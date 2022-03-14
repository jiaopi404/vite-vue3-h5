import { EventBusKey, useEventBus } from '@vueuse/core';

// event bus key
const refreshExtractEventBusKey: EventBusKey<void> = Symbol();

// event bus
export const refreshExtractEventBus = useEventBus(refreshExtractEventBusKey);
