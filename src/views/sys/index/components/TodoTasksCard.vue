<template>
  <IndexCardVue
    :class="prefixCls"
    title="待办事项"
    title-icon="ant-design:check-circle-outlined"
    :title-icon-color="titleIconColor"
    :is-extra="totalRef > MAX_SIZE"
    @view-more="viewMoreHandler"
  >
    <template #extraPrefix>
      <Tabs
        style="margin-right: 5px"
        v-model:activeKey="tabKeyRef"
        size="small"
        @change="tabChangeHandler"
      >
        <Tabs.TabPane v-for="item in tabKeys" :key="item.value" :tab="item.label" />
      </Tabs>
    </template>
    <BasicTable @register="register">
      <template #action="{ record }">
        <TableAction
          v-if="tabKeyRef === 0"
          :actions="[
            {
              icon: '',
              label: '处理',
              onClick: clickHandlerHandle.bind(null, record),
            },
            {
              icon: '',
              label: '暂缓',
              color: 'error',
              onClick: clickHandlerPostpone.bind(null, record),
            },
          ]"
        />
        <TableAction
          v-if="tabKeyRef === 2"
          :actions="[
            {
              icon: '',
              label: '处理',
              onClick: clickHandlerHandle.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <AuditProcessDrawer
      @register="registerDrawer"
      :minHeight="100"
      :ifTodoTask="true"
      @success="reload"
      :destroyOnClose="true"
    />
    <TodoTasksDialog
      @register="registerModal"
      @handle="clickHandlerHandle"
      @postpone="clickHandlerPostpone"
      @refresh-list="reload"
    />
  </IndexCardVue>
</template>

<script lang="ts" setup>
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { ref } from 'vue';
  import IndexCardVue from './IndexCard.vue';
  import {
    getFlowAlreadyDoneByPageByQueryDto,
    getFlowWaitTaskByPageByQueryDto,
    updateActRuTaskIfPostponementByProcInstId,
  } from '/@/api/auditMangement/auditMangement';
  import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import { ThemeColorEnum } from '/@/enums/themeColorEnum';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useUserStore } from '/@/store/modules/user';
  import { waitAuditListTableScheam } from '/@/views/purchasePlan_4_2/auditManagement/waitAudit/schemas';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { CustomMsgEnum, getCusConfirmTip } from '/@/enums/messageEnum';
  import TodoTasksDialog from './viewMoreDialogs/TodoTasksDialog.vue';
  import { Tabs } from 'ant-design-vue';
  import { useTodoTaskActionColumn, useTodoTasksQueryDto } from './useIndex';
  import { todoTaskTableColumns } from './index.data';
  import { useTmpSaveTagModuleEventBusEmitter } from './indexHelper';
  import { EventBus } from '/@/utils/commonServe/eventBus';
  import { DictionaryI } from '/#/business';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import { useConfigStore } from '/@/store/modules/config';

  const { prefixCls } = useDesign('todo-tasks-card');
  const titleIconColor = ref<ThemeColorEnum>(ThemeColorEnum.nine);
  const userStore = useUserStore();
  const userInfo = userStore.getUserInfo;
  const configStore = useConfigStore();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerModal, { openModal }] = useModal();
  const { createConfirmPromise, createMessage } = useMessage();
  const { emitTmpSaveTagModuleEventBus } = useTmpSaveTagModuleEventBusEmitter();

  // 模块列表
  const tagModuleListRef = ref<DictionaryI[]>([]);

  const totalRef = ref<number>(0);
  const tabKeyRef = ref<number>(0);
  const MAX_SIZE = 5;
  const tabKeys = [
    { value: 0, label: '待办' },
    { value: 1, label: '已办' },
    { value: 2, label: '暂缓' },
  ];

  const {
    getSqlQueryDto,
    setPage,
    resetSqlQueryDto,
    appendQueryList,
    getSqlQueryDtoAlreadyDone,
    setPageAlreadyDone,
    resetSqlQueryDtoAlreadyDone,
    appendQueryListAlreadyDone,
  } = useTodoTasksQueryDto();
  const [register, { reload, setProps }] = useTable({
    title: '',
    showTableSetting: false,
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
    bordered: false,
    showIndexColumn: false,
    showHeader: false,
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      slots: {
        customRender: 'action',
      },
    },
    // showHeader: false,
    api: async (params) => {
      if ([0, 2].includes(tabKeyRef.value)) {
        const res = await getFlowWaitTaskByPageByQueryDto(params);
        totalRef.value = res.page.totalElements;
        res.page.content.forEach((item) => {
          item.ifWait = true;
        });
        return res;
      } else {
        // 已办
        const res = await getFlowAlreadyDoneByPageByQueryDto(params);
        totalRef.value = res.page.totalElements;
        res.page.content.forEach((item) => {
          item.ifWait = false;
        });
        return res;
      }
    },
    columns: todoTaskTableColumns(tagModuleListRef),
    beforeFetch: () => {
      if ([0, 2].includes(tabKeyRef.value)) {
        resetSqlQueryDto();
        setPage({ pageNum: 1, pageSize: 5 });
        if (tabKeyRef.value === 0) {
          appendQueryList({
            param: 'waitDealtWith.IF_POSTPONEMENT',
            type: 'equal',
            value: [0],
          });
        }
        if (tabKeyRef.value === 2) {
          appendQueryList({
            param: 'waitDealtWith.IF_POSTPONEMENT',
            type: 'equal',
            value: [1],
          });
        }
        return getSqlQueryDto();
      } else {
        resetSqlQueryDtoAlreadyDone();
        setPageAlreadyDone({ pageNum: 1, pageSize: 5 });
        return getSqlQueryDtoAlreadyDone();
      }
    },
    pagination: false,
    canResize: false,
  });

  // 操作列
  const clickHandlerHandle = (record) => {
    emitTmpSaveTagModuleEventBus(Number(record.tagModuleId));
    openDrawer(true, {
      ID_: record.ID_ ? record.ID_ : '',
      PROC_INST_ID_: record.PROC_INST_ID_ ? record.PROC_INST_ID_ : '',
      FILENAME: record.DGRM_RESOURCE_NAME_ ? record.DGRM_RESOURCE_NAME_ : '',
    });
  };
  const clickHandlerPostpone = async (record) => {
    await createConfirmPromise({
      content: getCusConfirmTip('设为暂缓'),
    });
    const res = await updateActRuTaskIfPostponementByProcInstId(record.PROC_INST_ID_);
    if (res.data && res.result === 'success') {
      createMessage.success(CustomMsgEnum.SAVE_SUCCESS);
      reload();
    } else {
      createMessage.success(CustomMsgEnum.SAVE_FAIL);
    }
  };

  const viewMoreHandler = () => {
    openModal(true, { stage: tabKeyRef.value, tagModuleList: tagModuleListRef.value });
  };

  const { tabChangeHandler } = useTodoTaskActionColumn(reload, setProps);

  EventBus.on('index-todo-task-refresh', reload); // 监听刷新事件

  onMounted(async () => {
    tagModuleListRef.value = await getDictionaryByParentId(
      configStore.GET_CONFIG_DICTIONRY.tagModuleId,
    );
  });
</script>

<script lang="ts">
  import { defineComponent, onMounted } from 'vue';
  export default defineComponent({
    components: {
      TableAction,
    },
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-todo-tasks-card';

  .@{prefix-cls} {
  }
</style>
