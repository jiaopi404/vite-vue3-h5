<template>
  <template v-if="getShow">
    <LoginFormTitle class="enter-x" />
    <BasicForm @register="registerForm" />
    <Button
      type="primary"
      class="enter-x"
      size="large"
      block
      @click="handleReset"
      :loading="loading"
    >
      {{ t('common.resetText') }}
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
  import { formSchema } from './find.data';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useConfigStore } from '/@/store/modules/config';
  import {
    noSessionUpdatePassword,
    getUserByRoleAndMobile,
    checkMobileCode,
    getDictionaryByParentId,
  } from '/@/api/demo/system';
  import { debouncePromise } from '/@/utils/commonServe';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { encryptByMd5 } from '/@/utils/cipher';
  const { t } = useI18n();
  const { handleBackLogin, getLoginState } = useLoginState();
  const loading = ref(false);
  const perId = ref<number>();
  const { createMessage } = useMessage();
  const configStore = useConfigStore();
  const [registerForm, { validate, updateSchema, getFieldsValue }] = useForm({
    baseColProps: {
      span: 22,
    },
    labelWidth: 100,
    schemas: formSchema(),
    showActionButtonGroup: false,
  });
  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.RESET_PASSWORD);
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
      field: 'mobile',
      rules: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        {
          trigger: 'blur',
          validator: debouncePromise(async (_, value) => {
            const values = await getFieldsValue();
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
              const res = await getUserByRoleAndMobile(params.value);
              if (res) {
                perId.value = res.Id;
                return Promise.resolve();
              } else {
                return Promise.reject('用户不存在！');
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
  async function handleReset() {
    const [values] = await Promise.all([validate()]);
    const userForm = {
      id: perId.value,
      password: encryptByMd5(values.password),
    };
    await noSessionUpdatePassword(userForm);
    createMessage.success('重置成功！');
    handleBackLogin();
  }
</script>
