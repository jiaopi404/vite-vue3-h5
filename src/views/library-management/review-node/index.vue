<template>
  <div :class="prefixCls">
    <PageWrapper v-loading="pageLoadingRef" :title="cmptExtractTypeAndTitle">
      <template v-if="reviewNodeRef?.extractType === 0">
        <div v-if="reviewNodeRef?.extractMethod === 0">
          <Card title="定向手动抽取" size="small">
            <ExtractExpertManual
              :review-node="reviewNodeRef"
              @refresh:review-node="refreshReviewNode"
            />
          </Card>
          <div class="mb-5"></div>
        </div>
        <div v-if="reviewNodeRef?.extractMethod === 1">
          <Card title="随机自动抽取" size="small">
            <ExtractExpertRandom
              :review-node="reviewNodeRef"
              @refresh:review-node="refreshReviewNode"
            />
          </Card>
          <div class="mb-5"></div>
        </div>
      </template>
      <template v-if="reviewNodeRef?.extractType === 1">
        <div v-if="reviewNodeRef?.extractMethod === 0 && projectRef">
          <Card title="定向手动抽取" size="small">
            <ExtractCompanyManual
              :review-node="reviewNodeRef"
              @refresh:review-node="refreshReviewNode"
              :project-info="projectRef"
            />
          </Card>
        </div>
        <div v-if="reviewNodeRef?.extractMethod === 1">
          <Card title="随机自动抽取" size="small">
            <ExtractCompanyRandom
              :review-node="reviewNodeRef"
              @refresh:review-node="refreshReviewNode"
            />
          </Card>
        </div>
      </template>

      <!-- <Card title="测试抽取结点的添加" size="small">
        <AddReviewNode ref="addReviewNode" />
        <div class="m-5">
          <AButton @click="saveReviewNodeTest">保存</AButton>
        </div>
      </Card> -->
    </PageWrapper>
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref, onBeforeUnmount, onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { ReviewNodeI } from './typing';
  import { Card } from 'ant-design-vue';
  // import AddReviewNode from '/@/views/library-management/review-node/components/addReviewNode/AddReviewNode.vue';
  import { PageWrapper } from '/@/components/Page';
  import { useTabs } from '/@/hooks/web/useTabs';
  import ExtractExpertManual from './components/extractExpertManual/ExtractExpertManual.vue';
  import ExtractExpertRandom from './components/extractExpertRandom/ExtractExpertRandom.vue';
  import ExtractCompanyManual from './components/extractCompanyManual/ExtractCompanyManual.vue';
  import ExtractCompanyRandom from './components/extractCompanyRandom/ExtractCompanyRandom.vue';
  // import AButton from '/@/components/Button/src/BasicButton.vue';
  import { getProReviewNodeById } from '/@/api/review-node/proReviewNode';
  import { getProjectById } from '/@/api/purchase/waitTenderApi';

  const { prefixCls } = useDesign('review-node_page');

  const reviewNodeIdRef = ref<Nullable<number>>(null);
  const reviewNodeRef = ref<Nullable<ReviewNodeI>>(null);
  const pageLoadingRef = ref<boolean>(false);
  const projectRef = ref<Nullable<Recordable>>(null);

  // 标题;
  const cmptExtractTypeAndTitle = computed(() => {
    const extractType = reviewNodeRef.value?.extractType; // 0 专家，1 招标公司
    return extractType === 1 ? '抽取招标公司' : '抽取专家';
  });

  onMounted(async () => {
    const route = useRoute();
    reviewNodeIdRef.value = route.query.id ? Number(route.query.id) : null;
    if (unref(reviewNodeIdRef)) {
      pageLoadingRef.value = true;
      // 获取 评审结点数据
      try {
        reviewNodeRef.value = await getProReviewNodeById(reviewNodeIdRef.value);
        // @ts-ignore
        if ([1, 2].includes(reviewNodeRef.value?.node)) {
          projectRef.value = await getProjectById(reviewNodeRef.value?.objectId);
        }
      } finally {
        pageLoadingRef.value = false;
      }
    }
  });

  // 离开之前关闭当前的 tab
  // const { closeCurrent } = useTabs();
  // onBeforeUnmount(() => {
  //   closeCurrent();
  // });

  const refreshReviewNode = async () => {
    reviewNodeRef.value = await getProReviewNodeById(reviewNodeIdRef.value);
  };

  // const { addReviewNode, saveReviewNodeTest } = testAddReviewNode();

  // 测试
  // function testAddReviewNode() {
  //   const addReviewNode = ref<Nullable<AddReviewNodeActionType>>(null);

  //   onMounted(() => {
  //     addReviewNode.value?.init({
  //       objectId: 18,
  //       objectName: 'pro_project',
  //       node: '27', // 1 -> 1, 2 -> 2
  //     });
  //   });

  //   const saveReviewNodeTest = () => {
  //     addReviewNode.value?.confirm();
  //   };
  //   return {
  //     addReviewNode,
  //     saveReviewNodeTest,
  //   };
  // }
</script>

<style lang="less"></style>
