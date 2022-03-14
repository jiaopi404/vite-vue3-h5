<template>
  <PageWrapper :class="prefixCls" title="" :contentFullHeight="true" v-loading="loading">
    <template #default>
      <div class="lx-pt_form">
        <ContractTemplatePreview :id="bidSectionIdRef" :type="2" :difference="false">
        </ContractTemplatePreview>
      </div>
      <CollapseContainer class="pd-20" :title="payTitle" :canExpan="false">
        <BasicForm @register="registerForm" />
        <div class="save-review-info-btn">
          <AButton
            class="lly"
            type="primary"
            @click="saveContractList"
            :loading="loadingBtn"
            style="margin-right: 10px"
            >保存</AButton
          >
          <AButton
            class="lly"
            @click="cancelContractList"
            :loading="loadingBtn"
            style="margin-right: 10px"
            >取消</AButton
          >
        </div>
      </CollapseContainer>
      <BasicTable @register="registerTable" class="payTable">
        <template #tableTitle>
          付款比例合计：{{ proportionTotal }}
          <span
            style="color: #ed6f6f; margin: 0 5px"
            v-if="proportionTotal && proportionTotal !== 100"
            >{{ '（比例合计不等于100）' }}</span
          >
          金额合计：{{ amountTotal }}
          <span style="color: #ed6f6f" v-if="ifShow"
            >（合计金额与合同金额不符，误差为{{ error }}）</span
          >
        </template>
        <template #action="{ record }">
          <TableAction
            :actions="[
              { label: `编辑`, onClick: clickEdit.bind(null, record) },
              { label: `删除`, onClick: clickDelete.bind(null, record) },
            ]"
          />
        </template>
      </BasicTable>
    </template>
    <template #rightFooter>
      <!-- <Button class="mr-3" @click="clickHandlePreview" color="primary">预览</Button> -->
      <Button type="info" class="mr-3" @click="clickHandleSave">返回</Button>
      <Button @click="clickHandleSave" color="primary">保存</Button>
    </template>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { PageWrapper } from '/@/components/Page';
  import { Button } from '/@/components/Button';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { CollapseContainer } from '/@/components/Container';

  import { useDesign } from '/@/hooks/web/useDesign';
  import { useRoute, useRouter } from 'vue-router';
  import { onMounted, ref, onBeforeUnmount } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import ContractTemplatePreview from '/@/components/LxComponents/LxTemplatePreview/ContractTemplatePreview.vue';
  import { CustomMsgEnum } from '/@/enums/messageEnum';
  import { paymentFormSchema, paymentTableColumns } from './paymentMethod.data';
  import {
    deleteConPaymentMethodById,
    getConContractById,
    getConPaymentMethodPageByQueryDto,
    getTotalByContractId,
    saveConPaymentMethod,
  } from '/@/api/contractManagement/waitImprove';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getDictionaryByParentId } from '/@/api/noticeManagement/noticeManagement';
  import { useConfigStore } from '/@/store/modules/config';
  import { toFixedNumber } from '/@/utils/commonServe/common';
  import { useTabs } from '/@/hooks/web/useTabs';
  // BLOCK: hooks
  document.body.style.height = 'auto';
  onBeforeUnmount(() => {
    document.body.style.height = '100%';
  });
  const { prefixCls } = useDesign('purchase-template');
  const route = useRoute();
  const router = useRouter();
  const { createMessage } = useMessage();

  // BLOCK: common state
  const bidSectionRef = ref<Nullable<any>>(null);
  let bidSectionIdRef = ref<any>(null);

  const loading = ref<boolean>(false);

  const [registerForm, { resetFields, updateSchema, validate, setFieldsValue }] = useForm({
    labelWidth: 120,
    schemas: paymentFormSchema(),
    showActionButtonGroup: false,
    baseColProps: { span: 22 },
  });
  const {
    getHqlQueryDto,
    resetHqlQueryDto,
    setPageByQueryInfo,
    appendQueryListByQueryInfoValuePlain,
    setSortByQueryInfo,
  } = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      page: { pageNum: 1, pageSize: 10 },
      queryList: [
        // 采购方式 ！= （电子竞价/询价），状态 = 待采购，项目处理人 = 当前登陆人，未删除的项目
        { param: 'conPaymentMethod.ifDelete', type: 'equal', value: [0] },
      ],
      ifCustomHql: true,
      dataFieldList: ['conPaymentMethod', 'conPaymentMethod.id'],
      // sumList: ['number', 'number*transactionUnitPrice'],
    },
  });
  const proportionTotal = ref();
  const amountTotal = ref();
  const error = ref();
  const ifShow = ref(false);
  const paymentMethodList = ref([]);
  const payTitle = ref('添加付款方式');
  const [registerTable, { reload, setColumns }] = useTable({
    title: '合同清单',
    canResize: false,
    // 点击行不选中
    api: getConPaymentMethodPageByQueryDto,
    columns: paymentTableColumns(),
    rowKey: 'conPaymentMethod_id',
    beforeFetch: (queryInfo: any) => {
      resetHqlQueryDto(); // 先重置
      setPageByQueryInfo(queryInfo);
      appendQueryListByQueryInfoValuePlain(
        'conPaymentMethod.contractId',
        'equal',
        bidSectionIdRef.value,
      );
      setSortByQueryInfo(queryInfo);
      return getHqlQueryDto();
    },
    afterFetch: async (data) => {
      const paymentTitle: any = await getTotalByContractId(bidSectionIdRef.value);
      console.log(paymentTitle);
      proportionTotal.value = paymentTitle.proportionSum;
      amountTotal.value = paymentTitle.amountSum;
      if (contractInfo.value) {
        amountTotal.value =
          paymentTitle.amountSum +
          (contractInfo.value.bidSection.project.currencyType?.code === '1'
            ? '元'
            : contractInfo.value.bidSection.project.currencyType?.name);
        error.value = toFixedNumber(contractInfo.value.conAmount - paymentTitle.amountSum);
        if (
          contractInfo.value.conAmount !== 0 &&
          contractInfo.value.conAmount !== paymentTitle.amountSum
        ) {
          ifShow.value = true;
        } else {
          ifShow.value = false;
        }
      }
      paymentMethodList.value.forEach((item: any) => {
        item.label = item.name;
        item.value = item.id;
        const index = data.findIndex((dataItem: any) => {
          return item.id === dataItem.conPaymentMethod.paymentMethod.id;
        });
        if (index !== -1) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      });
      updateSchema({
        field: 'paymenMethod',
        componentProps: {
          options: paymentMethodList.value,
          placeholder: '请选择付款方式',
          labelField: 'name',
          valueField: 'id',
          showSearch: true,
          optionFilterProp: 'label',
        },
      });
      return data;
    },
    fetchSetting: {
      // The field name of the current page passed to the background
      pageField: 'page',
      // The number field name of each page displayed in the background
      sizeField: 'pageSize',
      // Field name of the form data returned by the interface
      listField: 'page.content',
      // Total number of tables returned by the interface field name
      totalField: 'page.totalElements',
    },
    showTableSetting: true,
    tableSetting: {
      // 是否显示刷新按钮
      redo: true,
      // 是否显示尺寸调整按钮
      size: true,
      // 是否显示字段调整按钮
      setting: true,
      // 是否显示全屏按钮
      fullScreen: true,
    },
    actionColumn: {
      width: 80,
      title: '操作',
      dataIndex: 'action',
      slots: {
        customRender: 'action',
      },
      fixed: undefined,
    },
  });
  bidSectionIdRef.value = Number(route.query.id);
  const contractInfo = ref();
  const configStore = useConfigStore();
  onMounted(async () => {
    contractInfo.value = await getConContractById(bidSectionIdRef.value);
    const columnList = await paymentTableColumns();
    columnList.forEach((item) => {
      if (item.dataIndex === 'conPaymentMethod.amount') {
        item.format = (_text, record) => {
          return (
            record.conPaymentMethod.amount +
            (contractInfo.value.bidSection.project.currencyType?.code === '1'
              ? '元'
              : contractInfo.value.bidSection.project.currencyType?.name)
          );
        };
      }
    });
    paymentMethodList.value = await getDictionaryByParentId(
      configStore.GET_CONFIG.configInfo?.configDictionary?.conPaymentMethodId,
    );
    await reload();
    updateSchema({
      field: 'proportion',
      componentProps: ({ formModel, formActionType }) => ({
        min: 0,
        max: 100,
        placeholder: '请输入付款比例',
        precision: 2,
        onChange: (e: any) => {
          const { updateSchema, setFieldsValue } = formActionType;
          // toRaw(formModel).fundsDepId = undefined;
          if (e) {
            setFieldsValue({
              amount: e * contractInfo.value.conAmount * 0.01,
            });
          } else {
            setFieldsValue({
              amount: 0,
            });
          }
        },
      }),
    });
    updateSchema({
      field: 'amount',
      label: `金额（${
        contractInfo.value.bidSection.project.currencyType?.code === '1'
          ? '元'
          : contractInfo.value.bidSection.project.currencyType?.name
      }）`,
    });
    await setColumns(columnList);
  });
  const clickHandlePreview = () => {
    // TODO: 预览的弹窗
  };

  const clickHandleCancel = () => {
    // router.back();
  };
  const loadingBtn = ref(false);
  async function saveContractList() {
    loadingBtn.value = true;
    payTitle.value = '添加付款方式';
    try {
      const result = await validate();
      console.log('付款方式', result);
      const params = {
        contractId: bidSectionIdRef.value,
        paymentMethod: {
          id: result.paymenMethod,
        },
        paymentExplain: result.description,
        proportion: result.proportion,
        amount: result.amount,
      };
      if (editId.value) {
        params.id = editId.value;
      }
      await saveConPaymentMethod(params);
      await reload();
      await resetFields();
      editId.value = undefined;
    } catch (error) {}
    loadingBtn.value = false;
  }
  const editId = ref();
  async function clickEdit(record: Recordable) {
    payTitle.value = '编辑付款方式';
    console.log(record.conPaymentMethod.paymenMethod);
    editId.value = record.conPaymentMethod.id;
    const formData = {
      paymenMethod: record.conPaymentMethod.paymentMethod.id,
      proportion: record.conPaymentMethod.proportion,
      description: record.conPaymentMethod.paymentExplain,
      amount: record.conPaymentMethod.amount,
    };
    await setFieldsValue({
      ...formData,
    });
  }
  async function clickDelete(record: Recordable) {
    await deleteConPaymentMethodById(record.conPaymentMethod.id);
    createMessage.success('删除成功！');

    await reload();
  }
  async function cancelContractList() {
    await resetFields();
    payTitle.value = '添加付款方式';
    editId.value = undefined;
  }
  const { closeCurrent } = useTabs(router);
  const clickHandleSave = async () => {
    loading.value = true;
    try {
      router.back();
      closeCurrent();
    } finally {
      loading.value = false;
    }
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-purchase-template';
  .lx-pt_form {
    margin-bottom: 20px;
  }
  .pd-20 {
    margin-bottom: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 30%);
  }
  .save-review-info-btn {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  :deep(.ant-input-number) {
    width: 100% !important;
  }
  .payTable {
    margin-bottom: 40px;
    background-color: #fff;
  }
  .lx-basic-table {
    border-radius: 5px;
  }
</style>
