<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="编辑通知公告"
    width="75%"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>

<script lang="ts">
  import { defineComponent, ref, toRaw } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { noticeformSchema } from './notice.data';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { saveNotice } from '/@/api/noticeManagement/noticeManagement';
  import { Tinymce } from '/@/components/Tinymce/index';

  export default defineComponent({
    name: 'EditNoticeDrawer',
    components: { BasicDrawer, BasicForm, Tinymce },
    emits: ['success'],
    setup(_, { emit }) {
      const id = ref(0); // 编辑项id，初始化为0
      const { createMessage } = useMessage();

      const [
        registerForm,
        { resetFields, setFieldsValue, validate, getFieldsValue, updateSchema },
      ] = useForm({
        labelWidth: 100,
        schemas: noticeformSchema(),
        showActionButtonGroup: false,
        baseColProps: { lg: 22, md: 24 },
      });

      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        id.value = toRaw(data.record).notice.id; // 取到该编辑项id

        if (!toRaw(data.record).notice.pic) {
          // 没图片，ifIndexShow禁用且为0;
          updateSchema({
            field: 'ifIndexShow',
            componentProps: {
              disabled: true,
            },
          });
          setFieldsValue({
            ifIndexShow: 0,
          });
        } else {
          // 有图片，ifIndexShow取返回值
          updateSchema({
            field: 'ifIndexShow',
            componentProps: {
              disabled: false,
            },
          });
          setFieldsValue({
            ifIndexShow: toRaw(data.record).notice.ifIndexShow,
          });
        }

        // 数据回显
        setFieldsValue({
          // ...data.record.notice,
          role: toRaw(data.record).notice.role + '',
          systemModule: toRaw(data.record).notice.systemModule,
          title: toRaw(data.record).notice.title,
          content: toRaw(data.record).notice.content,
          pic: !data.record.notice.pic
            ? []
            : [{ url: data.record.notice.pic, id: 1, name: data.record.notice.pic }],
          useMark: toRaw(data.record).notice.useMark,
        });
      });

      // 编辑保存
      async function handleSubmit() {
        try {
          await validate();
          setDrawerProps({ confirmLoading: true });
          const values = getFieldsValue();
          values.id = id.value;
          values.role = parseInt(values.role);
          // 判断是否上传了图片
          if (values.pic && values.pic.length) {
            values.pic = values.pic[0].url;
          } else {
            values.pic = ''; // 未上传时传空字符串
          }
          await saveNotice(values);
          closeDrawer();
          emit('success');
          createMessage.success('保存成功！');
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }
      return { registerDrawer, registerForm, handleSubmit };
    },
  });
</script>
