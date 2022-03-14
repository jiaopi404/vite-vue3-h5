<template>
  <div class="border-2 border-gray-200 rounded-lg overflow-hidden">
    <!-- <img src="/resource/img/title1.png" alt="" /> -->
    <div class="px-25px py-5px bg-blue-500 flex items-center">
      <Icon icon="ant-design:notification-outlined" :size="35" style="color: white" />
      <span class="ml-10px text-2xl font-bold text-white">通知公告</span>
    </div>

    <div class="h-160px mx-10px mb-0 overflow-hidden">
      <ul v-if="dataList.length > 0">
        <!-- <li class="flex justify-between px-10px py-5px" v-for="item in dataList" :key="item.id">
          <div class="flex-1 truncate">
            <span class="demoLp"></span>
            <span class="lx-color--primary cursor-pointer" @click="previewNotice(item)"
              >{{ item.title }}
            </span>
          </div>
          <div> 【{{ renderTime(item.addDateTime) }}】 </div>
        </li> -->

        <li
          class="flex justify-between pl-15px py-5px relative"
          v-for="item in dataList"
          :key="item.id"
        >
          <div
            class="cursor-pointer truncate flex-grow hover:text-blue-600 hover:font-semibold"
            @click="previewNotice(item)"
          >
            {{ item.title }}
          </div>
          <div class="flex-none"> 【{{ renderTime(item.addDateTime) }}】 </div>
        </li>
      </ul>
      <Empty v-else :image="simpleImage" description="暂无数据" />
    </div>
    <div class="h-35px py-5px border-t-1 border-gray-300">
      <Pagination
        class="container mx-auto flex justify-center"
        size="small"
        v-model:current="current"
        :total="total"
        :defaultPageSize="5"
        @change="onChange"
      />
    </div>
    <NoticeModal @register="registerModal" />
  </div>
</template>

<script lang="ts">
  // 通知公告
  import { Icon } from '/@/components/Icon/index';
  import { defineComponent, onMounted, ref } from 'vue';
  import { Pagination, Empty } from 'ant-design-vue'; // 按需引入
  import { renderTime } from '/@/components/Time';
  import { informPageAndSort } from '../webPublicity.data';
  import { useModal } from '/@/components/Modal';
  import NoticeModal from '/@/views/notice-management_4_9/noticeList_4_9_2/Modal.vue';
  import { NoticeI } from '/#/business';
  // api
  import { getNoticePageByQueryDto } from '/@/api/web-publicity/webPublicityApi';

  export default defineComponent({
    components: {
      Empty,
      Icon,
      Pagination, // 分页
      NoticeModal,
    },
    setup() {
      let dataList = ref<any>([]); // list数据
      const current = ref<number>(1); // 分页 当前页数
      const total = ref<number>(0); // 分页 总数

      const [registerModal, { openModal }] = useModal();

      // 获取数据
      const getData = async (pageNum: number) => {
        const resData = await getNoticePageByQueryDto(informPageAndSort(pageNum));
        dataList.value = resData.page.content.map((item) => item.notice);
        total.value = resData.page.totalElements;
      };

      onMounted(() => {
        getData(1);
      });

      const onChange = (pageNumber: number) => {
        getData(pageNumber);
      };

      const previewNotice = (notice: NoticeI) => {
        openModal(true, { previewId: notice.id });
      };

      return {
        dataList,
        current,
        total,
        onChange,
        renderTime,
        registerModal,
        previewNotice,
        simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      };
    },
  });
</script>

<style scoped>
  .demoLp {
    display: inline-block;
    width: 5px;
    height: 5px;
    margin-right: 10px;
    background: deepskyblue;
    border-radius: 50%;
  }
  li::before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translate(0, -50%);
    height: 6px;
    width: 6px;
    background-color: rgba(9, 96, 189, 0.85);
    border-radius: 50%;
  }
</style>
