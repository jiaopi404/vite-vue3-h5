<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="评审详情" width="40%">
    <div style="border: 0.1px solid #ccc">
      <table :border="1" cellpadding="8" cellspacing="0" v-if="fromList.addDateTime" class="tb">
        <tr>
          <th>评审人:</th>
          <td :title="fromList.addUserName">{{ fromList.addUserName }}</td>
          <th>评审时间:</th>
          <td colspan="2">{{
            renderTime(fromList.addDateTime, true).substring(
              0,
              renderTime(fromList.addDateTime, true).length - 3,
            )
          }}</td>
        </tr>
        <tr>
          <th class="reviewOpinion">评审意见:</th>
          <td colspan="4" align="left" :title="fromList.reviewOpinion" class="reviewOpinionHigth">{{
            fromList.reviewOpinion.length < 500
              ? fromList.reviewOpinion
              : fromList.reviewOpinion.substring(0, 499) + '...'
          }}</td>
        </tr>
        <tr>
          <th>供应商:</th>
          <td align="left" v-for="(item, index) in fromList.reviewInfo" :key="index">
            {{ item.successfulSupplier }} ({{ item.mobile }})
          </td>
        </tr>
        <tr>
          <th>评审情况:</th>
          <td
            align="left"
            v-for="(item, index) in fromList.reviewInfo"
            :key="index"
            :class="`${item.result == '推荐中标' ? 'col' : ''}`"
          >
            {{ item.result }}
          </td>
        </tr>
      </table>
    </div>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, onUpdated, ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
  import { renderTime } from '/@/components/Time';
  // 引入接口
  import { getProEvaluationRecordById } from '/@/api/projectReview/projectReviewApi';
  export default defineComponent({
    name: 'AddPending',
    components: { BasicDrawer },
    emits: ['success', 'register'],
    setup() {
      const fromList = ref<any>({});
      let prId = ref<any>(null);
      const [registerDrawer, { changeLoading, setDrawerProps }] = useDrawerInner(async (data) => {
        try {
          setDrawerProps({ confirmLoading: false });
          changeLoading(true);
          prId = data.record.prId;
          const res = await getProEvaluationRecordById(prId);
          console.log('res:', res);
          console.log(res.data.reviewInfo, 'console.log(res);console.log(res);');
          res.data.reviewInfo = JSON.parse(res?.data.reviewInfo) || [];
          res.data.reviewInfo.forEach((i) => {
            if (i.result === 1) {
              i.result = '推荐中标';
            } else if (i.result === 2) {
              i.result = '第二候选人';
            } else if (i.result === 3) {
              i.result = '第三候选人';
            }
            i.mobile = getSecretMobile(i.mobile);
          });
          fromList.value = res.data;
          console.log(fromList, 'fromList.value');
        } finally {
          changeLoading(false);
        }
      });
      return {
        registerDrawer,
        onUpdated,
        fromList,
        renderTime,
      };
    },
  });
</script>

<style lang="less" scoped>
  .col {
    font-weight: 600;
    color: #fba626;
  }
  // .tb {

  // }
  th {
    text-align: right;
  }
  td {
    font-size: 12px;
    color: #020202;
    overflow: hidden;
  }
  .td-ailgn {
    text-align: center;
  }
  .reviewOpinion {
    min-width: 60px;
    min-width: 100px;
    // height: 300px;
  }
  .reviewOpinionHigth {
    word-break: break-all;
    word-wrap: break-word;
  }
</style>
