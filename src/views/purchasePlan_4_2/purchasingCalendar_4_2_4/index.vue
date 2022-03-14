<template>
  <div class="purchase-calendar">
    <Calendar
      v-model:value="value"
      :mode="modeRef"
      @select="handleMonthCellRenderClick"
      @panel-change="handlePanelChange"
    >
      <template #dateCellRender="{ current: value }">
        <ul class="events">
          <li v-for="item in getListData(value)" :key="item.content">
            <Badge :status="item.type" :text="item.content" />
          </li>
        </ul>
      </template>
      <template #monthCellRender="{ current: value }">
        <div
          v-if="getMonthData(value)"
          class="notes-month"
          @click="handleMonthCellRenderClick(value)"
        >
          <section class="month_section">{{ getMonthData(value) }}</section>
        </div>
      </template>
    </Calendar>
  </div>
</template>
<script lang="ts">
  import { defineComponent, onMounted, ref, toRaw, watch } from 'vue';
  import { Moment } from 'moment';
  import { Calendar, Badge } from 'ant-design-vue';
  import { getYearMonthDayProCount, getYearProCount } from '/@/api/purchase/purchaseCalendar';
  export default defineComponent({
    components: {
      Calendar,
      Badge,
    },
    setup() {
      const value = ref<Moment>();
      const monthList = ref();
      const dayList = ref();
      const modeRef = ref<'month' | 'year'>('year');
      const currentMounth = ref();
      onMounted(async () => {
        console.log(new Date().getMonth() + 1);
        monthList.value = await getYearProCount({
          year: new Date().getFullYear(),
        });
        dayList.value = await getYearMonthDayProCount({
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
        });
        currentMounth.value = new Date().getMonth() + 1;
      }),
        watch(
          () => value.value,
          async (newValue: any) => {
            monthList.value = await getYearProCount({
              year: newValue.year(),
            });
            dayList.value = await getYearMonthDayProCount({
              year: newValue.year(),
              month: newValue.month() + 1,
            });
            currentMounth.value = newValue.month() + 1;
            console.log(toRaw(monthList.value));
            console.log(toRaw(dayList.value));
          },
          { deep: true },
        );
      const getListData = (value: Moment) => {
        let listData = [];
        dayList.value.forEach((item) => {
          if (value.date() === Number(item.day) && value.month() + 1 === currentMounth.value) {
            listData = item.listProject;
          }
        });
        if (listData.length > 0) {
          listData.forEach((item: any) => {
            item.type = 'success';
            item.content = item.proName;
          });
        }
        return listData || [];
      };

      const getMonthData = (value: Moment) => {
        let count;
        monthList.value?.forEach((item) => {
          // console.log('yue', value.month(), value.month(), item.month - 1);
          if (value.month() === item.month - 1) {
            count = item.count;
          }
        });
        count = count ? '当月代办事项' + count : null;
        return count || null;
      };

      const handleMonthCellRenderClick = (value: Moment) => {
        modeRef.value = 'month';
      };

      const handlePanelChange = (date: Moment, mode: string) => {
        modeRef.value = mode as 'month' | 'year';
      };
      return {
        value,
        getListData,
        getMonthData,
        handleMonthCellRenderClick,
        modeRef,
        handlePanelChange,
      };
    },
  });
</script>
<style lang="less" scoped>
  .events {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .events .ant-badge-status {
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
    text-overflow: ellipsis;
    font-size: 12px;
  }
  .notes-month {
    text-align: center;
    font-size: 28px;
    border: 1px solid #eee;
  }
  .notes-month section {
    font-size: 28px;
  }
  .purchase-calendar {
    background-color: #fff;
    margin: 15px;
  }
  .notes-month {
    border: none !important;
  }
</style>
