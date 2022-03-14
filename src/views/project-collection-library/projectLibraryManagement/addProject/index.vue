<template>
  <div class="bg-white h-1/1 relative">
    <Row class="p-30px">
      <Col>
        <BasicForm @register="registerForm">
          <template #formFooter>
            <div class="w-1/1 mt-10px text-center">
              <a-button type="primary" @click="saveProject"> 保存 </a-button>
            </div>
          </template>
        </BasicForm>
      </Col>
      <!-- <a-button type="primary" @click="handleDeclare" class="submit_btn">
          申报
        </a-button> -->
    </Row>
    <div> </div>
  </div>
</template>
<script lang="ts">
  /**
   * 添加项目
   * addProject
   * project-collection-library/projectLibraryManagement/addProject/index.vue
   */
  import { defineComponent, ref, unref, onMounted } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { CollapseContainer } from '/@/components/Container/index';
  import { Col, Row } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { formSchema } from './addProject.data';
  import { dateUtil } from '/@/utils/dateUtil';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';
  import { useConfigStore } from '/@/store/modules/config';
  import { debouncePromise } from '/@/utils/commonServe';

  import {
    saveProBudget,
    getProBudgetById,
    checkProBudgetRepeat,
  } from '/@/api/projectManagement/projectCollectionLibraryApi';
  import { getDictionaryByParentId } from '/@/api/demo/system';

  export default defineComponent({
    components: { BasicForm, CollapseContainer, Row, Col },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const { createMessage } = useMessage();
      const userStore = useUserStore();
      const configStore = useConfigStore();
      const year = ref<number>(dateUtil().year());
      const projectId = ref<number | null>(null); // 项目征集库id
      const statusId = ref<number | null>(null);
      const processId = ref<number | string | null>(null);
      projectId.value = Number(route.query.projectId);

      const [
        registerForm,
        { validate, resetFields, getFieldsValue, updateSchema, setFieldsValue, clearValidate },
      ] = useForm({
        labelWidth: 150,
        schemas: formSchema(),
        baseColProps: { span: 10 },
        showActionButtonGroup: false,
        baseRowStyle: {
          padding: '20px 30px 50px',
          // margin: '20px 10px',
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#F4F6F9',
        },
      });
      onMounted(async () => {
        resetFields();
        clearValidate();
        console.log('字典', configStore.GET_CONFIG_DICTIONRY);
        console.log('项目状态', configStore.GET_CONFIG_DICTIONRY.projectBudgetStatusId);
        console.log('归口部门', configStore.GET_CONFIG_MODULE.ifCentralizedDepartment);

        if (projectId.value) {
          // 通过id获取项目信息
          const resData = await getProBudgetById(unref(projectId));
          projectId.value = resData.id;
          statusId.value = resData.status?.id;
          processId.value = resData.processId;

          setFieldsValue({
            ...resData,
            declareDept: resData.declareDept.id,
            currencyType: resData.currencyType.id,
            projectType: resData.projectType.id,
            time: [
              // dateUtil(resData.startTime).format('YYYY-MM-DD'),
              // dateUtil(resData.endTime).format('YYYY-MM-DD'),
              dateUtil(resData.startTime).format(),
              dateUtil(resData.endTime).format(),
            ],
          });
        } else {
          const data = await getDictionaryByParentId(
            configStore.GET_CONFIG_DICTIONRY.projectBudgetStatusId,
          );
          data.forEach((item) => {
            if (item.code === '1') {
              statusId.value = item.id;
            }
          });
          setFieldsValue({
            time: [`${unref(year) + 1}-01-01 00:00:00`, `${unref(year) + 1}-12-31 23:59:59`],
          });
        }

        updateSchema({
          field: 'proName',
          rules: [
            {
              validator: debouncePromise(async (_, value) => {
                const RegExp = /^(?!\s)(?!.*\s$).{1,50}$/;
                if (value) {
                  if (!RegExp.test(value)) {
                    return Promise.reject(`请输入1至50位汉字，符号，字母或数字`);
                  } else {
                    const res = await checkProBudgetRepeat({
                      id: unref(projectId) ? unref(projectId) : null,
                      proName: value,
                    });
                    if (res) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject('项目名称已存在，请重新输入');
                    }
                  }
                } else {
                  return Promise.reject(`请输入项目名称`);
                }
              }, 800),
              trigger: 'blur',
            },
          ],
        });
      });

      const saveProject = async () => {
        try {
          await validate();
          const formData = getFieldsValue();
          console.log('time', formData.time);

          const otherData = {
            id: unref(projectId),
            addUser: { id: userStore.getUserInfo.id }, // 申报人id
            status: { id: unref(statusId) ? unref(statusId) : 1 }, // 项目状态
            // processId: unref(processId.value), // 流程ID 是否需要传递？？？
          };
          formData.projectType = { id: formData.projectType };
          formData.currencyType = { id: formData.currencyType };
          formData.declareDept = { id: formData.declareDept };
          formData.startTime = `${formData.time[0]}`;
          formData.endTime = `${formData.time[1]}`;
          delete formData.time;

          console.log('otherData', otherData);
          console.log('formData', formData);
          Object.assign(formData, otherData);

          await saveProBudget(formData);
          createMessage.success('保存成功');
          router.push({
            path: '/projectLibraryManagement/toDeclare',
          });
        } catch (err) {
          console.log('err is', err);
        }
      };

      const handleDeclare = async () => {
        try {
          // await createConfirmPromise({
          //   content: `确认申报吗？`,
          // });
          // console.log('record', record);
          // await reload();
          createMessage.success('申报项目成功');
        } catch (err) {}
      };

      return {
        registerForm,
        saveProject,
        handleDeclare,
      };
    },
  });
</script>
<style scoped>
  :deep(.ant-input-number) {
    width: 100% !important;
  }
  .submit_btn {
    position: fixed;
    z-index: 999;
    left: 50%;
    bottom: 50px;
    transform: translateX(-50%);
  }
</style>
