<template>
  <IndexCardVue
    :class="prefixCls"
    title="待办事项"
    title-icon="ant-design:check-circle-outlined"
    :title-icon-color="titleIconColor"
    :is-extra="false"
  >
    <template #extraPrefix>
      <Tabs
        style="margin-right: 5px"
        v-model:activeKey="tabKeyRef"
        size="small"
        @change="tabChangeHandler"
      >
        <Tabs.TabPane v-for="item in tabKeys" :key="item.value">
          <template #tab>
            <Badge :count="tabKeyRef === item.value ? totalThisTabRef : totalAnotherRef">
              <span>
                {{ item.label }}
              </span>
            </Badge>
          </template>
        </Tabs.TabPane>
      </Tabs>
    </template>
    <div :class="`${prefixCls}-todo-task-container`" class="flex flex-wrap" v-loading="loadingRef">
      <template v-if="processListRef.length">
        <TodoTaskItem
          v-for="item in processListRef"
          :key="item.ID_"
          :process="item"
          @click:postpone="clickHandlerPostpone(item)"
          @click:audit="clickHandlerHandle(item)"
        />
      </template>
      <LxEmpty class="w-full" v-else />
    </div>
    <Pagination
      class="flex-none"
      v-model:current="pageRef.pageNum"
      v-model:page-size="pageRef.pageSize"
      :total="totalThisTabRef"
      size="small"
      @change="getList"
      :show-total="(total) => `共${total}条数据`"
    />
    <AuditProcessDrawer
      @register="registerDrawer"
      :minHeight="100"
      :ifTodoTask="true"
      @success="reload"
      :destroyOnClose="true"
    />
    <IndexReportFormDialog @register="registerModalReportForm" />
  </IndexCardVue>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import IndexCardVue from '/@/views/sys/index/components/IndexCard.vue';
  import {
    getFlowWaitTaskByPageByQueryDto,
    updateActRuTaskIfPostponementByProcInstId,
  } from '/@/api/auditMangement/auditMangement';
  import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import { ThemeColorEnum } from '/@/enums/themeColorEnum';
  import { useDesign } from '/@/hooks/web/useDesign';
  // import { useUserStore } from '/@/store/modules/user';
  import { useBusinessStore } from '/@/store/modules/business';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { CustomMsgEnum, getCusConfirmTip } from '/@/enums/messageEnum';
  import { Tabs, Badge } from 'ant-design-vue';
  import { useTodoTasksQueryDto } from '/@/views/sys/index/components/useIndex';
  import IndexReportFormDialog from '/@/views/sys/index/components/reportFormDialogs/IndexReportFormDialog.vue';
  import { useToIndexReportDialogEventBusHandler } from '/@/views/sys/index/components/indexHelper';
  import { MyPageI, ProcessWaitDealI } from '/#/business';
  import TodoTaskItem from './TodoTaskItem.vue';
  import { LxEmpty } from '/@/components/LxComponents';
  import { EventBus } from '/@/utils/commonServe/eventBus';

  const { prefixCls } = useDesign('todo-tasks-card-dashboard');
  const titleIconColor = ref<ThemeColorEnum>(ThemeColorEnum.nine);

  // 待处理数据，待处理 or 暂缓
  const processListRef = ref<ProcessWaitDealI[]>([]);
  const totalThisTabRef = ref<number>(0); // 当前 tab 的总计
  const totalAnotherRef = ref<number>(0); // 另一 tab 的总计

  const pageRef = ref<MyPageI>({ pageNum: 1, pageSize: 10 });

  const loadingRef = ref<boolean>(false);

  // const userStore = useUserStore();
  // const userInfo = userStore.getUserInfo;
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerModalReportForm, { openModal: openModalReportForm }] = useModal();
  const { createConfirmPromise, createMessage } = useMessage();

  const tabKeyRef = ref<number>(0);
  // tag 列表
  const tabKeys = [
    { value: 0, label: '待办' },
    // { value: 1, label: '已办' },
    { value: 2, label: '暂缓' },
  ];

  const { getSqlQueryDto, setPage, resetSqlQueryDto, appendQueryList } = useTodoTasksQueryDto();
  // 没有已办 的 获取数据
  const getList = async () => {
    try {
      loadingRef.value = true;
      const businessStore = useBusinessStore();
      const tagModuleId = businessStore.GET_TAG_MODULE_INFO?.id;
      resetSqlQueryDto();
      setPage(pageRef.value);
      if (tagModuleId) {
        appendQueryList({
          param: 'waitDealtWith.tagModuleId',
          type: 'equal',
          value: [tagModuleId],
        });
      }
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
      const queryDto = getSqlQueryDto();
      const res = await getFlowWaitTaskByPageByQueryDto(queryDto);
      totalThisTabRef.value = res.page.totalElements;
      res.page.content.forEach((item: ProcessWaitDealI) => {
        item.ifWait = true;
      });
      processListRef.value = res.page.content;
    } finally {
      loadingRef.value = false;
    }
  };

  // 获取数字提醒
  const getOtherReminder = async () => {
    const businessStore = useBusinessStore();
    const tagModuleId = businessStore.GET_TAG_MODULE_INFO?.id;
    resetSqlQueryDto();
    setPage(pageRef.value);
    if (tagModuleId) {
      appendQueryList({
        param: 'waitDealtWith.tagModuleId',
        type: 'equal',
        value: [tagModuleId],
      });
    }
    // 与上面 getList 相反
    if (tabKeyRef.value === 0) {
      appendQueryList({
        param: 'waitDealtWith.IF_POSTPONEMENT',
        type: 'equal',
        value: [1],
      });
    }
    if (tabKeyRef.value === 2) {
      appendQueryList({
        param: 'waitDealtWith.IF_POSTPONEMENT',
        type: 'equal',
        value: [0],
      });
    }
    const queryDto = getSqlQueryDto();
    const res = await getFlowWaitTaskByPageByQueryDto(queryDto);
    totalAnotherRef.value = res.page.totalElements;
  };

  // reload 方法，调用 获取列表 已经 另一个的 数字提醒
  const reload = async () => {
    getList();
    getOtherReminder();
  };

  // 操作列，点击处理，打开审核弹窗
  const clickHandlerHandle = (record) => {
    openDrawer(true, {
      ID_: record.ID_ ? record.ID_ : '',
      PROC_INST_ID_: record.PROC_INST_ID_ ? record.PROC_INST_ID_ : '',
      FILENAME: record.DGRM_RESOURCE_NAME_ ? record.DGRM_RESOURCE_NAME_ : '',
    });
  };

  // 设为暂缓
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

  const tabChangeHandler = () => {
    // 重置统计数，不然会两边闪动；当前只有一边在闪动
    totalAnotherRef.value = 0;
    totalThisTabRef.value = 0;
    reload();
  };

  EventBus.on('index-todo-task-refresh', reload); // 监听刷新事件

  // 报表的弹窗，完全复用首页的
  useToIndexReportDialogEventBusHandler((payload) => {
    openModalReportForm(true, payload);
  });

  onMounted(() => {
    // 第一次请求数据
    reload();
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-todo-tasks-card-dashboard';

  .@{prefix-cls} {
  }
</style>
