<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :wrapClassName="prefixCls"
    title="制作采购文件"
    width="576px"
    @ok="handleSubmit"
    @close="closeHandler"
  >
    <BasicForm @register="registerForm">
      <template #purchaseFile="{ model, field }">
        <Select
          placeholder="请选择采购文件模板"
          :allowClear="true"
          :show-search="true"
          option-label-prop="label"
          v-model:value="model[field]"
          :options="purchaseFileListRef"
        />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useRouter } from 'vue-router';
  import { Select } from 'ant-design-vue';
  import { ref } from 'vue';
  import {
    getDocumentTemplateListByPageAndSortSumDto,
    saveYourselfAndAllChildren,
  } from '/@/api/templateManagement/templateManagementApi';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { saveBidSection } from '/@/api/purchase/plan-purchase';

  const { prefixCls } = useDesign('make-purchase-file-drawer');
  const router = useRouter();
  const userStore = useUserStore();

  const emit = defineEmits(['save-success']);

  // BLOCK: state
  const bidSectionId = ref<Nullable<number>>(null);

  const makePurchaseFileFormSchema: FormSchema[] = [
    {
      field: 'purchaseFile',
      component: 'Select',
      label: '采购文件模板',
      slot: 'purchaseFile',
      colProps: {
        span: 24,
      },
      rules: [{ required: true, message: '请选择采购文件模板', trigger: 'change', type: 'number' }],
    },
  ];
  const [registerForm, { getFieldsValue, resetFields, clearValidate, validate }] = useForm({
    schemas: makePurchaseFileFormSchema,
    labelWidth: 115,
    showActionButtonGroup: false,
  });

  // BLOCK: drawer inner
  const [registerDrawer, { closeDrawer, changeOkLoading, changeLoading }] = useDrawerInner(
    async (data) => {
      changeLoading(true);
      try {
        bidSectionId.value = data.id;
        getPurchaseFileListRef();
        clearValidate();
      } finally {
        changeLoading(false);
      }
    },
  );

  // BLOCK: form options
  const purchaseFileListRef = ref<any[]>([]);
  const { getHqlQueryDto } = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      ifCustomHql: true,
      sorts: [{ dir: 'asc', prop: 'id' }],
      queryList: [
        { param: 'documentTemplate.ifDelete', type: 'equal', value: [0] },
        { param: 'documentTemplate.type', type: 'equal', value: [1] },
        { param: 'documentTemplate.ifShow', type: 'equal', value: [1] },
        { param: 'documentTemplate.parent', type: 'isNull', value: [''] },
      ],
      dataFieldList: ['documentTemplate', 'documentTemplate.id'],
    },
  });
  const getPurchaseFileListRef = async () => {
    const res = await getDocumentTemplateListByPageAndSortSumDto(getHqlQueryDto());
    purchaseFileListRef.value = res.page.content.map((item) => {
      return {
        ...item,
        value: item.documentTemplate.id,
        label: item.documentTemplate.content,
      };
    });
  };

  const handleSubmit = async () => {
    changeOkLoading(true);
    try {
      const formData = getFieldsValue();
      await validate();
      formData.id = bidSectionId.value;
      // TODO: 调用保存接口
      // await savePurchaseFile(formData);
      await saveYourselfAndAllChildren({
        documentTemplateId: formData.purchaseFile,
        bidSectionId: bidSectionId.value,
        addUser: { id: userStore.getUserInfo?.id },
      });
      const bidSectionInfo = {
        id: bidSectionId.value,
        ifUploadProcurementDocuments: 2,
        // 保存上传人
        upLoader: userStore.getUserInfo.id,
      };
      await saveBidSection(bidSectionInfo);
      // 表示已经有了, 跳转
      router.push({
        path: '/proMng/proPurchaseTemplate',
        query: {
          id: bidSectionId.value,
        },
      });
      closeDrawer();
      emit('save-success');
    } finally {
      changeOkLoading(false);
    }
  };

  const closeHandler = () => {
    bidSectionId.value = null;
    resetFields();
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-make-purchase-file-drawer';
</style>
