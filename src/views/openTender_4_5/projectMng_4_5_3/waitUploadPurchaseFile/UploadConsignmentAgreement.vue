<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :wrapClassName="prefixCls"
    title="上传委托协议"
    width="576px"
    @ok="handleSubmit"
    @close="closeHandler"
  >
    <BasicForm @register="registerForm">
      <template #caFile="{ model, field }">
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
    getBidSectionById,
    getFileList,
    saveBidSection,
    saveFile,
  } from '/@/api/purchase/plan-purchase';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { CustomMsgEnum } from '/@/enums/messageEnum';
  import { useConfigStore } from '/@/store/modules/config';

  const { prefixCls } = useDesign('upload-consignment-agreement');
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const configStore = useConfigStore();

  const emit = defineEmits(['save-success']);

  // BLOCK: common state
  const bidSectionId = ref<Nullable<number>>(null);
  const bidSectionRef = ref<any>(null);

  // 上传 委托协议
  const uploadCAFileFormSchema: FormSchema[] = [
    {
      field: 'caFile',
      component: 'LxBasicUploadFile',
      label: '上传附件',
      slot: 'caFile',
      helpMessage: [
        '1. 支持图片类型：png、jpg、bmp、jpeg、gif；',
        '2. 支持文件类型：doc、docx、xls、xlsx、ppt、pptx、pub、txt、pdf、zip、rar；',
        `3. 上传的单个文件不大于：${configStore.GET_CONFIG_BASEINFO?.uploadImageMaxSize}M；`,
        `4. 单次上传文件最大个数：${configStore.GET_CONFIG_BASEINFO?.uploadImageMaxCount}`,
      ],
      colProps: {
        span: 24,
      },
      rules: [{ required: true, message: '请上传委托协议', trigger: 'change', type: 'array' }],
      defaultValue: [],
    },
  ];
  const [
    registerForm,
    { getFieldsValue, resetFields, clearValidate, validate, setFieldsValue, validateFields },
  ] = useForm({
    schemas: uploadCAFileFormSchema,
    labelWidth: 115,
    showActionButtonGroup: false,
  });

  const changeHandlerLxBasicUploadFile = async (fileList, file, flag) => {
    // console.log('change handler in drawer: ', fileList, file, flag);
    // if (flag === 'add') {
    //   setFieldsValue({ caFile: fileList.value });
    // }
    validateFields(['caFile']);
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
        objectId: bidSectionId.value,
        objectName: 'pro_bidSection',
        fileTypeId: fileType?.id,
        name: _file.name,
        url: _file.url,
        size: _file.size,
        addUserId: userStore.getUserInfo.id,
      };
      const res: any = await saveFile(obj);
      file.id = res.id;
      // const bidSectionInfo = {
      //   id: bidSectionId.value,
      //   ifUploadProcurementDocuments: 1,
      //   // 保存上传人
      //   upLoader: userStore.getUserInfo.id,
      // };
      // await saveBidSection(bidSectionInfo);
    }
  };
  const handleDeleteFile = async (fileList, file) => {
    if (!file.id) {
      // 本地删除
      return;
    }
    await deleteFileById(file.id);
    createMessage.success(CustomMsgEnum.DEL_SUCCESS);
    // const fileIdList = fileList.map((item) => item.id);
    // if (!fileIdList.length) {
    //   const bidSectionInfo = {
    //     id: bidSectionId.value,
    //     ifUploadProcurementDocuments: 0,
    //     // 保存上传人
    //     upLoader: 'null',
    //   };
    //   await saveBidSection(bidSectionInfo);
    // }
  };

  // BLOCK: drawer inner
  const [registerDrawer, { closeDrawer, changeOkLoading, changeLoading }] = useDrawerInner(
    async (data) => {
      changeLoading(true);
      try {
        bidSectionId.value = data.id;
        bidSectionRef.value = await getBidSectionById(data.id);
        await getFileListRef();
        setFieldsValue({ caFile: fileListRef.value?.[0].list });
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
      projectId: bidSectionId.value,
      objectType: 1,
      statusId: [bidSectionRef.value?.status?.id], // 待上传采购文件的状态
      objectName: 'pro_bidSection',
    });
    fileListRef.value = fileListRef.value.filter((item) => {
      // 状态 16 且 非 采购文件的文件类型
      return (
        item.fileType.statusId?.code === '16' &&
        item.fileType.id !== configStore.GET_CONFIG_MODULE.fileTypePurchaseDocuments
      );
    });
    if (!fileListRef.value.length) {
      // 没有内容
      createMessage.error('请先配置委托协议文件类型！');
    }
  };

  const handleSubmit = async () => {
    changeOkLoading(true);
    try {
      await validate();
      closeDrawer();
      emit('save-success');
    } finally {
      changeOkLoading(false);
    }
  };

  const closeHandler = () => {
    bidSectionId.value = null;
    fileListRef.value = [];
    setFieldsValue({ caFile: [] });
    emit('save-success');
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-upload-consignment-agreement';
</style>
