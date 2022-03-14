<template>
  <BasicDrawer
    v-bind="$attrs"
    title="出库记录"
    @register="registerDrawer"
    width="800px"
    @close="handleCancel"
  >
    <BasicTable @register="registerTable"></BasicTable>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, unref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { checkRecordColumns } from '../materialLibrary.data'; // 数据
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getOutboundRecordByContractListId } from '/@/api/assetManagement/assetManagementApi';

  // import UserManagementAuditApi from '/@/api/system/UserManagementAuditApi';

  export default defineComponent({
    name: 'userAuditedDrawer',
    components: { BasicDrawer, BasicTable },
    emits: ['register'],
    setup() {
      const { createMessage } = useMessage();
      const contractListId = ref<number>(); // 合同清单id

      const [registerTable, { reload }] = useTable({
        // title: '固定资产列表',
        // api: getOutboundRecordByContractListId,
        immediate: false,
        api: async () => {
          try {
            const result = await getOutboundRecordByContractListId(unref(contractListId));
            console.log('================', result);
            return result;
          } catch (err) {
            console.log('error is: ', err);
          }
        },
        columns: checkRecordColumns(), // 表单列信息
        rowKey: 'id',
        showTableSetting: false, // 显示表格设置工具
        bordered: true,
        showIndexColumn: true,
      });

      const [registerDrawer, { changeLoading, changeOkLoading, closeDrawer }] = useDrawerInner(
        async (data) => {
          try {
            changeLoading(true);
            contractListId.value = data.contractListId;
            reload();
            changeLoading(false);
          } catch (err) {
            console.log(err);
          }
        },
      );

      // 点击取消按钮的 callback (包括右上角的 X)
      const handleCancel = () => {
        console.log('取消');
      };

      return {
        registerDrawer,
        registerTable,
        handleCancel,
      };
    },
  });
</script>
<style scoped>
  :deep(.ant-input-number) {
    width: 100% !important;
  }
</style>
