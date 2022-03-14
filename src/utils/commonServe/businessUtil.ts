import { encryptByBase64 } from '/@/utils/cipher';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import * as TreeHelper from '/@/utils/helper/treeHelper';
import { BidSectionI, DictionaryI, FileI } from '/#/business';
import { useBusinessStoreWithOut } from '/@/store/modules/business';
import { TagModuleNameEnum } from '/@/enums/menuFullPathEnum';
import { getConfigBaseInfoAndSub, getDictionaryByParentId } from '/@/api/demo/system';
import { useMessage } from '/@/hooks/web/useMessage';
import { downloadByUrl } from '../file/download';
import { createImgPreview } from '/@/components/Preview';
import { openWindow } from '..';
import componentSetting from '/@/settings/componentSetting';

/**
 * 初始化, 获取配置
 */
export const getConfig = async () => {
  const configStore = useConfigStoreWithOut();
  const businessStore = useBusinessStoreWithOut();
  try {
    const configId = configStore.configId;
    // console.log('config is', configStore.GET_CONFIG);
    // console.log('config is', configId);
    const config = await getConfigBaseInfoAndSub(configId);
    configStore.SET_CONFIG(config);
    // TODO: 拉字典
    const tagModuleId = configStore.GET_CONFIG_DICTIONRY?.tagModuleId;
    getDictionaryByParentId(tagModuleId)
      .then((res) => {
        businessStore.SET_TAG_MODULE_LIST(transformTagModuleDicList(res));
      })
      .catch((err) => {
        console.log('获取模块字典失败', err);
      });
    // console.log('config is', configStore.GET_CONFIG);
  } catch (error) {
    console.error(error);
  }
};

/**
 * 业务相关的各种函数
 */
/**
 * 获取当前月第一天
 * @returns
 */
export function getFirstDayOfCurrentMonth() {
  const date = new Date();
  date.setDate(1);
  return date;
}

/**
 * @Description: 对象名称通用 filter，默认显示 code-name
 * 使用：{{ scope.row.xxDepartment | codeName }}
 * @author jiaopi404
 * @date 5/19/21
 */
export function codeNameFilter(object, codeNameField = { code: 'code', name: 'name' }) {
  if (
    !codeNameField ||
    !codeNameField.code ||
    typeof codeNameField.code !== 'string' ||
    !codeNameField.name ||
    typeof codeNameField.name !== 'string'
  ) {
    codeNameField = {
      code: 'code',
      name: 'name',
    };
  }
  return object
    ? object[codeNameField.code]
      ? `${object[codeNameField.code]}-${object[codeNameField.name]}`
      : object[codeNameField.name] || '-'
    : '-';
}

/**
 * @description 格式化 person 对象的 perName 和 mobile, 根据配置切换显示电话号码
 * @author jiaopi404
 * @date 02/12/2021
 * @export
 * @returns {*}
 */
export function getPersonNameFormatter() {
  const configStore = useConfigStoreWithOut();
  const ifShowMobilePhone = configStore.GET_CONFIG_BASEINFO?.ifShowMobilePhone;
  return function (person) {
    if (!person) {
      return '';
    }
    const { perName, mobile } = person;
    let _mobile = mobile;
    if (!ifShowMobilePhone && _mobile) {
      const subStr1 = _mobile.slice(0, 3);
      const subStr2 = _mobile.slice(7, 11);
      _mobile = subStr1 + '****' + subStr2;
    }
    if (perName && _mobile) {
      return `${perName}（${_mobile}）`;
    } else {
      return perName || _mobile || '';
    }
  };
}

/**
 * @description 格式化用户列表，添加 value 和 label 字段；
 * @author jiaopi404
 * @date 02/12/2021
 * @export
 * @param {any[]} personList
 * @returns {*}
 */
export function personListFormatter(personList: any[]) {
  const formatter = getPersonNameFormatter();
  return personList.map((person) => ({
    ...person,
    value: person.id,
    label: formatter(person),
  }));
}
export function defaultResultFormatter(result) {
  TreeHelper.forEach(result, (node) => {
    if (node.children && !node.children.length) {
      // 空列表
      Reflect.deleteProperty(node, 'children');
    }
    // TODO: 看哪个字段
    node.name = codeNameFilter(node);
  });
  return result;
}
/**
 * 递归获取名字
 * @param obj
 * @param nameArr
 * @param fields
 * @param connector
 * @returns {*}
 */
export function getNameRecursive(
  obj: any,
  nameArr: any = [],
  fields = { name: 'name', parent: 'parent' },
  connector = '/',
) {
  if (!obj) {
    return nameArr.join(connector);
  } else {
    if (obj.parent) {
      nameArr.push(obj[fields.name]);
    }
    return getNameRecursive(obj.parent, nameArr, fields, connector);
  }
}

/**
 * 根据配置 获取加密后的 电话号码
 * @param mobile
 */
export function getSecretMobile(mobile: string): string {
  const configStore = useConfigStoreWithOut();
  const ifShowMobilePhone = configStore.GET_CONFIG_BASEINFO?.ifShowMobilePhone;
  if (!ifShowMobilePhone && mobile) {
    const subStr1 = mobile.slice(0, 3);
    const subStr2 = mobile.slice(7, 11);
    return subStr1 + '****' + subStr2;
  } else {
    return mobile;
  }
}

/**
 * 获取性别显示
 * @param value
 * @param options
 */
export function getGenderText(
  value: number | string,
  options?: { value: string | number; label: string }[],
): string {
  const defaultOptions = [
    { value: 1, label: '男' },
    { value: 0, label: '女' },
  ];
  const _options = options ? options : defaultOptions;
  return _options.find((opt) => opt.value === value)?.label ?? '-';
}

/**
 * or 参数 使用这个函数进行处理，处理成 base64
 * @param str
 * @returns {string}
 */
export function orParamsFormatter(str: string) {
  return encryptByBase64(encodeURI(str));
}

/**
 * 获取标段字符串
 * @param bidSection
 * @returns
 */
export function getBidSectionSortStr(bidSection) {
  const sort = bidSection?.sort;
  if (sort === 0) {
    return '单标段';
  }
  if (sort) {
    return `第${sort}标段`;
  } else {
    return '-';
  }
}

/**
 * 获取金额
 * @param amount
 * @param curency
 * @returns
 */
export function getAmountWithCurencyName(amount, currencyType) {
  if (currencyType?.name === '人民币') {
    return amount + '元';
  } else {
    return amount + currencyType?.name;
  }
}

/**
 * 获取标段的项目编号
 * 1. 电子竞价 / 询价的项目编号，取值是 项目.采购编号 purchaseNumber
 * 2. 非电子竞价 / 询价的，取值：标段.ProNumber
 *
 * 以上规则废弃
 * 新规则：只显示 bidSection.proNumber
 *
 * @param bidSection
 */
export function getBidSectionProNumber(bidSection: BidSectionI): string {
  // if (bidSection.procurementMethod?.node === '1') {
  //   // 电子竞价询价
  //   return bidSection.project?.purchaseNumber ?? '';
  // }
  return bidSection.proNumber ?? '';
}

/**
 * 转换字典
 * @param dicList
 * @returns
 */
export function transformTagModuleDicList(dicList: DictionaryI[]): DictionaryI[] {
  return dicList.map((item) => {
    return {
      ...item,
      meta: JSON.parse(item.code ?? '{}'),
    };
  });
}

/**
 * 根据 tagModuleName 获取 tagModuleId
 * @param tagModuleName
 * @returns
 */
export function getTagModuleByTagModuleName(tagModuleName: TagModuleNameEnum): DictionaryI {
  const businessStore = useBusinessStoreWithOut();
  const tagModuleList = businessStore.GET_TAG_MODULE_LIST;
  let tagModule;
  for (const module of tagModuleList) {
    if (module?.meta.name === tagModuleName) {
      tagModule = module;
      break;
    }
  }
  return tagModule;
}

/**
 * 预览文件
 * @param file
 */
export function previewFile(file: FileI) {
  const { createMessage } = useMessage();
  const configStore = useConfigStoreWithOut();
  try {
    const { url, name } = file;
    if (!url) {
      throw new Error('无下载地址！');
    }
    // 根据 url 获取 服务器生成的 文件名 和 拓展名
    let fileName;
    let extName;
    const fileNamePattern = /([a-zA-Z0-9]+(\.[a-zA-Z0-9]+))$/;
    const urlMatchResult = url.match(fileNamePattern);
    if (urlMatchResult) {
      fileName = urlMatchResult[1];
      extName = urlMatchResult[2];
      if (!fileName || !extName) {
        throw new Error('下载地址出错！');
      }
    } else {
      throw new Error('下载地址出错！');
    }
    // 根据 拓展名 分发该有的逻辑
    const imgTypeExt = ['.png', '.jpg', '.bmp', '.jpeg', '.gif'];
    const officeTypeExt = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
    switch (true) {
      case imgTypeExt.indexOf(extName) > -1:
        createImgPreview({ imageList: [url], index: 0, destroyOnClose: true });
        break;
      case officeTypeExt.indexOf(extName) > -1:
        const onlyOfficeUrl = configStore.GET_CONFIG_MODULE?.onlyOfficeUrl;
        const _url = `${onlyOfficeUrl}?url=${url}${name ? `&fileName=${name}` : ''}`;

        openWindow(_url, { target: '_blank' });
        break;
      default:
        // 默认本地下载
        downloadByUrl({ url, fileName: name || fileName });
        break;
    }
  } catch (err) {
    console.log('下载错误', err);
    if (err instanceof Error) {
      createMessage.error(err.message || '下载错误！');
    }
  }
}

/**
 * 文件名是不是可接受的图片
 * @param fileName
 * @returns
 */
export function ifImg(fileName) {
  const acceptExt = componentSetting.lxBasicUpload.acceptImgExt;
  for (const ext of acceptExt) {
    const pattern = new RegExp(`\\${ext}$`, 'g');
    if (pattern.test(fileName)) {
      return true;
    }
  }
  return false;
}
