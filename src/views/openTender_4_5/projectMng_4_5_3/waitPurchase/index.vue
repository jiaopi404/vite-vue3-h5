<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <LxBasicExportBtn
          :disabled="!ifDisabled"
          :exportType="ExportTypeEnum.PROJECT"
          :exportExcelDto="{
            fileName: '待采购',
            sheetName: '待采购项目',
            ifShowTotal: false,
            listDataColumn: [
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_PRO_NAME],
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_BUDGET_AMOUNT],
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_TYPE],
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_PROCUREMENT_METHOD],
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_DECLARE_DEPT],
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_USER],
              ExportColumnMap[ExportColumnKeyEnum.ADD_DATE_TIME],
              ExportColumnMap[ExportColumnKeyEnum.BIDDING_COMPANY_NAME],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_USER],
            ],
          }"
          :reloadTableFn="reload"
          :getHqlQueryDtoFn="getHqlQueryDto"
        />
      </template>
      <template #action="{ record }">
        <div class="flex items-center justify-start">
          <!-- <span class="flex-none">抽取专家</span> -->
          <!-- <ExtractCompanyPopover :id="record.project?.id" /> -->
          <ExtractPopover
            :disabled="!!record.project?.biddingCompanyId"
            :id="record.project?.id"
            :node="2"
            popoverTitle="抽取招标公司"
          />
          <TableAction
            :actions="[
              {
                noPadding: true,
                label: '',
                onClick: clickHandlerExtractCompany.bind(null, record),
                disabled: !!record.project?.biddingCompanyId,
              },
              {
                label: '作废',
                onClick: invalidate.bind(null, record),
              },
              {
                label: '标段管理',
                color: 'error',
                onClick: clickHandlerBidSectionMng.bind(null, record),
              },
              {
                label: '设为待上传采购文件',
                color: 'warning',
                onClick: clickHandlerSetPurchaseFilesWaitUploading.bind(null, record),
              },
              {
                label: '转交',
                onClick: handleTransfer.bind(null, record),
                ifShow: () => {
                const role: any = userInfo.role
                if ([1,5].includes(role)) {
                  return false;
                } else {
                  return true;
                }
              },
              },
            ]"
          />
        </div>
      </template>
    </BasicTable>
    <ExtractCompanyDrawer @register="registerDrawer" @extract-complete="reload" />
    <!-- 转交 Drawer -->
    <LxTransferDrawer @register="registerDrawer2" :objectType="1" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import ExtractCompanyDrawer from './ExtractCompanyDrawer.vue';
  import LxTransferDrawer from '/@/components/LxComponents/LxTransfer/LxTransferDrawer.vue';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { getProjectPage, setToBeUploadedPurchaseFile } from '/@/api/purchase/plan-purchase';
  import { useRouter } from 'vue-router';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import {
    proMngWaitPurchaseTableColumns,
    proMngWaitPurchaseSearchFormSchema,
  } from './proMngWaitPurchase.data';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { CustomMsgEnum, getCusConfirmTip } from '/@/enums/messageEnum';
  import { useDrawer } from '/@/components/Drawer';
  import { getReviewNodeByProjectNode } from '/@/api/review-node/proReviewNode';
  import { LxBasicExportBtn } from '/@/components/LxComponents';
  import { ExportTypeEnum } from '/@/enums/businessEnum';
  import { ExportColumnMap, ExportColumnKeyEnum } from '/@/components/LxComponents';
  // import ExtractCompanyPopover from './ExtractCompanyPopover.vue';
  import { invalidateReviewNode } from '/@/views/purchaseDeclare_4_4/pendingProject_4_4_5/toProcessed/components/reviewNode.mixin';
  import ExtractPopover from '../inProcurement/ExtractPopover.vue';
  import { ref } from 'vue';
  const ifDisabled = ref<any>(null);
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerDrawer2, { openDrawer: openDrawer2 }] = useDrawer();

  const userInfo = useUserStore().getUserInfo;
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
        { dir: 'desc', prop: 'project.updateDateTime' },
        { dir: 'desc', prop: 'project.id' },
      ],
      queryList: [
        // 采购方式 ！= （电子竞价/询价），状态 = 待采购，项目处理人 = 当前登陆人，未删除的项目
        { param: 'project.ifDelete', type: 'equal', value: [0] },
        { param: 'project.status.code', type: 'equal', value: [15] }, // 待采购
        { param: 'project.BiddingUserId', type: 'equal', value: [userInfo.id] },
        // { param: 'project.procurementMethod.code', type: 'notIn', value: ['6', '7'] },
      ],
      dataFieldList: ['project', 'project.id', 'biddingCompany'],
    },
  });
  const [registerTable, { reload }] = useTable({
    ...DEFAULT_TABLE_SETTING_GETTER('待采购列表', 330),
    api: getProjectPage,
    columns: proMngWaitPurchaseTableColumns,
    rowKey: 'project_id',
    beforeFetch: (queryInfo: any) => {
      resetHqlQueryDto(); // 先重置
      setPageByQueryInfo(queryInfo);
      appendQueryListByQueryInfoValuePlain('project.proName', 'like', queryInfo.proName);
      appendQueryListByQueryInfoValuePlain(
        'project.projectType.id',
        'equal',
        queryInfo.purchaseType,
      );
      setSortByQueryInfo(queryInfo);
      return getHqlQueryDto();
    },
    afterFetch: (data) => {
      ifDisabled.value = data.length ? true : false;
      return data;
    },
    formConfig: {
      labelWidth: 120,
      schemas: proMngWaitPurchaseSearchFormSchema,
      // placeHolder: '请输入菜单名称',
      autoSubmitOnEnter: true,
    },
    useSearchForm: true,
  });
  const router = useRouter();

  const { createMessage, createConfirmPromise, createInfoModal } = useMessage();

  const clickHandlerExtractCompany = ({ project }) => {
    openDrawer(true, {
      id: project.id, // 项目 id
    });
  };

  const clickHandlerBidSectionMng = async ({ project }) => {
    router.push({
      path: '/proMng/bidSectionMng',
      query: {
        id: project?.id,
      },
    });
  };

  /**
   * 设为待上传采购文件
   */
  const clickHandlerSetPurchaseFilesWaitUploading = async ({ project }) => {
    /**
     * 未分标段的项目（项目表.IfMultiBidSection=0），点击该按钮，询问弹窗上选择确认后
     * 项目标段表，项目表的状态更新到“待上传采购文件”，审核记录表新增数据。
     * 有标段的项目（项目表.IfMultiBidSection=1），点击该按钮，提示“该项目为多标段，请前往子标段设置！”
     */
    const { ifMultiBidSection, id } = project;
    if (ifMultiBidSection) {
      // 多标段
      createInfoModal({
        content: '该项目为多标段，请前往子标段设置！',
      });
    } else {
      await createConfirmPromise({
        content: getCusConfirmTip('设为待上传采购文件'),
      });
      const reviewNode = await getReviewNodeByProjectNode({
        objectId: id,
        objectName: 'pro_project',
        node: 2,
      });
      if (reviewNode && reviewNode.ifReview && reviewNode.statusId !== 3) {
        // 说明抽取结点未完成
        await createConfirmPromise({
          content: '抽取未完成，确定继续？',
        });
      }
      // 没有 reviewNode 表示没有抽取节点，就不验证了
      // 单标段，调用接口;
      const res = await setToBeUploadedPurchaseFile({ projectId: id, bidSectionId: null });
      if (res.msg) {
        createMessage.error(res.msg);
      } else {
        createMessage.success(CustomMsgEnum.SAVE_SUCCESS);
        reload();
      }
    }
  };

  // 转交
  const handleTransfer = ({ biddingCompany, project }) => {
    console.log(project, 'projectproject', biddingCompany);
    openDrawer2(true, {
      objectId: project.id,
      biddingDepartmentId: project.biddingDepartmentId,
    });
  };

  const invalidate = async (record) => {
    const ifAborted = await invalidateReviewNode(null, {
      objectId: record.project.id,
      objectName: 'pro_project',
      node: 2,
    });
    if (ifAborted) {
      reload();
    }
  };
  const handleSuccess = () => {
    reload();
  };
</script>
