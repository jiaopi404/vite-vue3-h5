<template>
  <template v-if="getShow">
    <LoginFormTitle class="enter-x" />
    <Form class="p-4 enter-x" :model="formData" :rules="formRules" ref="formRef">
      <FormItem name="mobile" class="enter-x">
        <Input
          size="large"
          allowClear
          v-model:value="formData.mobile"
          :placeholder="t('sys.login.mobile')"
          class="fix-auto-fill"
        />
      </FormItem>
      <FormItem name="code" class="enter-x">
        <CountdownInput
          size="large"
          allowClear
          :mobile="formData.mobile"
          class="fix-auto-fill"
          v-model:value="formData.code"
          :placeholder="t('sys.login.smsCode')"
          @pressEnter="handleLogin"
        />
      </FormItem>

      <FormItem class="enter-x">
        <Button type="primary" size="large" block @click="handleLogin" :loading="loading">
          {{ t('sys.login.loginButton') }}
        </Button>
        <Button size="large" block class="mt-4" @click="handleBackLogin">
          {{ t('sys.login.backSignIn') }}
        </Button>
      </FormItem>
    </Form>
  </template>
</template>
<script lang="ts" setup>
  import { reactive, ref, computed, unref } from 'vue';
  import { Form, Input, Button } from 'ant-design-vue';
  import { CountdownInput } from '/@/components/CountDown';
  import LoginFormTitle from './LoginFormTitle.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useLoginState, useFormValid, LoginStateEnum } from './useLogin';

  import { useUserStore } from '/@/store/modules/user';
  import { getUserCountByMobile } from '/@/api/sys/user';
  import { RuleObject } from 'ant-design-vue/es/form/interface';
  import { useMessage } from '/@/hooks/web/useMessage';

  const FormItem = Form.Item;
  const { t } = useI18n();
  const userStore = useUserStore();
  const { notification, createErrorModal } = useMessage();
  const { handleBackLogin, getLoginState } = useLoginState();

  let validatemobile = async (rule: RuleObject, value: string) => {
    let regExp = /^1\d{10}$/;
    if (regExp.test(value) === false) {
      return Promise.reject('请输入11位手机号码');
    } else {
      const mobileNumber = await getUserCountByMobile(value);
      if (mobileNumber) {
        if (mobileNumber === 1) {
          return Promise.resolve();
        } else {
          return Promise.reject('手机号重复！');
        }
      } else {
        return Promise.reject('手机号不存在！');
      }
    }
  };

  const formRef = ref();
  const loading = ref(false);
  const formData = reactive({
    mobile: '',
    code: '',
  });
  const formRules = {
    mobile: [
      // { required: true, message: '请输入手机号', trigger: 'blur' },
      { required: true, validator: validatemobile, trigger: ['blur', 'change'] },
    ],
    code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  };

  const { validForm } = useFormValid(formRef);
  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.MOBILE);

  async function handleLogin() {
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;
      const userInfo = await userStore.login({
        LodingType: 'mobile',
        mobile: formData.mobile,
        code: formData.code,
        mode: 'none', //不要默认的错误提示
      });
      if (userInfo) {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${userInfo.realName}`,
          duration: 3,
        });
      }
    } catch (error) {
      createErrorModal({
        title: t('sys.api.errorTip'),
        content: (error as unknown as Error).message || t('sys.api.networkExceptionMsg'),
        // getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
      });
    } finally {
      loading.value = false;
    }
  }
</script>
