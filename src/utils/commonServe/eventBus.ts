import { useEventBus, UseEventBusReturn } from '@vueuse/core';

type EventBusStoreType = {
  key: string;
  bus: UseEventBusReturn<void>;
  canceller: Fn;
  handler: Fn;
};

const EVENT_BUS: EventBusStoreType[] = [];

/**
 * 事件中心
 */
export const EventBus = {
  _EVENT_BUS: EVENT_BUS,
  emit(key: string, payload?: any) {
    // 防止重复注册
    const _busList = EVENT_BUS.filter((item) => item.key === key);
    if (_busList.length) {
      _busList.forEach((bus) => {
        bus.bus.emit(payload);
      });
    }
  },
  on(key: string, handler: Fn) {
    // 防止重复注册
    const _bus = EVENT_BUS.find((item) => item.key === key && item.handler === handler);
    if (_bus) {
      return;
    }
    const bus = useEventBus<void>(Symbol(key));
    const canceller = bus.on(handler);

    EVENT_BUS.push({
      key,
      bus,
      canceller,
      handler,
    });
  },
  off(key, handler: Fn) {
    const busIndex = EVENT_BUS.findIndex((item) => item.key === key && item.handler === handler);
    if (busIndex > -1) {
      const bus = EVENT_BUS[busIndex];
      bus.canceller();

      EVENT_BUS.splice(busIndex, 1);
    }
  },
};
