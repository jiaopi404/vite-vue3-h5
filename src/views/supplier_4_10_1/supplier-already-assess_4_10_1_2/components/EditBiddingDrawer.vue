<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="register"
    :wrapClassName="prefixCls"
    title="查看"
    width="500px"
    @close="closeHandler"
  >
    <Form>
      <Row class="enter-x" style="padding-left: 80px">
        <Col :span="24">
          <template v-for="item in statusList" :key="`${item.value}`">
            <div class="basic-info-content">
              <div class="value pull-left">
                {{ item.name }}
              </div>
              <div class="pull-right">
                <div class="value">
                  <Rate v-model:value="item.evaluatingIndicator" :allowHalf="true" disabled>{{
                    item.value
                  }}</Rate>
                </div>
              </div>
            </div>
          </template>
        </Col>
      </Row>
    </Form>
    <BasicForm @register="registerForm">
      <template #purchaseFile="{ model, field }">
        <LxBasicUploadTest
          v-model:value="model[field]"
          :multiple="true"
          @change="changeHandlerLxBasicUploadFile"
          :control="false"
        />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { editRoleFormSchema } from '../schemas';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Rate, Form, Row, Col } from 'ant-design-vue';
  import { LxBasicUploadTest } from '/@/components/LxComponents';
  import { useDrawerInner, BasicDrawer } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import { useConfigStoreWithOut } from '/@/store/modules/config';
  import { getProEvaluateByBidSectionId } from '/@/api/review-node/biddingCompany';
  import { useUserStore } from '/@/store/modules/user';
  import { CustomMsgEnum } from '/@/enums/messageEnum';
  import {
    deleteFileById,
    saveBidSection,
    saveFile,
    getFileListByObjectIdAndObjectName,
  } from '/@/api/purchase/plan-purchase';
  // state
  const configStore = useConfigStoreWithOut();
  const { prefixCls } = useDesign('upload-purchase-file-drawer');
  const recordId = ref<Nullable<number>>(null); // 是否更新
  const proEvaluateId = ref<Nullable<number>>(null);
  const biddingCompanyId = ref<Nullable<number>>(null); // 是否更新
  const statusList = ref<any[]>([]);
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const emit = defineEmits(['success']);
  const statuId: any = ref(0);
  const [registerForm, { resetFields, setFieldsValue }] = useForm({
    schemas: editRoleFormSchema,
    labelWidth: 115,
    showActionButtonGroup: false,
  });
  const [register, { changeLoading }] = useDrawerInner(async (data) => {
    try {
      resetFields(); // 重置表单
      changeLoading(true);
      recordId.value = data.record.id;
      biddingCompanyId.value = data.biddingCompany ? data.biddingCompany.id : null;
      statuId.value = data.record.status.id;
      const statuList = await getDictionaryByParentId(
        configStore.GET_CONFIG_DICTIONRY.supplierEvaluateId,
      );
      statusList.value = statuList.map((item) => ({
        ...item,
        value: item.code,
        label: item.name,
        evaluatingIndicator: 0,
      }));
      const _roleInfo = await getProEvaluateByBidSectionId({
        bidSectionId: data.record.id,
        successfulSupplierId: biddingCompanyId.value,
      });
      if (_roleInfo) {
        statusList.value = JSON.parse(_roleInfo.evaluatingIndicator);
      }
      proEvaluateId.value = _roleInfo ? _roleInfo.id : null;
      setFieldsValue({
        ..._roleInfo,
      });
      if (proEvaluateId.value) {
        await getFileListRef();
      }
      setFieldsValue({ purchaseFile: fileListRef.value?.[0] ? fileListRef.value?.[0]?.list : [] });
    } finally {
      changeLoading(false);
    }
  });

  // BLOCK: form options
  const fileListRef = ref<any>([]); // 附件列表
  const getFileListRef = async () => {
    const resData = await getFileListByObjectIdAndObjectName({
      objectId: proEvaluateId.value,
      objectName: 'pro_Evaluate',
    });
    if (resData) {
      fileListRef.value.push({
        fileType: {},
        list: resData,
      });
    }
  };
  const changeHandlerLxBasicUploadFile = async (fileList, file, flag) => {
    if (flag === 'remove') {
      if (file.status !== 'error') {
        handleDeleteFile(fileList, file);
      }
    }
    if (flag === 'add') {
      const fileType = fileListRef.value?.[0]?.fileType;
      const _file = file;
      const obj = {
        objectId: proEvaluateId.value,
        objectName: 'pro_Evaluate',
        fileTypeId: fileType?.id,
        name: _file.name,
        url: _file.url,
        size: _file.size,
        addUserId: userStore.getUserInfo.id,
      };
      const res: any = await saveFile(obj);
      file.id = res.id;
      const bidSectionInfo = {
        id: recordId.value,
        ifUploadProcurementDocuments: 1,
      };
      await saveBidSection(bidSectionInfo);
    }
  };
  const handleDeleteFile = async (fileList, file) => {
    if (!file.id) {
      // 本地删除
      return;
    }
    await deleteFileById(file.id);
    createMessage.success(CustomMsgEnum.DEL_SUCCESS);
    const fileIdList = fileList.map((item) => item.id);
    if (!fileIdList.length) {
      const bidSectionInfo = {
        id: recordId.value,
        ifUploadProcurementDocuments: 0,
      };
      await saveBidSection(bidSectionInfo);
    }
  };
  const closeHandler = () => {
    recordId.value = null;
    proEvaluateId.value = null;
    fileListRef.value = [];
    setFieldsValue({ purchaseFile: [] });
    emit('success');
  };
</script>
<style lang="less">
  .basic-info-content {
    display: flex;
    margin-bottom: 5px;
    line-height: 30px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    .value {
      font-size: 14px;
    }
    .pull-left {
      text-align: right;
      width: 20%;
    }
    .pull-right {
      width: 80%;
    }
  }
</style>
