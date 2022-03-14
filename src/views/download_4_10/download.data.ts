import { FormSchema } from '/@/components/Form';
import { BasicColumn } from '/@/components/Table';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();

// 查询参数
export const downloadSearchFormSchema = (): FormSchema[] => [
  {
    field: 'name',
    label: '文件名称',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入文件名称',
    },
  },
  {
    field: 'useMark',
    label: '文件状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' },
      ],
      showSearch: true,
      optionFilterProp: 'label',
      placeholder: '请选择文件状态',
    },
    colProps: { span: 8 },
  },
];

// 抽屉数据
export const downloadAddSchemas = (): FormSchema[] => [
  {
    field: 'role',
    component: 'ApiRadioGroup',
    label: '角色',
    required: true,
    componentProps: () => ({
      api: async (param) => {
        const data = await getDictionaryByParentId(param);
        data.unshift({
          label: '全部',
          value: '0',
        });
        return data;
      },
      params: configStore.GET_CONFIG_DICTIONRY.userRoleId,
      labelField: 'name',
      valueField: 'code',
      showSearch: true,
      optionFilterProp: 'label',
    }),
    defaultValue: '2',
  },
  {
    field: 'systemModule',
    component: 'ApiSelect',
    label: '模块属性',
    required: true,
    componentProps: {
      api: async (param) => {
        const data = await getDictionaryByParentId(param);
        data.unshift({
          name: '全部',
          id: 0,
        });
        console.log('data: ', data);
        return data;
      },
      params: configStore.GET_CONFIG_DICTIONRY.tagModuleId,
      placeholder: '请选择模块属性',
      labelField: 'name',
      valueField: 'id',
      showSearch: true,
      optionFilterProp: 'label',
    },
    defaultValue: 0,
  },
  {
    field: 'downloadType',
    component: 'ApiSelect',
    label: '文件类型',
    required: true,
    componentProps: {
      api: getDictionaryByParentId,
      params: configStore.GET_CONFIG.configInfo?.configDictionary?.downloadTypeId,
      placeholder: '请选择文件类型',
      labelField: 'name',
      valueField: 'id',
      showSearch: true,
      optionFilterProp: 'label',
    },
  },
  {
    field: 'useMark',
    component: 'RadioGroup',
    label: '文件状态',
    required: true,
    componentProps: {
      options: [
        {
          label: '启用',
          value: 1,
        },
        {
          label: '禁用',
          value: 0,
        },
      ],
    },
    defaultValue: 1,
  },
  {
    field: 'name',
    component: 'LxBasicUploadTest',
    label: '文件名称',
    required: true,
    helpMessage: [
      '1. 支持图片类型：png、jpg、bmp、jpeg、gif;',
      '2. 支持文件类型：doc、docx、xls、xlsx、ppt、pptx、pub、txt、pdf、zip、rar;',
      `3. 上传的单个文件不大于${configStore.GET_CONFIG_BASEINFO?.uploadImageMaxSize}M。`,
    ],
    componentProps: {
      limit: 1, // 限制一张
    },
    defaultValue: [],
  },
];

// 表格数据
export const downloadTableScheam = (): BasicColumn[] => {
  // 调接口

  return [
    {
      title: '角色',
      dataIndex: 'commonFile.role',
      width: 70,
      format: (_text, record) => {
        return record.commonFile?.role === 0
          ? '全部'
          : record.commonFile?.role === 1
          ? '商库用户'
          : record.commonFile?.role === 2
          ? '校内用户'
          : record.commonFile?.role === 3
          ? '专家'
          : '招标公司';
      },
    },
    {
      title: '模块属性',
      dataIndex: 'dictionary_name',
      width: 70,
      format: (_text, record) => {
        return _text == null ? '全部' : _text;
      },
    },
    {
      title: '文件类型',
      dataIndex: 'commonFile.downloadType',
      width: 70,
      format: (_text, record) => {
        return record.commonFile.downloadType.name;
      },
    },
    {
      title: '文件状态',
      dataIndex: 'commonFile.useMark',
      width: 70,
      format: (_text, record) => {
        return record.commonFile.useMark === 0 ? '禁用' : '启用';
      },
    },
    {
      title: '文件名称',
      dataIndex: 'commonFile.name',
      width: 110,
    },
    {
      title: '下载次数',
      dataIndex: 'commonFile.downloadAmount',
      width: 50,
      format: (_text, record) => {
        return record.commonFile.downloadAmount;
      },
    },
  ];
};
