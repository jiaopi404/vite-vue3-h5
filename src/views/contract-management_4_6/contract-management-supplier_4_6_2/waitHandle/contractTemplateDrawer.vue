<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" :show-footer="true" @ok="handleSubmit">
    <BasicForm @register="registerContractForm">
      <template #purchaseFile="{ model, field }">
        <Select
          placeholder="请选择采购文件模板"
          :allowClear="true"
          :show-search="true"
          option-label-prop="label"
          v-model:value="model[field]"
          :options="contractListRef"
          @change="saveContract"
        />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, toRaw } from 'vue';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { saveYourselfAndAllChildren } from '/@/api/contractManagement/waitImprove';
  import { getDocumentTemplateListByPageAndSortSumDto } from '/@/api/templateManagement/templateManagementApi';
  import { Select } from 'ant-design-vue';
  import { useUserStore } from '/@/store/modules/user';
  import { useRouter } from 'vue-router';

  export default defineComponent({
    name: 'ReviewInfoDrawer',
    components: {
      BasicDrawer,
      BasicForm,
      Select,
    },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const conTractContent = ref();
      let _list = [];
      const contractTemplate: FormSchema[] = [
        {
          field: 'contractTemplate',
          component: 'Select',
          label: '合同模板',
          slot: 'purchaseFile',
          colProps: {
            span: 24,
          },
          rules: [{ required: true, message: '请选择合同模板', trigger: 'change', type: 'number' }],
        },
      ];
      const [registerContractForm, { resetFields, validate: validateContract }] = useForm({
        labelWidth: 80,
        schemas: contractTemplate,
        showActionButtonGroup: false,
        baseColProps: { span: 11 },
      });
      const contractId: any = ref();
      const bidSectionId: any = ref();
      const contract: any = ref();
      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        setDrawerProps({
          confirmLoading: false,
          closable: false,
        });
        contractId.value = toRaw(data.record).conContract.id;
        contract.value = toRaw(data.record).conContract;
        await getPurchaseFileListRef();
      });
      const contractListRef = ref<any[]>([]);
      const { getHqlQueryDto: getHqlQueryDtoContract } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          ifCustomHql: true,
          sorts: [{ dir: 'asc', prop: 'id' }],
          queryList: [
            { param: 'documentTemplate.ifDelete', type: 'equal', value: [0] },
            { param: 'documentTemplate.type', type: 'equal', value: [2] },
            { param: 'documentTemplate.ifShow', type: 'equal', value: [1] },
            { param: 'documentTemplate.parent', type: 'isNull', value: [''] },
          ],
          dataFieldList: ['documentTemplate', 'documentTemplate.id'],
        },
      });
      const getPurchaseFileListRef = async () => {
        const res = await getDocumentTemplateListByPageAndSortSumDto(getHqlQueryDtoContract());
        contractListRef.value = res.page.content.map((item) => {
          return {
            ...item,
            value: item.documentTemplate.id,
            label: item.documentTemplate.content,
          };
        });
      };
      const { createMessage } = useMessage();
      // 确认按钮
      async function handleSubmit() {
        try {
          setDrawerProps({ confirmLoading: true });
          const result = await validateContract();
          const params = {
            addUser: {
              id: userInfo.id,
            },
            contractId: contractId.value,
            documentTemplateId: result.contractTemplate,
          };
          await saveYourselfAndAllChildren(params);
          router.push({
            path: '/contract-management/contractTemplate',
            query: {
              id: contractId.value,
            },
          });
        } catch (error) {
          console.log('error', error);
          setDrawerProps({ confirmLoading: false });
        }
        setDrawerProps({ confirmLoading: false });
      }
      const userInfo = useUserStore().getUserInfo;
      const router = useRouter();

      return {
        registerDrawer,
        handleSubmit,
        _list,
        registerContractForm,
        bidSectionId,
        contractListRef,
        conTractContent,
      };
    },
  });
</script>
<style lang="less" scoped>
  :deep(.ant-input-number) {
    width: 100% !important;
  }
  .save-review-info-btn {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .pd-20 {
    margin-bottom: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 30%);
  }
</style>
