<template>
  <div class="border-2 border-gray-200 rounded-lg overflow-hidden">
    <!-- <img src="/resource/img/title2.png" alt="" /> -->
    <div class="px-25px py-5px bg-blue-500 flex items-center">
      <Icon icon="ant-design:cloud-download-outlined" :size="35" style="color: white" />
      <span class="ml-10px text-2xl font-bold text-white">常用下载</span>
    </div>

    <div class="h-160px mx-10px mb-0 overflow-hidden">
      <ul v-if="dataList.length > 0">
        <li
          class="flex justify-between pl-15px py-5px relative"
          v-for="item in dataList"
          :key="item.id"
        >
          <div
            class="cursor-pointer truncate flex-grow hover:text-blue-600 hover:font-semibold"
            @click="downloadFile(item)"
          >
            {{ item.name }}
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
  </div>
</template>

<script lang="ts">
  // 常用下载
  import { Icon } from '/@/components/Icon/index';
  import { defineComponent, onMounted, ref } from 'vue';
  import { Pagination, Empty } from 'ant-design-vue'; // 按需引入
  import { renderTime } from '/@/components/Time';
  import { downloadPageAndSort } from '../webPublicity.data';
  import { previewFile } from '/@/utils/commonServe/businessUtil';
  // api
  import { getCommonFilePageByQueryDto } from '/@/api/web-publicity/webPublicityApi';

  export default defineComponent({
    components: {
      Empty,
      Icon,
      Pagination, // 分页
    },
    setup() {
      let dataList = ref<any>([]); // list数据
      const current = ref<number>(1); // 分页 当前页数
      const total = ref<number>(0); // 分页 总数

      // 获取数据
      const getData = async (pageNum: number) => {
        const resData = await getCommonFilePageByQueryDto(downloadPageAndSort(pageNum));
        dataList.value = resData.page.content.map((item) => item.commonFile);
        total.value = resData.page.totalElements;
      };
      console.log('dataList===:', dataList);

      onMounted(() => {
        getData(1);
      });

      const onChange = (pageNumber: number) => {
        getData(pageNumber);
      };

      const downloadFile = (commonFile) => {
        // window.open(attach);
        previewFile({ name: commonFile.name, url: commonFile.attach });
      };

      return {
        dataList,
        current,
        total,
        onChange,
        renderTime,
        downloadFile,
        simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      };
    },
  });
</script>

<style scoped>
  /* .demoLp {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 10px;
    background: rgba(9, 96, 189, 0.85);
    border-radius: 50%;
  } */
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
