<template>
  <PageWrapper title="发布通知公告" contentBackground contentClass="p-4">
    <BasicForm @register="register" />
  </PageWrapper>
</template>

<script lang="ts">
  import { BasicForm, useForm } from '/@/components/Form';
  import { PageWrapper } from '/@/components/Page';
  import { Tinymce } from '/@/components/Tinymce/index'; // 引入富文本编辑器
  import { defineComponent } from 'vue';
  import { schemas } from './publish.data';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { saveNotice } from '/@/api/noticeManagement/noticeManagement';

  export default defineComponent({
    name: 'publishNotice',
    components: { BasicForm, PageWrapper, Tinymce },
    setup() {
      const { createMessage } = useMessage();
      const [
        register,
        {
          validate,
          getFieldsValue,
          setProps,
          resetFields,
          setFieldsValue,
          clearValidate,
          updateSchema,
        },
      ] = useForm({
        labelCol: {
          span: 4,
        },
        wrapperCol: {
          span: 18,
        },
        schemas: schemas(),
        actionColOptions: {
          offset: 8,
          span: 12,
        },
        // 按钮文字设置
        submitButtonOptions: {
          text: '发布',
        },
        // 按钮函数
        submitFunc: handleSubmit,
      });

      // 确定发布按钮
      async function handleSubmit() {
        try {
          setProps({
            submitButtonOptions: {
              loading: true,
            },
          });
          await validate();
          const values = getFieldsValue();
          values.role = parseInt(values.role);
          values.pic = values.pic?.length ? values.pic[0]?.url : ''; // 是否上传图片
          await saveNotice(values);
          createMessage.success('发布成功！');
          resetFields();
          // 发布后页面置空
          setFieldsValue({
            content: '',
            pic: [],
          });
          clearValidate();
          updateSchema({
            field: 'ifIndexShow',
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
          });
        } catch (error) {
          console.log('err is', error);
        } finally {
          setProps({
            submitButtonOptions: {
              loading: false,
            },
          });
        }
      }

      return { register };
    },
  });
</script>

<style lang="less" scoped>
  .form-wrap {
    padding: 24px;
    background-color: @component-background;
  }
</style>
