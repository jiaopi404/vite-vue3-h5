<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :title="getTitle"
    :width="(leafLevel === 3 && isUpdate) || (leafLevel >= 2 && isAdd) ? '70%' : '35%'"
    @ok="handleSubmit"
  >
    <h1 v-show="formListData.leafLevel > 1 && isUpdate == true" style="margin-left: 35px">
      父级名称：{{ formListData.parent.content }}
    </h1>
    <h1 v-show="formListData.leafLevel > 0 && isAdd == true" style="margin-left: 35px">
      父级名称：{{ formListData.content }}
    </h1>
    <hr v-show="formListData.leafLevel > 0" style="margin-bottom: 20px" />
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, h, ref, computed, unref, toRaw, onUpdated, reactive } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { Tinymce } from '/@/components/Tinymce/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTable } from '/@/components/Table';
  import { formSchema } from '../contract.data';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { debouncePromise } from '/@/utils/commonServe';
  import { addContract } from './addContractModel';
  // 接口调用
  import {
    checkDocumentTemplateRepeat,
    saveDocumentTemplate,
    getDocumentTemplateById,
    updateDocumentTemplateUseMark,
    updateDocumentTemplateIfShow,
  } from '/@/api/templateManagement/templateManagementApi';

  export default defineComponent({
    name: 'addContract',
    components: { BasicDrawer, BasicForm, BasicTable, Tinymce },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const toolbarList = [
        'fontsizeselect lineheight searchreplace bold italic underline  alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript hr  numlist link  preview    forecolor backcolor fullscreen',
      ];
      // wordcount 字数统计
      const pluginsList = [
        'advlist anchor autolink autosave code codesample  directionality  fullscreen hr insertdatetime link lists nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus  template  textpattern visualblocks visualchars',
      ];
      const isUpdate = ref(true);
      const isAdd = ref(true);
      const leafLevel = ref<any>(null);
      const id = ref<number | null>(null);
      let procurementData = ref<any>(null);
      let addFormData = ref<any>(null);
      // 富文本框校验提示内容
      let lengthNum = ref<any>(null);
      let formListData = reactive({
        leafLevel: null || 0,
        content: '',
        parent: {
          content: '',
        },
      });
      const { createMessage } = useMessage();

      const [
        registerForm,
        { resetFields, getFieldsValue, setFieldsValue, validate, updateSchema, clearValidate },
      ] = useForm({
        labelWidth: 100,
        schemas: formSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
      const [registerDrawer, { changeLoading, setDrawerProps, closeDrawer }] = useDrawerInner(
        async (data) => {
          try {
            resetFields(); //重置
            setDrawerProps({ confirmLoading: false });
            changeLoading(true);
            isUpdate.value = !!data?.isUpdate;
            isAdd.value = !!data?.isAdd;
            leafLevel.value = data?.record?.leafLevel;
            if (unref(isUpdate)) {
              updateSchema({
                field: 'useMark',
                ifShow: () => {
                  return toRaw(data?.record)?.leafLevel < 3 ? false : true;
                },
              });
              if (toRaw(data?.record)?.leafLevel < 3) {
                setFieldsValue({
                  useMark: 0,
                });
              } else {
                setFieldsValue({
                  useMark: 1,
                });
              }
              id.value = data.record.id;
              // 回显数据
              const result = await getDocumentTemplateById(toRaw(data.record).id);
              procurementData.value = result;
              if (data.record.leafLevel === 3) {
                data.record.content_text = result.content;
              }
              updateSchema({
                field: 'content',
                ifShow: ({ values }) => {
                  if (toRaw(data?.record)?.leafLevel < 3) {
                    values.isShow = true;
                  }
                  return values.isShow;
                },
                rules: [
                  { required: true, message: '请输入合同名称', trigger: 'change' },
                  {
                    validator: debouncePromise(async (_, value) => {
                      const _params: addContract = {
                        content: value || '',
                      };
                      _params.id = id.value || null;
                      _params.type = 2;
                      _params.leafLevel = 1;
                      // let regExp = /^[\S]{2,50}$/;
                      let regExp = /^\S.{1,50}\S$/;
                      const res = await checkDocumentTemplateRepeat(
                        _params.id,
                        _params.content,
                        _params.type,
                        _params.leafLevel,
                      );
                      if (!res) {
                        return Promise.reject('您输入的合同名称重复');
                      } else if (regExp.test(value) === false) {
                        return Promise.reject('最大可输入50个字符（不允许前后输入空格）');
                      } else {
                        return Promise.resolve();
                      }
                    }, 800),
                  },
                ],
              });
              // 富文本编辑器的校验
              updateSchema({
                field: 'content_text',
                ifShow: ({ values }) => {
                  if (toRaw(data?.record)?.leafLevel > 2) {
                    values.isShow = true;
                  }
                  return values.isShow;
                },
                render: ({ model, field }) => {
                  return h(Tinymce, {
                    showImageUpload: false,
                    toolbar: toolbarList,
                    plugins: pluginsList,
                    options: {
                      resize: false,
                      // // paste_data_images: true,
                      extended_valid_elements: 'table[border=1]',
                      paste_enable_default_filters: false,
                    },
                    value: model[field],
                    onChange: (value: string) => {
                      //清除校验规则
                      clearValidate('content_text');
                      model[field] = value;
                    },
                  });
                },
                rules: [
                  { required: true, message: '请输入合同内容', trigger: 'change' },
                  {
                    validator: debouncePromise(async (_, value) => {
                      let regExp = /^[\s\S]{1,50000}$/;
                      if (regExp.test(value) === false) {
                        return Promise.reject('最大可输入50000个字符');
                      } else {
                        return Promise.resolve();
                      }
                    }, 800),
                  },
                ],
              });
              resetFields();
              // 回填
              setFieldsValue({
                ...data.record,
              });
            } else {
              addFormData = toRaw(data)?.record;
              // 添加
              id.value = null;
            }
            formListData.leafLevel = toRaw(data?.record)?.leafLevel;
            formListData.content = toRaw(data.record)?.content;
            formListData.parent.content = toRaw(data.record?.parent)?.content;
            // 判断是编辑还是添加
            if (unref(isAdd)) {
              updateSchema({
                field: 'useMark',
                ifShow: () => {
                  return toRaw(data?.record)?.leafLevel < 2 ? false : true;
                },
              });
              if (toRaw(data?.record)?.leafLevel < 2) {
                setFieldsValue({
                  useMark: 0,
                });
              } else {
                setFieldsValue({
                  useMark: 1,
                });
              }
              // 回填
              setFieldsValue({
                content_text: '',
              });
              // 富文本编辑器采购内容的校验
              updateSchema({
                field: 'content_text',
                ifShow: () => {
                  return data.record.leafLevel == 2 ? true : false;
                },
                render: ({ model, field }) => {
                  return h(Tinymce, {
                    toolbar: toolbarList,
                    showImageUpload: false,
                    plugins: pluginsList,
                    options: {
                      resize: false,
                      // // paste_data_images: true,
                      extended_valid_elements: 'table[border=1]',
                      paste_enable_default_filters: false,
                    },
                    value: model[field],
                    onChange: (value: string) => {
                      //清除校验规则
                      clearValidate('content_text');
                      model[field] = value;
                    },
                  });
                },
                rules: [
                  { required: true, message: '请输入模板内容', trigger: 'change' },
                  {
                    validator: debouncePromise(async (_, value) => {
                      let regExp = /^[\s\S]{1,50000}$/;
                      if (regExp.test(value) === false) {
                        return Promise.reject('最大可输入50000个字符');
                      } else {
                        return Promise.resolve();
                      }
                    }, 800),
                  },
                ],
              });

              // 采购内容校验
              updateSchema({
                field: 'content',
                ifShow: () => {
                  return data.record.leafLevel < 2 ? true : false;
                },
                rules: [
                  { required: true, message: '请输入合同名称', trigger: 'change' },
                  {
                    validator: debouncePromise(async (_, value) => {
                      const _params: addContract = {
                        content: value || '',
                      };
                      _params.id = id.value || null;
                      _params.type = 2;
                      _params.leafLevel = 1;
                      // let regExp = /^[\S]{2,50}$/;
                      let regExp = /^\S.{2,50}\S$/;
                      const res = await checkDocumentTemplateRepeat(
                        _params.id,
                        _params.content,
                        _params.type,
                        _params.leafLevel,
                      );
                      if (!res) {
                        return Promise.reject('您输入的合同名称重复');
                      } else if (regExp.test(value) === false) {
                        return Promise.reject('请输入2至50个字符（不允许前后输入空格）');
                      } else {
                        return Promise.resolve();
                      }
                    }, 800),
                  },
                ],
              });
            }
          } finally {
            changeLoading(false);
          }
        },
      );
      const getTitle = computed(() => (!unref(isUpdate) ? '添加合同模板' : '编辑合同模板'));
      // 保存
      async function handleSubmit() {
        await validate();
        setDrawerProps({ confirmLoading: true });
        const formData = getFieldsValue();
        try {
          if (formData.content_text) {
            formData.content = formData.content_text;
          }
          //编辑保存的文档
          if (unref(isUpdate)) {
            let params = {
              id: id.value,
              parent: procurementData.value?.parent?.id
                ? { id: procurementData.value?.parent?.id }
                : null,
              leafLevel: procurementData.value?.leafLevel,
              type: 2,
              addUser: procurementData.value?.addUser?.id
                ? { id: procurementData.value?.addUser?.id }
                : null,
            };
            let _data = Object.assign({}, formData, params);
            let list = {
              id: id.value,
              useMark: formData.useMark,
            };
            let isList = {
              id: id.value,
              ifShow: formData.ifShow,
            };
            await updateDocumentTemplateIfShow(isList);
            await updateDocumentTemplateUseMark(list);
            await saveDocumentTemplate(_data);
          } else {
            //  添加保存的文档
            const userStore = useUserStore();
            if (addFormData.leafLevel == 0) {
              let params = {
                id: id.value,
                parentId: null,
                leafLevel: 1,
                type: 2,
                addUser: { id: userStore.getUserInfo.id },
              };
              let _data = Object.assign({}, formData, params);
              await saveDocumentTemplate(_data);
            } else {
              let params = {
                id: id.value,
                parent: { id: toRaw(addFormData)?.id },
                leafLevel: toRaw(addFormData).leafLevel + 1,
                type: 2,
                addUser: toRaw(addFormData?.addUser)?.id
                  ? { id: toRaw(addFormData?.addUser)?.id }
                  : null,
              };
              let _data = Object.assign({}, formData, params);
              await saveDocumentTemplate(_data);
            }
          }
          closeDrawer();
          createMessage.success('保存成功');
          emit('success');
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }
      return {
        registerDrawer,
        registerForm,
        getTitle,
        isUpdate,
        handleSubmit,
        onUpdated,
        formListData,
        procurementData,
        lengthNum,
        isAdd,
        leafLevel,
      };
    },
  });
</script>

<style lang="less" scoped>
  :deep(.tox .tox-tbtn--select) {
    width: 65px;
  }
</style>
