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
      <div class="titleMsg">
        <span>处理项目：</span>
        <span>{{ projectName }}</span>
      </div>
    </template>

    <BasicForm @register="registerForm">
      <template #reviewNode="{ model }">
        <AddReviewNode v-show="model['result'] === 1" ref="reviewNodeRef" />
      </template>
    </BasicForm>
    <Modal @register="registerModal" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, unref } from 'vue';
  import { formSchema, dataMessage } from '../ToProcessed.data';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { formatToDateTime, formatToDate, dateUtil } from '/@/utils/dateUtil';

  import { useConfigStore } from '/@/store/modules/config';
  const configStore = useConfigStore();
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import {
    getProjectById,
    saveProject,
    getStatusBy,
  } from '/@/api/purchaseDeclare/pendingProjectApi';
  import AddReviewNode from '/@/views/library-management/review-node/components/addReviewNode/AddReviewNode.vue';
  import { useModal } from '/@/components/Modal';
  import Modal from './ResultModal.vue';
  import { useReviewNode } from './reviewNode.mixin';
  import { useRouter } from 'vue-router';

  export default defineComponent({
    components: { BasicDrawer, BasicForm, Modal, AddReviewNode },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();
      const router = useRouter();
      const projectId = ref<number>(-999);
      const projectName = ref<string>('');
      const filterArray = ref<Number[]>([]);

      // 筛选电子竞价&询价
      const procurementMethodArray = async () => {
        const dateAndTime = await getDictionaryByParentId(
          configStore.GET_CONFIG_DICTIONRY.purchaseMethodId,
        );
        filterArray.value = dateAndTime
          .filter((item) => {
            if (item.code === '5' || item.code === '6') {
              return item;
            }
          })
          .map((item) => item.id);
      };
      const [registerModal, { openModal }] = useModal();
      const [
        registerForm,
        {
          getFieldsValue,
          setFieldsValue,
          resetFields,
          validate,
          updateSchema,
          resetSchema,
          clearValidate,
        },
      ] = useForm({
        labelWidth: 120,
        schemas: formSchema(),
        showActionButtonGroup: false,
      });
      const { reviewNode, reviewNodeRef, reviewNodeInit, reviewNodeConfirm, reviewNodeReset } =
        useReviewNode(projectId, 1); // 当前节点 1，组织部门待处理
      const [registerDrawer, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
        projectId.value = data.projectId;
        projectName.value = data.projectName;
        procurementMethodArray();
        // 回显
        const resData = await getProjectById(data.projectId);

        setFieldsValue({
          ...{
            'planOrganizationalForm.id': resData.planOrganizationalForm?.id,
            'planProcurementMethod.id': resData.planProcurementMethod?.id,
            // 'organizationalForm.id': resData.organizationalForm?.id,
            // 'procurementMethod.id': resData.procurementMethod?.id,
            quoteStartTime: resData.quoteStartTime
              ? formatToDateTime(resData.quoteStartTime)
              : null,
            quoteEndTime: resData.quoteEndTime ? formatToDateTime(resData.quoteEndTime) : null,
            quaRequire: resData.quaRequire?.split(','),
            remark: resData.remark,
            dateOfDelivery: resData.dateOfDelivery,
          },
        });
        // 如果是采购计划添加的项目 projectAdditionPhase === 1 禁用
        if (resData.projectAdditionPhase === 1) {
          setFieldsValue({
            'organizationalForm.id': resData.planOrganizationalForm?.id,
            'procurementMethod.id': resData.planProcurementMethod?.id,
          });
          updateSchema([
            { field: 'planOrganizationalForm.id', dynamicDisabled: true },
            { field: 'planProcurementMethod.id', dynamicDisabled: true },
          ]);
        } else {
          if (resData.organizationalForm && resData.procurementMethod) {
            setFieldsValue({
              'organizationalForm.id': resData.organizationalForm?.id,
              'procurementMethod.id': resData.procurementMethod?.id,
            });
          } else {
            setFieldsValue({
              'organizationalForm.id': resData.planOrganizationalForm?.id,
              'procurementMethod.id': resData.planProcurementMethod?.id,
            });
          }
          updateSchema([
            { field: 'planOrganizationalForm.id', dynamicDisabled: false },
            { field: 'planProcurementMethod.id', dynamicDisabled: false },
          ]);
        }
        clearValidate();
        // 初始化
        reviewNodeInit();
      });

      // 提交
      const handleSubmit = async () => {
        try {
          await validate();
          const formData = getFieldsValue();
          const userInfo = useUserStore().getUserInfo;
          // console.log('测试：formData:', formData);
          let _data: any = {};

          // 当前登录人 相关参数
          const auditRecords = {
            result: formData.result,
            auditOpinion: formData.auditOpinion,
            userId: userInfo.id,
            reviewer: userInfo.perName,
            depId: userInfo?.department?.id,
            depName: userInfo?.department?.name,
          };

          if (formData.result === 1) {
            _data.planOrganizationalForm = formData.planOrganizationalForm;
            _data.planProcurementMethod = formData.planProcurementMethod;
            _data.organizationalForm = formData.organizationalForm;
            _data.procurementMethod = formData.procurementMethod;
            if (!_data.planOrganizationalForm?.id) {
              delete _data.planOrganizationalForm;
            }
            if (!_data.planProcurementMethod?.id) {
              delete _data.planProcurementMethod;
            }
            // 判断 是否为电子竞价或询价
            if (unref(filterArray).includes(formData.procurementMethod.id)) {
              const _quoteStartTime = formData.quoteStartTime;
              const _quoteEndTime = formData.quoteEndTime;

              // 点击保存按钮时，输入的报价时间已经过了系统时间，会提示修改。
              if (dateUtil(_quoteStartTime).unix() < dateUtil().unix()) {
                dataMessage('报价开始日期已过,请修改！');
                return;
              }
              // let dim_dd = dateUtil(_quoteEndTime).diff(dateUtil(_quoteStartTime), 'days');
              if (dateUtil(_quoteStartTime).unix() >= dateUtil(_quoteEndTime).unix()) {
                dataMessage('报价截止日期应晚于报价开始日期！');
                return;
              }
              if (formatToDate(_quoteStartTime) === formatToDate(_quoteEndTime)) {
                dataMessage('报价截止日期应晚于报价开始日期！');
                return;
              }

              _data.quoteStartTime = formData.quoteStartTime;
              _data.quoteEndTime = formData.quoteEndTime;
              _data.quaRequire = formData.quaRequire.toString();
              _data.dateOfDelivery = formData.dateOfDelivery;
              if (formData.remark) {
                _data.remark = formData.remark;
              }
            }

            Object.assign(_data, { auditRecords, id: unref(projectId) });
          } else if (formData.result === 2) {
            Object.assign(_data, { auditRecords, id: unref(projectId) });
          }

          // 处理抽取
          if (formData.result === 1) {
            // 同意
            // 更新评审节点 （新创建，或者回显的）
            await reviewNodeConfirm();
            console.log('reviewNode：', reviewNode.value);

            if (unref(reviewNode)?.ifReview) {
              _data.proReviewNode = 1; // 是否论证为 是 unref(reviewNode).ifReview === 1
            } else {
              _data.proReviewNode = 0; // 是否论证为 否 unref(reviewNode).ifReview === 0
            }
            if (
              unref(reviewNode) &&
              unref(reviewNode)?.ifReview &&
              unref(reviewNode)?.statusId !== 3
            ) {
              // 是评审，则会建立 或 拉取评审节点
              // 1 保存上面修改的信息
              // 2. 跳转到抽取页面
              const reviewNodeId = unref(reviewNode)?.id;

              await saveProject(_data);
              createMessage.success('处理项目成功！正在前往抽取。。。');
              router.push({
                path: '/review-node',
                query: {
                  id: reviewNodeId,
                },
              });
              changeOkLoading(false);
              return;
            }
          }
          changeOkLoading(true);
          await saveProject(_data);
          changeOkLoading(false);

          createMessage.success('处理项目成功');
          closeDrawer();
          resetFields();
          projectId.value = -999;
          projectName.value = '';
          filterArray.value = [];
          emit('success');
        } catch (err) {
          changeOkLoading(false);
          console.log(err);
        }
      };

      const handleCancel = () => {
        resetFields();
        projectId.value = -999;
        projectName.value = '';
        filterArray.value = [];
        reviewNodeReset(); // 重置
      };

      return {
        projectName,
        reviewNodeRef,
        registerDrawer,
        registerForm,
        handleSubmit,
        handleCancel,
        registerModal,
      };
    },
  });
</script>
<style scoped>
  :deep().ant-calendar-picker {
    width: 100%;
  }
  .titleMsg {
    margin-right: 32px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
