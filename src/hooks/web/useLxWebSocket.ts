import { useWebSocket } from '@vueuse/core';
import { useGlobSetting } from '../setting';
import { useMessage } from './useMessage';
import {
  useLxWebSocketStoreWithOut,
  LxWebSocketActionEnum,
  LxWebSocketActionHandlerEnum,
} from '../../store/modules/lxWebSocket';
import { watch } from 'vue';
import { useUserStoreWithOut } from '/@/store/modules/user';

// 1. get server
const { webSocketUrl } = useGlobSetting();
// TODO: 可能处理 ws or wss
const _server = webSocketUrl;
const {
  data,
  status,
  open,
  send: sendRaw,
  close,
} = useWebSocket(_server, {
  immediate: false,
  heartbeat: false,
  autoReconnect: {
    retries: 5,
    delay: 10000,
    onFailed: () => {
      const { createMessage } = useMessage();
      createMessage.error('服务器重连失败，请检查您的网络！');
      // 登出
      const lxWebSocketStore = useLxWebSocketStoreWithOut();
      lxWebSocketStore[LxWebSocketActionHandlerEnum.FORCE_OFF_LINE]();
    },
  },
  onError: (ws: WebSocket, event: Event) => {
    console.log('出错了: ', ws, event);
  },
});
// 监听 status, open 的时候 进行登录
watch(
  () => status.value,
  (nv) => {
    if (nv === 'OPEN') {
      const lxWebSocketStore = useLxWebSocketStoreWithOut();
      lxWebSocketStore[LxWebSocketActionEnum.LOGIN](); // 执行登录
    }
  },
);
// 监听 data，有改变的时候执行 handler，handler 在 store 中可查
watch(() => data.value, wsMsgHandler);

export function useLxWebSocket() {
  function lxOpen() {
    // console.log('我执行登录了');
    const userStore = useUserStoreWithOut();
    if (!userStore.getUserInfo?.account) {
      return;
    }
    if (status.value === 'OPEN') {
      return;
    } else {
      open();
    }
  }
  function send(msg: string) {
    const result = sendRaw(msg);
    console.log('💥 发送 ws 消息：', msg, '，是否成功？', result);
  }
  return {
    send,
    lxOpen,
    close,
    status,
  };
}

function wsMsgHandler(msg: string): void {
  const data = JSON.parse(msg);
  console.log('🚀 接收 ws 消息： ', data);
  const type = data.type;
  const lxWebSocketStore = useLxWebSocketStoreWithOut();
  if (lxWebSocketStore[type]) {
    lxWebSocketStore[type](data);
  } else {
    console.log('[ERROR: 无此 ws 消息对应的 handler]', data, msg);
  }
}
