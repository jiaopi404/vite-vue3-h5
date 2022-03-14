import type { ModalFunc, ModalFuncProps } from 'ant-design-vue/lib/modal/Modal';

import { message as Message, Modal, notification } from 'ant-design-vue';
import { CheckCircleFilled, CloseCircleFilled, InfoCircleFilled } from '@ant-design/icons-vue';

import { ConfigProps, NotificationArgsProps } from 'ant-design-vue/lib/notification';
import { useI18n } from './useI18n';
import { isString } from '/@/utils/is';

export interface NotifyApi {
  info(config: NotificationArgsProps): void;

  success(config: NotificationArgsProps): void;

  error(config: NotificationArgsProps): void;

  warn(config: NotificationArgsProps): void;

  warning(config: NotificationArgsProps): void;

  open(args: NotificationArgsProps): void;

  close(key: String): void;

  config(options: ConfigProps): void;

  destroy(): void;
}

export declare type NotificationPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
export declare type IconType = 'success' | 'info' | 'error' | 'warning';

export interface ModalOptionsEx extends Omit<ModalFuncProps, 'iconType'> {
  iconType?: 'warning' | 'success' | 'error' | 'info';
}

export type ModalOptionsPartial = Partial<ModalOptionsEx> & Pick<ModalOptionsEx, 'content'>;

interface ConfirmOptions {
  info: ModalFunc;
  success: ModalFunc;
  error: ModalFunc;
  warn: ModalFunc;
  warning: ModalFunc;
}

function getIcon(iconType: string) {
  if (iconType === 'warning') {
    return <InfoCircleFilled class="modal-icon-warning" />;
  } else if (iconType === 'success') {
    return <CheckCircleFilled class="modal-icon-success" />;
  } else if (iconType === 'info') {
    return <InfoCircleFilled class="modal-icon-info" />;
  } else {
    return <CloseCircleFilled class="modal-icon-error" />;
  }
}

function renderContent({ content }: Pick<ModalOptionsEx, 'content'>) {
  if (isString(content)) {
    return <div innerHTML={`<div>${content as string}</div>`}></div>;
  } else {
    return content;
  }
}

/**
 * @description: Create confirmation box
 */
function createConfirm(options: ModalOptionsEx): ConfirmOptions {
  const iconType = options.iconType || 'warning';
  Reflect.deleteProperty(options, 'iconType');
  const opt: ModalFuncProps = {
    centered: true,
    icon: getIcon(iconType),
    ...options,
    content: renderContent(options),
  };
  return Modal.confirm(opt) as unknown as ConfirmOptions;
}

/**
 * promise 化，但是依然不优雅
 * @param options 同上 , title 传入 'undefined' 时不显示 title
 * @param cb 同上
 * @returns Promise<void>
 */
function createConfirmPromise(
  options: Omit<ModalOptionsEx, 'onOk' | 'onCancel'> & { cancelMessage?: string },
  cb?: () => Promise<void>,
) {
  const iconType = options.iconType || 'warning';
  const title = options.title === 'undefined' ? undefined : (options.title ?? '提示')
  Reflect.deleteProperty(options, 'iconType');
  Reflect.deleteProperty(options, 'title');
  const opt: ModalFuncProps = {
    centered: true,
    icon: getIcon(iconType),
    ...options,
    content: renderContent(options),
    title,
  };
  return new Promise<void>((resolve, reject) => {
    Modal.confirm({
      ...opt,
      onOk: () => {
        resolve();
        return new Promise<void>(async (resolveInner, rejectInner) => {
          try {
            cb && (await cb());
            resolveInner();
          } catch (err) {
            rejectInner(err);
          }
        });
      },
      onCancel: () => {
        let cancelMessage;
        if (options.cancelMessage) {
          cancelMessage = options.cancelMessage;
          Message.info(cancelMessage);
        }
        reject();
      },
    }) as unknown as ConfirmOptions;
  });
}

const getBaseOptions = () => {
  const { t } = useI18n();
  return {
    okText: t('common.okText'),
    centered: true,
  };
};

function createModalOptions(options: ModalOptionsPartial, icon: string): ModalOptionsPartial {
  return {
    ...getBaseOptions(),
    ...options,
    content: renderContent(options),
    icon: getIcon(icon),
  };
}

function createSuccessModal(options: ModalOptionsPartial) {
  return Modal.success(createModalOptions(options, 'success'));
}

function createErrorModal(options: ModalOptionsPartial) {
  return Modal.error(createModalOptions(options, 'close'));
}

function createInfoModal(options: ModalOptionsPartial) {
  return Modal.info(createModalOptions(options, 'info'));
}

function createWarningModal(options: ModalOptionsPartial) {
  return Modal.warning(createModalOptions(options, 'warning'));
}

notification.config({
  placement: 'topRight',
  duration: 3,
});

/**
 * @description: message
 */
export function useMessage() {
  return {
    createMessage: Message,
    notification: notification as NotifyApi,
    createConfirm: createConfirm,
    createSuccessModal,
    createErrorModal,
    createInfoModal,
    createWarningModal,
    createConfirmPromise,
  };
}
