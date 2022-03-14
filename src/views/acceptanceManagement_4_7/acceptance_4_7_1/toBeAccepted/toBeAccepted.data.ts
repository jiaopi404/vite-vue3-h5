import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut, useConfigStore } from '/@/store/modules/config';
import { useUserStore } from '/@/store/modules/user';
import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
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
      dataIndex: 'proAcceptance.frequency',
      width: 120,
      format: (_text) => {
        return _text ? _text : '';
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
  const configStoreWithOut = useConfigStoreWithOut();
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
        params: configStoreWithOut?.GET_CONFIG_DICTIONRY?.projectTypeId,
        placeholder: '请选择采购类型',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    // {
    //   field: 'procurementMethod',
    //   label: '采购方式',
    //   component: 'ApiSelect',
    //   colProps: { span: 8 },
    //   componentProps: {
    //     api: getDictionaryByParentId,
    //     params: configStoreWithOut?.GET_CONFIG_DICTIONRY?.purchaseMethodId,
    //     placeholder: '请选择采购方式',
    //     labelField: 'name',
    //     valueField: 'id',
    //     showSearch: true,
    //     optionFilterProp: 'label',
    //   },
    // },
  ];
};

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => {
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
        { param: 'bidSection.status.code', type: 'equal', value: [24] },
        {
          param: 'proAcceptance.statusId',
          type: 'equal',
          value: [1],
        },
        {
          param: '',
          type: 'or',
          // value: [
          //   `((bidSection.project.proChargeUserId=${userInfo.id} AND bidSection.ifBeforeAcceptance=0) OR (bidSection.project.BiddingUserId=${userInfo.id} AND bidSection.ifBeforeAcceptance=1))`,
          // ],
          value: [
            orParamsFormatter(
              `((bidSection.project.proChargeUserId=${userInfo.id} AND bidSection.ifBeforeAcceptance=0) OR (bidSection.project.BiddingUserId=${userInfo.id} AND bidSection.ifBeforeAcceptance=1))`,
            ),
          ],
        },
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
// 抽屉数据
const formSchema = (): FormSchema[] => [
  {
    field: 'deliveryTime',
    label: '完工日期',
    component: 'DatePicker',
    slot: 'deliveryTime',
  },
  {
    field: 'accDate',
    label: '验收日期',
    component: 'DatePicker',
    required: true,
    componentProps: {
      disabledDate(current) {
        return current > Date.now();
      },
      placeholder: '请选择验收日期',
    },
  },
  {
    field: 'accUserIds',
    label: '验收人员',
    component: 'ApiSelect',
    required: true,
    // componentProps: () => {
    //   return {
    //     api: async (param) => {
    //       const data = await getUserByOrgID(param);
    //       data.forEach((item) => {
    //         if (item.role === 3) {
    //           item.perName = '专家-' + item.perName;
    //         }
    //         item.perName = `${item.perName}(${getSecretMobile(item.mobile)})`;
    //       });
    //       return data;
    //     },
    //     // api: getUserByOrgID,
    //     params: userInfo.orgId,
    //     numberToString: true, // 是否将number值转化为string
    //     labelField: 'perName',
    //     valueField: 'id',
    //     mode: 'multiple',
    //     // 'multiple' 多选 | 'tags' 多选且支持自定义标签 | 'combobox' 单选
    //     showSearch: true,
    //     optionFilterProp: 'label',
    //     placeholder: '请选择验收人员',
    //   };
    // },
    defaultValue: [], // 默认 普通用户
  },
  {
    field: 'accExplain',
    label: '验收说明',
    component: 'InputTextArea',
    required: true,
    rules: [
      { required: true, message: '请输入1至5000位汉字、符号、字母或数字。', trigger: 'blur' },
    ],
    componentProps: {
      placeholder: '请输入验收说明',
      autoSize: { minRows: 8, maxRows: 5 },
      showCount: true,
      maxlength: 5000,
    },
  },
];
export { columns, searchFormSchema, pageAndSort, formSchema };
