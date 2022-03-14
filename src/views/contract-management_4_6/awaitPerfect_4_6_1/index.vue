<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
      </template>
      <template #action="{ record }">
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  /**
   * 合同管理》待完善
   * awaitPerfcet
   * contract-management_4_6/awaitPerfcet_4_6_1/index.vue
   */
  import { defineComponent, ref, toRaw } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useConfigStore } from '/@/store/modules/config';
  import { useUserStore } from '/@/store/modules/user';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './awaitPerfect.data';

  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';

  import { getConContractPageByQueryDto } from '/@/api/contractManagement/signedApi';

  export default defineComponent({
    components: { BasicTable, TableAction },
    setup() {

      // 组织查询参数
      const {
        resetHqlQueryDto,
        setPageByQueryInfo,
        appendQueryListByQueryInfoValuePlain,
        setSorts,
        setSortByQueryInfo,
        getHqlQueryDto,
      } = useHqlQueryDto(pageAndSort());
      // 请求之前对参数进行处理
      const beforeFetch = async (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        setPageByQueryInfo(queryInfo);
        // 合同
        appendQueryListByQueryInfoValuePlain('conContract.name', 'like', queryInfo.name);
        appendQueryListByQueryInfoValuePlain('conContract.code', 'like', queryInfo.code);

        // 项目
        appendQueryListByQueryInfoValuePlain(
          'conContract.bidSection.proName',
          'like',
          queryInfo.proName,
        );
        appendQueryListByQueryInfoValuePlain(
          'conContract.bidSection.proNumber',
          'like',
          queryInfo.proNumber,
        );
        appendQueryListByQueryInfoValuePlain(
          'conContract.bidSection.project.projectType.id',
          'equal',
          queryInfo.projectTypeId,
        );

        // 中标日期
        if (queryInfo.bidWinningDate) {
          appendQueryListByQueryInfoValuePlain(
            'bidWinner.bidWinningDate',
            'ge',
            `${queryInfo.bidWinningDate[0]} 00:00:00`,
          );
          appendQueryListByQueryInfoValuePlain(
            'bidWinner.bidWinningDate',
            'le',
            `${queryInfo.bidWinningDate[1]} 23:59:59`,
          );
        }
        console.log('queryInfo:', queryInfo);
        if (queryInfo.field === 'bidWinner.bidWinningDate') {
          const _dir = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: queryInfo.field,
            dir: _dir,
          });
        }
        if (queryInfo.field === 'addDateTime') {
          const _dir = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `conContract.${queryInfo.field}`,
            dir: _dir,
          });
        }
        // setSortByQueryInfo(queryInfo, 'conContract');
        const queryDto = getHqlQueryDto();
        return queryDto;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        return data.map((item) => item.conContract);
      };

      const [registerTable, { reload }] = useTable({
        title: '待完善列表',
        api: getConContractPageByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        rowKey: 'id',
        useSearchForm: true,
        formConfig: {
          labelWidth: 120,
          // alwaysShowLines: 2,
          schemas: searchFormSchema(),
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
        bordered: true,
        showIndexColumn: true,
      });

      return {
        registerTable,
      };
    },
  });
</script>
