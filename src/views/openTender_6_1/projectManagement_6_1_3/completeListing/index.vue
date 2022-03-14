<template>
  <div>
    <div class="buttonBox">
      <a-button type="primary" @click="handleDeleteAll" :disabled="checkedKeys.length <= 1">
        批量删除
        <Icon icon="ant-design:delete-outlined" />
      </a-button>
      <div>
        <a-button @click="handleAdd">
          <Icon icon="ant-design:plus-outlined" />
          添加清单
        </a-button>
        <a-button>
          <Icon icon="ant-design:arrow-down-outlined" />
          <a
            :href="`${publicPath}resource/template/winningList.xlsx`"
            download="中标清单模板.xlsx"
            class="pos-absolute"
            style="width: 100%; height: 100%; left: 0; top: 0"
            >下载清单模板</a
          >
        </a-button>
        <a-button @click="handleimportUser">
          <!-- preIcon="carbon:cloud-upload" -->
          <Icon icon="ant-design:cloud-upload-outlined" />
          导入清单
        </a-button>
        <LxBasicExportBtn
          class="inline-block"
          :disabled="!importMsg"
          :exportType="ExportTypeEnum.BIDWINNINGLIST"
          :exportExcelDto="{
            fileName: '中标清单明细',
            sheetName: '中标清单明细',
            ifShowTotal: false,
            listDataColumn: [
              ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_NAME],
              ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_BRANDMODEL],
              ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_SPEC],

              ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_UNITDICID],
              ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_NUMBER],
              {
                dataName: 'bidWinningList.unitPrice',
                dataType: 'String',
                dataTitle: `预算单价（${currencyTypeName}）`,
                width: 5000,
              },
              {
                dataName: 'bidWinningList.totalUnitPrice',
                dataType: 'String',
                dataTitle: `预算总价（${currencyTypeName}）`,
                width: 5000,
              },
              {
                dataName: 'bidWinningList.transactionUnitPrice',
                dataType: 'String',
                dataTitle: `报价单价（${currencyTypeName}）`,
                width: 5000,
              },
              {
                dataName: 'bidWinningList.totalTransactionUnitPrice',
                dataType: 'String',
                dataTitle: `报价总价（${currencyTypeName}）`,
                width: 5000,
              },
              //ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_UNITPRICE],
              //[ExportColumnKeyEnum.BIDWINNINGLIST_TOTALNUITPRICE],
              //ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_TRANSACTIONUNITPRICE],

              //ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_TOTALTRANSACTIONUNITPRICE],
              ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_ACTUALSPEC],
              ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_PURCHASETYPEID],
              // ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_ADDDATETIME],
            ],
          }"
          :reloadTableFn="reload"
          :getHqlQueryDtoFn="
            () => {
              const dto = getHqlQueryDto();
              return dto;
            }
          "
        />
      </div>
    </div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <div class="totalDiv">
          <p><b>采购数量合计：</b>{{ total.totalNumber }} ;</p>
          <p
            ><b>预算总价合计：</b>{{ total.totalUnitPrice.toFixed(2) }} {{ currencyTypeName }}
            {{ currencyTypeCode === '1' ? numberToChinese(total.totalUnitPrice) : '' }} ;</p
          >
          <p>
            <b>报价总价合计：</b>{{ total.totalTransactionUnitPrice.toFixed(2) }}
            {{ currencyTypeName }}
            {{ currencyTypeCode === '1' ? numberToChinese(total.totalTransactionUnitPrice) : '' }} ;
          </p>
          <p>
            <Badge
              v-if="bidWinningAmount !== total.totalTransactionUnitPrice"
              color="red"
              style="color: red"
              text="与中标金额不符"
            ></Badge>
          </p>
        </div>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '编辑',
              onClick: handleEditor.bind(null, record.bidWinningList),
            },
            {
              icon: '',
              label: '删除',
              color: 'error',
              onClick: handleDelete.bind(null, record.bidWinningList),
            },
          ]"
        />
      </template>
      <template #footer>
        <a-button v-if="showBtn" type="primary" @click="handleSubmit"> 提交 </a-button>
        <!-- <a-button type="primary" @click="handleSubmit"> 提交 </a-button> -->
      </template>
    </BasicTable>

    <completeListingDrawer @register="registerDrawer" @success="handleSuccess" />
    <uploadModal
      @register="registerModal"
      :supplierQuotationId="bidSectionId"
      @success="handleSuccess"
    />
  </div>
</template>
<script lang="ts">
  /**
   * 完善中标清单(隐藏)
   * completeListing
   * openTender_6_1/projectManagement_6_1_3/completeListing/index.vue
   */
  import { defineComponent, ref, unref, reactive, toRaw, onMounted } from 'vue';
  import { Badge, Tabs, TabPane } from 'ant-design-vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import uploadModal from './components/uploadModal.vue'; // 导入模板
  import { useDrawer } from '/@/components/Drawer';
  import completeListingDrawer from './components/completeListingDrawer.vue';
  // import { CollapseContainer } from '/@/components/Container/index';
  import Icon from '/@/components/Icon';
  import {
    LxBasicExportBtn,
    ExportColumnMap,
    ExportColumnKeyEnum,
  } from '/@/components/LxComponents';
  import { ExportTypeEnum } from '/@/enums/businessEnum';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { useRoute } from 'vue-router';
  import { useConfigStore } from '/@/store/modules/config';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, pageAndSort } from './completeListing.data';
  import { numberToChinese } from '/@/utils/commonServe/common';
  import {
    getBidWinningListListByPageAndSortSumDto,
    batchDelete,
    submitBidWinningList,
    getProjectByProId,
  } from '/@/api/purchase/supplierApi';

  export default defineComponent({
    components: {
      Icon,
      BasicTable,
      TableAction,
      completeListingDrawer,
      uploadModal,
      // CollapseContainer,
      Badge,
      Tabs,
      TabPane,

      LxBasicExportBtn,
      ExportColumnKeyEnum,
      ExportColumnMap,
      ExportTypeEnum,
    },
    setup() {
      const publicPath = import.meta.env.VITE_PUBLIC_PATH || '/'; // 下载模板
      const { createMessage, createConfirm, createConfirmPromise } = useMessage();
      const { close } = useTabs();
      const route = useRoute();
      const projectId = ref<Number>(-999);
      const bidSectionId = ref<Number>(-999);
      const bidWinningAmount = ref<Number>(-999); // 中标金额

      projectId.value = Number(route.query.projectId);
      bidSectionId.value = Number(route.query.bidSectionId);
      bidWinningAmount.value = Number(route.query.bidWinningAmount);
      const currencyTypeCode = ref('0');
      const checkedKeys = ref<Array<string | number>>([]); // 多选key集合
      const importMsg = ref<Boolean>(false); // 是否提示导入信息【是否有数据】
      const currencyTypeName = ref<String>('元'); // 货币类型
      const showBtn = ref<Boolean>(true); // 根据admin配置是否显示 提交按钮
      let resData = ref<any>(null);
      const userInfo = useUserStore().getUserInfo;
      const configInfo = useConfigStore().GET_CONFIG_BASEINFO;
      console.log('configInfo', configInfo.ifMessAgerePort);
      console.log('configInfo', configInfo.smsNoticeMethod);

      // ifMessAgerePort 是否消息通知 1是 0否
      // smsNoticeMethod 推送方式 微信推送 1 短信推送 0
      if (configInfo.ifMessAgerePort === 1 && configInfo.smsNoticeMethod === 0) {
        showBtn.value = true;
      } else {
        showBtn.value = false;
      }

      // 合计行数据
      const total = reactive({
        totalNumber: 0, // 采购数量合计
        totalUnitPrice: 0, // 预算总价合计
        totalTransactionUnitPrice: 0, // 报价总价合计
      });
      // 重置合计数据
      const restTotal = () => {
        total.totalNumber = 0;
        total.totalUnitPrice = 0;
        total.totalTransactionUnitPrice = 0;
      };

      onMounted(async () => {
        // 获取基本信息
        resData = await getProjectByProId(Number(route.query.projectId));
        currencyTypeCode.value = resData?.currencyType.code;
        currencyTypeName.value =
          resData?.currencyType.code === '1' ? '元' : resData?.currencyType.name;
      });

      const [registerDrawer, { openDrawer }] = useDrawer();
      const [registerModal, { openModal }] = useModal();

      const {
        resetHqlQueryDto,
        setPageByQueryInfo,
        appendQueryListByQueryInfoValuePlain,
        setSortByQueryInfo,
        getHqlQueryDto,
      } = useHqlQueryDto(pageAndSort());
      const beforeFetch = async (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        setPageByQueryInfo(queryInfo);
        // setSortByQueryInfo(queryInfo, 'bidWinningList');
        setSortByQueryInfo(queryInfo);
        appendQueryListByQueryInfoValuePlain('bidSection.id', 'equal', bidSectionId.value);
        const queryDto = getHqlQueryDto();
        return queryDto;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        // const _data = data.map((item) => item.bidWinningList);
        restTotal(); // 重置合计数据
        if (data.length > 0) {
          importMsg.value = true;
        } else {
          importMsg.value = false;
        }
        data.forEach((item) => {
          const bidWinningListItem = item.bidWinningList;
          total.totalNumber += bidWinningListItem.number;
          total.totalUnitPrice += bidWinningListItem.number * bidWinningListItem.unitPrice;
          total.totalTransactionUnitPrice +=
            bidWinningListItem.number * bidWinningListItem.transactionUnitPrice;
        });
        total.totalUnitPrice = Number(total.totalUnitPrice.toFixed(2));
        total.totalTransactionUnitPrice = Number(total.totalTransactionUnitPrice.toFixed(2));
        const columnsTitle = columns();
        columnsTitle.forEach((item) => {
          if (item.dataIndex === 'bidWinningList.unitPrice') {
            item.title = `预算单价(${
              resData?.currencyType.code === '1' ? '元' : resData?.currencyType.name
            })`;
          }
          if (item.dataIndex === 'totalUnitPrice') {
            item.title = `预算总价(${
              resData?.currencyType.code === '1' ? '元' : resData?.currencyType.name
            })`;
          }
          if (item.dataIndex === 'bidWinningList.transactionUnitPrice') {
            item.title = `报价单价(${
              resData?.currencyType.code === '1' ? '元' : resData?.currencyType.name
            })`;
          }
          if (item.dataIndex === 'bidWinningList.totalTransactionUnitPrice') {
            item.title = `报价总价(${
              resData?.currencyType.code === '1' ? '元' : resData?.currencyType.name
            })`;
          }
        });
        if (resData?.currencyType.code === '1') {
          ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_UNITPRICE].dataTitle =
            '预算单价（元）';
          ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_TOTALNUITPRICE].dataTitle =
            '预算总价（元）';
          ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_TRANSACTIONUNITPRICE].dataTitle =
            '报价单价（元）';
          ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_TOTALTRANSACTIONUNITPRICE].dataTitle =
            '报价总价（元）';
        } else {
          ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_UNITPRICE].dataTitle =
            '预算单价（' + resData?.currencyType.name + '）';
          ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_TOTALNUITPRICE].dataTitle =
            '预算总价（' + resData?.currencyType.name + '）';
          ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_TRANSACTIONUNITPRICE].dataTitle =
            '报价单价（' + resData?.currencyType.name + '）';
          ExportColumnMap[ExportColumnKeyEnum.BIDWINNINGLIST_TOTALTRANSACTIONUNITPRICE].dataTitle =
            '报价总价（' + resData?.currencyType.name + '）';
        }
        setColumns(columnsTitle);
        setProps({
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
            // 表格右侧操作列配置 BasicColumn
            width: 120,
            title: '操作',
            dataIndex: 'action',
            fixed: 'right',
            align: 'center',
            slots: {
              customRender: 'action',
            },
          },
        });
        return data;
      };

      const [registerTable, { reload, setColumns, setProps }] = useTable({
        // title: '完善中标清单',
        api: getBidWinningListListByPageAndSortSumDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        // rowKey: 'bidWinningList.id',
        rowKey: (record) => record.bidWinningList.id,
        showTableSetting: true, // 显示表格设置工具
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
        bordered: true,
        showIndexColumn: true,
        actionColumn: {
          // 表格右侧操作列配置 BasicColumn
          width: 120,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          align: 'center',
          slots: {
            customRender: 'action',
          },
        },
        canResize: true, // 是否自适应高度
        // pagination: false, // 是否显示分页
        clickToRowSelect: false,
        rowSelection: {
          type: 'checkbox',
          // selectedRowKeys: checkedKeys, // 指定选中项的 key 数组，需要和 onChange 进行配合
          onChange: onSelectChange,
        },
      });

      // 表格可选择
      function onSelectChange(selectedRowKeys: (string | number)[]) {
        console.log(selectedRowKeys);
        checkedKeys.value = selectedRowKeys;
      }

      // 导入用户
      const handleimportUser = () => {
        if (unref(importMsg)) {
          createConfirm({
            iconType: 'warning',
            title: '提示',
            content: '导入清单将删除之前的清单数据,是否继续导入?',
            onOk: async () => {
              openModal(true);
            },
            onCancel: () => {
              createMessage.info('已取消导入');
            },
          });
        } else {
          openModal(true);
        }
      };

      // 添加
      const handleAdd = () => {
        openDrawer(true, {
          id: null,
          bidSectionId: unref(bidSectionId),
          currencyTypeName: unref(currencyTypeName),
        });
      };

      // 编辑
      const handleEditor = (record: any) => {
        openDrawer(true, {
          id: record.id,
          bidSectionId: unref(bidSectionId),
          currencyTypeName: unref(currencyTypeName),
        });
      };
      // 删除
      const handleDelete = async (record: any) => {
        try {
          await createConfirmPromise({
            iconType: 'info',
            content: '确认删除吗？',
          });
          await batchDelete({ ids: [record.id] });
          reload(); // 刷新表格
          createMessage.success('删除成功');
        } catch (err) {
          console.log('err:', err);
          // createMessage.error('删除失败');
        }
      };
      // 批量删除
      const handleDeleteAll = async () => {
        createConfirm({
          iconType: 'warning',
          // title: '提示',
          content: `确认批量删除吗？`,
          onOk: async () => {
            await batchDelete({ ids: toRaw(unref(checkedKeys)) });
            reload(); // 刷新表格
            createMessage.success('删除成功');
          },
          onCancel: () => {
            createMessage.info('已取消删除');
          },
        });
      };

      // 提交 提交之后跳转待确认的列表
      const handleSubmit = async () => {
        await createConfirmPromise({
          iconType: 'info',
          content: "确认提交吗?选择'确认',将会给项目的采购组织部门人发送短信",
        });

        const resData = await getProjectByProId(unref(projectId));
        const _data = {
          perName: resData.map.purchasePersonName,
          projectName: resData.proName,
          mobile: resData.map.purchasePersonMobile,
          // supplierQuotationMobile: resData.map.biddingCompanyPersonMobile,
          // supplierQuotationMobile: userInfo.mobile,
        };
        await submitBidWinningList(_data);
        createMessage.success('提交成功');
        close(route);
      };

      function handleSuccess() {
        reload(); // 刷新表格
      }

      return {
        total,
        importMsg,
        currencyTypeName,
        showBtn,
        publicPath,
        checkedKeys,
        bidSectionId,
        bidWinningAmount,
        registerTable,
        registerDrawer,
        registerModal,
        handleimportUser,
        handleAdd,
        handleEditor,
        handleDelete,
        handleDeleteAll, //  批量删除
        handleSubmit,
        handleSuccess,

        reload,
        getHqlQueryDto,
        ExportColumnKeyEnum,
        ExportColumnMap,
        ExportTypeEnum,
        currencyTypeCode,
        numberToChinese,
      };
    },
  });
</script>
<style scoped>
  :deep().ant-table-footer {
    text-align: center;
    padding: 10px;
  }
  .totalDiv p {
    display: inline-block;
    margin-bottom: 0px;
    padding: 0 10px;
  }
  .buttonBox {
    padding: 10px 12px 5px;
    background: #fff;
    display: flex;
    justify-content: space-between;
  }
  .buttonBox .ant-btn {
    margin-right: 10px;
  }
  /* 报表 */
  .box {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .report_iframe {
    height: 100%;
    width: 100%;
  }
  :deep() .ant-tabs-bar {
    margin: 0px;
  }
</style>
