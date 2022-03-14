<template>
  <div class="page-test-page_cyk">
    <CollapseContainer
      v-if="isIntention"
      class="pd-20"
      title="注意事项"
      :canExpan="false"
      style="color: #ed6f6f"
    >
      <div class="pd-40">
        以下项目进行项目申报前，需按规定进行采购意向公开： <br />
        一、货物、服务采购项目：<br />
        &nbsp;&nbsp;&nbsp;&nbsp;1、预算{{ configModule.goodsAndServicesStartAmount / 10000 }}-{{
          configModule.goodsAndServicesEndAmount / 10000
        }}万元（含{{ configModule.goodsAndServicesStartAmount / 10000 }}万元、不含{{
          configModule.goodsAndServicesEndAmount / 10000
        }}万元）采购意向公开不少于{{ configModule.nonGovPublicDays }}天；<br />
        &nbsp;&nbsp;&nbsp;&nbsp;2、预算{{
          configModule.goodsAndServicesEndAmount / 10000
        }}万元以上（含{{ configModule.goodsAndServicesEndAmount / 10000 }}万元）采购意向公开不少于{{
          configModule.govPublicDays
        }}天。<br />
        二、工程采购项目预算{{ configModule.engineeringStartAmount / 10000 }}万元以上（含{{
          configModule.engineeringStartAmount / 10000
        }}万元）采购意向公开不少于{{ configModule.govPublicDays }}天。<br />
      </div>
    </CollapseContainer>
    <CollapseContainer class="pd-20" title="基本信息" :canExpan="false">
      <Row class="baseInfo">
        <Col :span="22" :offset="1">
          <BasicForm @register="registerForm">
            <template #purchaseDeptName="{ model, field }">
              <span>{{ model[field] }}</span>
            </template>
            <template #purchasePerson="{ model, field }">
              <span>{{ model[field] }}</span>
            </template>
            <template #biddingCompanyName="{ model, field }">
              <span>{{ model[field] }}</span>
            </template>
            <template #biddingCompanyPerson="{ model, field }">
              <span>{{ model[field] }}</span>
            </template>
          </BasicForm>
        </Col>
      </Row>

      <AButton
        v-if="!ifBidSectionMng || (ifBidSectionMng && !BDListRef.length)"
        class="lly"
        type="primary"
        @click="saveProject"
        >保存</AButton
      >
    </CollapseContainer>
    <CollapseContainer class="pd-20" title="采购清单" v-if="!ifShow" :canExpan="false">
      <BasicForm @register="registerForm1" v-if="ifShowTextArea" />
      <BasicTable @register="registerTable" @selection-change="getSelected">
        <template #tableTitle>
          {{ title }}
          <div
            v-if="purchaseList === 0 || totalAmount !== projectBudgetAmount"
            class="point point-flicker"
          ></div>
          <span style="color: #ed6f6f">{{
            purchaseList > 0
              ? totalAmount !== projectBudgetAmount
                ? '与预算金额不符'
                : ''
              : '项目清单逐一添加'
          }}</span>
        </template>
        <template #toolbar v-if="ifnoAction || ifBidSectionMng">
          <a-button
            v-if="!ifBidSectionMng"
            type="primary"
            :disabled="ids.length <= 1"
            @click="deleteIds"
          >
            批量删除
          </a-button>
          <a-button
            type="primary"
            :disabled="ids.length < 1"
            @click="setBid"
            v-if="ifShowBatchSetBid"
          >
            批量修改所在标段
          </a-button>
          <template v-if="!ifBidSectionMng">
            <a-button>
              <a
                :href="`${publicPath}resource/template/purchaseList.xlsx`"
                download="采购清单模板.xlsx"
                class="pos-absolute"
                style="width: 100%; height: 100%; left: 0; top: 0"
                >下载采购清单模板</a
              >
            </a-button>
            <a-button type="primary" @click="importPurchase"> 导入采购清单 </a-button>
            <LxBasicExportBtn
              v-if="currencyType.code === '1' && ifMultiBidSection"
              :disabled="disabled"
              :exportType="ExportTypeEnum.PURCHASE"
              :exportExcelDto="{
                fileName: '采购清单',
                sheetName: '采购清单',
                ifShowTotal: false,
                listDataColumn: [
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_NAME],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_BRANDMODAL],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_SPEC],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_UNITDIC],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_NUMBER],
                  {
                    dataName: 'unitPrice',
                    dataType: 'String',
                    dataTitle: `预算单价（元）`,
                    width: 3000,
                  },
                  {
                    dataName: 'unitSumPrice',
                    dataType: 'String',
                    dataTitle: `预算总价（元）`,
                    width: 3000,
                  },
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_PURCHASETYPE],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_PROBIDSECTION],
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
            <LxBasicExportBtn
              v-if="currencyType.code === '1' && !ifMultiBidSection"
              :disabled="disabled"
              :exportType="ExportTypeEnum.PURCHASE"
              :exportExcelDto="{
                fileName: '采购清单',
                sheetName: '采购清单',
                ifShowTotal: false,
                listDataColumn: [
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_NAME],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_BRANDMODAL],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_SPEC],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_UNITDIC],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_NUMBER],
                  {
                    dataName: 'unitPrice',
                    dataType: 'String',
                    dataTitle: `预算单价（元）`,
                    width: 3000,
                  },
                  {
                    dataName: 'unitSumPrice',
                    dataType: 'String',
                    dataTitle: `预算总价（元）`,
                    width: 3000,
                  },
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_PURCHASETYPE],
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
            <LxBasicExportBtn
              v-if="currencyType.code !== '1' && ifMultiBidSection"
              :disabled="disabled"
              :exportType="ExportTypeEnum.PURCHASE"
              :exportExcelDto="{
                fileName: '采购清单',
                sheetName: '采购清单',
                ifShowTotal: false,
                listDataColumn: [
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_NAME],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_BRANDMODAL],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_SPEC],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_UNITDIC],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_NUMBER],
                  {
                    dataName: 'unitPrice',
                    dataType: 'String',
                    dataTitle: `预算单价（${currencyType.name}）`,
                    width: 3000,
                  },
                  {
                    dataName: 'unitSumPrice',
                    dataType: 'String',
                    dataTitle: `预算总价（${currencyType.name}）`,
                    width: 3000,
                  },
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_PURCHASETYPE],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_PROBIDSECTION],
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
            <LxBasicExportBtn
              v-if="currencyType.code !== '1' && !ifMultiBidSection"
              :disabled="disabled"
              :exportType="ExportTypeEnum.PURCHASE"
              :exportExcelDto="{
                fileName: '采购清单',
                sheetName: '采购清单',
                ifShowTotal: false,
                listDataColumn: [
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_NAME],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_BRANDMODAL],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_SPEC],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_UNITDIC],
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_NUMBER],
                  {
                    dataName: 'unitPrice',
                    dataType: 'String',
                    dataTitle: `预算单价（${currencyType.name}）`,
                    width: 3000,
                  },
                  {
                    dataName: 'unitSumPrice',
                    dataType: 'String',
                    dataTitle: `预算总价（${currencyType.name}）`,
                    width: 3000,
                  },
                  ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_PURCHASETYPE],
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
            <a-button type="primary" @click="handleCreate"> 添加采购清单 </a-button></template
          >
        </template>
        <template #action="{ record }">
          <TableAction
            :actions="[
              {
                icon: '',
                label: '编辑',
                onClick: handleEdit.bind(null, record),
              },
              {
                icon: '',
                color: 'error',
                label: '删除',
                onClick: handleDelete.bind(null, record),
              },
            ]"
          />
        </template>
      </BasicTable>
      <PurchaseDrawer
        @register="registerDrawer"
        :purchaseType="purchaseType"
        :currencyType="currencyType"
        @success="handleSuccess"
      />
      <BasicTable
        @register="registerBDTable"
        v-if="(ifDeclare || ifBidSectionMng) && ifMultiBidSection"
      >
        <template
          #toolbar
          v-if="
            ifnoAction &&
            (!ifBidSectionMng || (ifBidSectionMng && !ifBidSectionIsBeforeBidSectionMng))
          "
        >
          <a-button type="primary" @click="handleAddBD"> 添加项目标段 </a-button>
        </template>
        <template #tableTitle>
          {{ BDtitle }}
        </template>
        <template #action="{ record }">
          <TableAction
            v-if="ifBidSectionMng && !ifBidSectionIsBeforeBidSectionMng"
            :actions="[
              {
                label: '编辑',
                onClick: handleEditBD.bind(null, record),
                disabled: record.status?.code - 0 >= 16,
              },
              {
                color: 'error',
                label: '删除',
                onClick: handleDeleteBD.bind(null, record),
                disabled: record.status?.code - 0 >= 16,
              },
              {
                label: '编辑采购计划',
                onClick: btnHandlerEditPurchasePlan.bind(null, record),
                disabled: record.status?.code - 0 >= 16,
              },
              {
                label: '设为待上传采购文件',
                onClick: btnHandlerSetPurchaseFilesWaitUploading.bind(null, record),
                disabled:
                  !record?.organizationalForm?.id ||
                  !record?.procurementMethod?.id ||
                  record.status?.code - 0 >= 16,
              },
            ]"
          />
          <TableAction
            v-else-if="ifBidSectionMng && ifBidSectionIsBeforeBidSectionMng"
            :actions="[
              {
                label: '编辑采购计划',
                onClick: btnHandlerEditPurchasePlan.bind(null, record),
                disabled: record.status?.code - 0 >= 16,
              },
              {
                label: '设为待上传采购文件',
                onClick: btnHandlerSetPurchaseFilesWaitUploading.bind(null, record),
                disabled:
                  !record?.organizationalForm?.id ||
                  !record?.procurementMethod?.id ||
                  record.status?.code - 0 >= 16,
              },
            ]"
          />
          <TableAction
            v-else
            :actions="[
              {
                icon: '',
                label: '编辑',
                onClick: handleEditBD.bind(null, record),
              },
              {
                icon: '',
                color: 'error',
                label: '删除',
                onClick: handleDeleteBD.bind(null, record),
              },
            ]"
          />
        </template>
      </BasicTable>
      <BidSectionDrawer
        @register="registerDrawerBD"
        :statusId="status"
        @success="handleBDSuccess"
      />
      <BDModal
        @register="registerBD"
        :bidList="bidList"
        :proId="proId"
        @success="saveBDModal"
        @cancel="cancelBDModal"
      />
    </CollapseContainer>
    <CollapseContainer
      class="pd-20 file-list"
      v-if="!ifShow && fileList.length > 0 && !ifBidSectionMng"
      :canExpan="false"
    >
      <template #title>
        项目附件
        <Tooltip placement="right">
          <template #title>
            1. 单次上传文件最大个数：{{ limitMaxAmount }}<br />
            2. 单个上传文件最大上限大小：{{ configSize }}M<br />
            3. 上传文件格式：{{ acceptType }}<br />
          </template>
          <Icon icon="ant-design:question-circle-outlined" class="fileIcon"></Icon>
        </Tooltip>
      </template>

      <Row>
        <Col :span="12" v-for="(item, index) in fileList" :key="item.fileType?.id">
          <LxFileUpload
            v-if="fileList.length > 0"
            @change="upload"
            :key="index"
            :proId="proId"
            :name="item.fileType.name"
            :fileType="item.fileType"
            :fileList="item.list"
          />
        </Col>
      </Row>
    </CollapseContainer>
    <!-- 导入采购清单 -->
    <UploadTemplate @register="registerModal" :projectId="proId" @success="sucessAndReload" />
    <EditPurchasePlanForBidSectionDrawer
      @register="registerEditPurchasePlanForBidSectionDrawer"
      @save-purchase-plan-success="customHandlerSavePurchasePlanSuccess"
    />
    <AButton
      v-show="proId && ifSubmit"
      class="submit_btn"
      id="float_btn"
      :loading="submitLoading"
      type="primary"
      @click="submit"
      >提交</AButton
    >
  </div>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    toRaw,
    watch,
  } from 'vue';
  import { CollapseContainer } from '/@/components/Container';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { formSchema, columns, textAreaSchema, BDcolumns } from './purchase.data';
  import PurchaseDrawer from './purchaseDrawer.vue';
  import BidSectionDrawer from './bidSectionDrawer.vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useDrawer } from '/@/components/Drawer';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { ExportTypeEnum } from '/@/enums/businessEnum';
  import {
    LxBasicExportBtn,
    ExportColumnKeyEnum,
    ExportColumnMap,
  } from '/@/components/LxComponents';

  import {
    batchDelete,
    batchModificate,
    checkProjectRepeat,
    deleteBidSection,
    deletePurchase,
    getBidList,
    getBidSection,
    getFileList,
    getFundsCategoryById,
    getFundsCategoryDepSelect,
    // getProjectById,
    getPurchaseList,
    getUserListByDepId,
    preservateOfficeExpenses,
    savePurchasePlan,
    submitVerification,
    verificatePublicityDays,
  } from '/@/api/purchase/plan-purchase';
  import { getProjectByProId as getProjectById } from '/@/api/purchase/supplierApi';
  import { useUserStore } from '/@/store/modules/user';
  import UploadTemplate from './UploadTemplate.vue';
  import LxFileUpload from '../../../components/LxComponents/LxUploadTest/LxFileUpload.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute, useRouter } from 'vue-router';
  import { cloneDeep } from 'lodash-es';
  import { Col, Row, Tooltip } from 'ant-design-vue';
  import { personListFormatter } from '/@/utils/commonServe/businessUtil';
  import { useConfigStore } from '/@/store/modules/config';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import { useModal } from '/@/components/Modal/src/hooks/useModal';
  import {
    getNamePatternNoSpaceRule,
    getNamePatternRule,
  } from '/@/utils/helper/validateRuleHelper';
  import { debouncePromise, numberToChinese, waitForPromise } from '/@/utils/commonServe/common';
  import BDModal from './BDModal.vue';
  import EditPurchasePlanForBidSectionDrawer from './EditPurchasePlanForBidSectionDrawer.vue';
  import { bidSectionMngComp } from './bidSectionMng.comp';
  import Icon from '../../../components/Icon/src/Icon.vue';
  import componentSetting from '/@/settings/componentSetting';
  import { CustomMsgEnum } from '/@/enums/messageEnum';
  import { usePromiseQueue } from '/@/utils/commonServe/usePromiseQueue';
  import { projectDeclare } from '/@/api/auditMangement/auditMangement';
  import { useBusinessStore } from '/@/store/modules/business';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { usefloatBtn } from './floatBtn';
  export default defineComponent({
    name: 'purchasePlan',
    components: {
      CollapseContainer,
      BasicForm,
      BasicTable,
      TableAction,
      PurchaseDrawer,
      BidSectionDrawer,
      LxFileUpload,
      UploadTemplate,
      Col,
      Row,
      BDModal,
      Tooltip,
      Icon,
      EditPurchasePlanForBidSectionDrawer,
      LxBasicExportBtn,
      ExportColumnKeyEnum,
      ExportColumnMap,
      ExportTypeEnum,
    },
    setup() {
      const publicPath = import.meta.env.VITE_PUBLIC_PATH || '/';
      const totalNumber = ref(0); // 采购数量
      const totalAmount = ref(0); // 采购清单合计
      const title = ref(''); // 采购清单标题
      const BDtitle = ref(''); // 标段标题
      const ifShow = ref(true); // 是否是新增项目
      const proId = ref(0);
      const statusList = ref([]); // 项目状态
      const status = ref(0); // 当前项目状态
      const route = useRoute();
      const router = useRouter();
      const ifShowTextArea = ref(false); // 多行文本框
      const configStore = useConfigStore();
      const fileList: any = ref([]); // 附件
      const purchaseType: any = ref(0); // 采购类型
      const currencyType: any = ref(0); // 货币类型
      const _formData: any = ref({});
      const ifnoAction: any = ref(true); // 是否显示采购清单上方的button
      const isIntention: any = ref(false); // 是否意向公开
      const ids: any = ref([]);
      const projectCode = ref();
      const bidList = ref([]);
      const currencyTypeList = ref([]);
      const ifDeclare = ref(false); // 是否采购申报
      const ifBidSectionMng = ref(false); // 是否 待采购 的采购管理；业务：1. 标段：在此之前创建的标段不可编辑 2. 清单：都不能编辑
      const projectAdditionPhase = ref(0);
      const projectBudgetAmount = ref(0);
      const purchaseList = ref(0);
      const ifMultiBidSection = ref(false); // 是否多标段
      const configSize = ref(0);
      const limitMaxAmount = ref(0);
      const acceptType = ref();
      const configModule = ref();
      const ifSubmit = ref(false);
      const submitLoading = ref(false);
      configModule.value = configStore.GET_CONFIG_MODULE;
      const userInfo = useUserStore().getUserInfo;
      const { lxBasicUpload: lxBasicUploadSetting } = componentSetting;
      const getAccept = computed(() => {
        let _settingImg = lxBasicUploadSetting?.acceptImgExt ?? [];
        let _settingFile = lxBasicUploadSetting?.acceptFileExt ?? [];
        return [..._settingImg, ..._settingFile].join(',');
      });
      console.log('获取文件格式', getAccept.value);
      configSize.value = configStore.GET_CONFIG_BASEINFO?.uploadImageMaxSize ?? '';
      limitMaxAmount.value = configStore.GET_CONFIG_BASEINFO?.uploadImageMaxCount ?? '';
      acceptType.value = getAccept.value.replace(/\./g, '  ');
      // acceptType.value = getAccept.value.replace(',.', '  ');
      const configDictionary = configStore.GET_CONFIG.configInfo?.configDictionary;
      // computed
      // 标段是否在 待采购（bidSectionMng）之前创建的，禁用标段 以及 项目清单
      const ifBidSectionIsBeforeBidSectionMng = computed(() => {
        // project 中表征标段 创建的 阶段
        return _formData.value?.multiBidSectionAdditionPhase === 4;
      });

      watch(
        () => ifMultiBidSection.value,
        (newValue) => {
          if (!!newValue) {
            updateSchema({
              field: 'ifMultiBidSection',
              label: '是否多标段项目',
              component: 'RadioGroup',
              colProps: { span: 24 },
              required: true,
              defaultValue: 1,
              componentProps: {
                disabled: true,
                options: [
                  {
                    label: '是',
                    value: 1,
                  },
                  {
                    label: '否',
                    value: 0,
                  },
                ],
              },
            });
          } else {
            updateSchema({
              field: 'ifMultiBidSection',
              label: '是否多标段项目',
              component: 'RadioGroup',
              colProps: { span: 24 },
              required: true,
              defaultValue: 1,
              componentProps: {
                disabled: false,
                options: [
                  {
                    label: '是',
                    value: 1,
                  },
                  {
                    label: '否',
                    value: 0,
                  },
                ],
              },
            });
          }
        },
      );
      onMounted(async () => {
        const { reload: reloadFloatBtn } = usefloatBtn();
        statusList.value = await getDictionaryByParentId(
          configStore.GET_CONFIG.configInfo?.configDictionary?.projectStatusId,
        );
        currencyTypeList.value = await getDictionaryByParentId(
          configStore.GET_CONFIG.configInfo?.configDictionary?.currencyTypeId,
        );
        const _status: any = statusList.value.find((item: any) => item.code === '1');
        status.value = _status.id;
        if (route.path.indexOf('purchase') !== -1) {
          ifSubmit.value = true;
        }
        if (route.path.indexOf('initiation') !== -1) {
          ifSubmit.value = true;
          const _status: any = statusList.value.find((item: any) => item.code === '4');
          status.value = _status.id;
        }
        if (route.path.indexOf('declare') !== -1) {
          ifSubmit.value = true;
          ifDeclare.value = true;
          const _status: any = statusList.value.find((item: any) => item.code === '8');
          status.value = _status.id;
        } else {
          ifDeclare.value = false;
        }
        if (route.path.indexOf('intention') !== -1) {
          ifSubmit.value = true;
          isIntention.value = true;
          const _status: any = statusList.value.find((item: any) => item.code === '6');
          status.value = _status.id;
        } else {
          isIntention.value = false;
        }
        // 待采购的  标段管理
        if (route.path.indexOf('bidSectionMng') !== -1) {
          ifBidSectionMng.value = true;
          const _status: any = statusList.value.find((item: any) => item.code === '15');
          status.value = _status.id;
          // 设置 form 的禁用
          setPropsBasicForm({ disabled: true });
        } else {
          ifBidSectionMng.value = false;
        }
        appendForm();
        proId.value = Number(route.query.id);
        // 提交按钮的位置
        if (proId.value) {
          if (ifSubmit.value) {
            nextTick(() => {
              reloadFloatBtn();
            });
          }
          bidList.value = await getBidList(proId.value);
          ifShowTextArea.value = configStore.GET_CONFIG_MODULE.ifShowQualityRequirement;
          const basicForm = await getProjectById(proId.value);
          // 添加待采购阶段的 表单项
          await appendBidSectionFormSchema(ifBidSectionMng, basicForm, appendSchemaByField);
          _formData.value = cloneDeep(basicForm);
          const formData: any = cloneDeep(basicForm);
          // 货币类型 => drawinner
          projectAdditionPhase.value = formData.projectAdditionPhase;
          projectBudgetAmount.value = formData.budgetAmount;
          currencyType.value = formData.currencyType;
          ifShow.value = false;
          ifMultiBidSection.value = formData.ifMultiBidSection;
          formData.currencyType = formData.currencyType?.id;
          formData.engineeringProperties = formData.engineeringProperties?.id;
          projectCode.value = formData.projectType?.code;
          formData.projectType = formData.projectType?.id;
          formData.sourceFunds = formData.sourceFunds?.id;
          formData.useDirection = formData.useDirection?.id;
          if (formData.initiationMethod) {
            // formData.initiationMethod = JSON.parse(formData.initiationMethod);
            const initMethod = formData?.initiationMethod?.split(',');
            const arr: number[] = [];
            initMethod.forEach((item) => {
              item = Number(item);
              arr.push(item);
            });
            formData.initiationMethod = arr;
          } else {
            formData.initiationMethod = [];
          }
          purchaseType.value = formData.projectType;
          if (projectCode.value === '2') {
            updateSchema({
              field: 'engineeringProperties',
              ifShow: true,
              componentProps: {
                api: getDictionaryByParentId,
                params: configDictionary?.engineeringPropertiesId,
                placeholder: '请选择工程性质',
                labelField: 'name',
                valueField: 'id',
                showSearch: true,
                optionFilterProp: 'label',
              },
            });
          } else {
            updateSchema({
              field: 'engineeringProperties',
              ifShow: false,
              componentProps: {
                api: getDictionaryByParentId,
                params: configDictionary?.engineeringPropertiesId,
                placeholder: '请选择工程性质',
                labelField: 'name',
                valueField: 'id',
                showSearch: true,
                optionFilterProp: 'label',
              },
            });
          }
          if (projectCode.value === '3') {
            updateSchema({
              field: 'servicePeriod',
              ifShow: true,
            });
            updateSchema({
              field: 'serviceContent',
              ifShow: true,
            });
          } else {
            updateSchema({
              field: 'servicePeriod',
              ifShow: false,
            });
            updateSchema({
              field: 'serviceContent',
              ifShow: false,
            });
          }
          if (formData.ifImportedEquipment) {
            updateSchema({
              field: 'countryOfOrigin',
              ifShow: true,
            });
          } else {
            updateSchema({
              field: 'countryOfOrigin',
              ifShow: false,
            });
          }
          if (formData.ifSingleSource) {
            updateSchema({
              field: 'proposedTransactionUnit',
              ifShow: true,
            });
          } else {
            updateSchema({
              field: 'proposedTransactionUnit',
              ifShow: false,
            });
          }
          await updateSchema({
            field: 'fundsDepId',
            componentProps: () => ({
              api: getFundsCategoryDepSelect,
              params: formData.fundsCategoryId,
              placeholder: '请选择经费主管部门',
              labelField: 'name',
              valueField: 'id',
            }),
          });
          await updateSchema({
            field: 'proChargeUserId',
            componentProps: () => ({
              api: getUserListByDepId,
              params: formData.proChargeDepId,
              placeholder: '请选择项目负责人',
              showSearch: true,
              optionFilterProp: 'label',
              resultFormatter: personListFormatter,
            }),
          });
          // 修改 formData 添加 组织处理人 组织处理部门 招标公司 业务代理人
          await appendBidSectionFormData(ifBidSectionMng, _formData.value, formData);
          if (ifShowTextArea.value) {
            // 显示 textarea
            nextTick(async () => {
              await setFieldsValueTextArea(formData);
              await clearValidateTextArea();
            });
          }
          await setFieldsValue(formData);
          await clearValidate();
          // 招标采购模块不需要这个
          if (!ifBidSectionMng.value) {
            fileList.value = await getFileList({
              projectId: proId.value,
              objectType: 1,
              statusId: [status.value],
              objectName: 'pro_project',
            });
            if (!configModule.value.purchaseListAttachmentDropDown) {
              let fileIndex = 0;
              fileList.value.forEach((item, index) => {
                console.log('附件', item);
                if (item.fileType.statusId && item.fileType.statusId.code === '8') {
                  fileIndex = index;
                }
              });
              fileList.value.splice(fileIndex, 1);
            }
          }
          if (route.path.indexOf('initiation') !== -1 && formData.projectAdditionPhase !== 2) {
            ifnoAction.value = false;
            reload();
          }
          if (route.path.indexOf('intention') !== -1 && formData.projectAdditionPhase !== 3) {
            ifnoAction.value = false;
            reload();
          }
          await disabledForm();
          reload();
        } else {
          ifShowTextArea.value = false;
        }
        await updateSchema({
          field: 'proName',
          rules: [
            {
              required: true,
              message: '请输入项目名称',
              trigger: ['change', 'blur'],
            },
            getNamePatternNoSpaceRule(50, 'change'),
            {
              trigger: ['change', 'blur'],
              validator: debouncePromise(async (_, value) => {
                const params = {
                  id: proId.value,
                  proName: value,
                };
                const bool = await checkProjectRepeat(params);
                if (bool) {
                  return Promise.resolve();
                  // return;
                } else {
                  return Promise.reject('项目名称重复！');
                  // throw new Error('角色名称重复！');
                }
              }, 800),
            },
          ],
        });
        if (!!ifShowTextArea.value) {
          upDateTextArea({
            field: 'mainFunctionalObjectives',
            componentProps: ({ formModel }) => {
              return {
                placeholder: '请输入采购标的须实现的主要功能或目标',
                disabled:
                  (route.path.indexOf('initiation') !== -1 &&
                    _formData.value.projectAdditionPhase &&
                    _formData.value.projectAdditionPhase !== 2) ||
                  (route.path.indexOf('intention') !== -1 &&
                    _formData.value.projectAdditionPhase &&
                    _formData.value.projectAdditionPhase !== 3),
                onblur: async () => {
                  try {
                    saveProTextArea(
                      'mainFunctionalObjectives',
                      toRaw(formModel).mainFunctionalObjectives,
                    );
                  } catch (error) {}
                },
              };
            },
          });
          upDateTextArea({
            field: 'basicRequirements',
            componentProps: ({ formModel }) => {
              return {
                placeholder: '请输入供应商基本要求',
                disabled:
                  (route.path.indexOf('initiation') !== -1 &&
                    _formData.value.projectAdditionPhase &&
                    _formData.value.projectAdditionPhase !== 2) ||
                  (route.path.indexOf('intention') !== -1 &&
                    _formData.value.projectAdditionPhase &&
                    _formData.value.projectAdditionPhase !== 3),
                value: toRaw(formModel).basicRequirements,
                warn: '如：满足《中华人民共和国政府采购法》第二十二条规定，项目有特定要求自行填写，例如：系统集成二级等',
                onChange: async (e: any) => {
                  try {
                    saveProTextArea('basicRequirements', e);
                  } catch (error) {}
                },
              };
            },
          });
          upDateTextArea({
            field: 'qualityRequirements',
            componentProps: ({ formModel }) => {
              return {
                placeholder: '请输入质量要求',
                disabled:
                  (route.path.indexOf('initiation') !== -1 &&
                    _formData.value.projectAdditionPhase &&
                    _formData.value.projectAdditionPhase !== 2) ||
                  (route.path.indexOf('intention') !== -1 &&
                    _formData.value.projectAdditionPhase &&
                    _formData.value.projectAdditionPhase !== 3),
                value: toRaw(formModel).qualityRequirements,
                warn: '1.质保期限；2.其他特殊质保要求',
                onChange: async (e: any) => {
                  try {
                    saveProTextArea('qualityRequirements', e);
                  } catch (error) {}
                },
              };
            },
          });
          upDateTextArea({
            field: 'serviceRequirements',
            componentProps: ({ formModel }) => {
              return {
                placeholder: '请输入服务要求',
                disabled:
                  (route.path.indexOf('initiation') !== -1 &&
                    _formData.value.projectAdditionPhase &&
                    _formData.value.projectAdditionPhase !== 2) ||
                  (route.path.indexOf('intention') !== -1 &&
                    _formData.value.projectAdditionPhase &&
                    _formData.value.projectAdditionPhase !== 3),
                value: toRaw(formModel).serviceRequirements,
                warn: '1.售后服务要求；2.服务项目中的其他要求',
                onChange: async (e: any) => {
                  try {
                    saveProTextArea('serviceRequirements', e);
                  } catch (error) {}
                },
              };
            },
          });
          upDateTextArea({
            field: 'safetyRequirements',
            componentProps: ({ formModel }) => {
              return {
                placeholder: '请输入安全要求',
                disabled:
                  (route.path.indexOf('initiation') !== -1 &&
                    _formData.value.projectAdditionPhase &&
                    _formData.value.projectAdditionPhase !== 2) ||
                  (route.path.indexOf('intention') !== -1 &&
                    _formData.value.projectAdditionPhase &&
                    _formData.value.projectAdditionPhase !== 3),
                value: toRaw(formModel).safetyRequirements,
                warn: '相关产品、技术等相关安全要求',
                onChange: async (e: any) => {
                  try {
                    saveProTextArea('safetyRequirements', e);
                  } catch (error) {}
                },
              };
            },
          });
          upDateTextArea({
            field: 'timeLimitRequirements',
            componentProps: ({ formModel }) => {
              return {
                placeholder: '请输入时限要求',
                disabled:
                  (route.path.indexOf('initiation') !== -1 &&
                    _formData.value.projectAdditionPhase &&
                    _formData.value.projectAdditionPhase !== 2) ||
                  (route.path.indexOf('intention') !== -1 &&
                    _formData.value.projectAdditionPhase &&
                    _formData.value.projectAdditionPhase !== 3),
                value: toRaw(formModel).timeLimitRequirements,
                warn: '供货期、服务期或工期',
                onChange: async (e: any) => {
                  try {
                    saveProTextArea('timeLimitRequirements', e);
                  } catch (error) {}
                },
              };
            },
          });
        }
        if (ifBidSectionMng.value) {
          if (ifShowTextArea.value) {
            nextTick(() => {
              setPropsTextAreaForm({ disabled: true });
            });
          }
        }
      });
      const initiationMethod: any = ref();
      function appendForm() {
        if (
          route.path.indexOf('initiation') !== -1 ||
          route.path.indexOf('intention') !== -1 ||
          route.path.indexOf('declare') !== -1 ||
          route.path.indexOf('bidSectionMng') !== -1
        ) {
          updateSchema({
            field: 'projectType',
            required: true,
          });
          updateSchema({
            field: 'sourceFunds',
            required: true,
          });
          appendSchemaByField(
            {
              field: 'initiationMethod',
              label: '项目立项方式',
              component: 'ApiSelect',
              colProps: { span: 10 },
              helpMessage: ['支持项目立项方式多选'],
              componentProps: ({ formModel }) => {
                return {
                  api: getDictionaryByParentId,
                  params: configDictionary?.initiationMethodId,
                  placeholder: '请选择项目立项方式',
                  labelField: 'name',
                  valueField: 'id',
                  showSearch: true,
                  mode: 'multiple',
                  optionFilterProp: 'label',
                  resultFormatter: (result) => {
                    initiationMethod.value = result;
                    return result;
                  },
                  onChange: (e: any) => {
                    if (e) {
                      let other = initiationMethod.value.find((item) => item.code === '05');
                      other = toRaw(other);
                      toRaw(formModel).otherInitiationMethod = '';
                      const ifOther = e.findIndex((item) => other?.id === item);
                      if (ifOther !== -1) {
                        updateSchema({
                          field: 'otherInitiationMethod',
                          ifShow: true,
                        });
                      } else {
                        updateSchema({
                          field: 'otherInitiationMethod',
                          ifShow: false,
                        });
                      }
                    }
                  },
                };
              },
              required: true,
            },
            undefined,
          );
          appendSchemaByField(
            {
              field: 'initiationDate',
              label: '项目立项日期',
              component: 'DatePicker',
              colProps: { span: 10 },
              componentProps: {
                placeholder: '请选择项目立项日期',
              },
              required: true,
            },
            undefined,
          );
          appendSchemaByField(
            {
              field: 'otherInitiationMethod',
              label: '其他立项方式',
              component: 'Input',
              colProps: { span: 10 },
              ifShow: ({ values }) => {
                return !!values.otherInitiationMethod;
              },
              helpMessage: ["需要上传'其他的立项附件'！"],
              componentProps: {
                placeholder: '请输入其他立项方式',
              },
              rules: [
                {
                  required: true,
                  message: '请输入其他立项方式',
                  trigger: 'blur',
                },
                getNamePatternRule(50),
              ],
            },
            undefined,
          );
          appendSchemaByField(
            {
              field: 'projectDesc',
              label: '项目立项情况',
              component: 'InputTextArea',
              colProps: { span: 24 },
              componentProps: {
                placeholder: '最大可输入5000个字符',
              },
              rules: [
                {
                  required: true,
                  message: '请输入项目立项情况',
                  trigger: 'blur',
                },
                getNamePatternRule(5000),
              ],
            },
            undefined,
          );
          if (
            (route.path.indexOf('declare') !== -1 || ifBidSectionMng.value) &&
            (configStore.GET_CONFIG_MODULE.ifBidSectionToBeDeclared || ifBidSectionMng.value)
          ) {
            appendSchemaByField(
              {
                field: 'ifMultiBidSection',
                label: '是否多标段项目',
                component: 'RadioGroup',
                colProps: { span: 24 },
                required: true,
                defaultValue: 1,
                componentProps: {
                  options: [
                    {
                      label: '是',
                      value: 1,
                    },
                    {
                      label: '否',
                      value: 0,
                    },
                  ],
                },
                ...(ifBidSectionMng.value
                  ? {
                      dynamicDisabled: () => {
                        return BDListRef.value.length;
                      },
                    }
                  : {}),
              } as FormSchema,
              undefined,
            );
            setFieldsValue({ ifMultiBidSection: 0 });
          }
          // schema:
        }
      }
      function disabledForm() {
        if (
          (route.path.indexOf('initiation') !== -1 &&
            _formData.value.projectAdditionPhase &&
            _formData.value.projectAdditionPhase !== 2) ||
          (route.path.indexOf('intention') !== -1 &&
            _formData.value.projectAdditionPhase &&
            _formData.value.projectAdditionPhase !== 3)
        ) {
          const disabledSchema = [
            { field: 'proName' },
            { field: 'budgetAmount' },
            { field: 'currencyType' },
            { field: 'fundsCategoryId' },
            { field: 'fundsDepId' },
            { field: 'relevantDepId' },
            { field: 'useDirection' },
            { field: 'planUseTime' },
            { field: 'ifLargeEquipment' },
            { field: 'ifImportedEquipment' },
            { field: 'countryOfOrigin' },
            { field: 'ifSingleSource' },
            { field: 'proposedTransactionUnit' },
            { field: 'proChargeDepId' },
            { field: 'proChargeUserId' },
            { field: 'projectOverview' },
          ];
          const disabledTextArea = [
            { field: 'mainFunctionalObjectives' },
            { field: 'basicRequirements' },
            { field: 'qualityRequirements' },
            { field: 'serviceRequirements' },
            { field: 'safetyRequirements' },
            { field: 'timeLimitRequirements' },
          ];
          disabledTextArea.forEach((item) => {
            updateSchema({
              field: item.field,
              componentProps: {
                disabled: true,
              },
            });
          });
          disabledSchema.forEach((item) => {
            if (item.field === 'ifImportedEquipment') {
              updateSchema({
                field: 'ifImportedEquipment',
                componentProps: ({ formModel, formActionType }) => {
                  return {
                    disabled: true,
                    options: [
                      {
                        label: '是',
                        value: 1,
                      },
                      {
                        label: '否',
                        value: 0,
                      },
                    ],
                    onChange: (e: any) => {
                      const { updateSchema } = formActionType;
                      toRaw(formModel).countryOfOrigin = '';
                      if (e.target.value) {
                        updateSchema({
                          field: 'countryOfOrigin',
                          ifShow: true,
                        });
                      } else {
                        updateSchema({
                          field: 'countryOfOrigin',
                          ifShow: false,
                        });
                      }
                    },
                  };
                },
              });
            } else if (item.field === 'ifSingleSource') {
              updateSchema({
                field: item.field,
                componentProps: ({ formModel, formActionType }) => {
                  return {
                    disabled: true,
                    options: [
                      {
                        label: '是',
                        value: 1,
                      },
                      {
                        label: '否',
                        value: 0,
                      },
                    ],
                    onChange: (e: any) => {
                      const { updateSchema } = formActionType;
                      toRaw(formModel).proposedTransactionUnit = '';

                      if (e.target.value) {
                        updateSchema({
                          field: 'proposedTransactionUnit',
                          ifShow: true,
                        });
                      } else {
                        updateSchema({
                          field: 'proposedTransactionUnit',
                          ifShow: false,
                        });
                      }
                    },
                  };
                },
              });
            } else {
              updateSchema({
                field: item.field,
                componentProps: {
                  disabled: true,
                },
              });
            }
          });
          if (
            route.path.indexOf('intention') !== -1 &&
            _formData.value.projectAdditionPhase &&
            _formData.value.projectAdditionPhase !== 3
          ) {
            const disabledSchema = [
              { field: 'sourceFunds' },
              { field: 'projectType' },
              { field: 'initiationMethod' },
              { field: 'initiationDate' },
              { field: 'otherInitiationMethod' },
              { field: 'projectDesc' },
              { field: 'engineeringProperties' },
              { field: 'servicePeriod' },
              { field: 'serviceContent' },
            ];
            if (configStore.GET_CONFIG_MODULE?.ifProjectEstablishment) {
              disabledSchema.forEach((item) => {
                updateSchema({
                  field: item.field,
                  componentProps: {
                    disabled: true,
                  },
                });
              });
            }
          }
        }
        if (
          route.path.indexOf('declare') !== -1 &&
          _formData.value.projectAdditionPhase &&
          _formData.value.projectAdditionPhase !== 4
        ) {
          const disabledSchema = [
            { field: 'proName' },
            { field: 'budgetAmount' },
            { field: 'currencyType' },
          ];
          disabledSchema.forEach((item) => {
            updateSchema({
              field: item.field,
              componentProps: {
                disabled: true,
              },
            });
          });
        }
      }
      const [
        registerForm,
        {
          validate,
          getFieldsValue,
          updateSchema,
          setFieldsValue,
          appendSchemaByField,
          clearValidate,
          setProps: setPropsBasicForm,
        },
      ] = useForm({
        labelWidth: 190,
        schemas: formSchema(),
        baseColProps: { span: 10 },
        showActionButtonGroup: false,
        baseRowStyle: {
          padding: '20px 0px 50px',
          margin: '20px 10px',
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#F4F6F9',
        },
      });
      const [
        registerForm1,
        {
          validateFields: validateTextArea,
          setFieldsValue: setFieldsValueTextArea,
          updateSchema: upDateTextArea,
          clearValidate: clearValidateTextArea,
          setProps: setPropsTextAreaForm,
        },
      ] = useForm({
        labelWidth: 280,
        schemas: textAreaSchema,
        baseColProps: { span: 10 },
        showActionButtonGroup: false,
        baseRowStyle: {
          padding: '20px 20px 50px',
          margin: '20px 10px',
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#F4F6F9',
        },
      });
      const [registerDrawer, { openDrawer }] = useDrawer();
      const [registerDrawerBD, { openDrawer: openDrawerBD }] = useDrawer();
      const {
        getHqlQueryDto,
        resetHqlQueryDto,
        setPageByQueryInfo,
        setSortByQueryInfo,
        appendQueryList,
      } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          sorts: [
            { dir: 'asc', prop: 'purchaseList.id' },
            { dir: 'desc', prop: 'purchaseList.updateDateTime' },
          ],
          page: {
            pageNum: 1,
            pageSize: 10,
          },
          queryList: [{ param: 'purchaseList.ifDelete', type: 'equal', value: [0] }],
          dataFieldList: ['purchaseList', 'purchaseList.id'],
          sumList: ['number', 'number*unitPrice'],
        },
      });
      // 是否显示 批量设置标段
      const ifShowBatchSetBid = computed(() => {
        return (
          (ifDeclare.value ||
            (ifBidSectionMng.value && !ifBidSectionIsBeforeBidSectionMng.value)) &&
          ifMultiBidSection.value
        );
      });
      const ifShowRowSelection = computed(() => {
        return (!ifBidSectionMng.value && ifnoAction.value) || ifShowBatchSetBid.value;
      });
      // 使用 promise 队列执行以下得东西
      const { add, destroy, start } = usePromiseQueue();
      start();
      onBeforeUnmount(() => {
        destroy();
      });
      const watchIfShowRowSelectionHandler = async (nv) => {
        if (ifShow.value) {
          if (nv) {
            // 等待一下 ifShow, 等到 变成 false
            await waitForPromise(() => !ifShow.value, 3000);
            nextTick(() => {
              setProps({
                rowSelection: { type: 'checkbox' },
              });
            });
          }
          return;
        }
        if (nv) {
          nextTick(() => {
            setProps({
              rowSelection: { type: 'checkbox' },
            });
          });
        } else {
          nextTick(() => {
            setProps({
              rowSelection: undefined,
            });
          });
        }
      };
      watch(
        () => ifShowRowSelection.value,
        async (nv) => {
          add(watchIfShowRowSelectionHandler.bind(null, nv));
        },
        {
          immediate: true,
        },
      );
      const disabled = ref(false);
      // 采购清单
      const [
        registerTable,
        { reload, getSelectRowKeys, setProps, setColumns, clearSelectedRowKeys },
      ] = useTable({
        title: title.value,
        api: getPurchaseList,
        isTreeTable: true,
        canResize: false,
        columns: columns(),
        rowKey: 'id',
        bordered: true,
        expandIcon: null,
        // rowSelection: undefined,
        showIndexColumn: true,
        // 点击行不选中
        clickToRowSelect: false,
        beforeFetch: (queryInfo: any) => {
          resetHqlQueryDto(); // 先重置
          setPageByQueryInfo(queryInfo);
          setSortByQueryInfo(queryInfo);
          if (proId.value) {
            appendQueryList({
              param: 'purchaseList.projectId',
              type: 'equal',
              value: [proId.value],
            });
          }
          const queryDto = getHqlQueryDto();
          return queryDto;
        },
        afterFetch: (data) => {
          const tableData: any[] = [];
          totalNumber.value = data.mapListSumAmount.totalNumber
            ? data.mapListSumAmount.totalNumber
            : 0;
          totalAmount.value = data.mapListSumAmount['totalNumber*unitPrice']
            ? data.mapListSumAmount['totalNumber*unitPrice']
            : 0;
          title.value = `采购数量合计：${
            totalNumber.value
          } ；  预算总价合计：${totalAmount.value.toFixed(2)}${
            currencyType.value.code === '1' ? '元' : currencyType.value.name
          }`;
          if (currencyType.value.code === '1') {
            title.value = title.value + '\xa0\xa0\xa0' + numberToChinese(totalAmount.value);
          }
          // console.log('货币类型', currencyType.value);
          // setProps({
          //   title: title.value,
          // });
          data.page.content.forEach((item) => {
            item.purchaseList.currencyType = toRaw(_formData.value).currencyType.name;
            tableData.push(item.purchaseList);
          });
          purchaseList.value = data.page.content.length;
          const columnList = columns();
          columnList.forEach((item) => {
            if (item.dataIndex === 'unitPrice') {
              item.title = `预算单价(${
                currencyType.value.code === '1' ? '元' : currencyType.value.name
              })`;
            }
            if (item.dataIndex === 'tagModule') {
              item.title = `预算总价(${
                currencyType.value.code === '1' ? '元' : currencyType.value.name
              })`;
            }
            item.align = 'left';
          });
          if (currencyType.value.code === '1') {
            ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_UNITPRICE].dataTitle =
              '预算单价（元）';
            ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_UNITAMOUNT].dataTitle =
              '预算总价（元）';
          } else {
            ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_UNITPRICE].dataTitle =
              '预算单价（' + currencyType.value.name + '）';
            ExportColumnMap[ExportColumnKeyEnum.PURCHASE_LIST_UNITAMOUNT].dataTitle =
              '预算总价（' + currencyType.value.name + '）';
          }
          if ((ifDeclare.value || ifBidSectionMng.value) && ifMultiBidSection.value) {
            columnList.push({
              title: '所属项目标段',
              dataIndex: 'bidSectionId',
              width: 120,
              align: 'left',
              format: (_text, record) => {
                const bidSection: any = bidList.value.find(
                  (item: any) => item.id === record.bidSectionId,
                );
                return bidSection?.name;
              },
            });
          }
          setColumns(columnList);
          // console.log('立项', ifnoAction.value);
          setProps({
            tableSetting: {
              // 是否显示刷新按钮
              redo: true,
              // 是否显示尺寸调整按钮
              size: true,
              // 是否显示字段调整按钮
              setting: ifnoAction.value,
              // 是否显示全屏按钮
              fullScreen: true,
            },
            actionColumn:
              ifnoAction.value && !ifBidSectionMng.value
                ? {
                    width: 110,
                    title: '操作',
                    dataIndex: 'action',
                    slots: {
                      customRender: 'action',
                    },
                    fixed: 'right',
                  }
                : undefined,
          });
          disabled.value = tableData.length === 0 ? true : false;
          return tableData;
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
          setting: ifnoAction.value,
          // 是否显示全屏按钮
          fullScreen: true,
        },
        actionColumn: ifnoAction.value
          ? {
              width: 80,
              title: '操作',
              dataIndex: 'action',
              slots: {
                customRender: 'action',
              },
              fixed: undefined,
            }
          : undefined,
        defaultExpandAllRows: true,
      });
      const {
        getHqlQueryDto: getHqlQueryDtoBD,
        resetHqlQueryDto: resetHqlQueryDtoBD,
        appendQueryList: appendQueryListBD,
        setPage: setPageBD,
      } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          // sorts: [{ dir: 'asc', prop: 'id' }],
          page: {
            pageNum: 1,
            pageSize: 10,
          },
          queryList: [{ param: 'bidSection.ifDelete', type: 'equal', value: [0] }],
          dataFieldList: ['bidSection', 'bidSection.id'],
          sumList: ['bidSection.budgetAmount'],
        },
      });
      const BDListRef = ref<any>([]); // 标段信息列表
      const [
        registerBDTable,
        { reload: reloadBD, setColumns: setColumnsBD, setProps: setPropsBD },
      ] = useTable({
        title: `标段预算金额合计`,
        api: getBidSection,
        canResize: false,
        columns: BDcolumns(),
        rowKey: 'id',
        bordered: true,
        expandIcon: null,
        // rowSelection: ifnoAction.value
        //   ? {
        //       type: 'checkbox',
        //     }
        //   : undefined,
        showIndexColumn: true,
        // 点击行不选中
        clickToRowSelect: false,
        beforeFetch: ({ page, pageSize }) => {
          resetHqlQueryDtoBD(); // 先重置
          setPageBD({ pageNum: page, pageSize });
          if (proId.value) {
            appendQueryListBD({
              param: 'bidSection.project.id',
              type: 'equal',
              value: [proId.value],
            });
          }
          const queryDto = getHqlQueryDtoBD();
          return queryDto;
        },
        afterFetch: (data) => {
          const tableData: any[] = [];
          BDtitle.value = `标段预算金额合计： ${
            data.mapListSumAmount.totalBudgetAmount ? data.mapListSumAmount.totalBudgetAmount : 0
          }${currencyType.value.code === '1' ? '元' : currencyType.value.name}`;
          if (currencyType.value.code === '1') {
            BDtitle.value =
              BDtitle.value +
              '\xa0\xa0\xa0' +
              numberToChinese(data.mapListSumAmount.totalBudgetAmount);
          }
          data.page.content.forEach((item) => {
            tableData.push(item.bidSection);
          });
          BDListRef.value = data.page.content;
          const columnsList = BDcolumns();
          columnsList.forEach((item) => {
            // if (item.dataIndex === 'currencyType') {
            //   item.format = () => {
            //     return currencyType.value.name;
            //   };
            // }
            item.align = 'left';
          });
          setColumnsBD(columnsList);
          if (ifBidSectionMng.value) {
            setPropsBD({
              actionColumn: {
                width: 300,
                title: '操作',
                dataIndex: 'action',
                slots: {
                  customRender: 'action',
                },
                fixed: 'right',
              },
            });
          }
          return tableData;
        },
        fetchSetting: {
          // The field name of the current page passed to the background
          pageField: 'page',
          // The number field name of each page displayed in the background
          sizeField: 'pageSize',
          // Field name of the form data returned by the interface
          listField: 'data',
          // Total number of tables returned by the interface field name
          totalField: 'data.page.totalElements',
        },
        showTableSetting: true,
        tableSetting: {
          // 是否显示刷新按钮
          redo: true,
          // 是否显示尺寸调整按钮
          size: true,
          // 是否显示字段调整按钮
          setting: ifnoAction.value,
          // 是否显示全屏按钮
          fullScreen: true,
        },
        actionColumn: ifnoAction.value
          ? {
              width: 120,
              title: '操作',
              dataIndex: 'action',
              slots: {
                customRender: 'action',
              },
              fixed: undefined,
            }
          : undefined,
        defaultExpandAllRows: true,
      });
      const { createConfirm, createMessage, createConfirmPromise } = useMessage();
      // 添加采购清单
      function handleCreate() {
        openDrawer(true, {
          isUpdate: false,
          isParent: false,
        });
      }
      // 添加标段
      function handleAddBD() {
        openDrawerBD(true, {
          isUpdate: false,
          currencyType: _formData.value.currencyType,
        });
      }
      // 编辑采购清单
      function handleEdit(record: Recordable) {
        openDrawer(true, {
          record,
          isUpdate: true,
        });
      }
      // 编辑标段
      function handleEditBD(record: Recordable) {
        openDrawerBD(true, {
          record,
          isUpdate: true,
          currencyType: _formData.value.currencyType,
        });
      }
      // 删除采购清单
      async function handleDelete(record: Recordable) {
        try {
          await createConfirmPromise({
            content: '确认删除吗？',
          });
          const id: number = toRaw(record).id;
          await deletePurchase(id);
          createMessage.success('删除成功！');
          await reload();
        } catch (error) {}
      }
      // 删除标段
      async function handleDeleteBD(record: Recordable) {
        try {
          await createConfirmPromise({
            content: '确认删除吗？',
          });
          const id: number = toRaw(record).id;
          await deleteBidSection(id);
          createMessage.success('删除成功！');
          await reloadBD();
          bidList.value = await getBidList(proId.value);
        } catch (error) {}
      }
      // 采购清单保存
      async function handleSuccess() {
        await refreshForm();
        await reload();
      }
      // 标段保存
      async function handleBDSuccess() {
        await reloadBD();
        bidList.value = await getBidList(proId.value);
      }
      const user = useUserStore();
      // 项目保存
      async function saveProject() {
        try {
          const result = await validate();
          const formData = getFieldsValue();
          const declareDept = {
            id: user.getUserInfo.department?.id,
          };
          const addUser = {
            id: user.getUserInfo.id,
          };
          formData.declareDept = declareDept;
          formData.addUser = addUser;
          // 区分 保存/编辑 项目 （采购计划、立项、意向公开、采购申报）
          if (!proId.value) {
            if (route.path.indexOf('purchase') !== -1) {
              formData.projectAdditionPhase = 1;
            }
            if (route.path.indexOf('initiation') !== -1) {
              formData.projectAdditionPhase = 2;
            }
            if (route.path.indexOf('intention') !== -1) {
              formData.projectAdditionPhase = 3;
            }
            if (route.path.indexOf('declare') !== -1) {
              formData.projectAdditionPhase = 4;
            }
          } else {
            formData.projectAdditionPhase = projectAdditionPhase.value;
          }
          if (route.path.indexOf('initiation') !== -1) {
            formData.initiationMethod = formData.initiationMethod.join(',');
          }
          if (route.path.indexOf('intention') !== -1) {
            formData.initiationMethod = formData.initiationMethod.join(',');
          }
          if (route.path.indexOf('declare') !== -1) {
            formData.initiationMethod = formData.initiationMethod.join(',');
          }
          if (route.path.indexOf('bidSectionMng') !== -1) {
            formData.initiationMethod = formData.initiationMethod.join(',');
          }
          formData.currencyType = {
            id: formData.currencyType,
          };
          formData.useDirection = {
            id: formData.useDirection,
          };
          if (formData.projectType) {
            formData.projectType = {
              id: formData.projectType,
            };
          } else {
            formData.projectType = 'null';
          }

          if (formData.engineeringProperties) {
            formData.engineeringProperties = {
              id: formData.engineeringProperties,
            };
          } else {
            formData.engineeringProperties = 'null';
          }
          if (formData.sourceFunds) {
            formData.sourceFunds = {
              id: formData.sourceFunds,
            };
          } else {
            formData.sourceFunds = 'null';
          }
          formData.servicePeriod = formData.servicePeriod ? formData.servicePeriod : 'null';
          formData.serviceContent = formData.serviceContent ? formData.serviceContent : 'null';
          formData.countryOfOrigin = formData.countryOfOrigin ? formData.countryOfOrigin : 'null';
          formData.proposedTransactionUnit = formData.proposedTransactionUnit
            ? formData.proposedTransactionUnit
            : 'null';
          formData.status = {
            id: status.value,
          };
          if (proId.value) {
            formData.id = proId.value;
          }
          if (formData.ifMultiBidSection && ifDeclare.value) {
            formData.multiBidSectionAdditionPhase = 4;
          }
          formData.ifFourAdditionStages = 1;
          // 采购中不需要传
          if (ifBidSectionMng.value) {
            formData.ifFourAdditionStages = 0;
          }
          const project: any = await savePurchasePlan(formData);
          projectBudgetAmount.value = formData.budgetAmount;
          if (project.verificateFailedMsg) {
            return createMessage.error(project.verificateFailedMsg);
          }
          if (project.fundsUserIdMsg) {
            return createMessage.error(project.fundsUserIdMsg);
          } else if (project.relevantUserIdMsg) {
            return createMessage.error(project.relevantUserIdMsg);
          } else {
            createMessage.success('保存成功！');
          }
          router.push({
            query: {
              id: project?.id,
            },
          });
          proId.value = project?.id;
          _formData.value = await getProjectById(proId.value);
          currencyType.value = currencyTypeList.value.find(
            (item: any) => item.id === formData.currencyType.id,
          );
          ifMultiBidSection.value = project.ifMultiBidSection;
          await reload();
          await reloadBD();
          ifShow.value = false;
        } catch (error) {
          console.log('error is', error);
        }
      }
      // 附件上传
      async function upload() {
        try {
          fileList.value = await getFileList({
            projectId: proId.value,
            objectType: 1,
            statusId: [status.value],
            objectName: 'pro_project',
          });
          if (!configModule.value.purchaseListAttachmentDropDown) {
            let fileIndex = 0;
            fileList.value.forEach((item, index) => {
              console.log('附件', item);
              if (item.fileType.statusId && item.fileType.statusId.code === '8') {
                fileIndex = index;
              }
            });
            fileList.value.splice(fileIndex, 1);
          }
        } catch (error) {}
      }
      const [registerModal, { openModal }] = useModal();
      // 导入采购清单
      function importPurchase() {
        if (!!purchaseList.value) {
          createConfirm({
            iconType: 'warning',
            title: '导入采购清单',
            content: '导入采购清单将删除之前的清单数据，是否继续导入？',
            onOk: async () => {
              openModal(true);
            },
          });
        } else {
          openModal(true);
        }
      }
      // 获取选中的采购清单
      function getSelected() {
        ids.value = getSelectRowKeys();
      }
      const [registerBD, { openModal: openModalBD, closeModal: closeModalBD }] = useModal();
      // 设置所属标段
      function setBid() {
        openModalBD(true, { tm: +new Date() });
        // await batchModificate();
      }
      // 批量删除
      function deleteIds() {
        createConfirm({
          iconType: 'warning',
          title: '批量删除',
          content: '确认批量删除吗？',
          onOk: async () => {
            await batchDelete({
              ids: ids.value,
            });
            reload();
            createMessage.success('删除成功！');
          },
        });
      }
      async function saveBDModal(bidSectionId) {
        try {
          await batchModificate({
            ids: ids.value,
            bidSectionId: bidSectionId.bidSectionId,
          });
          createMessage.success(CustomMsgEnum.SAVE_SUCCESS);
          clearSelectedRowKeys();
          closeModalBD();
          reload();
        } catch (error) {}
      }
      function cancelBDModal() {
        clearSelectedRowKeys();
      }
      function sucessAndReload() {
        reload();
      }
      async function saveProTextArea(field, value) {
        try {
          await validateTextArea([field]);
          const obj = {
            id: proId.value,
          };
          obj[field] = value;
          await savePurchasePlan(obj);
        } catch (error) {}
      }

      // 混入
      const [
        registerEditPurchasePlanForBidSectionDrawer,
        { openDrawer: openEditPurchasePlanForBidSectionDrawer },
      ] = useDrawer();
      const {
        btnHandlerEditPurchasePlan,
        btnHandlerSetPurchaseFilesWaitUploading,
        appendBidSectionFormSchema,
        appendBidSectionFormData,
        customHandlerSavePurchasePlanSuccess,
      } = bidSectionMngComp({
        reloadBD, // 重新获取 标段信息
        openDrawer: openEditPurchasePlanForBidSectionDrawer, // 打开 编辑采购计划的弹窗
        proData: _formData, // 项目信息
      });
      async function refreshForm() {
        if (proId.value) {
          bidList.value = await getBidList(proId.value);
          ifShowTextArea.value = configStore.GET_CONFIG_MODULE.ifShowQualityRequirement;
          const basicForm = await getProjectById(proId.value);
          // 添加待采购阶段的 表单项
          await appendBidSectionFormSchema(ifBidSectionMng, basicForm, appendSchemaByField);
          _formData.value = cloneDeep(basicForm);
          const formData: any = cloneDeep(basicForm);
          // 货币类型 => drawinner
          projectAdditionPhase.value = formData.projectAdditionPhase;
          projectBudgetAmount.value = formData.budgetAmount;
          currencyType.value = formData.currencyType;
          ifShow.value = false;
          ifMultiBidSection.value = formData.ifMultiBidSection;
          formData.currencyType = formData.currencyType?.id;
          formData.engineeringProperties = formData.engineeringProperties?.id;
          projectCode.value = formData.projectType?.code;
          formData.projectType = formData.projectType?.id;
          formData.sourceFunds = formData.sourceFunds?.id;
          formData.useDirection = formData.useDirection?.id;
          if (formData.initiationMethod) {
            // formData.initiationMethod = JSON.parse(formData.initiationMethod);
            const initMethod = formData?.initiationMethod?.split(',');
            const arr: number[] = [];
            initMethod.forEach((item) => {
              item = Number(item);
              arr.push(item);
            });
            formData.initiationMethod = arr;
          } else {
            formData.initiationMethod = [];
          }
          purchaseType.value = formData.projectType;
          if (projectCode.value === '2') {
            updateSchema({
              field: 'engineeringProperties',
              ifShow: true,
              componentProps: {
                api: getDictionaryByParentId,
                params: configDictionary?.engineeringPropertiesId,
                placeholder: '请选择工程性质',
                labelField: 'name',
                valueField: 'id',
                showSearch: true,
                optionFilterProp: 'label',
              },
            });
          } else {
            updateSchema({
              field: 'engineeringProperties',
              ifShow: false,
              componentProps: {
                api: getDictionaryByParentId,
                params: configDictionary?.engineeringPropertiesId,
                placeholder: '请选择工程性质',
                labelField: 'name',
                valueField: 'id',
                showSearch: true,
                optionFilterProp: 'label',
              },
            });
          }
          if (projectCode.value === '3') {
            updateSchema({
              field: 'servicePeriod',
              ifShow: true,
            });
            updateSchema({
              field: 'serviceContent',
              ifShow: true,
            });
          } else {
            updateSchema({
              field: 'servicePeriod',
              ifShow: false,
            });
            updateSchema({
              field: 'serviceContent',
              ifShow: false,
            });
          }
          if (formData.ifImportedEquipment) {
            updateSchema({
              field: 'countryOfOrigin',
              ifShow: true,
            });
          } else {
            updateSchema({
              field: 'countryOfOrigin',
              ifShow: false,
            });
          }
          if (formData.ifSingleSource) {
            updateSchema({
              field: 'proposedTransactionUnit',
              ifShow: true,
            });
          } else {
            updateSchema({
              field: 'proposedTransactionUnit',
              ifShow: false,
            });
          }
          await updateSchema({
            field: 'fundsDepId',
            componentProps: () => ({
              api: getFundsCategoryDepSelect,
              params: formData.fundsCategoryId,
              placeholder: '请选择经费主管部门',
              labelField: 'name',
              valueField: 'id',
            }),
          });
          await updateSchema({
            field: 'proChargeUserId',
            componentProps: () => ({
              api: getUserListByDepId,
              params: formData.proChargeDepId,
              placeholder: '请选择项目负责人',
              showSearch: true,
              optionFilterProp: 'label',
              resultFormatter: personListFormatter,
            }),
          });
          // 修改 formData 添加 组织处理人 组织处理部门 招标公司 业务代理人
          await appendBidSectionFormData(ifBidSectionMng, _formData.value, formData);
          if (ifShowTextArea.value) {
            // 显示 textarea
            nextTick(async () => {
              await setFieldsValueTextArea(formData);
              await clearValidateTextArea();
            });
          }
          await setFieldsValue(formData);
          await clearValidate();
          // 招标采购模块不需要这个
          if (!ifBidSectionMng.value) {
            fileList.value = await getFileList({
              projectId: proId.value,
              objectType: 1,
              statusId: [status.value],
              objectName: 'pro_project',
            });
            if (!configModule.value.purchaseListAttachmentDropDown) {
              let fileIndex = 0;
              fileList.value.forEach((item, index) => {
                console.log('附件', item);
                if (item.fileType.statusId && item.fileType.statusId.code === '8') {
                  fileIndex = index;
                }
              });
              fileList.value.splice(fileIndex, 1);
            }
          }
          if (route.path.indexOf('initiation') !== -1 && formData.projectAdditionPhase !== 2) {
            ifnoAction.value = false;
            reload();
          }
          if (route.path.indexOf('intention') !== -1 && formData.projectAdditionPhase !== 3) {
            ifnoAction.value = false;
            reload();
          }
          await disabledForm();
          reload();
        } else {
          ifShowTextArea.value = false;
        }
      }
      const businessStore = useBusinessStore();
      const { closeCurrent } = useTabs(router);
      async function submit() {
        try {
          // let fundsCategory;
          // if (_formData.value.fundsCategoryId) {
          //   const data = await getFundsCategoryById(_formData.value.fundsCategoryId);
          //   fundsCategory = data;
          // }
          submitLoading.value = true;
          let ifInitiateMethodAttachment = 0;
          let code = '1';
          let url = '';
          if (route.path.indexOf('purchase') !== -1) {
            ifInitiateMethodAttachment = 0;
            code = '1';
            url = '/purchasePlan_4_2/waitPurchase';
          }
          if (route.path.indexOf('initiation') !== -1) {
            ifInitiateMethodAttachment = 1;
            code = '2';
            url = '/projectManagement_4_3/waitInitiation';
          }
          if (route.path.indexOf('intention') !== -1) {
            ifInitiateMethodAttachment = 1;
            code = '3';
            url = '/disclosure/waitDeclare';
          }
          if (route.path.indexOf('declare') !== -1) {
            ifInitiateMethodAttachment = 1;
            code = '4';
            url = '/purchaseManagement/waitDeclare';
            if (
              _formData.value.projectAdditionPhase !== 4 &&
              configStore?.GET_CONFIG_MODULE?.ifGovernmentProcurement
            ) {
              const vpd = await verificatePublicityDays(proId.value);
              if (!vpd) {
                submitLoading.value = false;
                return createMessage.error('该项目还在公示期！');
              }
            }
          }
          const error: any = await submitVerification({
            id: proId.value,
            ifInitiateMethodAttachment: ifInitiateMethodAttachment,
          });
          console.log(_formData.value, !_formData.value.ifMultiBidSection);
          if (error.length > 0) {
            createMessage.error(error[0]);
          } else {
            await createConfirmPromise({
              content: '确认提交吗？',
            });
            // if (_formData.value.budgetAmount < 10000 && !_formData.value.ifMultiBidSection) {
            //   await preservateOfficeExpenses(proId.value);
            // }
            const res = await projectDeclare({
              objectId: proId.value,
              code: code,
              tagModuleId: businessStore.GET_TAG_MODULE_INFO?.id ?? -1,
              account: userInfo.account,
            });
            if (res) {
              createMessage.success('提交成功！');
              closeCurrent();
              router.push({
                path: url,
              });
            }
          }
          // await reload();
          submitLoading.value = false;
        } catch (error) {
          submitLoading.value = false;
        }
      }
      return {
        registerForm,
        registerForm1,
        registerTable,
        registerBDTable,
        registerDrawer,
        registerDrawerBD,
        handleCreate,
        handleEdit,
        handleDelete,
        handleSuccess,
        saveProject,
        upload,
        registerModal,
        importPurchase,
        publicPath,
        deleteIds,
        ifShow,
        proId,
        sucessAndReload,
        ifShowTextArea,
        fileList,
        purchaseType,
        currencyType,
        ifnoAction,
        isIntention,
        ifDeclare,
        ifBidSectionMng,
        ifBidSectionIsBeforeBidSectionMng,
        ids,
        getSelected,
        handleAddBD,
        status,
        handleBDSuccess,
        handleEditBD,
        handleDeleteBD,
        setBid,
        registerBD,
        bidList,
        saveBDModal,
        cancelBDModal,
        title,
        BDtitle,
        totalAmount,
        projectBudgetAmount,
        purchaseList,
        ifMultiBidSection,
        btnHandlerEditPurchasePlan,
        btnHandlerSetPurchaseFilesWaitUploading,
        customHandlerSavePurchasePlanSuccess,
        configSize,
        limitMaxAmount,
        acceptType,
        BDListRef,
        registerEditPurchasePlanForBidSectionDrawer,
        configModule,
        ifShowBatchSetBid,
        disabled,
        ExportColumnKeyEnum,
        ExportColumnMap,
        ExportTypeEnum,
        reload,
        getHqlQueryDto,
        submit,
        ifSubmit,
        submitLoading,
      };
    },
  });
</script>

<style lang="less" scoped>
  .pd-20 {
    // padding: 20px;
    margin: 20px;
    position: relative;
  }
  .baseInfo {
    background-color: #f4f6f9;
  }
  .pd-40 {
    // padding: 20px;
    margin: 20px 40px;
  }
  .lly {
    position: absolute;
    left: 50%;
    bottom: 40px;
    transform: translateX(-50%);
  }
  :deep(.ant-input-number) {
    width: 100% !important;
  }
  :deep(.ant-form-item-control) {
    margin-top: 0 !important;
  }
  :deep(#ifLargeEquipment) {
    .suffix {
      position: absolute;
      top: 8px;
      left: 100px;
    }
  }
  .file-list {
    padding: 0 20px;
    :deep(.lx-collapse-container__body) {
      width: 100%;
    }
  }
  .lx-file-upload {
    box-sizing: border-box;
    margin: 10px;
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

  /* @keyframes 规则用于创建动画。在 @keyframes 中规定某项 CSS 样式，就能创建由当前样式逐渐改为新样式的动画效果。 */
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
  .fileIcon {
    display: flex;
    align-items: center;
    margin-left: 10px;
  }
  :deep(.ant-calendar-picker) {
    width: 100%;
  }
  .submit_btn {
    position: fixed;
    z-index: 999;
    left: 50%;
    bottom: 50px;
    transform: translateX(-50%);
  }
</style>
<style>
  .suffix {
    color: #ed6f6f;
  }
</style>
