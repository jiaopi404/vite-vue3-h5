import { Ref } from 'vue';
import { setToBeUploadedPurchaseFile } from '/@/api/purchase/plan-purchase';
import { getReviewNodeByProjectNode } from '/@/api/review-node/proReviewNode';
import { CustomMsgEnum, getCusConfirmTip } from '/@/enums/messageEnum';
import { useMessage } from '/@/hooks/web/useMessage';
import { getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';

const { createMessage, createConfirmPromise } = useMessage();

export function bidSectionMngComp({ reloadBD, openDrawer, proData }) {
  const btnHandlerEditPurchasePlan = async (record) => {
    openDrawer(true, {
      id: record.id,
      proData: proData.value,
    });
  };

  const customHandlerSavePurchasePlanSuccess = () => {
    reloadBD();
  };

  const btnHandlerSetPurchaseFilesWaitUploading = async (record) => {
    await createConfirmPromise({
      content: getCusConfirmTip('设为待上传采购文件'),
    });
    const reviewNode = await getReviewNodeByProjectNode({
      objectId: record.project.id,
      objectName: 'pro_project',
      node: 2,
    });
    if (reviewNode && reviewNode.ifReview && reviewNode.statusId !== 3) {
      // 说明抽取结点未完成
      await createConfirmPromise({
        content: '抽取未完成，确定继续？',
      });
    }
    // 没有 reviewNode 表示没有抽取节点，就不验证了
    // 单标段，调用接口;
    const res = await setToBeUploadedPurchaseFile({ projectId: null, bidSectionId: record.id });
    if (res.msg) {
      createMessage.error(res.msg);
    } else {
      createMessage.success(CustomMsgEnum.SAVE_SUCCESS);
      reloadBD();
    }
  };

  const appendBidSectionFormSchema = async (
    ifBidSectionMng: Ref<any>,
    proData,
    appendSchemaByField,
  ) => {
    if (!ifBidSectionMng.value) {
      return;
    }
    // 采购部门 组织处理人
    appendSchemaByField(
      {
        field: 'purchaseDeptName',
        label: '采购部门',
        component: 'Input',
        colProps: { span: 10 },
        slot: 'purchaseDeptName',
      },
      undefined,
    );
    appendSchemaByField(
      {
        field: 'purchasePerson',
        label: '组织处理人',
        component: 'Input',
        colProps: { span: 10 },
        slot: 'purchasePerson',
      },
      undefined,
    );
    if (proData.biddingCompanyId) {
      // 招标公司 与 业务代理人
      appendSchemaByField(
        {
          field: 'biddingCompanyName',
          label: '招标公司名称',
          component: 'Input',
          colProps: { span: 10 },
          slot: 'biddingCompanyName',
        },
        undefined,
      );
      appendSchemaByField(
        {
          field: 'biddingCompanyPerson',
          label: '业务代理人',
          component: 'Input',
          colProps: { span: 10 },
          slot: 'biddingCompanyPerson',
        },
        undefined,
      );
    }
  };

  const appendBidSectionFormData = async (ifBidSectionMng: Ref<any>, proData, formData) => {
    if (!ifBidSectionMng.value) {
      return;
    }
    const personFormatter = getPersonNameFormatter();
    // 采购部门 组织处理人
    formData.purchaseDeptName = proData.map?.purchaseDeptName;
    formData.purchasePerson = personFormatter({
      perName: proData.map?.purchasePersonName,
      mobile: proData.map?.purchasePersonMobile,
    });
    // 公司
    if (proData.biddingCompanyId) {
      formData.biddingCompanyName = proData.map?.biddingCompanyName;
      formData.biddingCompanyPerson = personFormatter({
        perName: proData.map?.biddingCompanyPersonPerName,
        mobile: proData.map?.biddingCompanyPersonMobile,
      });
    }
  };

  return {
    btnHandlerEditPurchasePlan,
    btnHandlerSetPurchaseFilesWaitUploading,
    appendBidSectionFormSchema,
    appendBidSectionFormData,
    customHandlerSavePurchasePlanSuccess,
  };
}
