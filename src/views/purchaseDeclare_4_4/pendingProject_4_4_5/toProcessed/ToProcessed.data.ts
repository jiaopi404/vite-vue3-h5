import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';

import { getDictionaryByParentId } from '/@/api/demo/system';
import { getFileTypeList } from '/@/api/purchaseDeclare/pendingProjectApi';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
import { useUserStoreWithOut } from '/@/store/modules/user';
const userStore = useUserStoreWithOut();

import { useMessage } from '/@/hooks/web/useMessage';
const { createConfirm } = useMessage();
import { getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';
import { ref, unref, toRaw } from 'vue';
import { formatToDateTime, formatToDate, dateUtil } from '/@/utils/dateUtil';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';

// 选择“接收”的话 result === 1，
// 显示[审核结果][审核意见][计划采购形式][计划采购方式][审批采购形式][审批采购方式][是否论证项目]；
// 选择“退回”的话 result === 2，显示[审核结果][审核意见]
const ifShowResult = ({ model }): boolean => {
  return model.result === 1;
};

// 筛选电子竞价&询价
const filterArray = (data) => {
  return data
    .filter((item) => {
      if (item.code === '5' || item.code === '6') {
        return item;
      }
    })
    .map((item) => item.id);
};

// 时间校验
const dateValidation = (startTime, endTime) => {
  if (startTime && endTime) {
    // 日期差
    // const dateDiff = dateUtil(endTime).diff(dateUtil(startTime), 'days');
    if (dateUtil(startTime).unix() >= dateUtil(endTime).unix()) {
      return { dateBol: 2, msg: '报价截止日期应晚于报价开始日期！' };
    } else {
      if (formatToDate(startTime) === formatToDate(endTime)) {
        //  msg: '报价截止日期应晚于当前日期！'
        return { dateBol: 3, msg: '报价截止日期应晚于报价开始日期！' };
      } else {
        return { dateBol: 1, msg: '' };
      }
    }
  } else {
    return { dateBol: 1, msg: '' };
  }
};

// 时间校验message！
const dataMessage = (msg) => {
  createConfirm({
    iconType: 'info',
    title: '提示',
    content: msg,
    okCancel: false,
    okText: '确定',
  });
};

const columns = (): BasicColumn[] => {
  const personFormatter = getPersonNameFormatter();
  return [
    {
      title: '项目名称',
      dataIndex: 'proName',
      // width: 120,
      width: 200,
      fixed: 'left',
      customRender: ({ record }) => {
        return lxTableColumnProjectNameRender(record);
      },
    },
    {
      title: '预算金额',
      dataIndex: 'budgetAmount',
      width: 100,
      format: (_text, record) => {
        return (
          record.budgetAmount + (record.currencyType.code === '1' ? '元' : record.currencyType.name)
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
      dataIndex: 'projectType.name',
      width: 80,
    },
    // {
    //   title: '采购方式',
    //   dataIndex: 'procurementMethod.name',
    //   width: 120,
    // },
    {
      title: '申报部门',
      dataIndex: 'declareDept.name',
      width: 120,
    },
    {
      title: '申报人',
      dataIndex: 'addUser.perName',
      width: 120,
      format: (_, record) => {
        return personFormatter(record.addUser);
      },
    },
    {
      title: '计划采购时间',
      dataIndex: 'planPurchaseTime',
      width: 120,
      customRender: ({ text }) => {
        return renderTime(text);
      },
      sorter: true,
    },
    {
      title: '计划使用时间',
      dataIndex: 'planUseTime',
      width: 120,
      customRender: ({ text }) => {
        return renderTime(text);
      },
      sorter: true,
    },
    {
      title: '添加日期',
      dataIndex: 'addDateTime',
      width: 120,
      customRender: ({ text }) => {
        return renderTime(text);
      },
      sorter: true,
    },
    // {
    //   title: 'operation',
    //   dataIndex: 'operation',
    //   slots: { customRender: 'operation' },
    // },
  ];
};

// 查询表单
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
];

// 抽屉表单
const formSchema = (): FormSchema[] => {
  const procurementMethodArray = ref<Number[]>([]);
  const ifShowDataAndTime = ({ model }) => {
    if (unref(procurementMethodArray).includes(model['procurementMethod.id'])) {
      return true;
    } else {
      return false;
    }
  };
  return [
    {
      field: 'result',
      label: '处理项目',
      required: true,
      component: 'RadioGroup',
      componentProps: ({ formActionType, formModel }) => {
        return {
          options: [
            { label: '接收', value: 1 },
            { label: '退回', value: 2 },
          ],
          onChange: ({ target }) => {
            const { setFieldsValue, resetFields } = formActionType;
            resetFields();
            if (target.value === 1) {
              setFieldsValue({ auditOpinion: '同意' });
            } else if (target.value === 2) {
              setFieldsValue({ auditOpinion: '不同意' });
            }
          },
        };
      },
      defaultValue: 1,
    },
    // 选择 接收1 ，反馈意见默认填充“同意”
    // 选择 退回2 ，反馈意见默认填充“不同意”
    {
      field: 'auditOpinion',
      label: '审核意见',
      component: 'InputTextArea',
      rules: [{ required: true, message: '请输入审核意见', trigger: 'blur' }],
      componentProps: {
        // defaultValue: '同意666', bug
        placeholder: '最大可输入5000个字符',
        autoSize: { minRows: 3, maxRows: 5 },
        showCount: true,
        maxlength: 5000,
      },
      defaultValue: '同意',
    },
    {
      field: 'planOrganizationalForm.id',
      label: '计划采购形式',
      component: 'ApiSelect',
      // required: true,
      componentProps: ({ formActionType }) => ({
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG_DICTIONRY.organizationalFormId,
        placeholder: '请选择计划采购形式',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
        onChange: (value) => {
          const { setFieldsValue } = formActionType;
          if (value) {
            setFieldsValue({ 'organizationalForm.id': value });
          }
        },
      }),
      dynamicDisabled: true,
      ifShow: ifShowResult,
    },
    {
      field: 'planProcurementMethod.id',
      label: '计划采购方式',
      component: 'ApiSelect',
      // required: true,
      componentProps: ({ formActionType }) => ({
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG_DICTIONRY.purchaseMethodId,
        placeholder: '请选择计划采购方式',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
        onChange: (value) => {
          const { setFieldsValue, clearValidate } = formActionType;
          if (value) {
            setFieldsValue({ 'procurementMethod.id': value });

            if (toRaw(procurementMethodArray.value).includes(value)) {
              setFieldsValue({
                quoteStartTime: null,
                quoteEndTime: null,
                quaRequire: [],
                remark: null,
                dateOfDelivery: null,
              });
              clearValidate([
                'quoteStartTime',
                'quoteEndTime',
                'quaRequire',
                'remark',
                'dateOfDelivery',
              ]);
            }
          }
        },
        // onOptionsChange: (options) => {
        //   // option 内容改变时
        //   console.log('角色 get options', options.length, options);
        // },
      }),
      dynamicDisabled: true,
      ifShow: ifShowResult,
    },
    {
      field: 'organizationalForm.id',
      label: '审批采购形式',
      component: 'ApiSelect',
      required: true,
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG_DICTIONRY.organizationalFormId,
        placeholder: '请选择审批采购形式',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
      ifShow: ifShowResult,
    },
    {
      field: 'procurementMethod.id',
      label: '审批采购方式',
      component: 'ApiSelect',
      required: true,
      componentProps: ({ formActionType }) => ({
        api: async (param) => {
          const data = await getDictionaryByParentId(param);
          procurementMethodArray.value = filterArray(data);
          return data;
        },
        params: configStore.GET_CONFIG_DICTIONRY.purchaseMethodId,
        placeholder: '请选择审批采购方式',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
        onChange: async (value) => {
          const { setFieldsValue, clearValidate } = formActionType;
          console.log('审批采购方式:', value);
          setFieldsValue({
            quoteStartTime: null,
            quoteEndTime: null,
            quaRequire: [],
            remark: null,
            dateOfDelivery: null,
          });
          clearValidate([
            'quoteStartTime',
            'quoteEndTime',
            'quaRequire',
            'remark',
            'dateOfDelivery',
          ]);
        },
      }),
      ifShow: ifShowResult,
    },
    {
      field: 'quoteStartTime',
      label: '报价开始日期',
      component: 'DatePicker',
      required: true,
      componentProps: ({ formModel, formActionType }) => ({
        placeholder: '请选择报价开始日期',
        format: 'YYYY-MM-DD HH:mm',
        valueFormat: 'YYYY-MM-DD HH:mm:00',
        showTime: { defaultValue: dateUtil('08:00', 'HH:mm'), format: 'HH:mm' },
        showToday: false,
        disabledDate(current) {
          return current < dateUtil().startOf('day');
        },
        // 面板关闭时校验时间
        onOpenChange: (status) => {
          const { setFieldsValue } = formActionType;
          if (!status) {
            if (formModel.quoteStartTime) {
              if (dateUtil(formModel.quoteStartTime).unix() < dateUtil().unix()) {
                setFieldsValue({
                  quoteStartTime: null,
                });
                dataMessage('报价开始日期已过,请修改！');
              }
            }
            const data = dateValidation(formModel.quoteStartTime, formModel.quoteEndTime);
            if (data.dateBol === 2) {
              setFieldsValue({
                quoteStartTime: null,
              });
              dataMessage(data.msg);
            } else if (data.dateBol === 3) {
              setFieldsValue({
                quoteEndTime: null,
              });
              dataMessage(data.msg);
            }
          }
        },
      }),
      ifShow: ifShowDataAndTime,
    },
    {
      field: 'quoteEndTime',
      label: '报价截止日期',
      component: 'DatePicker',
      required: true,
      componentProps: ({ formModel, formActionType }) => ({
        placeholder: '请选择报价截止日期',
        format: 'YYYY-MM-DD HH:mm',
        valueFormat: 'YYYY-MM-DD HH:mm:00',
        showTime: { defaultValue: dateUtil('18:00', 'HH:mm'), format: 'HH:mm' },
        showToday: false,
        disabledDate(current) {
          return current < dateUtil().startOf('day');
        },
        // 面板关闭时校验时间
        onOpenChange: (status) => {
          const { setFieldsValue } = formActionType;
          if (!status) {
            const data = dateValidation(formModel.quoteStartTime, formModel.quoteEndTime);
            if (data.dateBol === 2) {
              setFieldsValue({
                quoteEndTime: null,
              });
              dataMessage(data.msg);
            } else if (data.dateBol === 3) {
              setFieldsValue({
                quoteEndTime: null,
              });
              dataMessage(data.msg);
            }
          }
        },
        // onOk: (date) => {
        //   console.log('点击确定按钮时的回调', date);
        // },
        // onPanelChange: (value, mode) => {
        //   console.log('日期面板变化时的回调', value, mode);
        // },
      }),
      ifShow: ifShowDataAndTime,
    },
    {
      field: 'quaRequire',
      label: '资质要求',
      component: 'ApiSelect',
      required: true,
      componentProps: {
        api: getFileTypeList,
        params: { objectType: 4 }, // 暂时为死值
        numberToString: true,
        placeholder: '请选择资质要求',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
        mode: 'multiple',
        // 'multiple' 多选 | 'tags' 多选且支持自定义标签 | 'combobox' 单选
      },
      ifShow: ifShowDataAndTime,
    },
    {
      field: 'remark',
      label: '申购备注',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '最大可输入1000个字符',
        autoSize: { minRows: 3, maxRows: 5 },
        showCount: true,
        maxlength: 1000,
      },
      // defaultValue: '同意',
      ifShow: ifShowDataAndTime,
    },
    {
      field: 'dateOfDelivery',
      label: '交货期',
      component: 'InputTextArea',
      rules: [{ required: true, message: '请输入交货期', trigger: 'blur' }],
      componentProps: {
        placeholder: '最大可输入50个字符',
        autoSize: { minRows: 3, maxRows: 5 },
        showCount: true,
        maxlength: 50,
      },
      ifShow: ifShowDataAndTime,
    },
    {
      field: 'reviewNode',
      label: '',
      component: 'Input',
      slot: 'reviewNode',
    },
  ];
};

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => ({
  hqlPageAndSortSumDto: {
    ifCustomHql: true,
    queryList: [
      {
        param: 'project.ifDelete',
        type: 'equal',
        value: [0],
      },
      {
        param: 'project.status.code',
        type: 'equal',
        value: ['11'],
      },
      {
        param: 'project.BiddingUserId',
        type: 'equal',
        value: [userStore.getUserInfo.id.toString()],
        // value 当前登录人id
      },
    ],
    dataFieldList: ['project', 'project.id'],
    // page: {
    //   pageNum: 1,
    //   pageSize: 10,
    // },
    sorts: [
      {
        dir: 'desc',
        prop: 'project.updateDateTime',
      },
      {
        dir: 'desc',
        prop: 'project.id',
      },
    ],
  },
});

export { columns, searchFormSchema, pageAndSort, formSchema, dataMessage };
