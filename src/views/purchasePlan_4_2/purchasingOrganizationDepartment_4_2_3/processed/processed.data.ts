import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStore } from '/@/store/modules/config';
// 引入接口
import { getDepartmentTreeListByOrgId } from '/@/api/purchase/plan-purchase';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';
const configStore = useConfigStore();
//列表展示项
export const columns = (): BasicColumn[] => {
  return [
    {
      title: '项目名称',
      dataIndex: 'proName',
      width: 280,
      customRender: ({ record }) => {
        return lxTableColumnProjectNameRender({
          id: record.id,
          proName: record.proName,
        });
      },
    },
    {
      title: '预算金额',
      dataIndex: 'budgetAmount',
      width: 80,
      format: (_text, record) => {
        return (
          record.budgetAmount + (record.currencyType.code === '1' ? '元' : record.currencyType.name)
        );
      },
    },
    {
      title: '计划使用时间',
      dataIndex: 'planUseTime',
      width: 90,
      customRender: ({ record }) => {
        return renderTime(record.planUseTime);
      },
      sorter: true,
    },
    {
      title: '计划采购时间',
      dataIndex: 'planPurchaseTime',
      width: 90,
      customRender: ({ record }) => {
        return renderTime(record.planPurchaseTime);
      },
      sorter: true,
    },
    {
      title: '申报部门',
      dataIndex: 'declareDept.name',
      width: 80,
    },
    {
      title: '申报人',
      dataIndex: 'AddUserId',
      width: 160,
      format: (_text, record) => {
        const mobile = getSecretMobile(record.addUser.mobile);
        return `${record.addUser.perName}(${mobile})`;
      },
    },
    {
      title: '添加日期',
      dataIndex: 'addDateTime',
      width: 80,
      customRender: ({ record }) => {
        return renderTime(record.addDateTime);
      },
      sorter: true,
    },
  ];
};
// 查询项
export const searchFormSchema = (): FormSchema[] => {
  const orgId = configStore.GET_CONFIG_BASEINFO.orgId;
  return [
    {
      field: 'proName',
      label: '项目名称',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        autoSubmitOnEnter: true,
        placeholder: '请输入项目名称',
      },
    },

    {
      field: 'planUseTime',
      label: '计划使用时间',
      component: 'DatePicker',
      colProps: { span: 8 },
      componentProps: {
        autoSubmitOnEnter: true,
        placeholder: '请选择计划使用时间',
      },
    },
    {
      field: 'declareDept',
      label: '申报部门',
      component: 'ApiTreeSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDepartmentTreeListByOrgId,
        params: orgId,
        placeholder: '请选择申报部门',
        resultField: 'data', // 接口返回的字段，如果接口返回数组，可以不填。支持x.x.x格式
        replaceFields: {
          children: 'children',
          key: 'id',
          value: 'id',
          title: 'name',
        },
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
  ];
};
