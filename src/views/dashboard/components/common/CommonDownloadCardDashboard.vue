<template>
  <IndexCardVue
    :class="prefixCls"
    title="常用下载"
    title-icon="ant-design:cloud-download-outlined"
    :title-icon-color="titleIconColor"
    :loading="loadingRef"
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
    <div :class="`${prefixCls}-download-item-container`" class="flex items-stretch flex-1">
      <template v-if="downloadListRef.length && largeScreenRef">
        <div :class="`${prefixCls}-download-item-container-left`" class="flex-1">
          <DownloadItemDashboard
            v-for="item in downloadListRef.slice(0, 5)"
            :key="item.id"
            :common-file="item.commonFile"
          />
        </div>
        <div
          :class="`${prefixCls}-download-item-container-gap`"
          class="flex-none dashboard-card-gap"
        ></div>
        <div :class="`${prefixCls}-download-item-container-right`" class="flex-1">
          <template v-if="downloadListRef.length > 5">
            <DownloadItemDashboard
              v-for="item in downloadListRef.slice(5, downloadListRef.length)"
              :key="item.id"
              :common-file="item.commonFile"
            />
          </template>
        </div>
      </template>
      <div v-if="downloadListRef.length && !largeScreenRef" class="w-full">
        <DownloadItemDashboard
          v-for="item in downloadListRef"
          :key="item.id"
          :common-file="item.commonFile"
        />
      </div>
      <div v-if="!downloadListRef.length" class="w-full">
        <LxEmpty />
      </div>
    </div>
    <!-- <LxPagination @register="register" :total="totalRef" :default-page-size="MAX_LENGTH" /> -->
    <Pagination
      class="flex-none"
      v-model:current="pageRef.pageNum"
      v-model:page-size="pageRef.pageSize"
      :total="totalRef"
      size="small"
      @change="getList"
      :show-total="(total) => `共${total}条数据`"
    />
  </IndexCardVue>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import IndexCardVue from '/@/views/sys/index/components/IndexCard.vue';
  import { ThemeColorEnum } from '/@/enums/themeColorEnum';
  import { onMounted, ref, nextTick, watch } from 'vue';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { getCommonFilePageByQueryDto } from '/@/api/download/download';
  import { useUserStore } from '/@/store/modules/user';
  // import { LxPagination, useLxPagination } from '/@/components/LxComponents';
  import { MyPageI } from '/#/business';
  import { Pagination } from 'ant-design-vue';
  import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
  import { useBusinessStore } from '/@/store/modules/business';
  import DownloadItemDashboard from './DownloadItemDashboard.vue';
  import { largeScreenRef } from './helper';
  import { LxEmpty } from '/@/components/LxComponents';

  const { prefixCls } = useDesign('common-download-card-dashboard');
  const titleIconColor = ref<ThemeColorEnum>(ThemeColorEnum.four);
  const userStore = useUserStore();

  // const [register, { setCurrentPage, doAfterPageChange }] = useLxPagination();

  const MAX_LENGTH = largeScreenRef.value ? 10 : 5;
  const downloadListRef = ref<any[]>([]);
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

  onMounted(() => {
    nextTick(async () => {
      await getList();
    });
    // setCurrentPage(pageRef.value.pageNum, pageRef.value.pageSize);
    // doAfterPageChange(getList);
  });

  const getList = async () => {
    const businessStore = useBusinessStore();
    const tagModuleId = businessStore.GET_TAG_MODULE_INFO?.id;
    loadingRef.value = true;
    try {
      const { getHqlQueryDto, appendQueryList } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          page: pageRef.value,
          queryList: [
            { param: 'commonFile.ifDelete', type: 'equal', value: [0] },
            { param: 'commonFile.useMark', type: 'equal', value: [1] },
            // @ts-ignore
            {
              param: '',
              type: 'or',
              value: [
                orParamsFormatter(
                  `(commonFile.role = ${userStore.getUserInfo.role} or commonFile.role = 0)`,
                ),
              ],
            },
          ],
          dataFieldList: ['commonFile', 'commonFile.id'],
          sorts: [{ dir: 'desc', prop: 'commonFile.id' }],
        },
      });
      if (tagModuleId) {
        console.log('有模块 id', tagModuleId);
        // 有模块
        appendQueryList({
          param: '',
          type: 'or',
          value: [
            orParamsFormatter(
              `(commonFile.systemModule = ${tagModuleId} or commonFile.systemModule = 0)`,
            ),
          ],
        });
      }
      // 默认显示 10 条
      const res = await getCommonFilePageByQueryDto(getHqlQueryDto());
      downloadListRef.value = res.page.content;
      totalRef.value = res.page.totalElements;
    } finally {
      loadingRef.value = false;
    }
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-common-download-card-dashboard';

  @import './common.less';

  .@{prefix-cls} {
    display: flex;
    flex-direction: column;
  }
</style>
