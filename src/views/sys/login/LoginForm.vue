<template>
  <LoginFormTitle v-show="getShow" />
  <!-- <LoginFormTitle v-show="getShow" class="enter-x" /> -->
  <Form
    :class="`${prefixCls}-vben-login-form`"
    class="p-4"
    :model="formData"
    :rules="getFormRules"
    ref="formRef"
    v-show="getShow"
    @keypress.enter="handleLogin"
  >
    <!-- class="p-4 enter-x" -->
    <FormItem name="account" class="enter-x">
      <Input
        size="large"
        allowClear
        v-model:value="formData.account"
        :placeholder="t('sys.login.userName')"
        class="fix-auto-fill"
      />
    </FormItem>
    <FormItem name="password" class="enter-x">
      <InputPassword
        size="large"
        visibilityToggle
        v-model:value="formData.password"
        :placeholder="t('sys.login.password')"
      />
    </FormItem>

    <ARow class="enter-x">
      <ACol :span="12">
        <FormItem>
          <!-- No logic, you need to deal with it yourself -->
          <Checkbox v-model:checked="rememberMe" size="small">
            {{ t('sys.login.rememberMe') }}
          </Checkbox>
        </FormItem>
      </ACol>
      <ACol :span="12">
        <FormItem :style="{ 'text-align': 'right' }">
          <!-- No logic, you need to deal with it yourself -->
          <Button type="link" size="small" @click="setLoginState(LoginStateEnum.RESET_PASSWORD)">
            {{ t('sys.login.forgetPassword') }}
          </Button>
        </FormItem>
      </ACol>
    </ARow>

    <FormItem class="enter-x">
      <Button type="primary" size="large" block @click="handleLogin" :loading="loading">
        {{ t('sys.login.loginButton') }}
      </Button>
      <!-- <Button size="large" class="mt-4 enter-x" block @click="handleRegister">
        {{ t('sys.login.registerButton') }}
      </Button> -->
    </FormItem>
    <ARow class="enter-x">
      <ACol :md="12" :xs="24">
        <Button block @click="setLoginState(LoginStateEnum.MOBILE)">
          {{ t('sys.login.mobileSignInFormTitle') }}
        </Button>
      </ACol>
      <!-- <ACol :md="8" :xs="24" class="!my-2 !md:my-0 xs:mx-0 md:mx-2">
        <Button block @click="setLoginState(LoginStateEnum.QR_CODE)">
          {{ t('sys.login.qrSignInFormTitle') }}
        </Button>
      </ACol> -->
      <ACol :md="12" :xs="24">
        <Button block @click="setLoginState(LoginStateEnum.REGISTER)">
          {{ t('sys.login.registerButton') }}
        </Button>
      </ACol>
    </ARow>

    <ARow class="enter-x" style="margin-top: 15px">
      <ACol> 温馨提示: </ACol>
    </ARow>
    <ARow class="enter-x">
      <ACol> 1、支持1360*768及以上分辨率， 推荐您使用1920*1080分辨率； </ACol>
    </ARow>
    <ARow class="enter-x">
      <ACol>
        2、支持Chrome、360极速版浏览器，<a
          href="https://www.baidu.com/s?ie=utf-8&f=3&rsv_bp=1&rsv_idx=1&tn=baidu&wd=%E8%B0%B7%E6%AD%8C%E6%B5%8F%E8%A7%88%E5%99%A8&fenlei=256&rsv_pq=848f98ae000bf196&rsv_t=a702clUVhSGUp7LK9Sa4mwGE3KZMeQK%2BEZXz3AY%2F0Y2FU8nHgTBuq3hjmII&rqlang=cn&rsv_enter=1&rsv_dl=ih_0&rsv_sug3=1&rsv_sug1=1&rsv_sug7=001&rsv_sug2=1&rsv_btype=i&rsp=0&rsv_sug9=es_2_1&rsv_sug4=2601&rsv_sug=9"
          target="_blank"
          >推荐Chrome浏览器</a
        >。
      </ACol>
    </ARow>

    <!-- <Divider class="enter-x">{{ t('sys.login.otherSignIn') }}</Divider>
    <div class="flex justify-evenly enter-x" :class="`${prefixCls}-sign-in-way`">
      <GithubFilled />
      <WechatFilled />
      <AlipayCircleFilled />
      <GoogleCircleFilled />
      <TwitterCircleFilled />
    </div> -->
  </Form>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, computed, onMounted } from 'vue';

  import { Checkbox, Form, Input, Row, Col, Button, Divider } from 'ant-design-vue';
  // import {
  //   GithubFilled,
  //   WechatFilled,
  //   AlipayCircleFilled,
  //   GoogleCircleFilled,
  //   TwitterCircleFilled,
  // } from '@ant-design/icons-vue';
  import LoginFormTitle from './LoginFormTitle.vue';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { useUserStore } from '/@/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { encryptByMd5 } from '/@/utils/cipher';
  // 引入查询系统配置接口
  import { getConfig } from '/@/utils/commonServe/businessUtil';
  //import { onKeyStroke } from '@vueuse/core';

  const ACol = Col;
  const ARow = Row;
  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const { t } = useI18n();
  const { notification, createErrorModal } = useMessage();
  const { prefixCls } = useDesign('login');
  const userStore = useUserStore();

  const { setLoginState, getLoginState } = useLoginState();
  const { getFormRules } = useFormRules();

  const formRef = ref();
  const loading = ref(false);
  const rememberMe = ref(false);
  const formData = reactive({
    account: '',
    password: '',
  });

  const { validForm } = useFormValid(formRef);
  onMounted(() => {
    // 获取cookie
    getCookie();
  });
  // 设置cookie
  const setCookie = (account, exdays) => {
    let exdate = new Date(); // 获取时间
    exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays); // 保存的天数
    // 字符串拼接cookie
    window.document.cookie = 'account' + '=' + account + ';path=/;expires=' + exdate.toUTCString();
    //  window.document.cookie ='password' + '=' + encryptByMd5(password) + ';path=/;expires=' + exdate.toUTCString();
    window.document.cookie =
      'rememberMe' + '=' + rememberMe.value + ';path=/;expires=' + exdate.toUTCString();
  };
  //onKeyStroke('Enter', handleLogin);
  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

  const getCookie = () => {
    if (document.cookie.length > 0) {
      // 这里显示的格式需要切割一下自己可输出看下
      let arr = document.cookie.split('; ');
      for (let i = 0; i < arr.length; i++) {
        // 再次切割
        let arr2 = arr[i].split('=');
        // // 判断查找相对应的值
        if (arr2[0] === 'account') {
          // 保存到保存数据的地方
          formData.account = arr2[1];
        } else if (arr2[0] === 'rememberMe') {
          rememberMe.value = Boolean(arr2[1]);
        }
      }
      if (rememberMe.value) {
        // 保存到保存数据的地方
        formData.account = formData.account;
      } else {
        formData.account = '';
        clearCookie();
      }
    }
  };
  async function handleLogin() {
    const data = await validForm();
    if (!data) return;
    try {
      getConfig();
      loading.value = true;
      const _md5Password = encryptByMd5(data.password);
      const userInfo = await userStore.login({
        LodingType: 'account',
        password: _md5Password,
        account: data.account,
        mode: 'none', //不要默认的错误提示
      });
      if (rememberMe.value) {
        setCookie(formData.account, 7);
      } else {
        clearCookie();
      }
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
        getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
      });
    } finally {
      loading.value = false;
    }
  }
  //清除设置的Cookie
  const clearCookie = () => {
    setCookie('', -1);
  };
</script>

<style lang="less">
  .test-page {
    color: #ffff00;
  }
</style>
