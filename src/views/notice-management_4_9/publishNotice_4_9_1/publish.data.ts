import { FormSchema } from '/@/components/Form';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { debouncePromise } from '/@/utils/commonServe';
import { getNamePatternRule } from '/@/utils/helper/validateRuleHelper';
import { h } from 'vue';
import { Tinymce } from '/@/components/Tinymce/index';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();

// 富文本编辑器工具栏
const toolbarList = [
  'fontsizeselect lineheight searchreplace bold italic underline  alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript hr  numlist link  preview    forecolor backcolor fullscreen',
];
const pluginsList = [
  'advlist anchor autolink autosave code codesample  directionality  fullscreen hr insertdatetime link lists nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus  template  textpattern visualblocks visualchars wordcount',
];

// 发布通告数据
export const schemas = (): FormSchema[] => [
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
    component: 'RadioGroup',
    label: '首页显示',
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
    component: 'RadioGroup',
    label: '状态',
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
    required: true,
  },
];
