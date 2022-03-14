<template>
  <div
    class="w-580px h-150px mb-20px border-2 border-gray-200 rounded-5px hover:shadow-lg"
    @click="handleToReport(obj)"
  >
    <!-- bg-gray-50 卡片背景色 -->
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
        >{{ obj.proNumber }}</div
      >
      <div class="absolute top-0 right-0 text-gray-400 px-10px py-3px">{{
        obj.project.addUser.orgName
      }}</div>
      <div class="w-1/1 px-20px pt-20px text-xl font-semibold truncate">
        <span class="cursor-pointer text-gray-800 hover:text-yellow-500">{{ obj.proName }}</span>
      </div>
    </div>
    <div class="flex justify-between border-t-2 border-gray-300 h-50px px-10px py-5px">
      <div class="flex items-center content-center font-semibold">
        <Divider type="vertical"></Divider>
        <span class="text-center text-blue-500 min-w-50px">{{ obj.project.projectType.name }}</span>
        <Divider type="vertical"></Divider>
        <span class="text-center text-yellow-400 min-w-80px">
          <span v-if="obj.project.currencyType.code === '1'">￥</span>
          <span v-else>{{ obj.project.currencyType.name }}</span>
          {{ obj.budgetAmount }}</span
        >
        <Divider type="vertical"></Divider>
        <span
          class="text-center text-gray-400 min-w-80px"
          :title="'报价开始时间：' + renderTime(obj.project.quoteStartTime, true)"
        >
          {{ renderTime(obj.project.quoteStartTime) }}
        </span>
        <Divider type="vertical"></Divider>
      </div>
      <div
        class="leading-40px flex justify-items-center items-center"
        :title="'报价结束时间：' + renderTime(obj.project.quoteEndTime, true)"
      >
        <!-- <div v-if="obj.project.quoteEndTime < Date.now()">已结束</div> -->
        <div v-if="thinkTime(obj.project)" :class="textColor">{{ thinkTime(obj.project) }}</div>
        <div v-else class="flex justify-items-center items-center">
          <Icon
            icon="ant-design:field-time-outlined"
            :size="25"
            style="color: rgba(220, 38, 38); padding-right: 10px"
          />
          <StatisticCountdown
            class="inline-block"
            :value="Date.now() + (obj.project.quoteEndTime - Date.now())"
            format="D 天 H 时 m 分 s 秒"
            :value-style="{
              color: 'rgba(220, 38, 38)',
              fontSize: '14px',
              fontWeight: 500,
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  // 采购公告Card
  import { Icon } from '/@/components/Icon/index';
  import { defineComponent, ref, computed } from 'vue';
  import { Divider, Statistic } from 'ant-design-vue';
  import { renderTime } from '/@/components/Time';
  import { useRouter } from 'vue-router';
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
      Icon,
      Divider, // 分割线
      StatisticCountdown: Statistic.Countdown, // 倒计时
    },
    setup(props) {
      let obj: any = ref({});
      obj = props.object;
      const router = useRouter();
      const textColor = ref<string>();

      const thinkTime = computed(() => {
        return function (projectInfo) {
          if (projectInfo.quoteStartTime > Date.now()) {
            // 暂未开始
            textColor.value = 'text-green-600';
            return '暂未开始';
          } else {
            if (projectInfo.quoteEndTime > Date.now()) {
              // 时间之内
              return 0;
            } else {
              // 已结束
              textColor.value = 'text-red-600';
              return '已结束';
            }
          }
        };
      });

      // 跳转 采购公告预览
      const { emitToIndexReportDialogEventBus } = useToIndexReportDialogEventBusEmitter();
      const { indexDialogToReportProcurementAffiche } = useIndexDialogToReport();
      const handleToReport = (record?: any) => {
        console.log('record:', record);
        const payload = indexDialogToReportProcurementAffiche(record.id);
        emitToIndexReportDialogEventBus(payload);
      };

      return {
        obj,
        thinkTime,
        textColor,
        renderTime,
        handleToReport,
      };
    },
  });
</script>

<style scoped></style>
