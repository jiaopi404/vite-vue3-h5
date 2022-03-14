import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';
import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut, useConfigStore } from '/@/store/modules/config';
import { useUserStore } from '/@/store/modules/user';
import {
  lxTableColumnProjectBidsectionRender,
  lxTableColumnReportSupplierRender,
} from '/@/components/LxComponents';

// 引入接口
const columns = (): BasicColumn[] => {
  const configStore = useConfigStore();
  return [
    {
      title: '项目名称',
      dataIndex: 'proName',
      width: 280,
      fixed: 'left',
      customRender: ({ record }) => {
        return lxTableColumnProjectBidsectionRender(record.bidSection, record.bidSection);
      },
    },
    {
      title: '项目编号',
      dataIndex: 'bidSection.proNumber',
      width: 120,
      fixed: 'left',
    },
    {
      title: '项目标段',
      dataIndex: 'bidSection.sort',
      width: 100,
      format: (_text, record) => {
        return record.bidSection.sort === 0 ? '单标段' : `第${record.bidSection.sort}标段`;
      },
    },
    {
      title: '预算金额',
      dataIndex: 'budgetAmount',
      width: 120,
      sorter: true,
      format: (_text, record) => {
        return (
          record.bidSection.budgetAmount +
          (record.bidSection.project.currencyType?.code === '1'
            ? '元'
            : record.bidSection.project.currencyType?.name)
        );
      },
    },
    {
      title: '采购类型',
      dataIndex: 'bidSection.project.projectType.name',
      width: 120,
    },
    // {
    //   title: '采购方式',
    //   dataIndex: 'bidSection.procurementMethod.name',
    //   width: 120,
    // },
    {
      title: '中标公司名称',
      dataIndex: 'name',
      width: 120,

      customRender: ({ record }) => {
        return lxTableColumnReportSupplierRender(
          record.bidWinner.biddingCompany,
          record.bidWinner.biddingCompany,
        );
      },
    },
    {
      title: '中标金额',
      dataIndex: 'bidWinningAmount',
      width: 120,
      sorter: true,
      format: (_text, record) => {
        const bidWinningAmount = record?.bidWinner?.bidWinningAmount
          ? record?.bidWinner?.bidWinningAmount +
            (record.bidSection.project.currencyType?.code === '1'
              ? '元'
              : record.bidSection.project.currencyType?.name)
          : record?.bidWinner?.bidWinningAmount === 0
          ? record?.bidWinner?.bidWinningAmount +
            (record.bidSection.project.currencyType?.code === '1'
              ? '元'
              : record.bidSection.project.currencyType?.name)
          : '';
        return bidWinningAmount;
      },
    },
    {
      title: '初验是否完成',
      dataIndex: 'bidSection.ifBeforeAcceptance',
      width: 120,
      format: (_text) => {
        return _text ? '是' : '否';
      },
      ifShow: configStore?.GET_CONFIG_MODULE?.acceptanceMode ? true : false,
    },
    {
      title: '验收人员',
      dataIndex: 'proAcceptance.userName',
      width: 120,
    },
    {
      title: '验收次数',
      dataIndex: 'frequency',
      width: 120,
      sorter: true,
      format: (_text, record) => {
        return record?.proAcceptance?.frequency;
      },
    },
    {
      title: '验收日期',
      dataIndex: 'accDate',
      width: 100,
      sorter: true,
      format: (_text, record) => {
        return renderTime(record?.proAcceptance?.accDate);
      },
    },
  ];
};

// 查询项表单
const searchFormSchema = (): FormSchema[] => {
  const ConfigStoreWithOut = useConfigStoreWithOut();
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
      field: 'projectType',
      label: '采购类型',
      component: 'ApiSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDictionaryByParentId,
        params: ConfigStoreWithOut.GET_CONFIG_DICTIONRY.projectTypeId,
        placeholder: '请选择采购类型',
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
  const configStore = useConfigStore();
  const userInfo = useUserStore().getUserInfo;
  return {
    hqlPageAndSortSumDto: {
      ifCustomHql: true,
      queryList: [
        {
          param: 'bidSection.ifDelete',
          type: 'equal',
          value: [0],
        },
        {
          param: 'proAcceptance.statusId',
          type: 'equal',
          value: [4],
        },
        {
          param: 'proAcceptance.addUser.id',
          type: 'equal',
          value: [userInfo.id],
        },
        // {
        //   param: '',
        //   type: 'or',
        //   value: configStore?.GET_CONFIG_MODULE?.acceptanceMode
        //     ? [
        //         orParamsFormatter(
        //           `((bidSection.project.BiddingUserId=${userInfo.id} AND bidSection.ifBeforeAcceptance=1))`,
        //         ),
        //       ]
        //     : [
        //         orParamsFormatter(
        //           `((bidSection.project.proChargeUserId=${userInfo.id} AND bidSection.ifBeforeAcceptance=1))`,
        //         ),
        //       ],

        // [
        //   orParamsFormatter(
        //     `((bidSection.project.proChargeUserId=${userInfo.id} AND bidSection.ifBeforeAcceptance=0) OR (bidSection.project.BiddingUserId=${userInfo.id} AND bidSection.ifBeforeAcceptance=1))`,
        //   ),
        // ],
        // },
      ],
      dataFieldList: ['bidSection', 'proAcceptance', 'bidWinner'],
      page: {
        pageNum: 1,
        pageSize: 100,
      },
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
    },
  };
};

export { columns, searchFormSchema, pageAndSort };
