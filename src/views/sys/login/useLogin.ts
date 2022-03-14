import type { ValidationRule } from 'ant-design-vue/lib/form/Form';
import type { RuleObject } from 'ant-design-vue/lib/form/interface';
import { ref, computed, unref, Ref } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { FormSchema } from '/@/components/Table';
import { debouncePromise } from '/@/utils/commonServe';
import { checkMobileRepeat } from '/@/api/demo/system';

export enum LoginStateEnum {
  LOGIN,
  REGISTER,
  RESET_PASSWORD,
  MOBILE,
  QR_CODE,
}

const currentState = ref(LoginStateEnum.LOGIN);

export function useLoginState() {
  function setLoginState(state: LoginStateEnum) {
    currentState.value = state;
  }

  const getLoginState = computed(() => currentState.value);

  function handleBackLogin() {
    setLoginState(LoginStateEnum.LOGIN);
  }

  return { setLoginState, getLoginState, handleBackLogin };
}

export function useFormValid<T extends Object = any>(formRef: Ref<any>) {
  async function validForm() {
    const form = unref(formRef);
    if (!form) return;
    const data = await form.validate();
    return data as T;
  }

  return { validForm };
}

export function useFormRules(formData?: Recordable) {
  const { t } = useI18n();

  const getAccountFormRule = computed(() => createRule(t('sys.login.accountPlaceholder')));
  const getPasswordFormRule = computed(() => createRule(t('sys.login.passwordPlaceholder')));
  const getSmsFormRule = computed(() => createRule(t('sys.login.smsPlaceholder')));
  const getMobileFormRule = computed(() => createRule(t('sys.login.mobilePlaceholder')));

  const validatePolicy = async (_: RuleObject, value: boolean) => {
    return !value ? Promise.reject(t('sys.login.policyPlaceholder')) : Promise.resolve();
  };

  const validateConfirmPassword = (password: string) => {
    return async (_: RuleObject, value: string) => {
      if (!value) {
        return Promise.reject(t('sys.login.passwordPlaceholder'));
      }
      if (value !== password) {
        return Promise.reject(t('sys.login.diffPwd'));
      }
      return Promise.resolve();
    };
  };

  const getFormRules = computed((): { [k: string]: ValidationRule | ValidationRule[] } => {
    const accountFormRule = unref(getAccountFormRule);
    const passwordFormRule = unref(getPasswordFormRule);
    const smsFormRule = unref(getSmsFormRule);
    const mobileFormRule = unref(getMobileFormRule);

    const mobileRule = {
      sms: smsFormRule,
      mobile: mobileFormRule,
    };
    switch (unref(currentState)) {
      // register form rules
      case LoginStateEnum.REGISTER:
        return {
          account: accountFormRule,
          password: passwordFormRule,
          confirmPassword: [
            { validator: validateConfirmPassword(formData?.password), trigger: 'change' },
          ],
          policy: [{ validator: validatePolicy, trigger: 'change' }],
          ...mobileRule,
        };

      // reset password form rules
      case LoginStateEnum.RESET_PASSWORD:
        return {
          account: accountFormRule,
          ...mobileRule,
        };

      // mobile form rules
      case LoginStateEnum.MOBILE:
        return mobileRule;

      // login form rules
      default:
        return {
          account: accountFormRule,
          password: passwordFormRule,
        };
    }
  });
  return { getFormRules };
}

function createRule(message: string) {
  return [
    {
      required: true,
      message,
      trigger: 'change',
    },
  ];
}

// 手机号登陆
export const mobileFormSchema = (): FormSchema[] => [
  {
    field: 'mobile',
    // label: '手机号',
    label: '',
    component: 'Input',
    required: true,
    componentProps: ({ formModel, formActionType }) => ({
      placeholder: '请输入手机号',
      onChange: (value) => {
        const { updateSchema } = formActionType;
        updateSchema({
          field: 'sms',
          componentProps: () => ({
            mobile: formModel.mobile,
          }),
        });
      },
    }),
    rules: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      {
        trigger: 'blur',
        // validator: debouncePromise(async (_, value) => {
        //   // 根据手机号检验 账号是否存在
        //   let regExp = /^1\d{10}$/;
        //   if (regExp.test(value) === false) {
        //     return Promise.reject('请输入11位手机号码');
        //   }
        //   if (regExp.test(value) === true) {
        //     const bool = await checkMobileRepeat(value);
        //     if (bool) {
        //       return Promise.resolve();
        //     } else {
        //       return Promise.reject('手机号重复！');
        //     }
        //   }
        // }, 800),
      },
    ],
  },
  {
    field: 'sms',
    // label: '验证码',
    label: '',
    component: 'InputCountDown',
    componentProps: ({ formModel, formActionType }) => ({
      placeholder: '请输入验证码',
      onChange: (value) => {
        const { updateSchema } = formActionType;
        updateSchema({
          field: 'sms',
          componentProps: () => ({
            mobile: formModel.mobile,
          }),
        });
      },
    }),
  },
];
