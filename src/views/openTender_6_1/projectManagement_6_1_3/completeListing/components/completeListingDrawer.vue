<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :title="drawerTitle"
    width="500px"
    @ok="handleSubmit"
    @close="handleCancel"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, unref, computed } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { formSchema } from '../completeListing.data';
  import {
    getBidWinningListById,
    getIdByUserIdAndBidSectionId,
    saveBidWinningListbid,
    checkBidWinningListRepeat,
  } from '/@/api/purchase/supplierApi';

  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute } from 'vue-router';
  import { getNamePatternNoSpaceRule } from '/@/utils/helper/validateRuleHelper';
  import { debouncePromise } from '/@/utils/commonServe';
  import { getSpecialDictionaryList } from '/@/api/purchase/plan-purchase';
  import { TreeSelect } from 'ant-design-vue';
  import { findPathAll } from '/@/utils/helper/treeHelper';
  import { useConfigStore } from '/@/store/modules/config';

  export default defineComponent({
    name: 'PurchaseDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const configStore = useConfigStore();
      const userInfo = useUserStore().getUserInfo;
      const { createMessage } = useMessage();
      const route = useRoute();
      const router = useRoute();

      const isAdd = ref(false); // 是否为添加
      const id = ref<number | null>(-999); // 当前行id
      const bidSectionId = ref<number>(-999);

      const drawerTitle = computed(() => {
        if (unref(isAdd)) {
          return '添加中标清单';
        } else {
          return '编辑中标清单';
        }
      });

      const [
        registerForm,
        { getFieldsValue, setFieldsValue, resetFields, validate, updateSchema },
      ] = useForm({
        labelWidth: 130,
        schemas: formSchema(),
        showActionButtonGroup: false,
      });

      const [registerDrawer, { closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        id.value = data.id;
        bidSectionId.value = data.bidSectionId;
        // 更改 label名(货币类型)
        updateSchema([
          { field: 'transactionUnitPrice', label: `报价单价（${data.currencyTypeName}）` },
          { field: 'totalTransactionUnitPrice', label: `报价总价（${data.currencyTypeName}）` },
        ]);

        if (unref(id)) {
          isAdd.value = false;
          const resData = await getBidWinningListById(unref(id));
          setFieldsValue({
            ...resData,
            unItDicId: resData.unItDic?.id,
            purchaseType: resData.purchaseType?.id,
            totalTransactionUnitPrice: (
              Number(resData.number) * Number(resData.transactionUnitPrice)
            ).toFixed(2),
          });
        } else {
          isAdd.value = true;
        }
        // 设置名称判重验证
        // updateSchema({
        //   field: 'name',
        //   rules: [
        //     {
        //       required: true,
        //       message: '请输入名称',
        //       trigger: ['change', 'blur'],
        //     },
        //     getNamePatternNoSpaceRule(50, 'change', 2),
        //     {
        //       trigger: ['change', 'blur'],
        //       validator: debouncePromise(async (_, value) => {
        //         const bool = await checkBidWinningListRepeat({
        //           id: unref(id), // 判重id传递 添加时id为null
        //           name: value,
        //         });
        //         if (bool) {
        //           return Promise.resolve();
        //         } else {
        //           return Promise.reject('名称重复！');
        //         }
        //       }, 800),
        //     },
        //   ],
        // });
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
            params: {
              id: configStore.GET_CONFIG.configInfo?.configDictionary?.purchaseTypeId,
              useMark: 1,
            },
            replaceFields: {
              children: 'children',
              key: 'showLabel',
              value: 'id',
              title: 'name',
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
      });

      // 确认按钮
      async function handleSubmit() {
        try {
          await validate();
          const formData = getFieldsValue();

          const resData = await getIdByUserIdAndBidSectionId({
            userId: userInfo.id,
            bidSectionId: unref(bidSectionId),
          });
          const _data: any = {
            id: unref(id),
            supplierQuotation: {
              id: resData,
            },
            name: formData.name,
            brandModel: formData.brandModel,
            number: formData.number,
            unItDic: { id: formData.unItDicId }, // 计量单位
            transactionUnitPrice: formData.transactionUnitPrice, // 报价单价/成交单价
            // purchaseType: { id: formData.purchaseType }, // 采购目录
            actualSpec: formData.actualSpec, // 实际技术参数
          };
          if (formData.purchaseType) {
            _data.purchaseType = { id: formData.purchaseType };
          }
          // if (unref(isAdd)) {
          //   _data.unitPrice = formData.transactionUnitPrice; // 预算单价
          //   _data.spec = formData.actualSpec; // 要求技术参数
          // }
          console.log('_data:', _data);
          await saveBidWinningListbid(_data);
          createMessage.success('保存成功');

          closeDrawer();
          resetFields();
          isAdd.value = false;
          id.value = -999;
          bidSectionId.value = -999;
          emit('success');
        } catch (error) {
          console.log('error', error);
        }
      }
      // 取消
      const handleCancel = () => {
        resetFields();
        isAdd.value = false;
        id.value = -999;
        bidSectionId.value = -999;
      };

      return {
        drawerTitle,
        registerDrawer,
        registerForm,
        handleSubmit,
        handleCancel,
      };
    },
  });
</script>
<style lang="less" scoped>
  :deep(.ant-input-number) {
    width: 100% !important;
  }
</style>
