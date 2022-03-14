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
  // 申报部门树
  getDepartmentTreeListByOrgIdUrl = '/dep/getDepartmentTreeListByOrgId',
  getDepartmentStringByIdUrl = '/dep/getDepartmentStringById',
  VerificatePublicityDays = '/project/verificatePublicityDays',
  //查看审核流
  GetActRuTaskByProcessId = '/ruWaitTask/getActRuTaskByProcessId',
  // 设为 待上传采购文件
  SetToBeUploadedPurchaseFile = '/project/setToBeUploadedPurchaseFile',
  // 采购管理待采购的列表展示接口
  getBidSectionPageByQueryUrl = '/bidSection/getBidSectionPageByQueryDto',
  saveProChangeRecord = '/proChangeRecord/saveProChangeRecord',
  getFundsCategoryById = '/fundsCategory/getFundsCategoryById',
  preservateOfficeExpenses = '/project/preservateOfficeExpenses',
}

// 经费类别
export const getFundsCategorySelect = (params?: any) =>
  defHttp.get<MenuListGetResultModel>({ url: Api.FundsCategory, params });
// 经费主管部门
export const getFundsCategoryDepSelect = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.FundsCategoryDep, params });
// 业务归口管理部门下拉
export const getCentralizeDepSelectByOrgId = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.CentralizeDep, params });
// 项目负责部门、申报部门下拉
export const getDepartmentByOrgId = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.Department, params });
// 申报部门下拉
export const getDepartmentTreeListByOrgId = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.getDepartmentTreeListByOrgIdUrl, params });
export const getDepartmentStringById = (id: number) =>
  defHttp.post<any>(
    { url: Api.getDepartmentStringByIdUrl, params: id },
    { isTransformResponse: false },
  );
// 项目负责人
export const getUserListByDepId = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.UserList, params });

// 获取 当前单位所有的项目负责人
export const getUserByRole = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.AllUserList, params });

// 添加采购
export const savePurchasePlan = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.SaveProject, params });
// 采购单分页
export const getPurchaseList = (params: any) =>
  defHttp.post<MenuListGetResultModel>(
    { url: Api.GetPurchaseList, params },
    { isReturnNativeResponse: true },
  );
// 采购单保存
export const savePurchaseList = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.SavePurchaseList, params });
// 采购单删除
export const deletePurchase = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.DeletePurchase, params });
// 导入采购单
export const batchDelete = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.BatchDelete, params });
// 导入采购单
export const importPurchase = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.ImportPurchase, params });
// 采购项目回显
export const getProjectById = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.GetProjectById, params });
// 采购项目回显优化
export const getProjectByProId = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.GetProjectByProId, params });
// 采购相关文件 回显
export const getFileList = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.GetFileList, params });
export const getFileListByObjectIdAndObjectName = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.getFileListByObjectIdAndObjectName, params });
// 采购项目待提交
export const getProjectPage = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.GetProjectPage, params });
// 待提交删除
export const deleteProjectById = (params: any) =>
  defHttp.post<MenuListGetResultModel>(
    { url: Api.DeleteProjectById, params },
    { isTransformResponse: false },
  );
// 待提交 提交
export const submitVerification = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.SubmitVerification, params });
export const verificatePublicityDays = (params: any) =>
  defHttp.post<any>({ url: Api.VerificatePublicityDays, params });
// 文件上传 提交
export const saveFile = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.SaveFile, params });
// 文件删除 提交
export const deleteFileById = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.DeleteFileById, params });
export const deleteFileAndStatusById = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.deleteFileAndStatusById, params });
// 项目名称 判重
export const checkProjectRepeat = (params: any) =>
  defHttp.post({ url: Api.CheckProjectRepeat, data: params });
// 带node的字典
export const getDictionaryByParentIdAndNode = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.GetDictionaryByParentIdAndNode, params });
// 带node的字典
export const checkPurchaseListRepeat = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.CheckPurchaseListRepeat, params });
// 带node的字典
export const getSpecialDictionaryList = (params: any) =>
  defHttp.post<any>({ url: Api.GetSpecialDictionaryList, params });
// 标段分页
export const getBidSection = (params: any) =>
  defHttp.post<MenuListGetResultModel>(
    { url: Api.GetBidSection, params },
    { isTransformResponse: false },
  );
// 标段名称重复
export const checkBidSectionRepeat = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.CheckBidSectionRepeat, params });
// 标段保存
export const saveBidSection = (params: any) => defHttp.post({ url: Api.SaveBidSection, params });
export const getBidSectionById = (bidSectionId) =>
  defHttp.post({ url: Api.GetBidSectionById, data: bidSectionId });
export const getBidSectionDetailById = (bidSectionId) =>
  defHttp.post({ url: Api.GetBidSectionDetailById, data: bidSectionId });
// 删除标段
export const deleteBidSection = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.DeleteBidSection, params });
// 修改所在标段
export const batchModificate = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.BatchModificate, params });
// 修改所在标段
export const getBidList = (params: any) => defHttp.post({ url: Api.GetBidList, params });
//  查看审核流
export const getActRuTaskByProcessId = (params: any) =>
  defHttp.post<any>({ url: Api.GetActRuTaskByProcessId, data: params });
// 设为待上传采购文件
export const setToBeUploadedPurchaseFile = ({ projectId, bidSectionId }) =>
  defHttp.post<any>(
    { url: Api.SetToBeUploadedPurchaseFile, data: { projectId, bidSectionId } },
    { isTransformResponse: false },
  );

// // 采购管理待采购的列表展示接口
export const getBidSectionPageByQuery = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.getBidSectionPageByQueryUrl, params });
// 变更供应商
export const saveProChangeRecord = (params: any) =>
  defHttp.post<any>({ url: Api.saveProChangeRecord, params });
// 获取经费类别
export const getFundsCategoryById = (id) =>
  defHttp.post({ url: Api.getFundsCategoryById, data: id });
// 获取经费类别
export const preservateOfficeExpenses = (id) =>
  defHttp.post({ url: Api.preservateOfficeExpenses, data: id });
