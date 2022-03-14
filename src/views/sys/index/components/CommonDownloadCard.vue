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
    <div :class="`${prefixCls}-download-item-container`" class="flex-1">
      <div
        :class="`${prefixCls}-download-item`"
        class="flex items-center justify-between mt-1 mb-1"
        v-for="item in downloadListRef"
        :key="item.id"
      >
        <div
          :class="`${prefixCls}-download-item_name`"
          class="flex-1 truncate cursor-pointer lx-color--primary"
          :title="item.commonFile.name"
          @click="downloadFile(item.commonFile)"
          >{{ item.commonFile.name }}</div
        >
        <div :class="`${prefixCls}-download-item_time`" class="flex-none"
          >【{{ formatToDateFormatter(item.commonFile.addDateTime) }}】</div
        >
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
  import IndexCardVue from './IndexCard.vue';
  import { ThemeColorEnum } from '/@/enums/themeColorEnum';
  import { onMounted, ref, nextTick } from 'vue';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { getCommonFilePageByQueryDto } from '/@/api/download/download';
  import { formatToDate } from '/@/utils/dateUtil';
  import { useUserStore } from '/@/store/modules/user';
  // import { LxPagination, useLxPagination } from '/@/components/LxComponents';
  import { MyPageI } from '/#/business';
  import { Pagination } from 'ant-design-vue';
  import { orParamsFormatter, previewFile } from '/@/utils/commonServe/businessUtil';
  import { useBusinessStore } from '/@/store/modules/business';

  const { prefixCls } = useDesign('common-download-card');
  const titleIconColor = ref<ThemeColorEnum>(ThemeColorEnum.four);
  const userStore = useUserStore();

  // const [register, { setCurrentPage, doAfterPageChange }] = useLxPagination();

  const MAX_LENGTH = 5;
  const downloadListRef = ref<any[]>([]);
  const loadingRef = ref<boolean>(false);
  const pageRef = ref<MyPageI>({ pageNum: 1, pageSize: MAX_LENGTH });
  const totalRef = ref<number>(0);

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

  const downloadFile = (commonFile) => {
    // window.open(commonFile.attach);
    previewFile({ name: commonFile.name, url: commonFile.attach });
  };

  const formatToDateFormatter = (time) => {
    return formatToDate(time);
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-common-download-card';

  .@{prefix-cls} {
    display: flex;
    flex-direction: column;
  }
</style>
