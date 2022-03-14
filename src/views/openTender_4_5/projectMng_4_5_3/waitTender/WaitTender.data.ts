import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';

import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
import { getBidSectionProNumber, getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';
import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
import { formatToDateTime } from '/@/utils/dateUtil';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';

const columns = (): BasicColumn[] => {
  const personFormatter = getPersonNameFormatter();
  return [
    {
      title: '项目名称',
      dataIndex: 'proName',
      width: 150,
      fixed: 'left',
      customRender: ({ record }) => {
        return lxTableColumnProjectBidsectionRender(record, record);
      },
    },
    {
      title: '项目编号',
      dataIndex: 'proNumber',
      width: 100,
      fixed: 'left',
      format: (_, record) => {
        return getBidSectionProNumber(record);
      },
    },
    {
      title: '项目标段',
      dataIndex: 'sort',
      width: 100,
      format: (_text) => {
        if (_text) {
          return `第${_text}标段`;
        } else {
          return '单标段';
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
    // {
    //   title: '货币类型',
    //   dataIndex: 'currencyType.name',
    //   width: 80,
    // },
    {
      title: '采购类型',
      dataIndex: 'project.projectType.name',
      width: 80,
    },
    {
      title: '采购方式',
      dataIndex: 'procurementMethod.name',
      width: 120,
    },
    {
      title: '申报部门',
      dataIndex: 'project.declareDept.name',
      width: 100,
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
      title: '报价开始时间',
      dataIndex: 'project.quoteStartTime',
      width: 130,
      customRender: ({ record }) => {
        if (record.procurementMethod.node) {
          return renderTime(record.project.quoteStartTime, false, true);
        } else {
          return renderTime(record.quoteEndTime, false, true);
        }
      },
      sorter: true,
    },
    {
      title: '报价截止时间',
      dataIndex: 'project.quoteEndTime',
      width: 130,
      customRender: ({ record }) => {
        if (record.procurementMethod.node) {
          return renderTime(record.project.quoteEndTime, false, true);
        } else {
          return null;
        }
      },
      sorter: true,
    },
    {
      title: '发布日期',
      dataIndex: 'project.releaseDate',
      width: 100,
      customRender: ({ text }) => {
        return renderTime(text);
      },
      sorter: true,
    },
  ];
};

// 查询项表单
const searchFormSchema = (): FormSchema[] => [
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
    field: 'releaseDate',
    label: '发布日期',
    component: 'RangePicker',
    colProps: { span: 8 },
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
  },
];

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => {
  const nowDate = formatToDateTime();
  const base64Data = orParamsFormatter(
    // `((bidSection.project.procurementMethod.code in (5,6) and bidSection.project.quoteEndTime > '${nowDate}') or (bidSection.project.procurementMethod.code not in (5,6) and bidSection.quoteEndTime > '${nowDate}'))`,
    // `((bidSection.project.procurementMethod.node in (1) and bidSection.project.quoteEndTime > '${nowDate}') or (bidSection.project.procurementMethod.node not in (1) and bidSection.quoteEndTime > '${nowDate}'))`,
    `((bidSection.procurementMethod.node in (1) and bidSection.project.quoteEndTime > '${nowDate}') or (( bidSection.procurementMethod.node is null) and bidSection.quoteEndTime > '${nowDate}'))`,
    // bidSection.procurementMethod.node not in (1) or
  );
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
      queryList: [
        {
          param: 'bidSection.ifDelete',
          type: 'equal',
          value: [0],
        },
        {
          param: 'bidSection.status.code',
          type: 'equal',
          value: [18], // 状态=待招标/采购中
        },
        {
          param: '',
          type: 'or',
          value: [base64Data],
        },
      ],
      dataFieldList: ['bidSection', 'bidSection.id'],
    },
  };
};

export { columns, searchFormSchema, pageAndSort };
