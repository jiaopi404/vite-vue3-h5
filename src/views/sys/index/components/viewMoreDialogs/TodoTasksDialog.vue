<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    title="待办事项"
    @visible-change="visibleChange"
    :class="prefixCls"
    width="900px"
    :z-index="998"
  >
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
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
      </template>
    </BasicTable>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { ref, nextTick } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useModalInner, BasicModal } from '/@/components/Modal';
  import {
    getFlowAlreadyDoneByPageByQueryDto,
    getFlowAlreadyDoneByPageByQueryDto2,
    getFlowWaitTaskByPageByQueryDto,
  } from '/@/api/auditMangement/auditMangement';
  import { todoTaskFormSchema, todoTaskTableColumns } from '../index.data';
  import { useTodoTaskActionColumn, useTodoTasksQueryDto } from '../useIndex';
  import { DictionaryI } from '/#/business';
  const emit = defineEmits(['handle', 'postpone', 'refresh-list']);

  const { prefixCls } = useDesign('todo-tasks-dialog');

  const totalRef = ref<number>(0);
  const businessStageRef = ref<number>(0); // 业务阶段
  const needRefreshRef = ref<boolean>(false);

  // 模块列表
  const tagModuleListRef = ref<DictionaryI[]>([]);

  const [register] = useModalInner(async (data) => {
    needRefreshRef.value = false;
    businessStageRef.value = data.stage;

    if (!tagModuleListRef.value.length) {
      tagModuleListRef.value = data.tagModuleList;
    }
    nextTick(async () => {
      await getForm()?.setFieldsValue({ businessStage: data.stage });
      await reload();
      nextTick(async () => {
        await getForm()?.setFieldsValue({ businessStage: data.stage });
      });
    });
  });

  // 业务编号
  // 业务类型
  // 业务阶段 代办 已办 暂缓
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
  const [registerTable, { reload, getForm, setProps }] = useTable({
    title: '',
    size: 'small',
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
    canResize: false,
    inset: true,
    bordered: true,
    showIndexColumn: true,
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      slots: {
        customRender: 'action',
      },
    },
    immediate: false,
    // showHeader: false,
    api: async (params) => {
      const stage = businessStageRef.value;
      if ([0, 2].includes(stage)) {
        const res = await getFlowWaitTaskByPageByQueryDto(params);
        totalRef.value = res.page.totalElements;
        return res;
      } else {
        params.code = '0'
        const res = await getFlowAlreadyDoneByPageByQueryDto2(params);
        totalRef.value = res.page.totalElements;
        return res;
      }
    },
    columns: todoTaskTableColumns(tagModuleListRef),
    beforeFetch: (queryInfo) => {
      businessStageRef.value = queryInfo.businessStage;
      // 改变 actionColumn 宽度
      tabChangeHandler(queryInfo.businessStage);
      if ([0, 2].includes(queryInfo.businessStage)) {
        resetSqlQueryDto();
        if (queryInfo.page && queryInfo.pageSize) {
          setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
        }
        if (queryInfo.processObjectCode) {
          appendQueryList({
            param: 'waitDealtWith.processObjectCode',
            type: 'equal',
            value: [queryInfo.processObjectCode],
          });
        }
        if (queryInfo.applyObjectType) {
          appendQueryList({
            param: 'waitDealtWith.applyObjectType',
            type: 'equal',
            value: [queryInfo.applyObjectType],
          });
        }
        if (queryInfo.businessStage === 0) {
          appendQueryList({
            param: 'waitDealtWith.IF_POSTPONEMENT',
            type: 'equal',
            value: [0],
          });
        }
        if (queryInfo.businessStage === 2) {
          appendQueryList({
            param: 'waitDealtWith.IF_POSTPONEMENT',
            type: 'equal',
            value: [1],
          });
        }
        return getSqlQueryDto();
      } else {
        resetSqlQueryDtoAlreadyDone();
        if (queryInfo.page && queryInfo.pageSize) {
          setPageAlreadyDone({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
        }
        if (queryInfo.processObjectCode) {
          appendQueryListAlreadyDone({
            param: 'alreadyDone.processObjectCode',
            type: 'equal',
            value: [queryInfo.processObjectCode],
          });
        }
        if (queryInfo.applyObjectType) {
          appendQueryListAlreadyDone({
            param: 'alreadyDone.applyObjectType',
            type: 'equal',
            value: [queryInfo.applyObjectType],
          });
        }
        return getSqlQueryDtoAlreadyDone();
      }
    },
    useSearchForm: true,
    formConfig: {
      labelWidth: 130,
      schemas: todoTaskFormSchema(),
      autoSubmitOnEnter: true,
    },
    pagination: true,
  });

  const { tabChangeHandler } = useTodoTaskActionColumn(undefined, setProps);

  // 操作列
  const clickHandlerHandle = (record) => {
    needRefreshRef.value = true;
    emit('handle', record);
  };
  const clickHandlerPostpone = async (record) => {
    needRefreshRef.value = true;
    emit('postpone', record);
  };

  const visibleChange = (visible) => {
    if (!visible) {
      // 关闭弹窗
      if (needRefreshRef.value) {
        emit('refresh-list');
      }
    }
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-todo-tasks-dialog';

  .@{prefix-cls} {
  }
</style>
