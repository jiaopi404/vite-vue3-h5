<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '查看验收单',
              onClick: seeAcceptanceRecord.bind(null, record),
            },
            {
              label: '查看审核流',
              onClick: handleEdit.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <AuditProcessDrawer
      @register="registerDrawer"
      :minHeight="100"
      :ifTodoTask="false"
      @success="handleSuccess"
    />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { useRouter } from 'vue-router';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { columns, searchFormSchema, pageAndSort } from './InAcceptance.data';
  import { useDrawer } from '/@/components/Drawer';
  import { getActRuTaskByProcessId } from '/@/api/IntentionalDisclosureManagement/IntentionalDisclosureManagementApi';
  import { getBidSectionAndProAcceptanceByQueryDto } from '/@/api/acceptanceManagement/acceptanceManagementApi';
  export default defineComponent({
    name: 'toBeAccepted',
    components: {
      BasicTable,
      TableAction,
      AuditProcessDrawer,
    },
    setup() {
      const router = useRouter();
      const [registerDrawer, { openDrawer }] = useDrawer();
      // 组织查询参数
      const {
        resetHqlQueryDto,
        setPageByQueryInfo,
        appendQueryListByQueryInfoValuePlain,
        setSorts,
        getHqlQueryDto,
      } = useHqlQueryDto(pageAndSort());
      const beforeFetch = async (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        setPageByQueryInfo(queryInfo);
        appendQueryListByQueryInfoValuePlain('bidSection.proName', 'like', queryInfo.proName);
        appendQueryListByQueryInfoValuePlain('bidSection.proNumber', 'like', queryInfo.proNumber);
        appendQueryListByQueryInfoValuePlain(
          'bidSection.project.projectType.id',
          'equal',
          queryInfo.projectType,
        );
        if (queryInfo.field == 'budgetAmount') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidSection.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo.field == 'bidWinningAmount') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidWinner.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo.field == 'accDate') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `proAcceptance.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo.field == 'frequency') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `proAcceptance.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        const queryDto = getHqlQueryDto();
        return queryDto;
      };
      const afterFetch = (data) => {
        return data;
      };

      const [registerTable, { reload }] = useTable({
        title: '验收中列表',
        api: getBidSectionAndProAcceptanceByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        rowKey: (record) => record.bidSection.id,
        useSearchForm: true,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema(),
          autoSubmitOnEnter: true,
        },
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
        actionColumn: {
          // 表格右侧操作列配置 BasicColumn
          width: 240,
          title: '操作',
          dataIndex: 'action',
          slots: {
            customRender: 'action',
          },
          fixed: 'right',
        },
        bordered: true,
        showIndexColumn: true,
      });
      // 查看验收记录
      function seeAcceptanceRecord(record: Recordable) {
        router.push({
          path: '/reportForm/reportAcceptanceRecord',
          query: { bidSectionId: record.bidSection.id, acceptanceId: record.proAcceptance.id },
        });
      }
      // 查看审核流
      async function handleEdit(record: Recordable) {
        // console.log(record.proAcceptance.processId,'record.bidSection.processId')
        const res = await getActRuTaskByProcessId(record.proAcceptance.processId);
        openDrawer(true, {
          ID_: res.data.ID_ ? res.data.ID_ : '',
          PROC_INST_ID_: res.data.PROC_INST_ID_ ? res.data.PROC_INST_ID_ : '',
          FILENAME: res.data.DGRM_RESOURCE_NAME_ ? res.data.DGRM_RESOURCE_NAME_ : '',
        });
      }
      async function handleSuccess() {
        await reload();
      }

      return {
        registerTable,
        seeAcceptanceRecord,
        registerDrawer,
        handleSuccess,
        handleEdit,
      };
    },
  });
</script>

<style lang="less" scoped>
  .pop {
    display: block;
  }
</style>
