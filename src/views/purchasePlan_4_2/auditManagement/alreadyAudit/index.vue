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
              label: '查看审核流',
              onClick: checkProcessInfo.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <AuditProcessDrawer @register="registerDrawer2" :minHeight="100" />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { auditListTableScheam, searchFormSchema } from './schemas';
  import { getFlowAlreadyDoneByPageByQueryDto } from '/@/api/auditMangement/auditMangement';
  import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { useSqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useBusinessStore } from '/@/store/modules/business';
  import { getDepartmentStringById } from '/@/api/purchase/plan-purchase';
  const [registerDrawer2, { openDrawer: openDrawer2 }] = useDrawer();
  const businessStore = useBusinessStore();
  const { appendQueryList, getSqlQueryDto, resetSqlQueryDto, setPage, setSorts } = useSqlQueryDto({
    sqlPageAndSortSumDto: {
      queryList: [
        {
          param: 'alreadyDone.tagModuleId',
          type: 'equal',
          value: [businessStore.GET_TAG_MODULE_INFO?.id ?? -1],
        },
      ],
      sorts: [
        {
          dir: 'desc',
          prop: 'alreadyDone.LAST_UPDATED_TIME_',
        },
        {
          dir: 'desc',
          prop: 'alreadyDone.id_',
        },
      ],
      sumList: ['alreadyDone.tagModuleId'],
    },
  });
  const [registerTable] = useTable({
    title: '已审核',
    api: async (params) => {
      try {
        const queryItem = params.sqlPageAndSortSumDto.queryList.find(
          (item) => item.param === 'alreadyDone.addDepId',
        );
        if (queryItem) {
          let res = await getDepartmentStringById(queryItem.value[0]);
          let msg = res.msg;
          queryItem.value[0] = msg;
        }
        return await getFlowAlreadyDoneByPageByQueryDto(params);
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
      // 项目名称
      if (queryInfo.processObjectName) {
        appendQueryList({
          param: 'alreadyDone.processObjectName',
          type: 'like',
          value: [queryInfo.processObjectName],
        });
      }
      // 计划使用时间
      if (queryInfo.planUseTime) {
        queryInfo.planUseTime = queryInfo.planUseTime.slice(0, 10) + ' ' + '23:59:59';
        appendQueryList({
          param: 'alreadyDone.planUseTime',
          type: 'le',
          value: [queryInfo.planUseTime],
        });
      }
      // 申报部门
      if (queryInfo.addDepId) {
        appendQueryList({
          param: 'alreadyDone.addDepId',
          type: 'in',
          value: [queryInfo.addDepId],
        });
      }
      if (queryInfo.field == 'planUseTime') {
        queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
        setSorts({
          prop: `alreadyDone.${queryInfo.field}`,
          dir: queryInfo.order,
        });
      }
      if (queryInfo.field == 'addDateTime') {
        queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
        setSorts({
          prop: `alreadyDone.${queryInfo.field}`,
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
