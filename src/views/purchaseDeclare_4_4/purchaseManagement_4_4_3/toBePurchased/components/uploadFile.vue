<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :wrapClassName="prefixCls"
    title="上传附件"
    width="576px"
    @ok="handleSubmit"
    @close="closeHandler"
    @visible-change="changeClose"
  >
    <BasicForm @register="registerForm">
      <template #purchaseFile="{ model, field }">
        <LxBasicUploadTest
          v-model:value="model[field]"
          :multiple="true"
          @change="changeHandlerLxBasicUploadFile"
        />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { ref } from 'vue';
  import { LxBasicUploadTest } from '/@/components/LxComponents';
  import {
    deleteFileById,
    getFileList,
    saveBidSection,
    saveFile,
  } from '/@/api/purchase/plan-purchase';
  import { getOneByproId } from '/@/api/purchaseManagement/purchaseManagementApi';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { CustomMsgEnum } from '/@/enums/messageEnum';
  import { useConfigStore } from '/@/store/modules/config';

  const { prefixCls } = useDesign('upload-purchase-file-drawer');
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const configStore = useConfigStore();
  const emit = defineEmits(['success']);

  // BLOCK: common state
  let _fromList = ref<any>(null);
  const proId = ref<Nullable<number>>(null);
  let statuId = ref<Nullable<number>>(null);
  const makePurchaseFileFormSchema: FormSchema[] = [
    {
      field: 'purchaseFile',
      component: 'LxBasicUploadFile',
      label: '上传附件',
      slot: 'purchaseFile',
      helpMessage: [
        '1. 支持图片类型：png、jpg、bmp、jpeg、gif；',
        '2. 支持文件类型：doc、docx、xls、xlsx、ppt、pptx、pub、txt、pdf、zip、rar；',
        `3. 上传的单个文件不大于：${configStore.GET_CONFIG_BASEINFO?.uploadImageMaxSize}M；`,
        `4. 单次上传文件最大个数：${configStore.GET_CONFIG_BASEINFO?.uploadImageMaxCount}`,
      ],
      colProps: {
        span: 24,
      },
      rules: [{ required: true, message: '请上传采购文件', trigger: 'change', type: 'array' }],
      defaultValue: [],
    },
  ];
  const [registerForm, { clearValidate, validate, setFieldsValue, validateFields }] = useForm({
    schemas: makePurchaseFileFormSchema,
    labelWidth: 115,
    showActionButtonGroup: false,
  });
  // 上传附件保存
  const changeHandlerLxBasicUploadFile = async (fileList, file, flag) => {
    // if (flag === 'add') {
    //   setFieldsValue({ purchaseFile: fileList.value });
    // }
    validateFields(['purchaseFile']);
    if (flag === 'remove') {
      if (file.status !== 'error') {
        handleDeleteFile(fileList, file);
      }
    }
    if (flag === 'add') {
      const fileType = fileListRef.value?.[0]?.fileType;
      if (!fileType) {
        createMessage.error('请先配置文件类型！');
      }
      const _file = file;
      const obj = {
        objectId: proId.value,
        objectName: 'pro_bidSection',
        fileTypeId: fileType?.id,
        name: _file.name,
        url: _file.url,
        size: _file.size,
        addUserId: userStore.getUserInfo.id,
      };

      const res: any = await saveFile(obj);
      file.id = res.id;
      const bidSectionInfo = {
        id: proId.value,
        ifUploadProcurementDocuments: 1,
      };
      await saveBidSection(bidSectionInfo);
    }
  };
  // 删除
  const handleDeleteFile = async (fileList, file) => {
    if (!file.id) {
      // 本地删除
      return;
    }
    await deleteFileById(file.id);
    createMessage.success(CustomMsgEnum.DEL_SUCCESS);
    const fileIdList = fileList.map((item) => item.id);
    if (!fileIdList.length) {
      const bidSectionInfo = {
        id: proId.value,
        ifUploadProcurementDocuments: 0,
      };
      await saveBidSection(bidSectionInfo);
    }
  };

  // BLOCK: drawer inner
  const [registerDrawer, { closeDrawer, changeOkLoading, changeLoading }] = useDrawerInner(
    async (data) => {
      changeLoading(true);
      try {
        statuId = data.record.status.id;
        _fromList = await getOneByproId(data.record.id);
        proId.value = _fromList?.id;
        await getFileListRef();
        setFieldsValue({ purchaseFile: fileListRef.value?.[0].list });
        clearValidate();
      } finally {
        changeLoading(false);
      }
    },
  );

  // BLOCK: form options
  const fileListRef = ref<any>([]); // 附件列表
  const getFileListRef = async () => {
    fileListRef.value = await getFileList({
      projectId: _fromList?.id,
      objectType: 1,
      statusId: [statuId],
      objectName: 'pro_bidSection',
    });
    fileListRef.value = fileListRef.value.filter((item) => {
      return item.fileType.statusId?.id === statuId;
    });
    if (!fileListRef.value.length) {
      // 没有内容
      createMessage.error('请先配置文件类型！');
    }
  };
  // 保存
  const handleSubmit = async () => {
    changeOkLoading(true);
    try {
      await validate();
      closeDrawer();
      emit('success');
    } finally {
      changeOkLoading(false);
    }
  };
  // 关闭
  const closeHandler = () => {
    _fromList.value = null;
    fileListRef.value = [];
    setFieldsValue({ purchaseFile: [] });
    emit('success');
  };
  const changeClose = () => {
    emit('success');
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-upload-purchase-file-drawer';
</style>
