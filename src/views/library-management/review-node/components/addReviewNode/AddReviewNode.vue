<template>
  <div :class="prefixCls">
    <BasicForm @register="registerForm" :disabled="ifReviewNodeExistRef" />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import {
    AddReviewNodeActionType,
    ReviewNodeI,
  } from '/@/views/library-management/review-node/typing';
  import { getAddReviewNodeFormSchema } from '/@/views/library-management/review-node/components/addReviewNode/addReviewNode.data';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { getReviewNodeByProjectNode, saveReviewNode } from '/@/api/review-node/proReviewNode';
  import { useUserStore } from '/@/store/modules/user';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import UserController from '/@/api/system/UserManagementAuditApi';
  import { personListFormatter } from '/@/utils/commonServe/businessUtil';
  // import { getProjectById } from '/@/api/purchase/plan-purchase';

  interface CacheReviewNodeInfoI {
    objectId?: number | string;
    objectName?: string;
    node?: number; // 评审结点
  }

  const { prefixCls } = useDesign('add-review-node');
  const userStore = useUserStore();

  // BLOCK: state
  // 暂存 结点的部分信息
  let tmpReviewNodeInfo: CacheReviewNodeInfoI = {};
  // 缓存的 服务器中 评审结点信息
  let cacheReviewNode: Nullable<ReviewNodeI> = null;
  const ifReviewNodeExistRef = ref<boolean>(false);
  const cacheProData = ref<any>(null); // 项目信息

  const [
    registerForm,
    {
      getFieldsValue,
      validate,
      resetFields,
      setFieldsValue,
      updateSchema,
      resetSchema,
      appendSchemaByField,
      setProps,
    },
  ] = useForm({
    schemas: getAddReviewNodeFormSchema(),
    labelWidth: 120,
    showActionButtonGroup: false,
  });

  // BLOCK: expose
  /**
   * 初始化方法
   * @param objectId
   * @param objectName
   * @param node
   * @param ifReviewNodeExist 抽取结点是否已经保存过（是否已存在）
   * @param ifBatch 是否批量抽取
   * @returns
   */
  const init = async ({
    objectId,
    objectName,
    node,
    ifReviewNodeExist = false,
    ifBatch = false,
  }): Promise<Nullable<ReviewNodeI>> => {
    tmpReviewNodeInfo = {
      objectId,
      objectName,
      node,
    };
    if (ifBatch) {
      // 批量抽取，不进行后续
      return null;
    }
    ifReviewNodeExistRef.value = ifReviewNodeExist;
    await dispatchByNodeAndProject(node); // updateSchemas
    // 查询抽取结点
    cacheReviewNode = await getReviewNodeByProjectNode({
      ...tmpReviewNodeInfo,
    });
    // cacheProData.value = await getProjectById(objectId);
    // 假如有
    if (cacheReviewNode) {
      ifReviewNodeExistRef.value = true; // 禁用表单
      // 3. 填写到 formData
      cacheReviewNode.purchaseAgent = cacheReviewNode.purchaseAgent?.id ?? undefined;
      setFieldsValue(cacheReviewNode);
      return cacheReviewNode; // 返回评审结点
    } else {
      return null;
    }
  };

  const confirm = async () => {
    await validate();
    if (cacheReviewNode) {
      // 如果有评审结点，返回
      return cacheReviewNode;
    } else {
      // 无评审结点，新建评审结点返回
      const _formData = getFieldsValue();
      _formData.purchaseAgent = _formData.purchaseAgent ? { id: _formData.purchaseAgent } : null;
      const _data = { ...tmpReviewNodeInfo, ..._formData };
      // 保存结点
      const _reviewNode = await saveReviewNode(_data);
      return _reviewNode;
    }
  };

  const reset = () => {
    tmpReviewNodeInfo = {};
    cacheReviewNode = null;
    ifReviewNodeExistRef.value = false;
    resetFields();
    cacheProData.value = null;
    resetSchema(getAddReviewNodeFormSchema());
  };
  defineExpose({
    init,
    confirm,
    reset,
  } as AddReviewNodeActionType);

  /**
   * 根据 节点 和 项目 更新 schema
   */
  const dispatchByNodeAndProject = async (node: number) => {
    // 抽取节点  1 组织部门待处理 2 组织部门待采购 3 组织部门采购中
    /**
     *         可抽取类型                    是否抽取，抽取类型
     * 待处理1  专家/招标公司                 抽取专家        抽招标公司    不抽取          不抽取
     * 待采购2  招标公司                     可抽取招标公司   不可抽取      只 公司         不抽取
     * 采购中3  专家                         只能专家        只能专家     只专家          只专家
     */
    switch (node) {
      case 1: // 组织部门待处理
        // 都可以抽，也可不抽，所以不处理
        break;
      case 2:
        setProps({
          compact: true,
        });
        await updateSchema({
          field: 'ifReview',
          defaultValue: 1,
          ifShow: false,
        });
        setFieldsValue({ ifReview: 1 });
        // 只 公司，也可不抽，所以更新；
        // node 1 如果抽招标公司，则在外部进行禁用，所以内部不处理
        await updateSchema({
          field: 'extractType',
          componentProps: {
            options: [{ value: 1, label: '招标公司' }],
          },
          defaultValue: 1,
          ifShow: false,
        });
        await updateSchema({
          field: 'extractMethod',
          labelWidth: 0,
          label: '',
        });
        // await updateSchema({
        //   field: 'ifReview',
        //   label: '是否抽取',
        // });
        setFieldsValue({ extractType: 1 });
        break;
      case 3:
        await updateSchema({
          field: 'ifReview',
          label: '是否抽取',
        });
        // 只专家，也可不抽，所以更新；
        await updateSchema({
          field: 'extractType',
          componentProps: {
            options: [{ value: 0, label: '专家' }],
          },
          defaultValue: 0,
        });
        const { getHqlQueryDto } = useHqlQueryDto({
          hqlPageAndSortSumDto: {
            page: null,
            sorts: [{ dir: 'asc', prop: 'user.id' }],
            queryList: [
              // 采购方式 ！= （电子竞价/询价），状态 = 待采购，项目处理人 = 当前登陆人，未删除的项目
              { param: 'user.ifDelete', type: 'equal', value: [0] },
              { param: 'user.orgId', type: 'equal', value: [userStore.getUserInfo?.orgId] },
              { param: 'user.approveStatus', type: 'equal', value: [1] },
              { param: 'user.useMark', type: 'equal', value: [1] },
              { param: 'user.role', type: 'equal', value: [2] },
            ],
            dataFieldList: ['user', 'user.id'],
          },
        });
        await appendSchemaByField(
          {
            field: 'purchaseAgent',
            label: '采购代理人',
            component: 'ApiSelect',
            colProps: { span: 22 },
            required: false,
            componentProps: {
              api: async (params) => {
                const data = await UserController.getUserPageList(params);
                const _data = data?.page?.content?.map((item) => item.user) ?? [];
                return personListFormatter(_data);
              },
              params: getHqlQueryDto(),
              placeholder: '请选择采购代理人',
              labelField: 'label',
              valueField: 'value',
              showSearch: true,
              optionFilterProp: 'label',
            },
            defaultValue: undefined,
            ifShow: ({ model }) => {
              return !!model.ifReview;
            },
          },
          undefined,
        );
        break;
      case 4:
        setProps({
          compact: true,
        });
        await updateSchema({
          field: 'ifReview',
          defaultValue: 1,
          ifShow: false,
        });
        setFieldsValue({ ifReview: 1 });
        // 只专家，也可不抽，所以更新；
        await updateSchema({
          field: 'extractType',
          componentProps: {
            options: [{ value: 0, label: '专家' }],
          },
          defaultValue: 0,
          ifShow: false,
        });
        await updateSchema({
          field: 'extractMethod',
          labelWidth: 0,
          label: '',
        });
        // await updateSchema({
        //   field: 'ifReview',
        //   label: '是否抽取',
        // });
        setFieldsValue({ extractType: 0 });
        break;
      default:
        break;
    }
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-add-review-node';
</style>
