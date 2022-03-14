<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    title="导入专家"
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
      :action="apiUrl + '/user/uploadUser'"
      :before-upload="beforeUpload"
      @change="handleChange"
      style="display: block; text-align: right"
    >
      <a-button type="primary" preIcon="carbon:cloud-upload"> 导入专家 </a-button>
    </upload>
    <div class="messageBox" v-show="isShow">
      <div>
        <a-button>总数：{{ totalList }}</a-button>
        <a-button>成功: {{ successList }}</a-button>
        <a-button>失败：{{ totalList - successList }}</a-button>
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
  import { importUserExtend } from '/@/api/libraryManager/libExpert';
  import { useGlobSetting } from '/@/hooks/setting';
  export default defineComponent({
    components: { BasicModal, Upload, Alert, Tooltip },
    emits: ['success'],
    setup(_, { emit }) {
      let getHelpText = `说明： \n1、单位名称：必填项，1~50位汉字，字母或数字；\n2、专家账号：必填项，2~20位汉字，字母或数字；\n3、专家姓名：必填项，2~25位汉字、符号、字母或数字；\n4、联系电话：必填项，11位手机号；\n5、性别：必填项，男，女。\n请严格按照以上说明要求导入数据。`;
      let getHelpText2 = [
        '说明：',
        '1、单位名称：必填项，1~50位汉字，字母或数字；',
        '2、专家账号：必填项，2~20位汉字，字母或数字；',
        '3、专家姓名：必填项，2~25位汉字、符号、字母或数字；',
        '4、联系电话：必填项，11位手机号；',
        '5、性别：必填项，男，女。',
        '请严格按照以上说明要求导入数据。',
      ];
      const { createMessage } = useMessage();
      const [register, { closeModal, setModalProps, changeOkLoading }] = useModalInner();
      const totalList = ref<number>(0); //总数
      const successList = ref<number>(0); // 成功
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
        console.log(file);
      };
      const handleChange = (info) => {
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
          createMessage.error('错误:导入专家失败！');
          changeOkLoading(false);
        }
      };
      // 获取导入信息
      const getImportUserMsg = async (url: string) => {
        try {
          let resData: any = await importUserExtend({ path: url });
          totalList.value = resData.allCount; // 总数
          successList.value = resData.successlist; // 成功
          errorUrl.value = resData.errorUrl; // 失败模板
          // if (resData.errorUrl) {
          //   // createMessage.error('失败:导入专家失败');
          // } else {
          //   emit('success');
          //   // createMessage.success('成功:导入专家成功');
          // }
          emit('success');
        } catch (error) {
          console.log(error);
        }
      };
      const handleOk = async () => {
        closeModal();
      };
      const visibleChange = async (visible: boolean) => {
        if (!visible) {
          totalList.value = 0; // 总数
          successList.value = 0; // 成功
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
