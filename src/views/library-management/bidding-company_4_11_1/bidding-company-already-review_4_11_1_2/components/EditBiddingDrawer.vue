<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="register"
    :title="getTitle"
    :width="1000"
    :isDetail="true"
    @visible-change="handleVisibleChange"
  >
    <Tabs default-active-key="1" v-model:activeKey="currentKey" @change="changeTab">
      <TabPane key="1" tab="基本信息" />
      <TabPane key="2" tab="资质信息" v-if="biddingUserId" />
    </Tabs>
    <div v-if="currentKey === '1'">
      <BasicForm @register="registerForm" />
      <div class="auditProcessfromGroup" style="text-align: right; margin-top: 20px">
        <AButton class="lly" @click="handleCancel" style="margin-right: 10px">取消</AButton>
        <AButton class="lly" type="primary" @click="handelSubmit">保存</AButton>
      </div>
    </div>
    <div v-if="currentKey === '2' && biddingUserId">
      <div v-if="fileList.length > 0">
        <Tooltip placement="right">
          <template #title>
            1. 单次上传文件最大个数：{{ limitMaxAmount }}<br />
            2. 单个上传文件最大上限大小：{{ configSize }}M<br />
            3. 上传文件格式：{{ acceptType }}<br />
          </template>
          <Icon icon="ant-design:question-circle-outlined" class="fileIcon"></Icon>
        </Tooltip>
        <Row>
          <Col :span="24" v-for="(item, index) in fileList" :key="item.fileType.id">
            <LxFileUpload
              v-if="fileList.length > 0"
              @change="upload"
              :key="index"
              :proId="biddingUserId"
              :fileType="item.fileType"
              :fileList="item.list"
              :identifier="identifier"
              :name="item.fileType.name"
              :approveStatus="approveStatus"
            />
          </Col>
        </Row>
      </div>
      <div class="auditProcessfromGroup" style="text-align: right; margin-top: 20px">
        <AButton class="lly" @click="handleCancel" style="margin-right: 10px">取消</AButton>
      </div>
    </div>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { editBiddingFormSchema } from '../schemas';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { debouncePromise } from '/@/utils/commonServe';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useConfigStore } from '/@/store/modules/config';
  import { useDrawerInner, BasicDrawer } from '/@/components/Drawer';
  import { checkMobileRepeat, checkUserRepeat, findByCode } from '/@/api/demo/system';
  import { Tabs, TabPane } from 'ant-design-vue';
  import { Col, Row, Tooltip } from 'ant-design-vue';
  import Icon from '/@/components/Icon/src/Icon.vue';
  import componentSetting from '/@/settings/componentSetting';
  import LxFileUpload from '../../../../../components/LxComponents/LxUploadTest/LxFileUpload.vue';
  import { biddingCompanyI } from '/@/api/review-node/model/biddingCompanyModel';
  import {
    getBiddingCompanyById,
    saveBiddingCompanyAndUser,
    getProFileMapGroupByFileTypeNameFromId,
  } from '/@/api/review-node/biddingCompany';
  // state
  const isUpdateRef = ref<boolean>(false); // 是否更新
  let cacheUpdateBiddingInfo: Nullable<biddingCompanyI> = null; // 暂存的 cacheUpdateBiddingInfo 的对象
  const { createConfirm } = useMessage();
  const configStore = useConfigStore();
  const currentKey = ref('1');
  const limitMaxAmount = ref(0);
  const configSize = ref(0);
  const acceptType = ref();
  const fileList: any = ref([]);
  const biddingUserId = ref(0);
  const recId = ref(0);
  const approveStatus = ref(1);
  const identifier = ref('sys_user');
  const getTitle = computed<string>(() => {
    return isUpdateRef.value ? '编辑招标公司' : '添加招标公司';
  });
  const emit = defineEmits(['success']);
  const { lxBasicUpload: lxBasicUploadSetting } = componentSetting;
  const getAccept = computed(() => {
    let _settingImg = lxBasicUploadSetting?.acceptImgExt ?? [];
    let _settingFile = lxBasicUploadSetting?.acceptFileExt ?? [];
    return [..._settingImg, ..._settingFile].join(',');
  });
  limitMaxAmount.value = configStore.GET_CONFIG_BASEINFO?.uploadImageMaxCount ?? '';
  configSize.value = configStore.GET_CONFIG_BASEINFO?.uploadImageMaxSize ?? '';
  acceptType.value = getAccept.value.replace(/\./g, '  ');
  const [registerForm, { getFieldsValue, validate, resetFields, setFieldsValue, updateSchema }] =
    useForm({
      schemas: editBiddingFormSchema(),
      labelWidth: 150,
      showActionButtonGroup: false,
    });
  const [register, { changeLoading, changeOkLoading, closeDrawer }] = useDrawerInner(
    async (data) => {
      try {
        resetFields(); // 重置表单
        cacheUpdateBiddingInfo = null;
        changeLoading(true);
        const { isUpdate } = data;
        isUpdateRef.value = Boolean(isUpdate) || false;
        if (isUpdate) {
          // 如果编辑，重新拉取数据
          const {
            record: { id: recordId },
          } = data;
          const {
            user: { id: userId },
          } = data;
          biddingUserId.value = userId;
          recId.value = recordId;
          const _roleInfo = await getBiddingCompanyById(recordId);
          cacheUpdateBiddingInfo = _roleInfo;
          // 修改参数后回填
          setFieldsValue({
            ..._roleInfo,
            ...{
              account: _roleInfo.user?.account,
              sexCode: _roleInfo.user?.sexCode,
              perName: _roleInfo.user?.perName,
              mobile: _roleInfo.user?.mobile,
              citId: _roleInfo.user?.citId,
              businessType: _roleInfo.businessType?.split(','),
            },
          });
        }
        updateSchema({
          field: 'account',
          rules: [
            { required: true, message: '请输入账号', trigger: 'blur' },
            {
              trigger: 'blur',
              validator: debouncePromise(async (_, value) => {
                const _role: biddingCompanyI = {
                  account: value,
                };
                if (cacheUpdateBiddingInfo?.user?.id) {
                  _role.id = cacheUpdateBiddingInfo.user.id;
                }
                let regExp = /^[\u4e00-\u9fa5A-Za-z0-9]{2,20}$/;
                if (regExp.test(value) === false) {
                  return Promise.reject('请输入2-20位字符（不允许纯空格）');
                }
                if (regExp.test(value) === true) {
                  const bool = await checkUserRepeat(_role);
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
                const _role: biddingCompanyI = {
                  mobile: value,
                };
                if (cacheUpdateBiddingInfo?.user?.id) {
                  _role.id = cacheUpdateBiddingInfo.user.id;
                }
                _role.role = 5;
                let regExp = /^1\d{10}$/;
                if (regExp.test(value) === false) {
                  return Promise.reject('请输入11位手机号码');
                }
                if (regExp.test(value) === true) {
                  const bool = await checkMobileRepeat(_role);
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
      } finally {
        changeLoading(false);
      }
    },
  );
  function handleVisibleChange(v) {
    if (!v) {
      currentKey.value = '1';
    }
  }
  async function changeTab() {
    try {
      if (currentKey.value === '2') {
        fileList.value = await getProFileMapGroupByFileTypeNameFromId({
          objectId: biddingUserId.value,
          objectType: 4,
          objectName: 'sys_user',
        });
      } else {
        const _roleInfo = await getBiddingCompanyById(recId.value);
        cacheUpdateBiddingInfo = _roleInfo;
        // 修改参数后回填
        setFieldsValue({
          ..._roleInfo,
          ...{
            account: _roleInfo.user?.account,
            sexCode: _roleInfo.user?.sexCode,
            perName: _roleInfo.user?.perName,
            mobile: _roleInfo.user?.mobile,
            citId: _roleInfo.user?.citId,
            businessType: _roleInfo.businessType?.split(','),
          },
        });
      }
    } catch (error) {}
  }
  async function upload() {
    try {
      fileList.value = await getProFileMapGroupByFileTypeNameFromId({
        objectId: cacheUpdateBiddingInfo?.user?.id,
        objectType: 4,
        objectName: 'sys_user',
      });
    } catch (error) {}
  }
  const handleCancel = () => {
    resetFields();
    closeDrawer();
    currentKey.value = '1';
  };
  const handelSubmit = async () => {
    try {
      changeOkLoading(true);
      await validate(); // 验证
      const formData = getFieldsValue();
      let biddingId = await findByCode(
        configStore.GET_CONFIG.configInfo.configBaseInfo.biddingCompany,
      );
      // 处理数据id
      formData.id = cacheUpdateBiddingInfo?.id;
      formData.userId = cacheUpdateBiddingInfo?.user?.id;
      const expertform = {
        user: {
          id: formData.userId ? formData.userId : null,
          account: formData.account,
          perName: formData.perName,
          mobile: formData.mobile,
          sexCode: formData.sexCode, // 性别
          citId: formData.citId, //身份证号
          role: 5,
          useMark: formData.useMark,
          // orgId: configStore.GET_CONFIG_BASEINFO.orgId,
          roleIds: biddingId.id,
          approveStatus: 1,
          orgName: formData.name,
        },
        biddingCompany: {
          id: formData.id ? formData.id : null,
          name: formData.name,
          comlicCode: formData.comlicCode,
          legalperName: formData.legalperName,
          legalperCitId: formData.legalperCitId,
          legalperTel: formData.legalperTel,
          regtel: formData.regtel,
          useMark: formData.useMark,
          regfunAmount: formData.regfunAmount,
          regdate: formData.regdate,
          address: formData.address,
          officeAddress: formData.officeAddress,
          businessType: formData.businessType.toString(), // 公司业务类型
          depositBank: formData.depositBank,
          bankAccount: formData.bankAccount,
          majorScope: formData.majorScope,
          ifRepairer: 0,
          ifSupplier: 0,
        },
      };
      // 保存
      await saveBiddingCompanyAndUser(expertform as biddingCompanyI);
      // 如果新增 createConfirm 询问是否继续添加
      if (!unref(isUpdateRef)) {
        // 新增
        createConfirm({
          iconType: 'warning',
          title: '提示',
          content: '添加成功，是否继续添加？',
          onOk: async () => {
            resetFields();
            changeOkLoading(false);
          },
          onCancel: () => {
            closeDrawer();
            changeOkLoading(false);
          },
        });
        emit('success');
        return;
      }
      closeDrawer();
      cacheUpdateBiddingInfo = null; // 重置
      emit('success');
    } finally {
      changeOkLoading(false);
    }
  };
</script>
<style lang="less" scoped>
  .file-list {
    padding: 0 20px;
    :deep(.lx-collapse-container__body) {
      width: 100%;
    }
  }
  .fileIcon {
    display: flex;
    align-items: center;
    margin-left: 10px;
  }
</style>
