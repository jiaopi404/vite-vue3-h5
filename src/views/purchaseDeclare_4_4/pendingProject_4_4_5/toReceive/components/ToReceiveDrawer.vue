<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    width="500px"
    @ok="handleSubmit"
    @close="handleCancel"
  >
    <template #title>
      <div v-if="isChecks"> 批量处理项目 </div>
      <div v-else>
        处理项目：<span>{{ projectName }}</span>
      </div>
    </template>
    <BasicForm @register="registerForm"></BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, unref, toRaw } from 'vue';
  import { formSchema } from '../ToReceive.data';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import {
    getProjectById,
    filterIds,
    batchDealWithProject,
  } from '/@/api/purchaseDeclare/pendingProjectApi';

  export default defineComponent({
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();
      const isChecks = ref<boolean>(false); // 是否为多选
      const projectName = ref<string>('');
      // 筛选的 数组对象
      let filterIdsArray = reactive({
        ids: [],
        notIds: [],
      });

      const [
        registerForm,
        { getFieldsValue, setFieldsValue, resetFields, validate, updateSchema, clearValidate },
      ] = useForm({
        labelWidth: 120,
        schemas: formSchema(),
        showActionButtonGroup: false,
      });
      const [registerDrawer, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
        console.log('data:', data);
        projectName.value = data.projectName;
        // 进行筛选 计划采购id 与 非计划采购id (单选多选都可用)
        const filterData = await filterIds({
          id: 1,
          ids: data.projectIds,
        });
        filterIdsArray.ids = filterData.ids;
        filterIdsArray.notIds = filterData.notIds;

        if (data.projectIds.length === 1) {
          // 单选
          isChecks.value = false;
          const resData = await getProjectById(data.projectIds[0]);
          setFieldsValue({
            ...{
              biddingUserId: resData.biddingUserId,
              planOrganizationalForm: resData.planOrganizationalForm?.id,
              planProcurementMethod: resData.planProcurementMethod?.id,
            },
          });
          // 如果是采购计划添加的项目 projectAdditionPhase === 1 禁用
          if (resData.projectAdditionPhase === 1) {
            updateSchema([
              { field: 'planOrganizationalForm', componentProps: { disabled: true } },
              { field: 'planProcurementMethod', componentProps: { disabled: true } },
            ]);
          } else {
            updateSchema([
              { field: 'planOrganizationalForm', componentProps: { disabled: false } },
              { field: 'planProcurementMethod', componentProps: { disabled: false } },
            ]);
          }
          clearValidate();
        } else if (data.projectIds.length > 1) {
          // 多选
          isChecks.value = true;
        }
      });

      // 提交
      const handleSubmit = async () => {
        try {
          await validate();
          const formData = getFieldsValue();
          const userInfo = useUserStore().getUserInfo;

          // 当前登录人 相关参数
          const auditRecords = {
            result: formData.result,
            auditOpinion: formData.auditOpinion,
            userId: userInfo.id,
            reviewer: userInfo.perName,
            depId: userInfo?.department?.id,
            depName: userInfo?.department?.name,
          };
          // 处理项目 相关参数
          let data: any = {
            ids: toRaw(filterIdsArray.ids),
            notIds: toRaw(filterIdsArray.notIds),
            project: {
              assignorUserId: userInfo.id,
              // biddingUserId: formData.biddingUserId,
              planOrganizationalForm: {
                // 形式
                id: formData.planOrganizationalForm,
              },
              planProcurementMethod: {
                // 方式
                id: formData.planProcurementMethod,
              },
            },
            auditRecords: auditRecords,
          };
          // 退回时 组织处理人 biddingUserId 不传
          if (formData.result === 1) {
            data.project.biddingUserId = formData.biddingUserId;
          }

          console.log('formData:', formData);
          console.log('filterIdsArray:', filterIdsArray);
          console.log('发送数据：', data);

          changeOkLoading(true);
          await batchDealWithProject(data);
          changeOkLoading(false);

          createMessage.success('处理项目成功');
          closeDrawer();
          resetFields();
          projectName.value = '';
          isChecks.value = false;
          filterIdsArray.ids = [];
          filterIdsArray.notIds = [];
          emit('success');
        } catch (err) {
          changeOkLoading(false);
          console.log(err);
        }
      };

      const handleCancel = () => {
        console.log('取消');
        resetFields();
        projectName.value = '';
        isChecks.value = false;
        filterIdsArray.ids = [];
        filterIdsArray.notIds = [];
      };

      return {
        isChecks,
        projectName,
        registerDrawer,
        registerForm,
        handleSubmit,
        handleCancel,
      };
    },
  });
</script>
