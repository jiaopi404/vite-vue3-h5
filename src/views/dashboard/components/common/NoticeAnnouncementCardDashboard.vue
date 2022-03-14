<template>
  <IndexCardVue
    :class="prefixCls"
    title="通知公告"
    title-icon="ant-design:notification-outlined"
    :title-icon-color="titleIconColor"
    :is-extra="false"
    :headStyle="{
      flex: 'none',
    }"
    :body-style="{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      height: 'calc(100% - 39px)',
      flex: '1',
    }"
  >
    <!-- <div
      :class="`${prefixCls}-download-item`"
      v-for="item in noticeListRef"
      :key="item.notice_id"
      >{{ item.name }}</div
    > -->
    <div :class="`${prefixCls}-notice-item-container`" class="flex items-stretch flex-1">
      <template v-if="noticeListRef.length && largeScreenRef">
        <div :class="`${prefixCls}-download-item-container-left`" class="flex-1">
          <NoticeItemDashboard
            v-for="item in noticeListRef.slice(0, 5)"
            :key="item.id"
            :notice="item.notice"
            @preview-notice="previewNotice"
          />
        </div>
        <div
          :class="`${prefixCls}-download-item-container-gap`"
          class="flex-none dashboard-card-gap"
        ></div>
        <div :class="`${prefixCls}-download-item-container-right`" class="flex-1">
          <template v-if="noticeListRef.length > 5">
            <NoticeItemDashboard
              v-for="item in noticeListRef.slice(5, noticeListRef.length)"
              :key="item.id"
              :notice="item.notice"
              @preview-notice="previewNotice"
            />
          </template>
        </div>
      </template>
      <div v-if="noticeListRef.length && !largeScreenRef" class="w-full">
        <NoticeItemDashboard
          v-for="item in noticeListRef"
          :key="item.id"
          :notice="item.notice"
          @preview-notice="previewNotice"
        />
      </div>
      <div v-if="!noticeListRef.length" class="w-full">
        <LxEmpty />
      </div>
    </div>
    <Pagination
      class="flex-none"
      v-model:current="pageRef.pageNum"
      v-model:page-size="pageRef.pageSize"
      :total="totalRef"
      size="small"
      @change="getList"
      :show-total="(total) => `共${total}条数据`"
    />
    <Modal @register="register" />
  </IndexCardVue>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import IndexCardVue from '/@/views/sys/index/components/IndexCard.vue';
  import { ThemeColorEnum } from '/@/enums/themeColorEnum';
  import { onMounted, ref, nextTick, watch } from 'vue';
  import { getNoticePageByQueryDto } from '/@/api/noticeManagement/noticeManagement';
  import { NoticeI } from '/#/business';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { formatToDate } from '/@/utils/dateUtil';
  import { useModal } from '/@/components/Modal';
  import Modal from '/@/views/notice-management_4_9/noticeList_4_9_2/Modal.vue';
  // import { LxPagination, useLxPagination } from '/@/components/LxComponents';
  import { MyPageI } from '/#/business';
  import { Pagination } from 'ant-design-vue';
  import { useBusinessStore } from '/@/store/modules/business';
  import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
  import { largeScreenRef } from './helper';
  import { LxEmpty } from '/@/components/LxComponents';
  import NoticeItemDashboard from './NoticeItemDashboard.vue';

  const { prefixCls } = useDesign('notice-announcement-card');
  const titleIconColor = ref<ThemeColorEnum>(ThemeColorEnum.three);
  const userStore = useUserStore();
  const [register, { openModal }] = useModal();

  const businessStore = useBusinessStore();
  const tagModuleId = businessStore.GET_TAG_MODULE_INFO?.id;

  // const [registerPagination, { doAfterPageChange }] = useLxPagination();

  const MAX_LENGTH = largeScreenRef.value ? 10 : 5;

  const noticeListRef = ref<NoticeI[]>([]);
  const loadingRef = ref<boolean>(false);
  const pageRef = ref<MyPageI>({ pageNum: 1, pageSize: MAX_LENGTH });
  const totalRef = ref<number>(0);

  watch(
    () => largeScreenRef.value,
    (nv) => {
      const maxLength = nv ? 10 : 5;
      pageRef.value.pageSize = maxLength;
    },
  );

  onMounted(async () => {
    // doAfterPageChange(getList);
    nextTick(async () => {
      await getList();
    });
  });

  const getList = async () => {
    loadingRef.value = true;
    try {
      const { getHqlQueryDto, appendQueryList } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          page: pageRef.value,
          queryList: [
            { param: 'notice.ifDelete', type: 'equal', value: [0] },
            { param: 'notice.useMark', type: 'equal', value: [1] },
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
      if (tagModuleId) {
        // 有模块
        appendQueryList({
          param: '',
          type: 'or',
          value: [
            orParamsFormatter(`(notice.systemModule = ${tagModuleId} or notice.systemModule = 0)`),
          ],
        });
      }
      const res = await getNoticePageByQueryDto(getHqlQueryDto());
      totalRef.value = res.page.totalElements;
      noticeListRef.value = res.page.content;
    } finally {
      loadingRef.value = false;
    }
  };

  const previewNotice = (notice: NoticeI) => {
    openModal(true, { previewId: notice.id });
  };

  const formatToDateFormatter = (time) => {
    return formatToDate(time);
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-notice-announcement-card';

  @import './common.less';

  .@{prefix-cls} {
    display: flex;
    flex-direction: column;
  }
</style>
