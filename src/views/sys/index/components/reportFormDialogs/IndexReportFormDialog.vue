<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    title="报表"
    :class="prefixCls"
    width="900px"
    :z-index="999"
    @visible-change="visibleChangeHandler"
    :show-cancel-btn="false"
    :show-ok-btn="false"
  >
    <div :class="`${prefixCls}-report-comp`">
      <component
        v-if="asyncComponentRef"
        :is="asyncComponentRef"
        v-bind="propsRef"
        :ifDialog="true"
      />
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { computed, ref } from 'vue';
  import { useModalInner, BasicModal } from '/@/components/Modal';
  import { EventBus } from '/@/utils/commonServe/eventBus';

  const { prefixCls } = useDesign('todo-tasks-dialog');

  // 动态组件
  const asyncComponentRef = ref<Nullable<Fn>>(null);
  const propsRef = ref<Nullable<Recordable>>(null);

  const emit = defineEmits(['reload-list']);

  const [register, { closeModal }] = useModalInner(async (data) => {
    console.log('打开报表弹窗, data is: ', data);
    asyncComponentRef.value = data.asyncComponent;
    propsRef.value = data.props;
  });

  const _initDialog = () => {
    asyncComponentRef.value = null;
    propsRef.value = null;
  };

  const visibleChangeHandler = (visible) => {
    if (!visible) {
      // 关闭时进行初始化
      _initDialog();
    }
  };

  EventBus.on('dialog-audit-success', () => {
    closeModal();
    EventBus.emit('index-todo-task-refresh');
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-todo-tasks-dialog';

  .@{prefix-cls} {
    &-report-comp {
      height: calc(100vh - 30vh - 80px);
    }
  }
</style>
