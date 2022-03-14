export enum CustomMsgEnum {
  // 确认弹窗
  DEL_CONFIRM_TIP = '确认删除吗？',
  DEL_SUCCESS = '删除成功！',
  DEL_CANCEL = '已取消删除',
  // 保存
  SAVE_SUCCESS = '保存成功！',
  // 启用禁用
  ENABLE_SUCCESS = '启用成功！',
  DISABLE_SUCCESS = '禁用成功！',
  // 操作失败
  SAVE_FAIL = '操作失败，请重试！',
  // 导出成功 与 失败
  EXPORT_SUCCESS = '导出成功！',
  EXPORT_FAIL = '导出失败',
}

/**
 * 如果是非删除类型的 确认框，则使用此方法获取tip
 * @param label
 * @returns
 */
export const getCusConfirmTip = (label: string) => {
  return `确认${label}吗？`;
};
