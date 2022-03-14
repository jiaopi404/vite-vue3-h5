<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :title="getTitle"
    width="576px"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref, toRaw, onMounted } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import { useConfigStore } from '/@/store/modules/config';
  import { addFormSchema } from './purchase.data';
  import { getSpecialDictionaryList, savePurchaseList } from '/@/api/purchase/plan-purchase';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute } from 'vue-router';
  import { getNamePatternNoSpaceRule } from '/@/utils/helper/validateRuleHelper';
  import { TreeSelect } from 'ant-design-vue';
  import { findPathAll } from '/@/utils/helper/treeHelper';

  export default defineComponent({
    name: 'PurchaseDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    props: {
      purchaseType: {
        type: Number,
      },
      currencyType: {
        type: Object,
      },
    },
    setup(props, { emit }) {
      const isUpdate = ref(true);
      const isAdd = ref(true);
      const id = ref(0);
      let _list = [];
      const route = useRoute();
      const router = useRoute();
      const [registerForm, { resetFields, setFieldsValue, updateSchema, validate }] = useForm({
        labelWidth: 140,
        schemas: addFormSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        setDrawerProps({ confirmLoading: false });
        isUpdate.value = !!data?.isUpdate;
        isAdd.value = !!data?.isAdd;
        if (unref(isUpdate)) {
          id.value = toRaw(data.record).id;
          const unItDic = toRaw(data.record).unItDic.id;
          const purchaseType = toRaw(data.record).purchaseType?.id;
          const unitAmount = toRaw(data.record).number * toRaw(data.record).unitPrice;
          await updateSchema({
            field: 'name',
            rules: [
              {
                required: true,
                message: '请输入名称',
                trigger: ['change', 'blur'],
              },
              getNamePatternNoSpaceRule(50, 'change', 2),
              // {
              //   trigger: ['change', 'blur'],
              //   validator: debouncePromise(async (_, value) => {
              //     const params = {
              //       id: id.value,
              //       name: value,
              //       projectId: Number(router?.query?.id),
              //     };
              //     const bool = await checkPurchaseListRepeat(params);
              //     console.log('bool', bool);
              //     if (bool) {
              //       return Promise.resolve();
              //       // return;
              //     } else {
              //       return Promise.reject('名称重复！');
              //     }
              //   }, 800),
              // },
            ],
          });
          await setFieldsValue({
            ...data.record,
            unitAmount,
            unItDic,
            purchaseType,
          });
        } else {
          await updateSchema({
            field: 'name',
            rules: [
              {
                required: true,
                message: '请输入名称',
                trigger: ['change', 'blur'],
              },
              getNamePatternNoSpaceRule(50, 'change', 2),
              // {
              //   trigger: ['change', 'blur'],
              //   validator: debouncePromise(async (_, value) => {
              //     const params = {
              //       id: null,
              //       name: value,
              //       projectId: Number(router?.query?.id),
              //     };
              //     const bool = await checkPurchaseListRepeat(params);
              //     console.log('bool', bool);
              //     if (bool) {
              //       return Promise.resolve();
              //       // return;
              //     } else {
              //       return Promise.reject('名称重复！');
              //     }
              //   }, 800),
              // },
            ],
          });
        }
        updateSchema({
          field: 'unitPrice',
          label:
            props.currencyType?.code === '1'
              ? '预算单价（元）'
              : `预算单价（${props.currencyType?.name}）`,
        });
        updateSchema({
          field: 'unitAmount',
          label:
            props.currencyType?.code === '1'
              ? '预算总价（元）'
              : `预算总价（${props.currencyType?.name}）`,
        });
        console.log('purchase', props.currencyType);
        updateSchema({
          field: 'purchaseType',
          componentProps: {
            api: async (params) => {
              const data = await getSpecialDictionaryList(params);
              const allPathArr = findPathAll(data, (node) => {
                if (!node.children?.length) {
                  return true;
                } else {
                  return false;
                }
              });
              allPathArr.forEach((path) => {
                const child = path[path.length - 1];
                child.showLabel = path.map((node) => node.code + '-' + node.name).join(' / ');
              });
              return data;
            },
            replaceFields: {
              children: 'children',
              key: 'showLabel',
              value: 'id',
              title: 'name',
            },
            params: {
              id: configStore.GET_CONFIG.configInfo?.configDictionary?.purchaseTypeId,
              useMark: 1,
            },
            placeholder: '请选择采购目录分类',
            labelField: 'name',
            valueField: 'id',
            showSearch: true,
            optionFilterProp: 'label',
            treeNodeLabelProp: 'key',
            showCheckedStrategy: TreeSelect.SHOW_ALL,
          },
        });
        // if (isAdd.value) {
        //   setFieldsValue({
        //   });
        // }
      });
      const getTitle = computed(() =>
        !unref(isUpdate)
          ? route.path.indexOf('intention') !== -1
            ? '添加意向公开内容'
            : '新增采购清单'
          : route.path.indexOf('intention') !== -1
          ? '编辑意向公开内容'
          : '编辑采购清单',
      );
      const configStore = useConfigStore();
      onMounted(async () => {
        _list = await getDictionaryInfo();
      });
      async function getDictionaryInfo() {
        try {
          const tagModuleId: number | undefined =
            configStore.GET_CONFIG.configInfo?.configDictionary?.tagModuleId;
          const tagModuleList = await getDictionaryByParentId(<number>tagModuleId);
          tagModuleList.forEach((item) => {
            item.label = item.name;
            item.value = item.id;
          });
          return tagModuleList;
        } catch (error) {}
      }
      // getDictionaryInfo()

      // async function handleSubmit() {
      //   await Submit();
      //   await resetForm();
      // }
      const { createMessage } = useMessage();
      async function Submit() {
        try {
          const values = await validate();
          setDrawerProps({ confirmLoading: true });
          // TODO custom api
          if (unref(isUpdate)) {
            values.id = id.value;
          }

          values.unItDic = {
            id: values.unItDic,
          };
          values.projectId = Number(router.query.id);
          values.ifDelete = 0;
          delete values.unitAmount;
          if (values.purchaseType) {
            values.purchaseType = {
              id: values.purchaseType,
            };
          } else {
            values.purchaseType = 'null';
          }
          await savePurchaseList(values);
          createMessage.success('保存成功！');
          emit('success');
        } catch (err) {
          console.log('err is ', err);
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }
      // 确认按钮
      async function handleSubmit() {
        try {
          await validate();
          await Submit();
          await closeAndEmit();
        } catch (error) {
          console.log('error', error);
        }
      }
      // 关闭抽屉
      function closeAndEmit() {
        closeDrawer();
      }
      return { registerDrawer, registerForm, getTitle, handleSubmit, _list, isUpdate };
    },
  });
</script>
<style lang="less" scoped>
  :deep(.ant-input-number) {
    width: 100% !important;
  }
</style>
