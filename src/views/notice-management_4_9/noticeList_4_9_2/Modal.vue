<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    title="公告详情"
    width="900px"
    :min-height="380"
    :draggable="false"
    :show-cancel-btn="false"
    :show-ok-btn="false"
    :centered="true"
    :can-fullscreen="false"
    :use-wrapper="false"
    @visible-change="handleClose"
  >
    <div id="content-body">
      <div align="center" class="title">{{ title }}</div>
      <div align="center" class="num">
        <span>发布时间：{{ time }}</span>
        <span style="padding-left: 20px" class="no-print">浏览次数：{{ viewingTimes }} </span>
        <span
          id="printBtn"
          style="padding-left: 20px"
          class="no-print"
          @click="printJS('content-body', 'html')"
          >【打印】
        </span>
        <a-divider />
      </div>
      <div id="content" v-html="content"></div>
    </div>
  </BasicModal>
</template>

<script lang="ts">
  import { defineComponent, toRaw, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { renderTime } from '/@/components/Time';
  import { getNoticeById, viewTimesPlus1 } from '/@/api/noticeManagement/noticeManagement';
  import { Divider } from 'ant-design-vue'; // 分割线
  import printJS from 'print-js'; // 打印

  export default defineComponent({
    components: { BasicModal, [Divider.name]: Divider },
    emits: ['register', 'visible-change'],
    setup(_, { emit }) {
      const id = ref(0);
      const title = ref('');
      const time = ref();
      const viewingTimes = ref(0);
      const content = ref('');
      const [register, { closeModal }] = useModalInner(async (data) => {
        id.value = toRaw(data).previewId;
        const res = await getNoticeById(id.value);
        title.value = res.title;
        time.value = renderTime(res.addDateTime, true);
        viewingTimes.value = res.viewingTimes;
        content.value = res.content;
      });
      // 关闭弹窗，浏览次数+1
      async function handleClose(visible: boolean) {
        if (visible === false) {
          await viewTimesPlus1(id.value);
          emit('visible-change', visible);
        }
      }
      return { register, closeModal, title, time, viewingTimes, content, handleClose, printJS };
    },
  });
</script>

<style lang="less" scoped>
  @media print {
    @page {
      size: auto;
      margin: 30px;
    }
    .no-print {
      display: none;
    }
  }
  #content-body {
    min-height: 380px;
    overflow-x: auto;
    border: 1px solid #ccc;
    width: 810px;
    // height: 600px;
    padding: 20px;
    margin: 5px 30px 5px 30px;
    .title {
      font-size: 25px;
      font-weight: 900;
    }
    .num {
      margin: 10px;
      color: #999;
      #printBtn {
        color: #333;
        &:hover {
          color: #108ee9;
        }
      }
    }
  }
</style>
