import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetConContractPageByQueryDto = '/conContract/getConContractPageByQueryDto',
  SaveConContract = '/conContract/saveConContract',
}
// ==============================【待签订 已签订】

// 【待签订】

// 获取列表
// conContract/getConContractPageByQueryDto
export const getConContractPageByQueryDto = (data: any) =>
  defHttp.post({ url: Api.GetConContractPageByQueryDto, data });

// 签订合同 保存
// conContract/saveConContract
export const saveConContract = (data: any) => defHttp.post({ url: Api.SaveConContract, data });
