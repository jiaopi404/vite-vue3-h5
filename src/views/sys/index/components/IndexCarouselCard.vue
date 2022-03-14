<template>
  <div :class="prefixCls" style="margin: 15px 15px 0 15px" v-show="noticeListRef.length">
    <Carousel :class="`${prefixCls}-carousel`" :autoplay="true" v-loading="loadingRef">
      <Image
        v-for="item in noticeListRef"
        :key="item.notice.id"
        :class="`${prefixCls}-img`"
        width="100%"
        :preview="false"
        :src="item.notice.pic"
        @click="previewNotice(item.notice)"
      />
    </Carousel>
    <Modal @register="register" />
  </div>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { ref } from 'vue';
  import { Carousel, Image } from 'ant-design-vue';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
  import { useUserStore } from '/@/store/modules/user';
  import { getNoticePageByQueryDto } from '/@/api/noticeManagement/noticeManagement';
  import { NoticeI } from '/#/business';
  import { useModal } from '/@/components/Modal';
  import Modal from '/@/views/notice-management_4_9/noticeList_4_9_2/Modal.vue';

  const { prefixCls } = useDesign('index-carousel-card');
  const loadingRef = ref<boolean>(false);
  const userStore = useUserStore();
  const totalRef = ref<number>(0);
  const noticeListRef = ref<NoticeI[]>([]);
  const [register, { openModal }] = useModal();

  const getList = async () => {
    loadingRef.value = true;
    try {
      const { getHqlQueryDto } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          page: null,
          queryList: [
            { param: 'notice.ifDelete', type: 'equal', value: [0] },
            { param: 'notice.useMark', type: 'equal', value: [1] },
            { param: 'notice.ifIndexShow', type: 'equal', value: [1] },
            // @ts-ignore
            {
              param: '',
              type: 'or',
              value: [
                orParamsFormatter(
                  `(notice.role = ${userStore.getUserInfo.role} or notice.role = 0)`,
                ),
              ],
            },
          ],
          dataFieldList: ['notice', 'notice.id'],
          sorts: [{ dir: 'desc', prop: 'notice.id' }],
        },
      });
      // if (tagModuleId) {
      //   // 有模块
      //   appendQueryList({
      //     param: '',
      //     type: 'or',
      //     value: [
      //       orParamsFormatter(`(notice.systemModule = ${tagModuleId} or notice.systemModule = 0)`),
      //     ],
      //   });
      // }
      const res = await getNoticePageByQueryDto(getHqlQueryDto());
      totalRef.value = res.page.totalElements;
      noticeListRef.value = res.page.content.filter((item) => item.notice.pic);
    } finally {
      loadingRef.value = false;
    }
  };

  getList();

  const previewNotice = (notice: NoticeI) => {
    openModal(true, { previewId: notice.id });
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-index-carousel-card';

  .@{prefix-cls} {
  }
</style>
