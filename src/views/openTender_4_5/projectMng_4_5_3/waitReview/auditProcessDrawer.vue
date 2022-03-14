<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" width="50%" @ok="handleSubmit">
    <BasicTable @register="registerTable"></BasicTable>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, onUpdated, ref } from 'vue';
  import { BasicForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { AccountColumns } from './auditProcessDrawer.data';
  import { useMessage } from '/@/hooks/web/useMessage';
  // 引入接口
  import { getExtractUserAndEvaluationRecord } from '/@/api/projectReview/projectReviewApi';
  import { NO_ACTION_DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  export default defineComponent({
    name: 'AddPending',
    components: { BasicDrawer, BasicForm, BasicTable, TableAction },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();
      const bidSectionId = ref();
      const [registerDrawer, { changeLoading, setDrawerProps, closeDrawer }] = useDrawerInner(
        async (data) => {
          try {
            setDrawerProps({
              confirmLoading: false,
              closable: false,
              headerStyle: {
                border: 'none',
                height: 0,
                padding: 0,
              },
            });
            bidSectionId.value = data.record.bidSection.id;
            await reload();
            changeLoading(true);
          } finally {
            changeLoading(false);
          }
        },
      );
      // // 请求之前对参数进行处理
      const beforeFetch = async () => {
        return bidSectionId.value;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        return data || [];
      };
      const [registerTable, { reload }] = useTable({
        ...NO_ACTION_DEFAULT_TABLE_SETTING_GETTER('查看审核列表', false),
        api: getExtractUserAndEvaluationRecord,
        beforeFetch,
        afterFetch,
        columns: AccountColumns(), // 表单列信息
        bordered: true,
        showIndexColumn: true,
        rowKey: 'id',
        canResize: false,
      });
      async function handleSubmit() {
        try {
          setDrawerProps({ confirmLoading: true });
          closeDrawer();
          // createMessage.success('保存成功');
          emit('success');
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }
      return {
        registerDrawer,
        handleSubmit,
        onUpdated,
        registerTable,
      };
    },
  });
</script>
