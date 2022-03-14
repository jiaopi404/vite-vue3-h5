<template>
  <div class="px-10px py-20px">
    <Row class="border-2 border-gray-200">
      <Col :span="24" class="p-5px border-b-1px border-gray-300">
        <span>采购类型：</span>
        <ApiRadioGroup
          :api="getDictionaryByParentId"
          :params="configStore.GET_CONFIG_DICTIONRY.projectTypeId"
          labelField="name"
          valueField="id"
          v-model:value="projectTypeId"
          :isBtn="true"
          @change="onChange"
          @optionsChange="onOptionsChange"
        ></ApiRadioGroup
      ></Col>
      <Col :span="24" class="p-5px border-b-1px border-gray-300">
        <!-- 采购公告是 发布时间 quoteStartTime
          结果公告是 中标时间 bidWinningDate
          时间范围传 传当前时间 -7天
       -->
        <span v-if="msgType">发布时间：</span>
        <span v-else>中标时间：</span>
        <RadioButtonGroup v-model:value="timeDate" :options="demoOptions" @change="onTimeChange">
        </RadioButtonGroup>
      </Col>
      <Col :span="24" class="p-5px"
        >项目关键词：
        <!-- v-model:value="value" -->
        <InputSearch v-model:value="proName" allowClear style="width: 200px" @search="onSearch"
      /></Col>
    </Row>
    <!-- <a-button @click="fun"> funnnnnnnnnnn</a-button> -->
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, unref } from 'vue';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import { useConfigStore } from '/@/store/modules/config';
  // 按需引入
  import { Input, Row, Col } from 'ant-design-vue';
  import ApiRadioGroup from '/@/components/Form/src/components/ApiRadioGroup.vue';
  import RadioButtonGroup from '/@/components/Form/src/components/RadioButtonGroup.vue';
  import { formatToDateTime, formatToDate, dateUtil } from '/@/utils/dateUtil';

  export default defineComponent({
    components: {
      Row,
      Col,
      ApiRadioGroup,
      RadioButtonGroup,
      InputSearch: Input.Search,
    },
    props: {
      msgType: {
        type: Number,
        default: 1,
        // 1 采购公告 0 常用下载
      },
    },
    expose: ['init'],
    emits: ['success'],
    setup(props, { emit }) {
      const configStore = useConfigStore();

      const projectTypeId = ref<number>(0); // 采购类型
      const timeDate = ref<string>(''); // 发布时间
      const proName = ref<string>(''); // 项目关键词

      const fun = () => {
        const time = dateUtil().format('YYYY-MM-DD');
        const time2 = dateUtil().subtract(3, 'days').format('YYYY-MM-DD'); //当前时间的前10天时间
        const time3 = dateUtil().subtract(1, 'months').format('YYYY-MM-DD'); //当前时间的前3个月时间
        const time4 = dateUtil().subtract(3, 'months').format('YYYY-MM-DD'); //当前时间的前3个月时间
        console.log('time:', time);
        console.log('time2:', time2);
        console.log('time3:', time3);
        console.log('time4:', time4);
      };

      const time = dateUtil().format('YYYY-MM-DD');
      const time2 = dateUtil().subtract(3, 'days').format('YYYY-MM-DD'); //当前时间的前10天时间
      const time3 = dateUtil().subtract(1, 'months').format('YYYY-MM-DD'); //当前时间的前3个月时间
      const time4 = dateUtil().subtract(3, 'months').format('YYYY-MM-DD'); //当前时间的前3个月时间

      const demoOptions = ref<array>([
        { label: '全部', value: '' },
        { label: '今天', value: time },
        { label: '最近3天', value: time2 },
        { label: '最近1个月', value: time3 },
        { label: '最近3个月', value: time4 },
      ]);

      // 采购类型 change
      const onChange = (e: Event) => {
        console.log('change event:', e);
        emit('success', getData());
      };
      // 采购类型 OptionsChange
      const onOptionsChange = (option) => {
        console.log('option:', option);
        option.unshift({ label: '全部', value: 0 }); // 头插
      };

      // 时间 change
      const onTimeChange = (e: Event) => {
        console.log('时间 change:', e);
        emit('success', getData());
      };

      // 项目关键词 change
      const onSearch = (value: string) => {
        emit('success', getData());
      };

      const init = () => {
        projectTypeId.value = 0;
        timeDate.value = '';
        proName.value = '';
      };
      const getData = () => {
        const _data = {
          projectTypeId: unref(projectTypeId),
          timeDate: unref(timeDate),
          proName: unref(proName),
        };
        return _data;
      };

      return {
        projectTypeId,
        timeDate,
        proName,
        fun,
        init,

        demoOptions,
        getDictionaryByParentId,
        configStore,
        onChange,
        onTimeChange,
        onSearch,
        getData,
        onOptionsChange,

        msgType: props.msgType,
      };
    },
  });
</script>

<style scoped></style>
