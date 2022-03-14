<template>
  <template v-if="getShow">
    <LoginFormTitle class="enter-x" />
    <BasicForm @register="registerForm" />
    <Button
      type="primary"
      class="enter-x"
      size="large"
      block
      @click="handleRegister"
      :loading="loading"
    >
      {{ t('sys.login.registerButton') }}
    </Button>
    <Button size="large" block class="mt-4 enter-x" @click="handleBackLogin">
      {{ t('sys.login.backSignIn') }}
    </Button>
  </template>
</template>
<script lang="ts" setup>
  import { ref, unref, computed, onUpdated } from 'vue';
  import LoginFormTitle from './LoginFormTitle.vue';
  import { Button } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useLoginState, LoginStateEnum } from './useLogin';
  import { formSchema } from './menu.data';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import {
    getDictionaryByParentId,
    getAllOrgList,
    saveUser,
    checkMobileRepeat,
    checkMobileCode,
    findByCode,
    checkUserRepeat,
  } from '/@/api/demo/system';
  import { useConfigStore } from '/@/store/modules/config';
  import { debouncePromise } from '/@/utils/commonServe';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { encryptByMd5 } from '/@/utils/cipher';
  const { t } = useI18n();
  const { handleBackLogin, getLoginState } = useLoginState();
  const loading = ref(false);
  const orgList = ref<any[]>([]);
  const configStore = useConfigStore();
  const { createMessage } = useMessage();
  const [registerForm, { validate, updateSchema, getFieldsValue }] = useForm({
    baseColProps: {
      span: 22,
    },
    labelWidth: 100,
    schemas: formSchema(),
    showActionButtonGroup: false,
  });
  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.REGISTER);
  onUpdated(async () => {
    const userRoleId: number | undefined =
      configStore.GET_CONFIG.configInfo.configDictionary?.userRoleId;
    const downloadTypeList = await getDictionaryByParentId(<number>userRoleId);
    downloadTypeList.forEach((item) => {
      item.label = item.name;
      item.value = item.code;
    });
    updateSchema({
      field: 'role',
      componentProps: { options: downloadTypeList },
    });
    orgList.value = await getAllOrgList();
    orgList.value.forEach((item) => {
      item.label = item.name;
      item.value = item.id;
    });
    updateSchema({
      field: 'orgId',
      componentProps: { options: orgList.value },
    });
    updateSchema({
      field: 'confirmPassword',
      rules: [
        { required: true, message: '请输入确认密码', trigger: 'blur' },
        {
          trigger: 'blur',
          validator: debouncePromise(async (_, value) => {
            const formData = getFieldsValue();
            if (value === formData.password) {
              return Promise.resolve();
            } else {
              return Promise.reject('两次密码不一致');
            }
          }, 0),
        },
      ],
    });
    updateSchema({
      field: 'account',
      rules: [
        { required: true, message: '请输入账号', trigger: 'blur' },
        {
          trigger: 'blur',
          validator: debouncePromise(async (_, value) => {
            const params = ref({});
            params.value = {
              account: value,
            };
            let regExp = /^[\u4e00-\u9fa5A-Za-z0-9]{2,20}$/;
            if (regExp.test(value) === false) {
              return Promise.reject('请输入2-20位字符（不允许纯空格）');
            }
            if (regExp.test(value) === true) {
              const bool = await checkUserRepeat(params.value);
              if (bool) {
                return Promise.resolve();
              } else {
                return Promise.reject('账号重复！');
              }
            }
          }, 800),
        },
      ],
    });
    updateSchema({
      field: 'mobile',
      rules: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        {
          trigger: 'blur',
          validator: debouncePromise(async (_, value) => {
            const values = await getFieldsValue()
            const params = ref({});
            params.value = {
              mobile: value,
              role: values.role,
            };
            let regExp = /^1\d{10}$/;
            if (regExp.test(value) === false) {
              return Promise.reject('请输入11位手机号码');
            }
            if (regExp.test(value) === true) {
              const bool = await checkMobileRepeat(params.value);
              if (bool) {
                return Promise.resolve();
              } else {
                return Promise.reject('手机号重复！');
              }
            }
          }, 800),
        },
      ],
    });
    // updateSchema({
    //   field: 'sms',
    //   rules: [
    //     { required: true, message: '请输入验证码', trigger: 'blur' },
    //     {
    //       trigger: 'blur',
    //       validator: debouncePromise(async (_, value) => {
    //         const formData = getFieldsValue();
    //         const params = ref({});
    //         params.value = {
    //           mobile: formData.mobile,
    //           code: value
    //         };
    //         if(value.length > 3){
    //           await checkMobileCode(params.value);
    //         }
    //       }, 0),
    //     },
    //   ],
    // });
  });
  async function handleRegister() {
    let supplierId = await findByCode(configStore.GET_CONFIG.configInfo.configBaseInfo.supplier);
    let repairerId = await findByCode(configStore.GET_CONFIG.configInfo.configBaseInfo.repairer);
    let ordinaryUserId = await findByCode(
      configStore.GET_CONFIG.configInfo.configBaseInfo.ordinaryUserCode,
    );
    let expertId = await findByCode(configStore.GET_CONFIG.configInfo.configBaseInfo.expertCode);
    let biddingId = await findByCode(
      configStore.GET_CONFIG.configInfo.configBaseInfo.biddingCompany,
    );
    const [values] = await Promise.all([validate()]);
    orgList.value.map((m) => {
      if (m.id == values.orgId) {
        values.orgName = m.name;
      }
    });
    const userForm = {
      user: {
        id: null,
        role: values.role,
        orgName: values.orgName ? values.orgName : values.companyName,
        orgId: values.orgId,
        //  ? values.orgId : configStore.GET_CONFIG_BASEINFO.orgId
        ifSupplier: values.role === '1' ? values.ifSupplier : values.role === '5' ? 0 : null,
        ifRepairer: values.role === '1' ? values.ifRepairer : values.role === '5' ? 0 : null,
        department: values.department ? { id: values.department } : null,
        companyName: values.companyName,
        account: values.account,
        password: encryptByMd5(values.password),
        perName: values.perName,
        sexCode: values.sexCode, // 性别
        citId: values.citId, //身份证号
        mobile: values.mobile,
        approveStatus: 0,
        roleIds:
          values.role === '1'
            ? values.ifSupplier && values.ifRepairer
              ? [supplierId?.id, repairerId?.id].toString()
              : values.ifSupplier
              ? supplierId?.id
              : values.ifRepairer
              ? repairerId?.id
              : null
            : values.role === '2'
            ? ordinaryUserId?.id
            : values.role === '3'
            ? expertId?.id
            : biddingId?.id,
      },
    };
    await saveUser(userForm);
    if (values.role === '1' || values.role === '5') {
      createMessage.success('用户账号注册成功，请正常登录，完善单位信息和资质信息后，提交审核！');
    } else if (values.role === '2') {
      createMessage.success('注册成功，账号等待审核！');
    } else if (values.role === '3') {
      createMessage.success('用户账号注册成功，请正常登录，完善专业和资质信息后，提交审核！');
    }
    handleBackLogin();
  }
</script>
