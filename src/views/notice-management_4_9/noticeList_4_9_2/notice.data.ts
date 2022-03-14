import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { getNamePatternRule } from '/@/utils/helper/validateRuleHelper';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { h } from 'vue';
import { debouncePromise } from '/@/utils/commonServe';
import { Tinymce } from '/@/components/Tinymce/index';
const configStore = useConfigStoreWithOut();

// index.vue 主页面
// notice.data.ts  index.vue需要的 相关配置数据

const toolbarList = [
  'fontsizeselect lineheight searchreplace bold italic underline  alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript hr  numlist link  preview    forecolor backcolor fullscreen',
];
const pluginsList = [
  'advlist anchor autolink autosave code codesample  directionality  fullscreen hr insertdatetime link lists nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus  template  textpattern visualblocks visualchars wordcount',
];

// 表格数据
export const noticeListTableScheam = (): BasicColumn[] => [
  {
    title: '标题',
    dataIndex: 'notice.title',
    width: 100,
  },
  {
    title: '角色', // 0-全部 1-商库用户 2-校内用户 3-专家 5-招标公司
    dataIndex: 'notice.role',
    width: 70,
    format: (_text, record) => {
      return record.notice?.role === 0
        ? '全部'
        : record.notice?.role === 1
        ? '商库用户'
        : record.notice?.role === 2
        ? '校内用户'
        : record.notice?.role === 3
        ? '专家'
        : '招标公司';
    },
  },
  {
    title: '首页显示',
    dataIndex: 'notice.ifIndexShow',
    width: 50,
    format: (_text, record) => {
      return record.notice.ifIndexShow === 1 ? '是' : '否';
    },
  },
  {
    title: '状态',
    dataIndex: 'notice.useMark',
    width: 50,
    format: (_text, record) => {
      return record.notice.useMark === 0 ? '禁用' : '启用';
    },
  },
  {
    title: '发布时间',
    dataIndex: 'notice.addDateTime',
    width: 90,
    customRender: ({ record }) => {
      return renderTime(record.notice.addDateTime, true);
    },
  },
  {
    title: '浏览次数',
    dataIndex: 'notice.viewingTimes',
    width: 50,
    format: (_text, record) => {
      return record.notice.viewingTimes === null ? 0 : record.notice.viewingTimes;
    },
  },
];

// 查询参数
export const noticeSearchFormSchema = (): FormSchema[] => [
  {
    field: 'title',
    label: '标题',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入标题',
    },
  },
  {
    field: 'useMark',
    label: '状态',
    component: 'Select',
    colProps: { span: 8 },
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
      showSearch: true,
      optionFilterProp: 'label',
      placeholder: '请选择状态',
    },
  },
];

// 抽屉数据-编辑页面
export const noticeformSchema = (): FormSchema[] => [
  {
    field: 'role',
    component: 'ApiRadioGroup',
    label: '角色',
    required: true,
    componentProps: ({ formActionType }) => ({
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
  },
  {
    field: 'systemModule',
    component: 'ApiSelect',
    label: '模块属性',
    required: true,
    componentProps: {
      // api: getDictionaryByParentId,
      api: async (param) => {
        const data = await getDictionaryByParentId(param);
        data.unshift({
          name: '全部',
          id: 0,
        });
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
    field: 'title',
    component: 'Input',
    label: '标题',
    componentProps: {
      placeholder: '请输入标题',
    },
    required: true,
    rules: [
      {
        required: true,
        message: '请输入标题',
        trigger: 'change',
      },
      getNamePatternRule(50),
    ],
  },
  {
    field: 'content', // 富文本编辑器
    component: 'Input',
    label: '内容',
    componentProps: {},
    required: true,
    render: ({ model, field }) => {
      return h(Tinymce, {
        showImageUpload: false,
        toolbar: toolbarList,
        plugins: pluginsList,
        value: model[field],
        onChange: (value: string) => {
          model[field] = value;
        },
      });
    },
    rules: [
      { required: true, message: '请输入内容', trigger: 'change' },
      {
        validator: debouncePromise(async (_, value) => {
          const regExp = /^[\s\S]{1,50000}$/;
          if (regExp.test(value) === false) {
            return Promise.reject('最大可输入50000位字符');
          } else {
            return Promise.resolve();
          }
        }, 800),
      },
    ],
  },
  {
    field: 'pic',
    component: 'LxBasicUploadTest',
    label: '上传照片',
    helpMessage: [
      '1. 图片格式：png、jpg、jpeg、bmp、gif;',
      `2. 不大于${configStore.GET_CONFIG_BASEINFO?.uploadImageMaxSize}M;`,
      '3. 上传1张图片;',
      '4. 图片宽高比要求为2：1。',
    ],
    rules: [{ type: 'array', message: '请选择图片' }],
    defaultValue: [],
    componentProps: ({ formActionType, formModel }) => {
      const { validateFields, updateSchema } = formActionType;
      return {
        limit: 1, // 限制一张
        ifImgOnly: true,
        accept: ['.png', '.jpg', '.bmp', '.jpeg', '.gif'],
        multiple: false,
        imgRatio: 2, // 宽高比
        onChange: (fileList, file, flag) => {
          validateFields(['pic']);
          if (flag === 'remove') {
            formModel.ifIndexShow = 0;
            updateSchema({
              field: 'ifIndexShow',
              componentProps: {
                disabled: true,
              },
            });
            return;
          }
          if (flag === 'add') {
            // formModel.pic = file.url;
            updateSchema({
              field: 'ifIndexShow',
              componentProps: {
                disabled: false,
              },
            });
          }
        },
      };
    },
  },
  {
    field: 'ifIndexShow',
    label: '首页显示',
    component: 'RadioGroup',
    componentProps: {
      options: [
        {
          label: '是',
          value: 1,
        },
        {
          label: '否',
          value: 0,
        },
      ],
      disabled: true,
    },
    defaultValue: 0,
  },
  {
    field: 'useMark',
    label: '状态',
    required: true,
    component: 'RadioGroup',
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
      disabled: true,
    },
    defaultValue: 0,
  },
];
