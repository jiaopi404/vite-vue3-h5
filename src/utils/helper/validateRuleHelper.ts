import { Rule } from '/@/components/Form';

/**
 * @description 获取名称规则，只允许中间空格；
 * @author jiaopi404
 * @date 24/11/2021
 * @export
 * @param {number} maxLength 最大长度，最小为 0
 * @param {string} message
 * @param {('blur' | 'change')} [trigger='blur']
 * @returns {*}  {Rule}
 */
export function getNamePatternRule(maxLength: number, trigger: 'blur' | 'change' = 'blur'): Rule {
  return {
    pattern: new RegExp(`^[\\S][\\S\\s]{0,${maxLength - 2}}[\\S]$|^[\\S]?$`, 'g'),
    message: `请输入1至${maxLength}位汉字，符号，字母或数字`,
    trigger,
  };
}
export function getNamePatternNoSpaceRule(
  maxLength: number,
  trigger: 'blur' | 'change' | ['change', 'blur'] = 'blur',
  minLength?: number,
): Rule {
  return {
    pattern: new RegExp(`^[\\S]{${minLength ? minLength : 1},${maxLength}}$`, 'g'),
    message: `请输入${minLength ? minLength : 1}至${maxLength}位汉字，符号，字母或数字`,
    trigger,
  };
}
// 文本域规则
export function getInputTextAreaPattern(
  maxLength: number,
  trigger: 'blur' | 'change' | ['change', 'blur'] = 'blur',
  minLength?: number,
): Rule {
  return {
    pattern: new RegExp(
      `^[\\S][\\S\\s]{${minLength ? minLength : 1},${maxLength - 2}}[\\S]$|^[\\S]?$`,
      'g',
    ),
    message: `请输入${minLength ? minLength : 1}至${maxLength}位汉字，符号，字母或数字`,
    trigger,
  };
}

export function getAccountPatternRule(
  maxLength: number,
  trigger: 'blur' | 'change' = 'blur',
): Rule {
  return {
    pattern: new RegExp(`^[\u4e00-\u9fa5A-Za-z0-9]{2,${maxLength}}$`, 'g'),
    message: `请输入2至${maxLength}位汉字，符号，字母或数字`,
    trigger,
  };
}
export function getPasswordPatternRule(
  maxLength: number,
  trigger: 'blur' | 'change' = 'blur',
): Rule {
  return {
    pattern: new RegExp(`^[\u4e00-\u9fa5A-Za-z0-9]{6,${maxLength}}$`, 'g'),
    message: `推荐使用6至${maxLength}位大小写字母、数字混合使用的密码`,
    trigger,
  };
}

/**
 * 获取 字符串长度的规则
 * @param maxLength 最大长度
 * @param message 显示消息
 * @param trigger
 * @returns
 */
export function getStringMaxLengthRule(
  maxLength: number,
  message: string,
  trigger: 'blur' | 'change' = 'blur',
): Rule {
  return {
    type: 'string',
    min: 0,
    max: maxLength,
    message,
    trigger,
  };
}
