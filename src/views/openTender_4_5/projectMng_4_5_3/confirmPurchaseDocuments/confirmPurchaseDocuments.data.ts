import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut, useConfigStore } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
const useConfigStoreData = useConfigStore();
// import { useUserStoreWithOut, useUserStore } from '/@/store/modules/user';
// const userStore = useUserStoreWithOut();
import { getPersonNameFormatter, codeNameFilter } from '/@/utils/commonServe/businessUtil';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
// 引入接口
import { getDepartmentTreeListByOrgId } from '/@/api/purchase/plan-purchase';
const columns = (): BasicColumn[] => {
  const personFormatter = getPersonNameFormatter();
  return [
    {
      title: '项目名称',
      dataIndex: 'proName',
      width: 120,
      fixed: 'left',
      customRender: ({ record }) => {
        return lxTableColumnProjectBidsectionRender(record, record);
      },
    },
    {
      title: '项目编号',
      dataIndex: 'purchaseNumber',
      width: 120,
      fixed: 'left',
      format: (_text, record) => {
        return record?.project?.purchaseNumber;
      },
    },
    {
      title: '项目标段',
      dataIndex: 'sort',
      width: 120,
      format: (_text, record) => {
        if (record.sort === 0) {
          return '单标段';
        } else {
          return `第${record.sort}标段`;
        }
      },
    },
    {
      title: '预算金额',
      dataIndex: 'budgetAmount',
      width: 100,
      format: (_text, record) => {
        return (
          _text +
          (record.project.currencyType.code === '1' ? '元' : record.project.currencyType.name)
        );
      },
    },
    {
      title: '采购类型',
      dataIndex: 'project.projectType.name',
      width: 80,
    },
    {
      title: '采购方式',
      dataIndex: 'procurementMethod.name',
      width: 100,
    },
    {
      title: '招标公司名称',
      dataIndex: 'biddingCompany.name',
      width: 120,
    },
    {
      title: '业务联系人',
      dataIndex: 'user',
      width: 120,
      format: (_text, record) => {
        const tel = getSecretMobile(record?.biddingCompany?.user?.mobile);
        const mobile = record?.biddingCompany?.user?.mobile ? `(${tel})` : '';
        const perName = record?.biddingCompany?.user?.perName
          ? record?.biddingCompany?.user?.perName
          : '';
        return `${perName}${mobile}`;
      },
    },
    {
      title: '申报部门',
      dataIndex: 'project.declareDept',
      width: 100,
      format: (_text, record) => {
        console.log(record, 'record');
        return codeNameFilter(record.project.declareDept);
      },
    },
    {
      title: '申报人',
      dataIndex: 'project.addUser.perName',
      width: 100,
      format: (_, record) => {
        return personFormatter(record.project.addUser);
      },
    },
    {
      title: '添加日期',
      dataIndex: 'project.addDateTime',
      width: 120,
      customRender: ({ text }) => {
        return renderTime(text);
      },
      sorter: true,
    },
  ];
};

// 查询项表单
const searchFormSchema = (): FormSchema[] => {
  const orgId = useConfigStoreData.GET_CONFIG_BASEINFO.orgId;
  return [
    {
      field: 'proName',
      label: '项目名称',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        placeholder: '请输入项目名称',
      },
    },
    {
      field: 'proNumber',
      label: '项目编号',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        placeholder: '请输入项目编号',
      },
    },
    {
      field: 'projectTypeId',
      label: '采购类型',
      component: 'ApiSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG_DICTIONRY.projectTypeId,
        placeholder: '请选择采购类型',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
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
      },
    },
  ];
};

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => {
  return {
    hqlPageAndSortSumDto: {
      ifCustomHql: true,
      sorts: [
        {
          dir: 'desc',
          prop: 'bidSection.id',
        },
        {
          dir: 'desc',
          prop: 'bidSection.updateDateTime',
        },
      ],
      page: {
        pageSize: 10,
        pageNum: 1,
      },
      queryList: [
        {
          param: 'bidSection.ifDelete',
          type: 'equal',
          value: [0],
        },
        {
          param: 'bidSection.status.code',
          type: 'equal',
          value: [17], // 状态=采购问价审核中
        },
        // {
        //   param: 'bidSection.project.BiddingUserId',
        //   type: 'equal',
        //   value: [userStore.getUserInfo.id.toString()],
        //   // value 当前登录人id
        // },
      ],
      dataFieldList: ['bidSection', 'bidSection.id'],
    },
  };
};

export { columns, searchFormSchema, pageAndSort };
