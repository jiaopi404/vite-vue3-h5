import { FormSchema } from '/@/components/Table';
import { encryptByMd5 } from '/@/utils/cipher';
import { useUserStore } from '/@/store/modules/user';
import { checkMobileRepeat, checkOldPassword } from '/@/api/demo/system';
// 抽屉数据
export const passwordFormSchema = (): FormSchema[] => {
  const userInfo = useUserStore().getUserInfo;
  return [
    {
      field: 'oldPassword',
      label: '原密码',
      required: true,
      component: 'InputPassword',
      componentProps: ({ formModel, formActionType }) => ({
        placeholder: '请输入原密码',
        onChange: () => {
          const { updateSchema } = formActionType;
          updateSchema({
            field: 'oldPassword',
            rules: [
              { required: true, message: '请输入原密码', trigger: 'blur' },
              {
                trigger: 'blur',
                validator: async (_, value) => {
                  const params = {
                    id: userInfo.id,
                    password: encryptByMd5(value),
                  };
                  const resData = await checkOldPassword(params);
                  if (resData) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject('原密码不正确！');
                  }
                },
              },
            ],
          });
        },
      }),
    },
    {
      field: 'password',
      label: '新密码',
      required: true,
      component: 'InputPassword',
      componentProps: ({ formModel, formActionType }) => ({
        placeholder: '请输入新密码',
        onChange: () => {
          const { updateSchema } = formActionType;
          updateSchema({
            field: 'password',
            rules: [
              { required: true, message: '请输入新密码', trigger: 'blur' },
              {
                trigger: 'blur',
                validator: async (_, value) => {
                  const regExp = /^[\u4e00-\u9fa5A-Za-z0-9]{6,20}$/;
                  if (regExp.test(value) === false) {
                    return Promise.reject('推荐使用6-20位大小写字母、数字混合使用的密码');
                  } else {
                    if (formModel.oldPassword == value) {
                      return Promise.reject('新密码不能与原密码相同');
                    }
                  }
                },
              },
            ],
          });
        },
      }),
    },
    {
      field: 'confirmPassword',
      label: '确认密码',
      required: true,
      component: 'InputPassword',
      componentProps: ({ formModel, formActionType }) => ({
        placeholder: '请输入确认密码',
        onChange: () => {
          const { updateSchema } = formActionType;
          updateSchema({
            field: 'confirmPassword',
            rules: [
              { required: true, message: '请输入确认密码', trigger: 'blur' },
              {
                trigger: 'blur',
                validator: async (_, value) => {
                  if (formModel.password !== value) {
                    return Promise.reject('两次密码不一致');
                  }
                },
              },
            ],
          });
        },
      }),
    },
  ];
};
export const mobileFormSchema = (): FormSchema[] => {
  const userInfo = useUserStore().getUserInfo;
  return [
    {
      field: 'mobile',
      label: '新手机号',
      component: 'Input',
      required: true,
      componentProps: ({ formModel, formActionType }) => ({
        placeholder: '请输入新手机号',
        onChange: () => {
          const { updateSchema } = formActionType;
          updateSchema({
            field: 'mobile',
            rules: [
              { required: true, message: '请输入手机号', trigger: 'blur' },
              {
                trigger: 'blur',
                validator: async (_, value) => {
                  const params = {
                    mobile: value,
                    role: userInfo.role,
                    id: userInfo.id,
                  };
                  const regExp = /^1\d{10}$/;
                  if (regExp.test(value) === false) {
                    return Promise.reject('请输入11位手机号码');
                  }
                  if (regExp.test(value) === true) {
                    const bool = await checkMobileRepeat(params);
                    if (bool) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject('手机号重复！');
                    }
                  }
                },
              },
            ],
          });
          updateSchema({
            field: 'sms',
            componentProps: () => ({
              mobile: formModel.mobile,
            }),
          });
        },
      }),
    },
    {
      field: 'sms',
      label: '验证码',
      component: 'InputCountDown',
      required: true,
      componentProps: ({ formModel, formActionType }) => ({
        placeholder: '请输入验证码',
        rules: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
        onChange: () => {
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
};
