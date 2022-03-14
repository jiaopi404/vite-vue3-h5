<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '查看审核流',
              onClick: handleViewAuditFlow.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <AuditProcessDrawer @register="registerDrawer" :minHeight="100" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useDrawer } from '/@/components/Drawer';
  import { useUserStore } from '/@/store/modules/user';
  import { columns, searchFormSchema, pageAndSort } from './confirmPurchaseDocuments.data';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { getBidSectionPageByQueryDto } from '/@/api/purchase/waitTenderApi';
  import { getActRuTaskByProcessId, getDepartmentStringById } from '/@/api/purchase/plan-purchase';

  export default defineComponent({
    name: 'confirmPurchaseDocuments',
    components: {
      BasicTable,
      TableAction,
      AuditProcessDrawer,
    },
    setup() {
      const [registerDrawer, { openDrawer }] = useDrawer();
      const userInfo = useUserStore().getUserInfo;
      // 是否是招标公司用户
      const ifCurrentUserBiddingCompanyUser = computed(() => {
        return userInfo.role === 5;
      });
      // 组织查询参数
      const {
        resetHqlQueryDto,
        setPageByQueryInfo,
        appendQueryListByQueryInfoValuePlain,
        appendQueryList,
        setSortByQueryInfo,
        getHqlQueryDto,
      } = useHqlQueryDto(pageAndSort());
      // 请求之前对参数进行处理
      const beforeFetch = async (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        setPageByQueryInfo(queryInfo);
        // 当前人
        // 是否是招标公司用户
        if (ifCurrentUserBiddingCompanyUser.value) {
          // 招标公司
          appendQueryList({
            param: 'bidSection.biddingCompany.user.id',
            type: 'equal',
            value: [userInfo.id],
          });
        } else {
          // 组织处理人
          appendQueryList({
            param: 'bidSection.project.BiddingUserId',
            type: 'equal',
            value: [userInfo.id],
          });
        }
        appendQueryListByQueryInfoValuePlain('bidSection.proName', 'like', queryInfo.proName);
        appendQueryListByQueryInfoValuePlain('bidSection.proNumber', 'like', queryInfo.proNumber);
        appendQueryListByQueryInfoValuePlain(
          'bidSection.project.declareDept.id',
          'in',
          queryInfo.declareDept,
        );
        appendQueryListByQueryInfoValuePlain(
          'bidSection.project.projectType.id',
          'equal',
          queryInfo.projectTypeId,
        );
        setSortByQueryInfo(queryInfo, 'bidSection');
        const queryDto = getHqlQueryDto();
        return queryDto;
      };

      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        return data.map((item) => item.bidSection);
      };
      const [registerTable, { reload }] = useTable({
        ...DEFAULT_TABLE_SETTING_GETTER('确认采购文件列表', 120),
        api: async (params) => {
          try {
            const queryItem = params.hqlPageAndSortSumDto.queryList.find(
              (item) => item.param === 'bidSection.project.declareDept.id',
            );
            if (queryItem) {
              let res = await getDepartmentStringById(queryItem.value[0]);
              let msg = res.msg;
              queryItem.value[0] = msg;
            }
            return await getBidSectionPageByQueryDto(params);
          } catch (err) {
            console.log('error is: ', err);
          }
        },
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        rowKey: 'id',
        useSearchForm: true,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema(),
          autoSubmitOnEnter: true,
        },
      });

      // 查看审核流
      async function handleViewAuditFlow(record: Recordable) {
        const res = await getActRuTaskByProcessId(record.processId);
        openDrawer(true, {
          ID_: res.data.ID_ ? res.data.ID_ : '',
          PROC_INST_ID_: res.data.PROC_INST_ID_ ? res.data.PROC_INST_ID_ : '',
          FILENAME: res.data.DGRM_RESOURCE_NAME_ ? res.data.DGRM_RESOURCE_NAME_ : '',
        });
      }

      function handleSuccess() {
        reload(); // 刷新表格
      }
      return {
        registerDrawer,
        registerTable,
        handleViewAuditFlow,
        handleSuccess,
      };
    },
  });
</script>
