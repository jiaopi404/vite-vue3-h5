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
  import { deleteFileById, getFileList, saveFile } from '/@/api/purchase/plan-purchase';
  import {
    getProAcceptanceById,
    saveProAcceptance,
  } from '/@/api/acceptanceManagement/acceptanceManagementApi';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { CustomMsgEnum } from '/@/enums/messageEnum';
  import { useConfigStore } from '/@/store/modules/config';
  // import { renderTime } from '/@/components/Time';

  const { prefixCls } = useDesign('upload-purchase-file-drawer');
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const configStore = useConfigStore();
  const emit = defineEmits(['success', 'register']);
  // const emit = ['save-success', 'register'];

  // BLOCK: common state
  // const proAcceptance = ref<Nullable<number>>(null);
  let bidSectionRef = ref<any>(null);
  let _fromList = ref<any>(null);
  const proId = ref(0);
  let statuId: any = ref(0);
  const makePurchaseFileFormSchema: FormSchema[] = [
    {
      field: 'result',
      label: '验收结果',
      required: true,
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: '通过',
            value: 1,
          },
          {
            label: '不通过',
            value: 2,
          },
        ],
      },
    },
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
      // rules: [{ required: true, message: '请选择上传采购文件', trigger: 'change', type: 'array' }],
      defaultValue: [],
    },
  ];
  const [
    registerForm,
    { getFieldsValue, clearValidate, validate, setFieldsValue, validateFields },
  ] = useForm({
    schemas: makePurchaseFileFormSchema,
    labelWidth: 115,
    showActionButtonGroup: false,
  });

  const changeHandlerLxBasicUploadFile = async (fileList, file, flag) => {
    console.log('change handler in drawer: ', fileList, file, flag);
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
        objectName: 'pro_acceptance',
        fileTypeId: fileType?.id,
        name: _file.name,
        url: _file.url,
        size: _file.size,
        addUserId: userStore.getUserInfo.id,
      };

      const res: any = await saveFile(obj);
      file.id = res.id;
      // const bidSectionInfo = {
      //   id: proId.value,
      //   ifUploadProcurementDocuments: 1,
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
    //     id: proId.value,
    //     ifUploadProcurementDocuments: 0,
    //   };
    //   await saveBidSection(bidSectionInfo);
    // }
  };

  // BLOCK: drawer inner
  const [registerDrawer, { closeDrawer, changeLoading, setDrawerProps }] = useDrawerInner(
    async (data) => {
      try {
        setDrawerProps({ confirmLoading: false });
        changeLoading(true);
        console.log(data.record, 'recordrecordrecord');
        statuId = data.record.bidSection.status.id;
        bidSectionRef = data.record;
        console.log(bidSectionRef, 'bidSectionRef.value');
        _fromList = await getProAcceptanceById(data.record.proAcceptance.id);
        console.log(_fromList, '_fromList', statuId);
        // proId.value = _fromList?.bidSection.id;
        proId.value = data.record.proAcceptance.id;

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
      objectName: 'pro_acceptance',
    });
    console.log(fileListRef, 'fileListRef');
    fileListRef.value = fileListRef.value.filter((item) => {
      return item.fileType.statusId?.id === statuId;
    });
    if (!fileListRef.value.length) {
      // 没有内容
      createMessage.error('请先配置文件类型！');
    }
  };

  const handleSubmit = async () => {
    try {
      await validate();
      setDrawerProps({ confirmLoading: true });
      const formData = getFieldsValue();
      console.log(formData, 'formDataformData', bidSectionRef.bidSection.id);
      let param = {
        // proId: proId.value,
        bidSection: {
          id: bidSectionRef.bidSection.id,
        },
        // accUserIds: bidSectionRef.proAcceptance.accUserIds,
        // accExplain: bidSectionRef.proAcceptance.accExplain,
        // accDate: renderTime(bidSectionRef.proAcceptance.accDate, true),
        addUser: {
          id: userStore.getUserInfo.id,
        },
        id: bidSectionRef.proAcceptance.id,
        result: formData.result,
        stage: 3,
      };
      console.log(param, 'formDataformData');
      await saveProAcceptance(param);
      closeDrawer();
      createMessage.success('保存成功');
      emit('success');
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  };

  const closeHandler = () => {
    _fromList.value = null;
    fileListRef.value = [];
    setFieldsValue({ purchaseFile: [] });
    emit('success');
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-upload-purchase-file-drawer';
  :deep(.ant-form-item-label) {
    margin-left: -6px;
  }
  :deep(.ant-form-item-label > label) {
    margin-right: 10px;
  }
</style>
