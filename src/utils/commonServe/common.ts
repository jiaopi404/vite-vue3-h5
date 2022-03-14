/**
 * common 通用方法
 * 1. debounce 使用 useDebounceFn
 * 2. throttle 使用 useThrottleFn
 */

import { CommonTree, PathVariableParesI } from './typing';
import { decodeByBase64, encryptByBase64 } from '/@/utils/cipher';

/**
 * object to base64
 * @param obj
 * @returns
 */
export function objToBase64(obj: Recordable): string {
  return encryptByBase64(JSON.stringify(obj));
}

/**
 * base64 to obj
 * @param base64Str
 * @returns
 */
export function base64ToObj(base64Str: string): Recordable {
  return JSON.parse(decodeByBase64(base64Str));
}

/**
 * 树转扁平化数据方法
 * @param data CommonTree[]
 * @param fn 参数 item
 * @return T[]
 */
export function treeFlat<T>(data: CommonTree[], fn: (CommonTree) => T) {
  const result: T[] = [];
  data.forEach((item) => {
    result.push(fn(item));
    if (item.children && item.children.length) {
      result.push(...treeFlat(item.children, fn));
    }
  });
  return result;
}

/**
 * 扁平专属
 * @param data
 * @param fields 字段名
 * @returns {*}
 */
export function flatToTree(
  data: CommonTree[],
  fields = { ID: 'id', PARENT: 'parentId', CHILDREN: 'children' },
) {
  if (typeof fields !== 'object') {
    fields = { ID: 'id', PARENT: 'parentId', CHILDREN: 'children' };
  }
  const ID = fields.ID || 'id';
  const PARENT = fields.PARENT || 'parentId';
  const CHILDREN = fields.CHILDREN || 'children';
  const parentIdMap: { root: CommonTree[] } = {
    root: [],
  };
  data.forEach((item) => {
    if (!item[PARENT]) {
      parentIdMap['root'].push(item);
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(parentIdMap, item[PARENT])) {
      parentIdMap[item[PARENT]] = [];
    }
    parentIdMap[item[PARENT]].push(item);
  });
  const result = {};
  connector(result, 'root', parentIdMap, { CHILDREN, ID });
  // console.log(result.children)
  return result[CHILDREN];
}

/**
 * 作为转树的 连接器 使用，不用导出
 * @param result
 * @param key
 * @param parentMap
 * @param param3
 * @returns
 */
function connector(result, key, parentMap, { CHILDREN, ID }) {
  if (parentMap[key]) {
    result[CHILDREN] = parentMap[key];
    result[CHILDREN].forEach((item) => {
      connector(item, item[ID], parentMap, { CHILDREN, ID });
    });
  } else {
    return result;
  }
}

/**
 * 树 找到某个节点 的方法
 * @param data []
 * @param fn 参数 item
 * @return {*|null|obj}
 */
export function treeFind(data: CommonTree[], fn: (CommonTree) => boolean) {
  // treeFind 方法找到某个节点
  for (const item of data) {
    if (fn(item)) {
      // 找到, 返回节点
      return item;
    }
    if (item.children && item.children.length) {
      const tmpResult = treeFind(item.children, fn);
      if (tmpResult) {
        return tmpResult;
      }
    }
  }
  return null;
}

/**
 * tree for each
 * @param data
 * @param fn
 * @param level
 */
export function treeForEach(data: CommonTree[], fn, level = 0) {
  level = 0;
  data.forEach((item) => {
    fn(item, level);
    if (item.children && item.children.length) {
      treeForEach(item.children, fn, level + 1);
    }
  });
}

/**
 * 树归并方法
 * @param data 树数据
 * @param fn 迭代器, 参数 (prev, item, index)
 * @param prev 归并初始值, 默认 0
 * @return {*}
 */
export function treeReduce(data: CommonTree[], fn, prev: any = 0) {
  data.forEach((item, index) => {
    prev = fn(prev, item, index);
    if (item.children && item.children.length) {
      prev = treeReduce(item.children, fn, prev);
    }
  });
  return prev;
}

/**
 * 将树节点中，children 列表为空列表的 设置为 undefined; 有副作用
 */
export function setEmptyChildrenToUndefinedWithEffect(item: CommonTree) {
  if (!item.children || !item.children.length) {
    item.children = undefined;
  }
}

/**
 * 数字 转万，保留两位小数
 * @param num
 * @return {number}
 */
export function to10Thousand(num: number) {
  return toFixedNumber(num, 6);
}

/**
 * 判断两个数字是否在误差范围内相等
 * @param num1
 * @param num2
 * @param precision 精度， 10^-precision
 * @return {boolean}
 */
export function ifNumberEqual(num1: number, num2: number, precision = 6) {
  return Math.abs(num1 - num2) < Math.pow(10, -1 * precision);
}

/**
 * 获取欢迎语
 * @returns string
 */
export function getGreetingNote() {
  const hour = new Date().getHours();
  if (hour < 5) {
    return '晚上好';
  } else if (hour >= 5 && hour < 9) {
    return '早上好';
  } else if (hour >= 9 && hour < 11) {
    return '上午好';
  } else if (hour >= 11 && hour < 13) {
    return '中午好';
  } else if (hour >= 13 && hour < 18) {
    return '下午好';
  } else if (hour >= 18) {
    return '晚上好';
  }
}

/**
 * 小数位格式化，最终结果 Number
 * @param num
 * @param precision
 * @returns {number}
 */
export function toFixedNumber(num: number, precision = 2) {
  if (typeof num !== 'number' || !num) {
    return 0;
  }
  return Number(num.toFixed(precision));
}

/**
 * 获取值
 * @param row
 * @param prop
 * @return {null|*}
 */
export function valueGetter(row, prop) {
  let value = row;
  if (prop === '') {
    return row;
  }
  try {
    const propList = prop.split('.');
    propList.forEach((propItem) => {
      value = value[propItem];
    });
    return value;
  } catch (err) {
    // 空指针错误一般是
    return null;
  }
}

/**
 * 生成 uuid
 * @return {string}
 */
export function uuid(divider = '-') {
  const s: any[] = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = divider;

  const uuid = s.join('');
  return uuid;
}

/**
 * 删除某个元素
 * @param arr any[]
 * @param args any[]
 */
export function deleteElements(arr, ...args) {
  args.forEach((toDelItem) => {
    const _index = arr.findIndex((item) => Object.is(item, toDelItem));
    if (_index > -1) {
      arr.splice(_index, 1);
    }
  });
}

/**
 * 日期转汉字
 * @param date yyyy-mm-dd
 */
export function CNDateString(date: Date) {
  const cn = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const arr: any[] = [];
  const YY = date.getFullYear().toString();
  for (let i = 0; i < YY.length; i++) {
    if (cn[YY.charAt(i)]) {
      arr.push(cn[YY.charAt(i)]);
    }
  }
  arr.push(',');
  const MM = date.getMonth() + 1;
  if (MM < 10) {
    arr.push(cn[MM]);
  } else if (MM < 20) {
    if (MM === 10) {
      arr.push('十');
    } else {
      arr.push('十' + cn[MM % 10]);
    }
  }
  arr.push(',');
  const DD = date.getDate();
  if (DD < 10) {
    arr.push(cn[DD]);
  } else if (DD < 20) {
    if (DD === 10) {
      arr.push('十');
    } else {
      arr.push('十' + cn[DD % 10]);
    }
  } else if (DD < 30) {
    if (DD === 20) {
      arr.push('二十');
    } else {
      arr.push('二十' + cn[DD % 10]);
    }
  } else {
    if (DD === 30) {
      arr.push('三十');
    } else {
      arr.push('三十' + cn[DD % 10]);
    }
  }
  return arr.join('').split(',');
}

/**
 * 数组切割 为 二维数组
 * @param data 需要切割的数组
 * @param sectionSize 切片数量
 */
export function arraySplice(data: any[], sectionSize: number) {
  let num = 0;
  const _data: any[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i % sectionSize == 0 && i != 0) {
      _data.push(data.slice(num, i));
      num = i;
    }
    if (i + 1 == data.length) {
      _data.push(data.slice(num, i + 1));
    }
  }
  return _data;
}

/**
 * 数字转中文数字
 * @param money
 * @returns
 */
export function numberToChinese(money) {
  if (money === 0 || Number(money) === 0 || !money) {
    return '零元整';
  }
  //  将数字金额转换为大写金额
  const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']; //汉字的数字
  const cnIntRadice = ['', '拾', '佰', '仟']; //基本单位
  const cnIntUnits = ['', '万', '亿', '万亿']; //对应整数部分扩展单位
  const cnDecUnits = ['角', '分', '毫', '厘']; //对应小数部分单位
  const cnInteger = '整'; //整数金额时后面跟的字符
  const cnIntLast = '元'; //整数完以后的单位
  //最大处理的数字
  // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
  const maxNum = 9999999999999.9999;
  //输出的中文金额字符串
  let chineseStr = '';
  // let parts; //分离金额后用的数组，预定义
  if (money == '') {
    return '';
  }

  money = parseFloat(money);
  if (money >= maxNum) {
    //超出最大处理数字
    return '超出最大处理数字';
  }
  if (money == 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger;
    return chineseStr;
  }

  //四舍五入保留两位小数,转换为字符串
  money = Math.round(money * 100).toString();
  //金额整数部分
  const integerNum = money.substr(0, money.length - 2);
  //金额小数部分
  const decimalNum = money.substr(money.length - 2);

  //获取整型部分转换
  if (parseInt(integerNum, 10) > 0) {
    let zeroCount = 0;
    const IntLen = integerNum.length;
    for (let i = 0; i < IntLen; i++) {
      const n = integerNum.substr(i, 1);
      const p = IntLen - i - 1;
      const q = p / 4;
      const m = p % 4;
      if (n == '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0];
        }
        //归零
        zeroCount = 0;
        chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
      }
      if (m == 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q];
      }
    }
    chineseStr += cnIntLast;
  }
  //小数部分
  if (decimalNum != '') {
    const decLen = decimalNum.length;
    for (let i = 0; i < decLen; i++) {
      const n = decimalNum.substr(i, 1);
      if (n != '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (chineseStr == '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum == '' || /^0*$/.test(decimalNum)) {
    chineseStr += cnInteger;
  }
  return chineseStr;
}

/**
 * 数字转千分位
 * @param num
 * @param fractionDigits 小数位数
 * @return {string}
 */
export function toThousand(num: number, fractionDigits: number) {
  fractionDigits = fractionDigits || 0;
  if (typeof num !== 'number') {
    num = Number(num);
  }
  if (fractionDigits > 0 && num) {
    num = Math.round(num * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);
  }
  const numStr = (num || 0).toString();
  const arr = numStr.split('.');
  let int = arr[0]; // 整数部分
  let decimal = arr[1] || 0; // 小数
  // 处理整数
  const pattern = /(?=(?!(\b))(\d{3})+$)/g;
  int = int.replace(pattern, ',');
  // 处理小数
  // if fractionDigits = 6 表示万元，小数位数 < 2 时， 格式化到 2 位， 2 - 6 位之间，格式化到 2 - 6 位， 6位以上， 格式化到 6 位
  if (fractionDigits === 6) {
    if (!decimal || (typeof decimal === 'string' && decimal.length <= 2)) {
      fractionDigits = 2;
    } else if (typeof decimal === 'string' && decimal.length <= 6 && decimal.length > 2) {
      fractionDigits = decimal.length;
    } else {
      fractionDigits = 6;
    }
  }
  decimal = Number('0.' + decimal).toFixed(fractionDigits);
  return decimal === '0' ? int : int + '.' + decimal.split('.')[1];
}

/**
 * 使用 json 工具克隆对象
 * @param obj
 * @returns
 */
export function cloneDeepJSON(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * @description promise 版 debounce
 * @author jiaopi404
 * @date 24/11/2021
 * @export
 * @param {*} inner
 * @param {number} [ms=0]
 * @returns {*}
 */
export function debouncePromise(inner, ms = 0): () => Promise<any> {
  let timer: TimeoutHandle;
  let resolves: any[] = [];

  return function (...args) {
    // Run the function after a certain amount of time
    clearTimeout(timer);
    timer = setTimeout(() => {
      // Get the result of the inner function,then apply it to the resolve function of
      // each promise that has been created since the last time the inner function was run
      const result = inner(...args);
      resolves.forEach((r: any) => r(result));
      resolves = [];
    }, ms);

    return new Promise((r: any) => resolves.push(r));
  };
}

export class PathVariableParser {
  delimiterPattern = '{$}'; // $ 作占位符
  constructor(delimiterPattern = '{$}') {
    this.delimiterPattern = delimiterPattern;
  }

  parse(url: string, pathVariablePares: PathVariableParesI): string {
    for (const key of Object.keys(pathVariablePares)) {
      const keyDelimiterPattern = new RegExp(this.delimiterPattern.replace('$', key), 'g');
      url = url.replace(keyDelimiterPattern, pathVariablePares[key] + '');
    }
    return url;
  }
}

/**
 * 从数组中移除某个元素
 * @param arr
 * @param item
 */
export function removeItemFromArr(arr: any[], item: any): boolean {
  let index = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === item) {
      index = i;
      break;
    }
  }
  if (index !== -1) {
    arr.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * 等待某个 逻辑判断
 * @param func 返回 boolean
 * @param rejectTimeout 超时 reject 防止无限等待
 * @returns
 */
export function waitForPromise(func, rejectTimeout = 3000): Promise<void> {
  let intervalId: NodeJS.Timer;
  let timeoutId: NodeJS.Timer;
  return new Promise((resolve, reject) => {
    intervalId = setInterval(() => {
      if (func()) {
        resolve();
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      }
    }, 17);
    timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      reject(new Error('等待超时'));
    }, rejectTimeout);
  });
}

/**
 * 获取文件拓展名
 * @param fileName
 * @returns
 */
export function getFileExt(fileName) {
  const _tmp = fileName.split('.');
  if (_tmp.length < 2) {
    throw new Error('文件名称错误');
  }
  return `.${_tmp[_tmp.length - 1]}`;
}

/**
 *
 * @param file
 * @returns
 */
export async function readImgSize(file): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (theFile) {
      const image = new Image();
      // @ts-ignore
      image.src = theFile?.target.result ?? '';
      image.onload = function () {
        // @ts-ignore
        const imgWidth = this.width;
        // @ts-ignore
        const imgHeight = this.height;
        resolve({ width: imgWidth, height: imgHeight });
      };
    };
    reader.readAsDataURL(file);
  });
}
