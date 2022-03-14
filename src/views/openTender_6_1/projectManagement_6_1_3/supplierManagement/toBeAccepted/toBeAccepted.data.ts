import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();

// 引入接口
const columns = (): BasicColumn[] => {
  return [
    {
      title: '项目名称',
      dataIndex: 'bidSection.proName',
      width: 200,
      fixed: 'left',
    },
    {
      title: '项目编号',
      dataIndex: 'bidSection.proNumber',
      width: 120,
      fixed: 'left',
    },
    {
      title: '项目标段',
      dataIndex: 'sort',
      width: 90,
      format: (_text, record) => {
        if (record.bidSection.sort === 0) {
          return '单标段';
        } else {
          return `第${record.bidSection.sort}标段`;
        }
      },
    },
    {
      title: '预算金额',
      dataIndex: 'bidSection.budgetAmount',
      width: 80,
      format: (_text, record) => {
        return (
          _text +
          (record.bidSection.project.currencyType.code === '1'
            ? '元'
            : record.bidSection.project.currencyType.name)
        );
      },
    },
    {
      title: '采购类型',
      dataIndex: 'bidSection.project.projectType.name',
      width: 80,
    },
    {
      title: '采购方式',
      dataIndex: 'bidSection.procurementMethod.name',
      width: 100,
    },
    {
      title: '添加日期',
      dataIndex: 'addDateTime',
      width: 100,
      format: (_text, record) => {
        return renderTime(record.bidSection.addDateTime);
      },
      sorter: true,
    },
    // {
    //   title: '中标公司名称',
    //   dataIndex: 'biddingCompany',
    //   width: 120,
    //   format: (_text, record) => {
    //     const name = record.bidSection.biddingCompany ? record.bidSection.biddingCompany.name : '';
    //     return name;
    //   },
    // },
    {
      title: '中标代表人',
      dataIndex: 'bidWinner.perName',
      width: 120,
      format: (_text, record) => {
        const tel = getSecretMobile(record?.bidWinner?.mobile);
        const mobile = record?.bidWinner?.mobile ? `(${tel})` : '';
        // const perName = record?.bidWinner.perName ? record?.bidWinner?.perName : '';
        return `${_text}${mobile}`;
      },
    },
    {
      title: '中标金额',
      dataIndex: 'bidWinner.bidWinningAmount',
      width: 80,
      format: (_text, record) => {
        return (
          _text +
          (record.bidSection.project.currencyType.code === '1'
            ? '元'
            : record.bidSection.project.currencyType.name)
        );
      },
    },
    {
      title: '中标日期',
      dataIndex: 'bidWinningDate',
      width: 100,
      format: (_text, record) => {
        return renderTime(record.bidWinner.bidWinningDate);
      },
      sorter: true,
    },
    {
      title: '交付日期',
      dataIndex: 'deliveryTime',
      width: 100,
      format: (_text, record) => {
        return renderTime(record.bidSection.deliveryTime);
      },
      sorter: true,
    },
  ];
};

// 查询项表单
const searchFormSchema = (): FormSchema[] => {
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
      field: 'proNumber',
      label: '项目编号',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        autoSubmitOnEnter: true,
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
      field: 'procurementMethod',
      label: '采购方式',
      component: 'ApiSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG_DICTIONRY.purchaseMethodId,
        placeholder: '请选择采购方式',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
  ];
};

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => {
  return {
    hqlPageAndSortSumDto: {
      ifCustomHql: true,
      queryList: [
        {
          param: 'bidWinner.ifDelete',
          type: 'equal',
          value: [0],
        },
        {
          param: 'bidSection.status.code',
          type: 'equal',
          value: [24],
        },
      ],
      dataFieldList: ['bidWinner', 'bidSection'],
      page: {
        pageNum: 1,
        pageSize: 10,
      },
      sorts: [
        {
          dir: 'desc',
          prop: 'bidWinner.id',
        },
        {
          dir: 'desc',
          prop: 'bidSection.id',
        },
        {
          dir: 'desc',
          prop: 'bidSection.updateDateTime',
        },
      ],
    },
  };
};

export { columns, searchFormSchema, pageAndSort };
