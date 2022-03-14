<template>
  <div>
    <!-- module1 基本信息展示-->
    <CollapseContainer title="基本信息" :canExpan="false" class="mx-20px my-20px">
      <Description
        :labelStyle="{ width: '150px', fontWeight: 'bold' }"
        :column="3"
        :data="projectInfo"
        :schema="schemaData"
      />
    </CollapseContainer>

    <!-- module2 采购清单附件
      供应商报价时，可见该项目在“采购申报待申报”添加的采购清单附件 且只可见。
     -->
    <CollapseContainer title="采购清单附件" :canExpan="false" class="mx-20px my-20px h-160px">
      <LxBasicUploadTest
        v-if="fileListRef2.length > 0"
        v-model:value="fileListRef2"
        :limit="1"
        :multiple="false"
        :control="false"
      />
      <Empty v-else :image="simpleImage" description="暂无附件" />
    </CollapseContainer>

    <!-- module3 报价清单Table + Form -->
    <CollapseContainer title="报价清单" :canExpan="false" class="mx-20px my-20px">
      <BasicTable @register="registerTable">
        <template #tableTitle>
          <div class="totalDiv">
            <b>采购数量合计：</b>
            <span>{{ total.totalNumber }} </span>
            <b>预算总价合计：</b>
            <span
              >{{ total.totalUnitPrice.toFixed(2) }} {{ currencyType }}
              {{ currencyTypeCode === '1' ? numberToChinese(total.totalUnitPrice) : '' }}</span
            >
            <b>报价总价合计：</b>
            <span
              >{{ total.totalTransactionUnitPrice.toFixed(2) }} {{ currencyType }}
              {{
                currencyTypeCode === '1' ? numberToChinese(total.totalTransactionUnitPrice) : ''
              }}</span
            >
          </div>
        </template>
        <!-- 自定义title图标
        <template #customTitle1>
          报价单价
          <EditOutlined />
        </template>
        <template #customTitle2>
          实际技术参数
          <EditOutlined />
        </template> -->
        <template #actualSpec="{ text, record }">
          <a-button v-if="text" type="link" style="padding: 0 0" @click="handleOpenModal(record)">
            查看技术参数
          </a-button>
        </template>

        <template #action="{ record }">
          <TableAction
            :actions="[
              {
                label: '编辑',
                color: 'success',
                disabled: !idEditable,
                onClick: handleOpenDrawer.bind(null, record),
              },
            ]"
          />
        </template>
      </BasicTable>

      <!-- 报价金额表单 -->
      <BasicForm @register="registerForm">
        <template #purchaseFile="{ model, field }">
          <!-- 供应商报价附件 -->
          <LxBasicUploadTest
            v-model:value="model[field]"
            :limit="1"
            :multiple="false"
            :control="(JSON.stringify(model[field]) === '[]' && !idEditable) || idEditable"
            :disabled="!idEditable"
            @change="changeHandlerLxBasicUploadFile"
          />
        </template>
        <template #submitSlot v-if="idEditable">
          <div class="text-center">
            <a-button type="primary" @click="handleSubmit">提交报价</a-button>
          </div>
          <!-- <div class="text-center">
            <a-button type="primary" @click="fun">funnnn</a-button>
          </div> -->
        </template>
      </BasicForm>

      <!-- 实际技术参数 modal-->
      <tenderDetailsModal @register="registerModal" />

      <!-- 抽屉 -->
      <tenderDetailsDrawer @register="registerDrawer" @success="handleSuccess" />
    </CollapseContainer>
  </div>
</template>
<script lang="ts">
  /**
   * 招标详情(隐藏)
   * tenderDetails
   * openTender_6_1/tenderDetails/index.vue
   */
  import { Empty } from 'ant-design-vue';
  import { EditOutlined } from '@ant-design/icons-vue';
  import { defineComponent, ref, unref, toRaw, onMounted, reactive, nextTick } from 'vue';
  import { columns, formSchemas, schema } from './tenderDetails.data';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import { numberToChinese } from '/@/utils/commonServe/common';

  import { CollapseContainer } from '/@/components/Container/index'; // 卡片容器
  import { Description } from '/@/components/Description/index'; // 描述列表
  import { LxBasicUploadTest } from '/@/components/LxComponents'; // 上传附件组件
  import tenderDetailsDrawer from './components/tenderDetailsDrawer.vue'; // 报价清单抽屉
  import tenderDetailsModal from './components/tenderDetailsModal.vue'; // 实际技术参数

  import { useRoute, useRouter } from 'vue-router';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { CustomMsgEnum } from '/@/enums/messageEnum';

  import {
    getBidWinningListBy,
    saveSupplierQuotation,
    getSupplierQuotation,
    saveBidWinningList,
  } from '/@/api/purchase/supplierApi';
  import { getFileList, getBidSectionById, getProjectByProId } from '/@/api/purchase/plan-purchase';

  import { useConfigStore } from '/@/store/modules/config';
  import { getDictionaryByParentId } from '/@/api/demo/system';

  export default defineComponent({
    components: {
      BasicTable,
      TableAction,
      BasicForm,
      EditOutlined,

      Empty,
      CollapseContainer,
      Description,
      LxBasicUploadTest,
      tenderDetailsDrawer,
      tenderDetailsModal,
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const userInfo = useUserStore().getUserInfo;
      const configStore = useConfigStore();
      const { createMessage, createConfirm, createConfirmPromise } = useMessage();
      const projectId = ref<Number>(-999); // 项目id
      const bidSectionId = ref<Number>(-999); // 标段id
      const supplierQuotation_id = ref<Number>(-999); //供应商报价id
      const currencyType = ref<String>(); // 货币类型
      const currencyTypeCode = ref('0');
      const projectInfo = ref<any>({}); // 基本信息数据
      const schemaData = ref<any>([]); // 基本信息配置
      const fileListRef2 = ref<any>([]); // 1. 采购清单附件
      const fileListRef = ref<any>([]); // 2. 供应商报价附件

      const idEditable = ref<any>(true); // 是否可编辑
      if (route.query.idEditable !== undefined) {
        idEditable.value = Number(route.query.idEditable) ? true : false;
      }
      bidSectionId.value = Number(route.query.bidSectionId);

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
      // 计算合计
      const calculateTotal = (arrData: Array<any>) => {
        arrData.forEach((item) => {
          total.totalNumber += item.number;
          total.totalUnitPrice += item.number * item.unitPrice;
          total.totalTransactionUnitPrice += item.number * item.transactionUnitPrice;
        });
        // 四舍五入 保留小数点后两位
        total.totalUnitPrice = Number(total.totalUnitPrice.toFixed(2));
        total.totalTransactionUnitPrice = Number(total.totalTransactionUnitPrice.toFixed(2));
      };

      onMounted(async () => {
        // 获取基本信息;
        const bidSection = await getBidSectionById(Number(route.query.bidSectionId));
        projectId.value = bidSection.project.id;
        projectInfo.value = await getProjectByProId(projectId.value);
        schemaData.value = schema();
        currencyTypeCode.value = projectInfo.value?.currencyType.code;
        currencyType.value =
          projectInfo.value?.currencyType.code === '1'
            ? '元'
            : projectInfo.value?.currencyType.name;

        setColumns(columns(unref(currencyType)));
        resetSchema(formSchemas(unref(currencyType), unref(idEditable)));

        await reload();
        getFileListRef();
        let statusId; // 采购申报待申报阶段id
        const zhuangtai = await getDictionaryByParentId(
          configStore.GET_CONFIG_DICTIONRY.projectStatusId,
        );
        zhuangtai.forEach((item) => {
          if (item.code === '8') {
            statusId = item.id;
          }
        });
        getFileListRef2(statusId);
      });

      // 获取 采购清单附件 (采购申报待申报时 添加的采购清单附件)
      const getFileListRef2 = async (statusId) => {
        fileListRef2.value = await getFileList({
          projectId: projectId.value,
          objectType: 1,
          statusId: [statusId],
          objectName: 'pro_project',
        });
        fileListRef2.value = fileListRef2.value.filter((item) => {
          return item.fileType.statusId?.code === '8'; // 采购申报待申报状态
        });
        fileListRef2.value = fileListRef2.value?.[0].list;

        // if (!fileListRef2.value.length) {
        //   // 没有内容
        //   createMessage.error('请先配置文件类型！');
        // }
      };

      const fun = async () => {
        console.log('funnnnnnnnn');
        await getSupplierQuotation(unref(supplierQuotation_id));
      };

      // 获取 供应商报价附件
      const getFileListRef = async () => {
        let _file = {
          name: '',
          url: '',
        };
        const resData = await getSupplierQuotation(unref(supplierQuotation_id));
        if (resData?.filePath) {
          const index = resData.filePath.lastIndexOf('.');
          const suffix = resData.filePath.substring(index);
          _file.name = `供应商报价附件${suffix}`;
          _file.url = resData.filePath;
          setFieldsValue({ purchaseFile: [_file] });
        }

        // if (!fileListRef.value.length) {
        //   // 没有内容
        //   createMessage.error('请先配置文件类型！');
        // }
      };
      const changeHandlerLxBasicUploadFile = async (fileList, file, flag) => {
        // console.log('change handler in drawer: ', fileList, file, flag);
        validateFields(['purchaseFile']);
        if (flag === 'remove') {
          if (file.status !== 'error') {
            handleDeleteFile(fileList, file);
          }
        }
        if (flag === 'add') {
          // console.log('file:', file);

          const index = file.name.lastIndexOf('.');
          const suffix = file.name.substring(index);
          file.name = `供应商报价附件${suffix}`;

          // 2.报价表保存一份
          await saveSupplierQuotation({
            id: unref(supplierQuotation_id),
            // filePath: res.url,
            filePath: file.url,
          });
        }
      };
      const handleDeleteFile = async (fileList, file) => {
        await saveSupplierQuotation({
          // 2.报价表删除一份
          id: unref(supplierQuotation_id),
          filePath: '',
        });
        createMessage.success(CustomMsgEnum.DEL_SUCCESS);
      };

      const beforeFetch = async () => {
        setTableData([]); // important！！! 表格可编辑行的验证时ref reload刷新之后ref就不一样了
      };
      const afterFetchProcessData = (result: any) => {
        restTotal(); // 重置合计数据
        supplierQuotation_id.value = result.data.supplierQuotation.id;
        calculateTotal(result.data.bidWinningList);
        const sup_quotedAmount = result.data.supplierQuotation?.quotedAmount; //供应商报价总金额
        // 判断是否报价进行回填
        if (sup_quotedAmount === null) {
          if (total.totalTransactionUnitPrice) {
            setFieldsValue({
              budgetAmount: total.totalTransactionUnitPrice,
            });
          } else {
            setFieldsValue({
              budgetAmount: total.totalUnitPrice,
            });
          }
        } else {
          setFieldsValue({
            budgetAmount: sup_quotedAmount,
          });
        }
        // return data;
      };
      // 报价清单列表
      const [registerTable, { reload, setTableData, getDataSource, setColumns }] = useTable({
        // api: getBidWinningListBy,
        immediate: false,
        api: async (params) => {
          try {
            const result = await getBidWinningListBy(params);
            afterFetchProcessData(result);
            return result.data.bidWinningList;
          } catch (err) {
            console.log('error is: ', err);
          }
        },
        searchInfo: {
          // userId: userInfo.id,
          userId: unref(idEditable) ? userInfo.id : route.query.registeredSupplierId,
          bidSectionId: unref(bidSectionId),
        },
        beforeFetch,
        // afterFetch,
        columns: columns(unref(currencyType)), // 表单列信息
        rowKey: 'id',
        bordered: true,
        showIndexColumn: true,
        actionColumn: {
          // 表格右侧操作列配置 BasicColumn
          width: 120,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          slots: {
            customRender: 'action',
          },
        },
        pagination: false, // 不显示分页
        canResize: false, // 是否自适应高度
      });

      // 查看实际技术参数 Modal
      const [registerModal, { openModal }] = useModal();
      const handleOpenModal = (record?: any) => {
        openModal(true, { actualSpec: record.actualSpec });
      };

      // 抽屉
      const [registerDrawer, { openDrawer }] = useDrawer();
      const handleOpenDrawer = (record: any) => {
        openDrawer(true, { record: toRaw(record), currencyType: unref(currencyType) });
      };

      // 报价总金额 form
      const [
        registerForm,
        { getFieldsValue, setFieldsValue, resetFields, validate, validateFields, resetSchema },
      ] = useForm({
        labelWidth: 170,
        schemas: formSchemas(unref(currencyType), unref(idEditable)),
        actionColOptions: {
          span: 24,
        },
        showResetButton: false, // 是否显示重置按钮
        showSubmitButton: false, // 是否显示提交按钮
        // submitButtonOptions: {
        //   text: '提交报价',
        // },
      });
      // 提交报价button
      const handleSubmit = async () => {
        try {
          await validate();
          const IsRequired = configStore.GET_CONFIG_MODULE.supplierQuotationFileRequired;
          formValidation(!IsRequired);
        } catch (err) {
          console.log('err:', err);
        }
      };

      // 表单提交验证
      const formValidation = async (bol) => {
        if (bol) {
          // 获取tabel数据 校验 报价单价与实际技术参数 必填项
          const tableData = getDataSource();

          let tablevalidate;
          // 报价清单表格数据
          if (tableData) {
            tablevalidate = tableData.every((item) => {
              return item.transactionUnitPrice !== null && item.actualSpec !== null;
            });
          } else {
            tablevalidate = true;
          }

          if (tablevalidate) {
            const _data = {
              userId: userInfo.id,
              bidSectionId: unref(bidSectionId),
              quotedAmount: getFieldsValue().budgetAmount.toString(),
            };
            await saveBidWinningList(_data);
            createMessage.success('提交报价成功');
            router.push('/supplier/alreadyquote');
          } else {
            createConfirm({
              iconType: 'info',
              title: '提示',
              content: '报价单价 与 实际技术参数 为必填项',
              okCancel: false,
              okText: '确定',
            });
          }
        } else {
          const _data = {
            userId: userInfo.id,
            bidSectionId: unref(bidSectionId),
            quotedAmount: getFieldsValue().budgetAmount.toString(),
          };
          await saveBidWinningList(_data);
          createMessage.success('提交报价成功');
          router.push('/supplier/alreadyquote');
        }
      };

      function handleSuccess() {
        reload(); // 刷新表格
      }
      return {
        fun,
        idEditable,
        fileListRef,
        fileListRef2,
        total, // 统计
        projectInfo, // 基本信息数据
        schemaData, // 基本信息配置
        currencyType, // 货币类型
        registerTable,
        handleSuccess,
        registerForm,
        handleSubmit,
        registerModal,
        handleOpenModal,
        registerDrawer,
        handleOpenDrawer,
        changeHandlerLxBasicUploadFile,
        currencyTypeCode,
        numberToChinese,
        simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      };
    },
  });
</script>
<style scoped>
  :deep().ant-input-number {
    width: 50%;
  }
  :deep().ant-row.ant-form-item {
    padding-top: 10px;
  }
  .totalDiv span {
    display: inline-block;
    padding-right: 10px;
  }
</style>
