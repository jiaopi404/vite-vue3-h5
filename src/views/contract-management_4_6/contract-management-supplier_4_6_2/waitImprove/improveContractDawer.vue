<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    @ok="handleSubmit"
    @close="closeContractDrawer"
  >
    <CollapseContainer class="pd-20" title="完善合同清单" :canExpan="false">
      <BasicForm @register="registerContractForm" />
    </CollapseContainer>
    <CollapseContainer class="pd-20" :title="contractCardTitle" :canExpan="false">
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
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <span class="contract_title" style="width: 60px; display: inline-block; white-space: nowrap"
          >合同清单</span
        >
        <div class="">
          <div class="contract_point"
            >{{ contractTitle }}
            <div class="contract_point_flicker">
              <div class="point point-flicker" v-if="ifWink"></div>
              <span v-if="ifWink" style="color: #ed6f6f; white-space: nowrap">{{
                ifShowAssetFund ? '资产总价合计与合同金额不符' : '与合同金额不符'
              }}</span>
            </div></div
          >
          <div>{{ contractAmountTitle }}</div>
          <div>{{ assetAmountTitle }}</div>
        </div>
      </template>
      <template #toolbar>
        <a-button>
          <a
            :href="`${publicPath}resource/template/contractList.xlsx`"
            download="合同清单模板.xlsx"
            class="pos-absolute"
            style="width: 100%; height: 100%; left: 0; top: 0"
            >下载合同清单模板</a
          >
        </a-button>
        <a-button type="primary" @click="importContractList"> 导入合同清单 </a-button>
        <LxBasicExportBtn
          :disabled="disabled"
          :exportType="ExportTypeEnum.CONCONTRACT"
          :exportExcelDto="{
            fileName: '合同清单',
            sheetName: '合同清单',
            ifShowTotal: false,
            listDataColumn: listDataColumn,
          }"
          :reloadTableFn="reload"
          :getHqlQueryDtoFn="
            () => {
              const dto = getHqlQueryDto();
              return dto;
            }
          "
        />
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            { label: `编辑`, onClick: clickEdit.bind(null, record) },
            { label: `删除`, color: 'error', onClick: clickDelete.bind(null, record) },
          ]"
        />
      </template>
    </BasicTable>
    <!-- 导入合同清单 -->
    <UploadTemplate
      @register="registerModal"
      :bidSectionId="bidSectionId"
      :contractId="contractId"
      @success="sucessAndReload"
    />
    <template #centerFooter>
      <AButton
        class="lly"
        type="primary"
        @click="clickImproveSuccess"
        :loading="loadingBtn"
        style="margin-right: 10px"
        >完善完成</AButton
      >
    </template>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, toRaw } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { CollapseContainer } from '/@/components/Container';
  import {
    contractFormSchema,
    contractInfoFormSchema,
    contractInfoTableColumns,
  } from './waitImprove.data';
  import {
    deleteConContractListById,
    getConContractListPageByQueryDto,
    perfectCompletion,
    saveConContract,
    saveConContractList,
  } from '/@/api/contractManagement/waitImprove';
  import { useModal } from '/@/components/Modal';
  import UploadTemplate from './UploadTemplate.vue';
  import { ExportTypeEnum } from '/@/enums/businessEnum';
  import {
    LxBasicExportBtn,
    ExportColumnKeyEnum,
    ExportColumnMap,
  } from '/@/components/LxComponents';
  import { numberToChinese } from '/@/utils/commonServe/common';
  import { useConfigStore } from '/@/store/modules/config';
  export default defineComponent({
    name: 'ReviewInfoDrawer',
    components: {
      BasicDrawer,
      BasicForm,
      BasicTable,
      TableAction,
      CollapseContainer,
      UploadTemplate,
      LxBasicExportBtn,
      ExportColumnKeyEnum,
      ExportColumnMap,
      ExportTypeEnum,
    },
    emits: ['success', 'register'],
    props: {
      statusId: {
        type: Number,
      },
    },
    setup(props, { emit }) {
      const publicPath = import.meta.env.VITE_PUBLIC_PATH || '/';
      const configStore = useConfigStore();
      const ifShowAssetFund = ref(configStore.GET_CONFIG_MODULE.ifShowAssetFund);
      const listDataColumn = ref();
      if (!ifShowAssetFund.value) {
        listDataColumn.value = [
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_NAME],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_BRANDMODEL],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_MANUFACTURER],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_UNITDIC],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_NUMBER],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_TRANSACTIONUNITPRICE],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_BIDWINNER],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_ACTUALSPEC],
          // ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_ADDDATETIME],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_WARRANTYYEAR],
        ];
      } else {
        listDataColumn.value = [
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_NAME],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_BRANDMODEL],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_MANUFACTURER],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_UNITDIC],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_NUMBER],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_TRANSACTIONUNITPRICE],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_BIDWINNER],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_ASSETPRICE],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_ASSETAMOUNT],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_ACTUALSPEC],
          // ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_ADDDATETIME],
          ExportColumnMap[ExportColumnKeyEnum.CONCONTRACTLIST_WARRANTYYEAR],
        ];
      }
      const id = ref(0);
      let _list = [];
      const [
        registerForm,
        { resetFields, updateSchema, appendSchemaByField, validate, setFieldsValue },
      ] = useForm({
        labelWidth: 140,
        schemas: contractInfoFormSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
      const [
        registerContractForm,
        {
          resetFields: resetContractFields,
          validate: validateContract,
          setFieldsValue: setContractFieldsValue,
        },
      ] = useForm({
        labelWidth: 120,
        schemas: contractFormSchema(),
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
          sorts: [
            { dir: 'desc', prop: 'conContractList.addDateTime' },
            { dir: 'desc', prop: 'conContractList.id' },
          ],
          queryList: [
            { param: 'conContractList.ifDelete', type: 'equal', value: [0] },
            // { param: 'conContractList.contractId', type: 'equal', value: [contract.value] },
          ],
          ifCustomHql: true,
          dataFieldList: ['conContractList', 'conContractList.id'],
          sumList: [
            'conContractList.number',
            'conContractList.number*conContractList.transactionUnitPrice',
            'conContractList.number*conContractList.assetsUnitPrice',
          ],
        },
      });
      const contractTitle = ref();
      const contractAmountTitle = ref(); // 成交总价
      const assetAmountTitle = ref();
      const ifWink = ref(false);
      const tableDataList = ref([]);
      const disabled = ref(false);
      const [registerTable, { reload }] = useTable({
        title: '合同清单',
        canResize: false,
        // 点击行不选中
        api: getConContractListPageByQueryDto,
        columns: contractInfoTableColumns(),
        rowKey: 'conContractList_id',
        beforeFetch: (queryInfo: any) => {
          resetHqlQueryDto(); // 先重置
          setPageByQueryInfo(queryInfo);
          appendQueryListByQueryInfoValuePlain(
            'conContractList.contractId',
            'equal',
            contractId.value,
          );
          // if (ifShowAssetFund.value) {
          // }
          setSortByQueryInfo(queryInfo);
          return getHqlQueryDto();
        },
        afterFetch: (data) => {
          contractTitle.value = `采购数量合计：${
            data.mapListSumAmount.totalNumber ? data.mapListSumAmount.totalNumber : 0
          }`;
          // 成交总价
          contractAmountTitle.value = `成交总价合计：${
            data.mapListSumAmount.totalTransactionUnitPrice
              ? data.mapListSumAmount.totalTransactionUnitPrice
              : 0
          }${
            contract.value.bidSection.project.currencyType?.code === '1'
              ? '元'
              : contract.value.bidSection.project.currencyType?.name
          }`;
          // 资产总价
          if (ifShowAssetFund.value) {
            assetAmountTitle.value = `资产总价合计：${
              data.mapListSumAmount.totalAssetsUnitPrice
                ? data.mapListSumAmount.totalAssetsUnitPrice
                : 0
            }${
              contract.value.bidSection.project.currencyType?.code === '1'
                ? '元'
                : contract.value.bidSection.project.currencyType?.name
            }`;
            if (contract.value.bidSection.project.currencyType?.code === '1') {
              assetAmountTitle.value +=
                ' ' + numberToChinese(data.mapListSumAmount.totalAssetsUnitPrice);
            }
          }
          if (contract.value.bidSection.project.currencyType?.code === '1') {
            contractAmountTitle.value +=
              ' ' + numberToChinese(data.mapListSumAmount.totalTransactionUnitPrice);
          }
          // 资产资金显示时
          if (ifShowAssetFund.value) {
            if (
              contract.value.conAmount &&
              data.mapListSumAmount.totalAssetsUnitPrice &&
              contract.value.conAmount === data.mapListSumAmount.totalAssetsUnitPrice
            ) {
              ifWink.value = false;
            } else {
              ifWink.value = true;
            }
          } else {
            if (
              contract.value.conAmount &&
              data.mapListSumAmount.totalTransactionUnitPrice &&
              contract.value.conAmount === data.mapListSumAmount.totalTransactionUnitPrice
            ) {
              ifWink.value = false;
            } else {
              ifWink.value = true;
            }
          }

          console.log('data', ifWink.value);
          tableDataList.value = data.page.content;
          disabled.value = data.page.content.length === 0 ? true : false;
          return data.page.content;
        },
        fetchSetting: {
          // The field name of the current page passed to the background
          pageField: 'page',
          // The number field name of each page displayed in the background
          sizeField: 'pageSize',
          // Field name of the form data returned by the interface
          listField: 'data.data',
          // Total number of tables returned by the interface field name
          totalField: 'data.data.page.totalElements',
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
          width: 110,
          title: '操作',
          dataIndex: 'action',
          slots: {
            customRender: 'action',
          },
          fixed: 'right',
        },
      });
      const contractId: any = ref();
      const bidSectionId: any = ref();
      const contract: any = ref();
      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        setDrawerProps({
          confirmLoading: false,
          closable: false,
          headerStyle: {
            border: 'none',
            height: 0,
            padding: 0,
          },
          bodyStyle: {
            backgroundColor: '#F0F2F5',
          },
        });
        console.log(toRaw(data.record));
        contractId.value = toRaw(data.record).conContract.id;
        bidSectionId.value = toRaw(data.record).conContract.bidSection.id;
        contract.value = toRaw(data.record).conContract;
        console.log('合同生效', contract.value.deliveryDays);
        if (contract.value.deliveryDays) {
          await setContractFieldsValue({
            deliveryDays: contract.value.deliveryDays,
          });
        }
        if (contract.value.warrantyYear) {
          await setContractFieldsValue({
            warrantyYear: contract.value.warrantyYear,
          });
        }
        // await setContractFieldsValue({
        //   deliveryDays: contract.value.deliveryDays,
        //   warrantyYear: contract.value.warrantyYear,
        // });
        await reload();
        if (
          ifShowAssetFund.value &&
          toRaw(data.record).conContract.bidSection.project.currencyType.code === '1'
        ) {
          appendSchemaByField(
            {
              field: 'assetsUnitPrice',
              label: '资产单价（元）',
              component: 'InputNumber',
              defaultValue: 1,
              colProps: { span: 11 },
              componentProps: ({ formModel, formActionType }) => {
                return {
                  placeholder: '请输入资产单价',
                  min: 0,
                  max: 1000000000,
                  precision: 2,
                  onChange: (e) => {
                    const { setFieldsValue } = formActionType;
                    const assetAmount = toRaw(formModel).number * e;
                    setFieldsValue({
                      assetAmount,
                    });
                  },
                };
              },
              rules: [
                {
                  required: true,
                  message: '请输入资产单价',
                  trigger: ['change', 'blur'],
                },
              ],
            },
            'unitAmount',
          );
          appendSchemaByField(
            {
              field: 'assetAmount',
              label: '资产总价（元）',
              defaultValue: 1,
              component: 'InputNumber',
              colProps: { span: 11 },
              componentProps: () => {
                return {
                  placeholder: '请输入资产总价',
                  disabled: true,
                  precision: 2,
                };
              },
            },
            'assetsUnitPrice',
          );
        } else if (
          ifShowAssetFund.value &&
          toRaw(data.record).conContract.bidSection.project.currencyType.code !== '1'
        ) {
          appendSchemaByField(
            {
              field: 'assetsUnitPrice',
              label: `资产单价（${
                toRaw(data.record).conContract.bidSection.project.currencyType.name
              }）`,
              component: 'InputNumber',
              defaultValue: 1,
              colProps: { span: 11 },
              componentProps: ({ formModel, formActionType }) => {
                return {
                  placeholder: '请输入资产单价',
                  min: 0,
                  max: 1000000000,
                  precision: 2,
                  onChange: (e) => {
                    const { setFieldsValue } = formActionType;
                    const assetAmount = toRaw(formModel).number * e;
                    setFieldsValue({
                      assetAmount,
                    });
                  },
                };
              },
              rules: [
                {
                  required: true,
                  message: '请输入资产单价',
                  trigger: ['change', 'blur'],
                },
              ],
            },
            'unitAmount',
          );
          appendSchemaByField(
            {
              field: 'assetAmount',
              label: `资产总价（${
                toRaw(data.record).conContract.bidSection.project.currencyType.name
              }）`,
              defaultValue: 1,
              component: 'InputNumber',
              colProps: { span: 11 },
              componentProps: () => {
                return {
                  placeholder: '请输入资产总价',
                  disabled: true,
                  precision: 2,
                };
              },
            },
            'assetsUnitPrice',
          );
        }
        if (ifShowAssetFund.value) {
          setFieldsValue({
            assetsUnitPrice: 1,
            assetAmount: 1,
          });
        }
        if (toRaw(data.record).conContract.bidSection.project.currencyType.code === '1') {
          updateSchema({
            field: 'transactionUnitPrice',
            label: '成交单价（元）',
          });
          updateSchema({
            field: 'unitAmount',
            label: '成交总价（元）',
          });
        } else {
          updateSchema({
            field: 'transactionUnitPrice',
            label: `成交单价（${
              toRaw(data.record).conContract.bidSection.project.currencyType.name
            }）`,
          });
          updateSchema({
            field: 'unitAmount',
            label: `成交总价（${
              toRaw(data.record).conContract.bidSection.project.currencyType.name
            }）`,
          });
        }
      });
      const { createMessage, createConfirm, createConfirmPromise } = useMessage();
      // 确认按钮
      async function handleSubmit() {
        try {
          setDrawerProps({ confirmLoading: true });
          const result = await validateContract();
          result.id = contractId.value;
          await saveConContract(result);
          createMessage.success('保存成功！');
          // await resetContractFields();
          // emit('success');
          // closeDrawer();
        } catch (error) {
          console.log('error', error);
          setDrawerProps({ confirmLoading: false });
        }
        setDrawerProps({ confirmLoading: false });
      }
      const clickImproveSuccess = async () => {
        try {
          await createConfirmPromise({
            content: '确认完善完成吗？',
          });
          if (ifWink.value && ifShowAssetFund.value) {
            createMessage.error('资产总价合计与合同金额不符！');
            return;
          } else if (ifWink.value && !ifShowAssetFund.value) {
            createMessage.error('成交总价合计与合同金额不符！');
            return;
          }
          const res: any = await perfectCompletion(contractId.value);
          if (res.data.length > 0) {
            createMessage.error(res.data[0]);
          } else {
            createMessage.success('确认完善完成成功！');
            await resetContractFields();
            emit('success');
            closeDrawer();
          }
        } catch (error) {}
      };
      // 评审信息保存
      const loadingBtn = ref(false);
      async function saveContractList() {
        loadingBtn.value = true;
        try {
          const result = await validate();
          if (editId.value) {
            result.id = editId.value;
          }
          result.unItDic = {
            id: result.unItDic,
          };
          result.contractId = contractId.value;
          result.bidSection = {
            id: contract.value.bidSection.id,
          };
          result.purchaseType = {
            id: contract.value.bidSection.project.projectType.id,
          };
          // bug4956 入库分类
          result.warehousingClassification = 0;
          await saveConContractList(result);
          createMessage.success('保存成功！');
          editId.value = undefined;
          await resetFields();
          if (ifShowAssetFund.value) {
            setFieldsValue({
              assetsUnitPrice: 1,
              assetAmount: 1,
            });
          }
          contractCardTitle.value = '添加合同清单';
          await reload();
        } catch (error) {}
        loadingBtn.value = false;
      }
      async function cancelContractList() {
        await resetFields();
        if (ifShowAssetFund.value) {
          setFieldsValue({
            assetsUnitPrice: 1,
            assetAmount: 1,
          });
        }
        contractCardTitle.value = '添加合同清单';
        editId.value = undefined;
      }
      const clickDelete = async (record: Recordable) => {
        try {
          await deleteConContractListById(record.conContractList.id);
          createMessage.success('删除成功！');
          await reload();
        } catch (error) {}
      };
      const editId = ref();
      const contractCardTitle = ref('添加合同清单');
      const clickEdit = async (record: Recordable) => {
        editId.value = record.conContractList.id;
        contractCardTitle.value = '编辑合同清单';
        const formData = {
          name: record.conContractList.name,
          brandModel: record.conContractList.brandModel,
          manufacturer: record.conContractList.manufacturer,
          number: record.conContractList.number,
          unItDic: record.conContractList.unItDic.id,
          transactionUnitPrice: record.conContractList.transactionUnitPrice,
          warrantyYear: record.conContractList.warrantyYear,
          actualSpec: record.conContractList.actualSpec,
          unitAmount: record.conContractList.transactionUnitPrice * record.conContractList.number,
          assetsUnitPrice: ifShowAssetFund.value
            ? record.conContractList.assetsUnitPrice
            : undefined,
          assetAmount: ifShowAssetFund.value
            ? record.conContractList.assetsUnitPrice * record.conContractList.number
            : undefined,
        };
        await setFieldsValue({
          ...formData,
        });
      };
      const [registerModal, { openModal }] = useModal();
      function importContractList() {
        if (tableDataList.value.length > 0) {
          createConfirm({
            iconType: 'warning',
            title: '导入合同清单',
            content: '导入合同清单将删除之前的清单数据，是否继续导入？',
            onOk: async () => {
              openModal(true);
            },
          });
        } else {
          openModal(true);
        }
      }
      async function closeContractDrawer() {
        await resetContractFields();
        emit('success', ifWink.value);
      }
      async function sucessAndReload() {
        await reload();
      }
      return {
        registerDrawer,
        registerForm,
        handleSubmit,
        _list,
        registerTable,
        clickDelete,
        saveContractList,
        loadingBtn,
        clickEdit,
        registerContractForm,
        cancelContractList,
        contractTitle,
        contractAmountTitle,
        ifWink,
        publicPath,
        importContractList,
        registerModal,
        contractId,
        bidSectionId,
        closeContractDrawer,
        sucessAndReload,
        contractCardTitle,
        disabled,
        ExportColumnKeyEnum,
        ExportColumnMap,
        ExportTypeEnum,
        reload,
        getHqlQueryDto,
        clickImproveSuccess,
        listDataColumn,
        assetAmountTitle,
        ifShowAssetFund,
      };
    },
  });
</script>
<style lang="less" scoped>
  :deep(.ant-input-number) {
    width: 100% !important;
  }
  .save-review-info-btn {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .pd-20 {
    margin-bottom: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 30%);
  }

  .point {
    width: 10px;
    height: 10px;
    background-color: #ed6f6f;
    position: relative;
    border-radius: 50%;
    margin: 0 10px;
  }

  /* 设置动画前颜色 */
  .point-flicker:after {
    background-color: #ed6f6f;
  }

  /* 设置动画后颜色 */
  .point-flicker:before {
    background-color: rgba(253, 0, 190, 0.2);
  }

  /* 设置动画 */
  .point-flicker:before,
  .point-flicker:after {
    content: '';
    width: 30px;
    height: 30px;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -15px;
    margin-top: -15px;
    border-radius: 50%;
    /* CSS3 animation 属性 网址 */
    /* https://www.w3school.com.cn/cssref/pr_animation.asp */
    animation: warn 1.5s ease-out 0s infinite;
  }
  @keyframes warn {
    0% {
      transform: scale(0.5);
      opacity: 1;
    }

    30% {
      opacity: 1;
    }

    100% {
      transform: scale(1.4);
      opacity: 0;
    }
  }
  .contract_title {
    margin-right: 10px;
  }
  .contract_point {
    display: flex;
  }
  .contract_point_flicker {
    display: flex;
    align-items: center;
  }
</style>
