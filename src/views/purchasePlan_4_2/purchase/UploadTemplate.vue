<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    title="导入采购清单"
    :helpMessage="getHelpText2"
    @ok="handleOk"
    @visible-change="visibleChange"
  >
    <Alert class="alertInfo" :message="getHelpText" type="info" banner />
    <upload
      name="file"
      :show-upload-list="false"
      accept="application/vnd.ms-excel,
      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      :action="apiUrl + '/purchaseList/uploadPurchaseList'"
      :before-upload="beforeUpload"
      @change="handleChange"
      style="display: block; text-align: right"
    >
      <!-- :show-upload-list="false" -->
      <a-button type="primary" preIcon="carbon:cloud-upload"> 导入采购清单 </a-button>
    </upload>
    <div class="messageBox" v-show="isShow">
      <div>
        <a-button>总数：{{ totalList }}</a-button>
        <a-button>成功: {{ successList }}</a-button>
        <a-button>失败：{{ totalList - successList ? totalList - successList : '' }}</a-button>
      </div>
      <a :href="errorUrl" target="_blank"> <a-button type="link">点击下载</a-button> </a
      >查看失败原因
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { Tooltip } from 'ant-design-vue';
  import { defineComponent, ref, onMounted } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Upload, Alert } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { importPurchase } from '/@/api/purchase/plan-purchase';
  import { useGlobSetting } from '/@/hooks/setting';
  export default defineComponent({
    components: { BasicModal, Upload, Alert, Tooltip },
    emits: ['success'],
    props: {
      projectId: {
        type: Number,
      },
    },
    setup(props, { emit }) {
      // let getHelpText = '说明';
      let getHelpText = `说明： \n1、名称：2~50位汉字、符号、字母或数字；\n2、品牌：1~50位汉字、符号、字母或数字；\n3、计量单位：1~10位汉字、符号、字母或数字；\n4、采购数量：1.00~200000.00之间的数字；\n5、单价：0~1000000000.00之间的数字；\n6、技术参数：1~10000位汉字、符号、字母或数字。\n请严格按照以上说明要求导入数据。`;
      let getHelpText2 = [
        '说明：',
        '1、名称：2~50位汉字、符号、字母或数字；',
        '2、品牌：1~50位汉字、符号、字母或数字；',
        '3、计量单位：1~10位汉字、符号、字母或数字；',
        '4、采购数量：1.00~200000.00之间的数字；',
        '5、单价：0~1000000000.00之间的数字；',
        '6、技术参数：1~10000位汉字、符号、字母或数字。',
        '请严格按照以上说明要求导入数据。',
      ];
      const { createMessage } = useMessage();
      const [register, { closeModal, setModalProps, changeOkLoading }] = useModalInner();

      const totalList = ref<number>(-999); //总数
      const successList = ref<number>(-999); // 成功
      const errorUrl = ref<string>(''); // 失败模板
      const isShow = ref<boolean>(false); // 失败模板
      const apiUrl = ref('');
      const globSetting = useGlobSetting();
      apiUrl.value = globSetting.apiUrl;
      onMounted(() => {
        setModalProps({
          canFullscreen: false,
          showCancelBtn: false,
          showOkBtn: true,
        });
      });

      // 限制用户上传行为
      const beforeUpload = (file) => {
        // 仅允许excel文件格式
        // let fileType = ''
        // let isAllowFileDeliver = [
        //   'application/vnd.ms-excel',
        //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // ];
        // if (file.type === '') {
        //   isAllowFileDeliver = ['xls', 'xlsx'];
        //   fileType = file.name.substring(file.name.lastIndexOf('.') + 1);
        // } else {
        //   fileType = file.type;
        // }
        // if (isAllowFileDeliver.findIndex((item) => { item === fileType }) === -1) {
        //   return false;
        // }else{
        //   return true;
        // }
      };

      const handleChange = (info) => {
        console.log('info', info);
        if (info.file.status === 'uploading') {
          changeOkLoading(true);
        }
        if (info.file.status === 'done') {
          // 调用接口获取导入信息
          getImportUserMsg(info.file.response.data.url);
          changeOkLoading(false);
          isShow.value = true;
        }
        if (info.file.status === 'error') {
          createMessage.error('错误：导入采购清单失败！');
          changeOkLoading(false);
        }
      };

      // 获取导入信息
      const getImportUserMsg = async (url: string) => {
        try {
          let resData: any = await importPurchase({
            projectId: props.projectId,
            filePath: url,
          });
          console.log('resDta', resData);
          if (!resData) {
            createMessage.error('错误：采购清单模板错误');
          } else if (resData.errorUrl) {
            createMessage.error('失败：导入采购清单失败');
          } else {
            emit('success');
            createMessage.success('成功：导入采购清单成功');
          }
          totalList.value = resData?.allCount; // 总数
          successList.value = resData?.list; // 成功
          errorUrl.value = resData?.errorUrl; // 失败模板
        } catch (error) {
          console.log(error);
        }
      };

      const handleOk = async () => {
        closeModal();
        emit('success');
      };

      const visibleChange = async (visible: boolean) => {
        if (!visible) {
          totalList.value = -999; // 总数
          successList.value = -999; // 成功
          errorUrl.value = ''; // 失败模板url
          isShow.value = false;
        }
      };

      return {
        getHelpText,
        getHelpText2,
        register,
        closeModal,
        handleOk,
        visibleChange,
        beforeUpload,
        handleChange,
        totalList,
        successList,
        errorUrl,
        isShow,
        apiUrl,
      };
    },
  });
</script>
<style lang="less">
  .alertInfo {
    white-space: pre-wrap;
  }
</style>
