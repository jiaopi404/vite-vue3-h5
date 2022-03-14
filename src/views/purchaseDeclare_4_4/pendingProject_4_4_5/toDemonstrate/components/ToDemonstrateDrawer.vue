<template>
  <BasicDrawer
    v-bind="$attrs"
    title="处理项目"
    @register="registerDrawer"
    showFooter
    width="600px"
    @ok="handleSubmit"
    @close="handleCancel"
  >
    <Description
      :bordered="false"
      :labelStyle="{ display: 'inline-block', textAlign: 'right', width: '100px' }"
      :column="1"
      :data="resData"
      :schema="schemaData"
    />
    <BasicForm @register="registerForm"></BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, unref } from 'vue';
  import { formSchema } from '../ToDemonstrate.data';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import {
    getDemonstrationByProjectId,
    getProjectById,
    argumentProject,
  } from '/@/api/purchaseDeclare/pendingProjectApi';
  import moment from 'moment';
  import { getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';
  import { Description, DescItem } from '/@/components/Description/index';
  export default defineComponent({
    components: { BasicDrawer, BasicForm, Description },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const personFormatter = getPersonNameFormatter();
      const projectId = ref<number>(-999);
      const resData = ref<any>({});

      const schemaData: DescItem[] = [
        {
          field: 'proName',
          label: '项目名称',
        },
        {
          field: 'biddingCompanyName',
          label: '招标公司',
          show: (data) => {
            if (data.extractType === 1) {
              return true;
            } else {
              return false;
            }
          },
          render: (curVal, data) => {
            if (data.demonstration) {
              return data.demonstration.biddingCompany.name;
            } else {
              return data.biddingCompanyName;
            }
          },
        },
        {
          field: 'userNameAndMobile',
          label: '业务联系人',
          show: (data) => {
            if (data.extractType === 1) {
              return true;
            } else {
              return false;
            }
          },
          render: (curVal, data) => {
            if (data.demonstration) {
              return personFormatter(data.demonstration.biddingCompany.user);
            } else {
              return `${data.userName}(${personFormatter(data)})`;
            }
          },
        },
      ];

      const { createMessage } = useMessage();
      const [registerForm, { getFieldsValue, setFieldsValue, resetFields, validate }] = useForm({
        labelWidth: 100,
        schemas: formSchema(),
        showActionButtonGroup: false,
      });
      const [registerDrawer, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
        projectId.value = data.id;

        resData.value = await getDemonstrationByProjectId(data.id);
        resData.value.proName = data.proName;

        // extractType 0专家 1公司
        if (unref(resData).extractType === 0) {
          if (unref(resData).userNames) {
            setFieldsValue({
              expert: unref(resData).userNames,
            });
          } else {
            setFieldsValue({
              expert: unref(resData).demonstration.expert,
            });
          }
        } else if (unref(resData).extractType === 1) {
        }
        // 如果论证过了 才会有demonstration 回填
        if (unref(resData).demonstration) {
          setFieldsValue({
            expert: unref(resData).demonstration.expert,
            participants: unref(resData).demonstration.participants,
            demonstrationTime: moment(unref(resData).demonstration.demonstrationTime).format(
              'YYYY-MM-DD HH:mm:ss',
            ),
            result: unref(resData).demonstration.result,
            auditOpinion: unref(resData).demonstration.opinion,
          });
        }
      });

      // 提交
      const handleSubmit = async () => {
        try {
          await validate();
          const formData = getFieldsValue();
          const userInfo = useUserStore().getUserInfo;
          console.log('formData:', formData);

          const auditRecords = {
            result: formData.result,
            auditOpinion: formData.auditOpinion,
            userId: userInfo.id,
            reviewer: userInfo.perName,
            depId: userInfo?.department?.id,
            depName: userInfo?.department?.name,
          };
          let _data: any = {
            // id: null,  // 特殊id
            // biddingCompany: { id: 1 }, // 招标公司
            addUserId: userInfo.id,
            projectId: unref(projectId),
            expert: formData.expert, // 论证专家
            participants: formData.participants, // 是参会人员
            demonstrationTime: formData.demonstrationTime,
            result: formData.result,
            opinion: formData.auditOpinion,
            auditRecords,
          };
          // 如果论证过
          if (unref(resData).demonstration) {
            _data.id = unref(resData)?.demonstration?.id;
          }
          const res = await getProjectById(unref(projectId));
          if (res.biddingCompanyId) {
            _data.biddingCompany = {
              id: res.biddingCompanyId,
            };
          }
          console.log('_data:', _data);

          changeOkLoading(true);
          await argumentProject(_data);
          changeOkLoading(false);

          createMessage.success('处理项目成功');
          closeDrawer();
          resetFields();
          projectId.value = -999;
          resData.value = {};
          emit('success');
        } catch (err) {
          changeOkLoading(false);
          console.log(err);
        }
      };

      const handleCancel = () => {
        console.log('取消');
        resetFields();
        projectId.value = -999;
        resData.value = {};
      };

      return {
        resData,
        schemaData,
        registerDrawer,
        registerForm,
        handleSubmit,
        handleCancel,
        personFormatter,
      };
    },
  });
</script>
<style scoped>
  .toDemonstrate span {
    display: inline-block;
    width: 130px;
    text-align: right;
  }
  :deep().ant-calendar-picker {
    width: 100%;
  }
</style>
