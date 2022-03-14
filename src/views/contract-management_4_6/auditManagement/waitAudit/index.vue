<template>
  <div>
    <BasicTable @register="registerTable">
      <template #ASSIGNEE_="{ record }">
        <div>
          {{ record.ASSIGNEE_ }}
        </div>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '审核',
              onClick: checkProcessInfo.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <AuditProcessDrawer
      @register="registerDrawer2"
      :minHeight="100"
      :ifTodoTask="true"
      @success="handleSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { auditListTableScheam, searchFormSchema } from './schemas';
  import { getFlowWaitTaskByPageByQueryDto } from '/@/api/auditMangement/auditMangement';
  import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { useSqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { useBusinessStore } from '/@/store/modules/business';
  import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
  import { getDepartmentStringById } from '/@/api/purchase/plan-purchase';
  const [registerDrawer2, { openDrawer: openDrawer2 }] = useDrawer();
  const userInfo = useUserStore().getUserInfo;
  const businessStore = useBusinessStore();
  const { appendQueryList, getSqlQueryDto, resetSqlQueryDto, setPage, setSorts } = useSqlQueryDto({
    sqlPageAndSortSumDto: {
      queryList: [
        { param: 'waitDealtWith.IF_POSTPONEMENT', type: 'equal', value: [0] },
        {
          param: 'waitDealtWith.tagModuleId',
          type: 'equal',
          value: [businessStore.GET_TAG_MODULE_INFO?.id ?? -1],
        },
        {
          param: 'or',
          type: 'or',
          value: [
            orParamsFormatter(
              " ((FIND_IN_SET('" +
                userInfo.account +
                "',REPLACE(waitDealtWith.ASSIGNEE_,'biddingCompanySupplierUser_','')) and (if((waitDealtWith.applyObjectType='con_contract' and (select ACT_NAME_ from act_ru_actinst where PROC_INST_ID_=waitDealtWith.PROC_INST_ID_ and ACT_TYPE_='userTask' AND END_TIME_ is NULL)='第三方会签-全通过'),(SELECT count(id) FROM sys_audit_records where ObjectId = waitDealtWith.processObjectId and ObjectName = waitDealtWith.applyObjectType and Frequency  = (select IFNULL(max(frequency),0) from sys_audit_records where objectName = waitDealtWith.applyObjectType and ObjectId =waitDealtWith.processObjectId) and userId = " +
                userInfo.id +
                " and ProcessId=(select ProcessId from con_contract where id =waitDealtWith.processObjectId) AND AuditOpinion is not NULL and AuditNode <> '处理' and result != 3 )=0,1=1))) or (select count(id) from sys_user where IfDelete=0 and UseMark=1 and ApproveStatus=1 and DepId=REPLACE(waitDealtWith.ASSIGNEE_,'depHeader_','') and id=" +
                userInfo.id +
                " and FIND_IN_SET((select id from sys_role where `Code`= (select depHeadCode from config_baseinfo limit 0,1) and IfDelete=0 and UseMark=1),RoleIds))>0 or ((select count(id) from sys_user where IfDelete=0 and UseMark=1 and ApproveStatus=1 and DepId=REPLACE(waitDealtWith.ASSIGNEE_,'depHeader_','') and FIND_IN_SET((select id from sys_role where `Code`= (select depHeadCode from config_baseinfo limit 0,1) and IfDelete=0 and UseMark=1),RoleIds))=0 and (select count(u.id) from Sys_DepAndUser d inner join sys_user u on d.UserId=u.id where u.IfDelete=0 and u.UseMark=1 and u.ApproveStatus=1 and d.DepId=REPLACE(waitDealtWith.ASSIGNEE_,'depHeader_','') and u.id=" +
                userInfo.id +
                ' and FIND_IN_SET((select id from sys_role where `Code`= (select directoChargeCode from config_baseinfo limit 0,1) and IfDelete=0 and UseMark=1),u.RoleIds))>0) or waitDealtWith.ASSIGNEE_ in (select code from sys_role where ifdelete=0 and usemark=1 and FIND_IN_SET(id,(select RoleIds from sys_user where id=' +
                userInfo.id +
                '))))',
            ),
          ],
        },
      ],
      sorts: [
        {
          dir: 'desc',
          prop: 'waitDealtWith.CREATE_TIME_',
        },
        {
          dir: 'desc',
          prop: 'waitDealtWith.id_',
        },
      ],
      sumList: ['waitDealtWith.tagModuleId'],
    },
  });
  const [registerTable, { reload }] = useTable({
    title: '待审核',
    api: async (params) => {
      try {
        const queryItem = params.sqlPageAndSortSumDto.queryList.find(
          (item) => item.param === 'waitDealtWith.addDepId',
        );
        if (queryItem) {
          let res = await getDepartmentStringById(queryItem.value[0]);
          let msg = res.msg;
          queryItem.value[0] = msg;
        }
        return await getFlowWaitTaskByPageByQueryDto(params);
      } catch (err) {
        console.log('error is: ', err);
      }
    },
    columns: auditListTableScheam(),
    useSearchForm: true,
    showTableSetting: true,
    actionColumn: {
      // 表格右侧操作列配置
      width: 120,
      title: '操作',
      dataIndex: 'action',
      slots: {
        customRender: 'action',
      },
      fixed: 'right',
    },
    formConfig: {
      labelWidth: 130,
      schemas: searchFormSchema(),
      autoSubmitOnEnter: true,
    },
    beforeFetch: (queryInfo: any) => {
      resetSqlQueryDto(); // 先重置
      if (queryInfo.page && queryInfo.pageSize) {
        setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
      }
      // 合同名称
      if (queryInfo.processObjectName) {
        appendQueryList({
          param: 'waitDealtWith.processObjectName',
          type: 'like',
          value: [queryInfo.processObjectName],
        });
      }
      // 合同编号
      if (queryInfo.processObjectCode) {
        appendQueryList({
          param: 'waitDealtWith.processObjectCode',
          type: 'like',
          value: [queryInfo.processObjectCode],
        });
      }
      // 项目名称
      if (queryInfo.proName) {
        appendQueryList({
          param: 'waitDealtWith.proName',
          type: 'like',
          value: [queryInfo.proName],
        });
      }
      // 项目编号
      if (queryInfo.purchaseNumber) {
        appendQueryList({
          param: 'waitDealtWith.purchaseNumber',
          type: 'like',
          value: [queryInfo.purchaseNumber],
        });
      }
      // 合同类型
      if (queryInfo.conContractType) {
        appendQueryList({
          param: 'waitDealtWith.conContractType',
          type: 'equal',
          value: [queryInfo.conContractType],
        });
      }
      // 中标日期
      if (queryInfo.bidWinningDate) {
        appendQueryList({
          param: 'waitDealtWith.bidWinningDate',
          type: 'ge',
          value: [`${queryInfo.bidWinningDate[0]} 00:00:00`],
        });
      }
      if (queryInfo.bidWinningDate) {
        appendQueryList({
          param: 'waitDealtWith.bidWinningDate',
          type: 'le',
          value: [`${queryInfo.bidWinningDate[1]} 23:59:59`],
        });
      }
      // 合同金额排序
      if (queryInfo.field == 'amount') {
        queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
        setSorts({
          prop: `waitDealtWith.${queryInfo.field}`,
          dir: queryInfo.order,
        });
      }
      //中标日期排序
      if (queryInfo.field == 'bidWinningDate') {
        queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
        setSorts({
          prop: `waitDealtWith.${queryInfo.field}`,
          dir: queryInfo.order,
        });
      }
      //生成日期排序
      if (queryInfo.field == 'conContractDate') {
        queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
        setSorts({
          prop: `waitDealtWith.${queryInfo.field}`,
          dir: queryInfo.order,
        });
      }
      const queryDto = getSqlQueryDto();
      return queryDto;
    },
    afterFetch: (data) => {
      console.log(data);
    },
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
    rowKey: 'ID_',
    showIndexColumn: true,
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
  });
  async function handleSuccess() {
    await reload();
  }
  //流程信息
  const checkProcessInfo = async (record) => {
    openDrawer2(true, {
      ID_: record.ID_ ? record.ID_ : '',
      PROC_INST_ID_: record.PROC_INST_ID_ ? record.PROC_INST_ID_ : '',
      FILENAME: record.DGRM_RESOURCE_NAME_ ? record.DGRM_RESOURCE_NAME_ : '',
    });
  };
</script>
<script lang="ts">
  import { defineComponent } from 'vue';
  export default defineComponent({
    name: 'ProcessManagement',
    components: {},
  });
</script>
<style lang="less" scoped>
  :deep(.ant-calendar-picker.ant-calendar-picker-default) {
    width: calc(100% - 1vw);
  }
</style>
