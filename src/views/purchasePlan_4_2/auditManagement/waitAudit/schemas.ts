import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
import { useConfigStore } from '/@/store/modules/config';
import { getDepartmentTreeListByOrgId } from '/@/api/purchase/plan-purchase';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
import { useRouter } from 'vue-router';
import { unref } from 'vue';
import { MenuFullPathEnum } from '/@/enums/menuFullPathEnum';
const configStore = useConfigStore();
export const auditListTableScheam = (): BasicColumn[] => {
  const router = useRouter();
  return [
    {
      title: '项目名称',
      dataIndex: 'processObjectName',
      width: 150,
      fixed: 'left',
      customRender: ({ record }) => {
        if (record.applyObjectType === 'pro_project') {
          return lxTableColumnProjectNameRender(
            {
              id: record.processObjectId,
              proName: record.processObjectName,
            },
            true,
          );
        } else {
          return lxTableColumnProjectBidsectionRender(
            {
              proName: record.processObjectName,
            },
            {
              id: record.processObjectId,
            },
            true,
          );
        }
      },
    },
    {
      title: '预算金额',
      dataIndex: 'amount',
      width: 90,
      fixed: 'left',
      format: (_text, record) => {
        return (
          record.amount + (record.currencyTypeName === '人民币' ? '元' : record.currencyTypeName)
        );
      },
    },
    {
      title: '采购方式',
      dataIndex: 'procurementMethodName',
      width: 80,
      ifShow: () => {
        const currentPath = unref(router.currentRoute).path;
        if (currentPath === MenuFullPathEnum.PURCHASE_DECLARE_AUDIT_MANAGEMENT_WAIT_AUDIT) {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      title: '采购形式',
      dataIndex: 'organizationalFormName',
      width: 80,
      ifShow: () => {
        const currentPath = unref(router.currentRoute).path;
        if (currentPath === MenuFullPathEnum.PURCHASE_DECLARE_AUDIT_MANAGEMENT_WAIT_AUDIT) {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      title: '计划使用时间',
      dataIndex: 'planUseTime',
      width: 90,
      sorter: true,
      customRender: ({ record }) => {
        return renderTime(record.planUseTime);
      },
    },
    {
      title: '申报部门',
      dataIndex: 'addDepName',
      width: 90,
    },
    {
      title: '申报人',
      dataIndex: 'addUserPerName',
      width: 120,
      format: (_text, record) => {
        const mobile = getSecretMobile(record.addUserMobile);
        return `${record.addUserPerName}(${mobile})`;
      },
    },
    {
      title: '添加日期',
      dataIndex: 'addDateTime',
      width: 90,
      sorter: true,
      customRender: ({ record }) => {
        return renderTime(record.addDateTime);
      },
    },
  ];
};
export const searchFormSchema = (): FormSchema[] => {
  const orgId = configStore.GET_CONFIG_BASEINFO.orgId;
  return [
    {
      field: 'processObjectName',
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
      field: 'addDepId',
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
      },
    },
  ];
};
