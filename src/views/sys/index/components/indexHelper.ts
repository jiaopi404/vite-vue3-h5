import { EventBus } from '/@/utils/commonServe/eventBus';
import { EventBusKey, useEventBus } from '@vueuse/core';
import { onMounted, onBeforeUnmount } from 'vue';

/**
 * 包含以下功能:
 * 1. 点击查看采购项目跳转到采购日历, 此处封装 eventEmitter
 * 2. 主页点击 项目 或 合同 或 其他不同的业务查看报表, 此处封装 eventEmitter
 * 3. 代办列表，点击处理，要暂存模块属性
 */

// =============================== [1] ============================

// event bus key
// const toPurchaseCalenderEventBusKey: EventBusKey<void> = Symbol();
const toPurchaseCalenderEventBusKey = 'to-purchase-calender-event-bus';
// event bus
// const toPurchaseCalenderEventBus = useEventBus(toPurchaseCalenderEventBusKey);

/**
 * 跳转到查看采购项目的 eventBus
 * @returns
 */
export const useToPurchaseCalenderEventBusEmitter = () => {
  const emitToPurchaseCalenderEventBus = () => {
    // toPurchaseCalenderEventBus.emit();
    EventBus.emit(toPurchaseCalenderEventBusKey);
  };
  return { emitToPurchaseCalenderEventBus };
};
export const useToPurchaseCalenderEventBusHandler = (handler: Fn) => {
  // let canceller;
  onMounted(() => {
    // canceller = toPurchaseCalenderEventBus.on(handler);
    EventBus.on(toPurchaseCalenderEventBusKey, handler);
  });

  onBeforeUnmount(() => {
    // canceller && canceller();
    EventBus.on(toPurchaseCalenderEventBusKey, handler);
  });
};

// =============================== [3] ============================

// event bus key
// const tmpSaveTagModuleEventBusKey: EventBusKey<void> = Symbol();
const tmpSaveTagModuleEventBusKey = 'save-tag-module-event-bus';
// event bus
// const tmpSaveTagModuleEventBus = useEventBus(tmpSaveTagModuleEventBusKey);

/**
 * 跳转到查看采购项目的 eventBus
 * @returns
 */
export const useTmpSaveTagModuleEventBusEmitter = () => {
  const emitTmpSaveTagModuleEventBus = (tagModuleId) => {
    // tmpSaveTagModuleEventBus.emit(tagModuleId);
    EventBus.emit(tmpSaveTagModuleEventBusKey, tagModuleId);
  };
  return { emitTmpSaveTagModuleEventBus };
};
export const useTmpSaveTagModuleEventBusHandler = (handler: Fn) => {
  // let canceller;
  onMounted(() => {
    // canceller = tmpSaveTagModuleEventBus.on(handler);
    EventBus.on(tmpSaveTagModuleEventBusKey, handler);
  });

  onBeforeUnmount(() => {
    // canceller && canceller();
    EventBus.off(tmpSaveTagModuleEventBusKey, handler);
  });
};

// =============================== [2] ============================
// event bus key
// const toIndexReportDialogEventBusKey: EventBusKey<void> = Symbol();
// event bus
// const toIndexReportDialogEventBus = useEventBus(toIndexReportDialogEventBusKey);
const toIndexReportDialogEventBusKey = 'dashboard-report-dialog';

/**
 * 主页 dialog 的 eventBus
 * @returns
 */
export const useToIndexReportDialogEventBusEmitter = () => {
  const emitToIndexReportDialogEventBus = (payload) => {
    // console.log('pay load is: ', payload);
    const { emitTmpSaveTagModuleEventBus } = useTmpSaveTagModuleEventBusEmitter();
    payload.tagModuleId && emitTmpSaveTagModuleEventBus(Number(payload.tagModuleId));
    // toIndexReportDialogEventBus.emit(payload);
    // console.log('pay load is: 最后一行', payload);
    // console.log('看一下这个 bus', toIndexReportDialogEventBus);
    EventBus.emit(toIndexReportDialogEventBusKey, payload);
  };
  return { emitToIndexReportDialogEventBus };
};
export const useToIndexReportDialogEventBusHandler = (handler: Fn) => {
  // console.log('report dialog, handler 执行', handler);
  // let canceller;
  onMounted(() => {
    // canceller = toIndexReportDialogEventBus.on(handler);
    EventBus.on(toIndexReportDialogEventBusKey, handler);
  });

  onBeforeUnmount(() => {
    // console.log('canceller 卸载 执行');
    // canceller && canceller();
    EventBus.off(toIndexReportDialogEventBusKey, handler);
  });
};

// // event bus key
// const dialogEmitSuccessEventBusKey: EventBusKey<void> = Symbol();
// // event bus
// const dialogEmitSuccessEventBus = useEventBus(dialogEmitSuccessEventBusKey);

// /**
//  * 跳转到查看采购项目的 eventBus
//  * @returns
//  */
// export const useDialogEmitSuccessEventBusEmitter = () => {
//   const emitDialogEmitSuccessEventBus = () => {
//     dialogEmitSuccessEventBus.emit();
//   };
//   return { emitDialogEmitSuccessEventBus };
// };
// export const useDialogEmitSuccessEventBusHandler = (handler: Fn) => {
//   let canceller;
//   onMounted(() => {
//     canceller = dialogEmitSuccessEventBus.on(handler);
//   });

//   onBeforeUnmount(() => {
//     canceller && canceller();
//   });
// };
