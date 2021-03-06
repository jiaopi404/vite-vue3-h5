import { MenuListGetResultModel } from '../demo/model/systemModel';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  FundsCategory = '/fundsCategory/getFundsCategorySelect',
  FundsCategoryDep = '/fundsCategory/getFundsCategoryDepSelect',
  CentralizeDep = '/dep/getCentralizeDepSelectByOrgId',
  Department = '/dep/getDepartmentByOrgId',
  UserList = '/user/getUserListByDeparId',
  AllUserList = '/user/getUserByRole',
  SaveProject = '/project/saveProject',
  GetPurchaseList = '/purchaseList/getPurchaseListPageByQueryDto',
  SavePurchaseList = '/purchaseList/savePurchaseList',
  DeletePurchase = '/purchaseList/deletePurchaseListById',
  UploadPurchase = '/purchaseList/uploadPurchaseList',
  ImportPurchase = '/purchaseList/importPurchaseList',
  BatchDelete = '/purchaseList/batchDelete',
  GetProjectById = '/project/getProjectById',
  GetProjectByProId = '/project/getProjectByProId',
  GetProjectPage = '/project/getProjectPageByQueryDto',
  DeleteProjectById = '/project/deleteProjectById',
  SubmitVerification = '/project/submitVerification',
  GetFileList = '/file/getProFileMapGroupByFileTypeNameFromProjectId',
  getFileListByObjectIdAndObjectName = '/file/getFileListByObjectIdAndObjectName',
  SaveFile = '/file/saveFile',
  uploadDownload = '/uploadDownload',
  DeleteFileById = '/file/deleteFileById',
  deleteFileAndStatusById = '/file/deleteFileAndStatusById',
  CheckProjectRepeat = '/project/checkProjectRepeat',
  GetDictionaryByParentIdAndNode = '/dic/getDictionaryByParentIdAndNode',
  CheckPurchaseListRepeat = '/purchaseList/checkPurchaseListRepeat',
  GetSpecialDictionaryList = '/dic/getSpecialDictionaryListPlus',
  GetBidSection = '/bidSection/getBidSectionPageByQueryDto',
  CheckBidSectionRepeat = '/bidSection/checkBidSectionRepeat',
  SaveBidSection = '/bidSection/saveBidSection',
  GetBidSectionById = '/bidSection/getBidSectionById',
  GetBidSectionDetailById = '/bidSection/getBidSectionDetailById',
  DeleteBidSection = '/bidSection/deleteBidSectionById',
  BatchModificate = '/purchaseList/batchModificate',
  GetBidList = '/bidSection/queryByproId',
  // ???????????????
  getDepartmentTreeListByOrgIdUrl = '/dep/getDepartmentTreeListByOrgId',
  getDepartmentStringByIdUrl = '/dep/getDepartmentStringById',
  VerificatePublicityDays = '/project/verificatePublicityDays',
  //???????????????
  GetActRuTaskByProcessId = '/ruWaitTask/getActRuTaskByProcessId',
  // ?????? ?????????????????????
  SetToBeUploadedPurchaseFile = '/project/setToBeUploadedPurchaseFile',
  // ??????????????????????????????????????????
  getBidSectionPageByQueryUrl = '/bidSection/getBidSectionPageByQueryDto',
  saveProChangeRecord = '/proChangeRecord/saveProChangeRecord',
  getFundsCategoryById = '/fundsCategory/getFundsCategoryById',
  preservateOfficeExpenses = '/project/preservateOfficeExpenses',
}

// ????????????
export const getFundsCategorySelect = (params?: any) =>
  defHttp.get<MenuListGetResultModel>({ url: Api.FundsCategory, params });
// ??????????????????
export const getFundsCategoryDepSelect = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.FundsCategoryDep, params });
// ??????????????????????????????
export const getCentralizeDepSelectByOrgId = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.CentralizeDep, params });
// ???????????????????????????????????????
export const getDepartmentByOrgId = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.Department, params });
// ??????????????????
export const getDepartmentTreeListByOrgId = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.getDepartmentTreeListByOrgIdUrl, params });
export const getDepartmentStringById = (id: number) =>
  defHttp.post<any>(
    { url: Api.getDepartmentStringByIdUrl, params: id },
    { isTransformResponse: false },
  );
// ???????????????
export const getUserListByDepId = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.UserList, params });

// ?????? ????????????????????????????????????
export const getUserByRole = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.AllUserList, params });

// ????????????
export const savePurchasePlan = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.SaveProject, params });
// ???????????????
export const getPurchaseList = (params: any) =>
  defHttp.post<MenuListGetResultModel>(
    { url: Api.GetPurchaseList, params },
    { isReturnNativeResponse: true },
  );
// ???????????????
export const savePurchaseList = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.SavePurchaseList, params });
// ???????????????
export const deletePurchase = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.DeletePurchase, params });
// ???????????????
export const batchDelete = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.BatchDelete, params });
// ???????????????
export const importPurchase = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.ImportPurchase, params });
// ??????????????????
export const getProjectById = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.GetProjectById, params });
// ????????????????????????
export const getProjectByProId = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.GetProjectByProId, params });
// ?????????????????? ??????
export const getFileList = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.GetFileList, params });
export const getFileListByObjectIdAndObjectName = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.getFileListByObjectIdAndObjectName, params });
// ?????????????????????
export const getProjectPage = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.GetProjectPage, params });
// ???????????????
export const deleteProjectById = (params: any) =>
  defHttp.post<MenuListGetResultModel>(
    { url: Api.DeleteProjectById, params },
    { isTransformResponse: false },
  );
// ????????? ??????
export const submitVerification = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.SubmitVerification, params });
export const verificatePublicityDays = (params: any) =>
  defHttp.post<any>({ url: Api.VerificatePublicityDays, params });
// ???????????? ??????
export const saveFile = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.SaveFile, params });
// ???????????? ??????
export const deleteFileById = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.DeleteFileById, params });
export const deleteFileAndStatusById = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.deleteFileAndStatusById, params });
// ???????????? ??????
export const checkProjectRepeat = (params: any) =>
  defHttp.post({ url: Api.CheckProjectRepeat, data: params });
// ???node?????????
export const getDictionaryByParentIdAndNode = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.GetDictionaryByParentIdAndNode, params });
// ???node?????????
export const checkPurchaseListRepeat = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.CheckPurchaseListRepeat, params });
// ???node?????????
export const getSpecialDictionaryList = (params: any) =>
  defHttp.post<any>({ url: Api.GetSpecialDictionaryList, params });
// ????????????
export const getBidSection = (params: any) =>
  defHttp.post<MenuListGetResultModel>(
    { url: Api.GetBidSection, params },
    { isTransformResponse: false },
  );
// ??????????????????
export const checkBidSectionRepeat = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.CheckBidSectionRepeat, params });
// ????????????
export const saveBidSection = (params: any) => defHttp.post({ url: Api.SaveBidSection, params });
export const getBidSectionById = (bidSectionId) =>
  defHttp.post({ url: Api.GetBidSectionById, data: bidSectionId });
export const getBidSectionDetailById = (bidSectionId) =>
  defHttp.post({ url: Api.GetBidSectionDetailById, data: bidSectionId });
// ????????????
export const deleteBidSection = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.DeleteBidSection, params });
// ??????????????????
export const batchModificate = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.BatchModificate, params });
// ??????????????????
export const getBidList = (params: any) => defHttp.post({ url: Api.GetBidList, params });
//  ???????????????
export const getActRuTaskByProcessId = (params: any) =>
  defHttp.post<any>({ url: Api.GetActRuTaskByProcessId, data: params });
// ???????????????????????????
export const setToBeUploadedPurchaseFile = ({ projectId, bidSectionId }) =>
  defHttp.post<any>(
    { url: Api.SetToBeUploadedPurchaseFile, data: { projectId, bidSectionId } },
    { isTransformResponse: false },
  );

// // ??????????????????????????????????????????
export const getBidSectionPageByQuery = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.getBidSectionPageByQueryUrl, params });
// ???????????????
export const saveProChangeRecord = (params: any) =>
  defHttp.post<any>({ url: Api.saveProChangeRecord, params });
// ??????????????????
export const getFundsCategoryById = (id) =>
  defHttp.post({ url: Api.getFundsCategoryById, data: id });
// ??????????????????
export const preservateOfficeExpenses = (id) =>
  defHttp.post({ url: Api.preservateOfficeExpenses, data: id });
