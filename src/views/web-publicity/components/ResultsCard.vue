<template>
  <div
    class="w-580px h-150px mb-20px border-2 border-gray-200 rounded-5px hover:shadow-lg"
    @click="handleToReport(obj)"
  >
    <div>
      <div class="relative h-100px flex items-center">
        <div
          class="
            absolute
            top-0
            left-0
            text-blue-500
            bg-blue-200 bg-opacity-75
            px-20px
            py-3px
            rounded-br
          "
          >{{ obj.bidSection.proNumber }}</div
        >
        <div class="absolute top-0 right-0 text-gray-400 px-10px py-3px">{{
          obj.bidSection.project.addUser.orgName
        }}</div>
        <div class="w-1/1 px-20px pt-20px text-xl font-semibold truncate">
          <span class="cursor-pointer text-gray-800 hover:text-yellow-500">{{
            obj.bidSection.proName
          }}</span>
        </div>
      </div>
      <div
        class="
          flex
          items-center
          content-center
          justify-center
          border-t-2 border-gray-300
          h-50px
          px-10px
          py-5px
          font-semibold
        "
      >
        <Divider type="vertical"></Divider>
        <div class="text-center text-blue-500 min-w-80px">{{ obj?.biddingCompany?.name }}</div>
        <Divider type="vertical"></Divider>
        <div class="text-center text-red-500 min-w-80px">
          <span v-if="obj.bidSection.project.currencyType.code === '1'">￥</span>
          <span v-else>{{ obj.bidSection.project.currencyType.name }}</span>

          {{ obj.bidSection.bidWinningAmount }}
        </div>
        <Divider type="vertical"></Divider>
        <div class="text-center text-gray-400 min-w-80px">{{
          renderTime(obj.bidWinner.addDateTime)
        }}</div>
        <Divider type="vertical"></Divider>
      </div>
    </div>
    <h1></h1>
  </div>
</template>

<script lang="ts">
  // 结果公告Card
  import { defineComponent, ref } from 'vue';
  import { Divider } from 'ant-design-vue';
  import { renderTime } from '/@/components/Time';
  // import { useRouter } from 'vue-router';
  import { useToIndexReportDialogEventBusEmitter } from '../../sys/index/components/indexHelper';
  import { useIndexDialogToReport } from '/@/enums/reportUrlEnum';

  export default defineComponent({
    props: {
      object: {
        type: Object,
        default: () => {},
      },
    },
    components: {
      Divider, // 分割线
    },
    setup(props) {
      let obj: any = ref({});
      obj = props.object;
      // const router = useRouter();

      const { emitToIndexReportDialogEventBus } = useToIndexReportDialogEventBusEmitter();
      const { indexDialogToReportWinAffiche } = useIndexDialogToReport();
      const handleToReport = (record?: any) => {
        const payload = indexDialogToReportWinAffiche(record.bidSection.id);
        emitToIndexReportDialogEventBus(payload);
      };

      return {
        obj,
        renderTime,
        handleToReport,
      };
    },
  });
</script>

<style scoped></style>
