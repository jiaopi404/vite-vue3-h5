<template>
  <div :class="prefixCls" class="relative w-full h-full px-4">
    <!-- <AppLocalePicker
      class="absolute text-white top-4 right-4 enter-x xl:text-gray-600"
      :showText="false"
      v-if="!sessionTimeout && showLocale"
    /> -->
    <AppDarkModeToggle class="absolute top-3 right-4 enter-x" v-if="!sessionTimeout" />

    <span class="-enter-x xl:hidden">
      <AppLogo :alwaysShowTitle="true" />
    </span>

    <div class="container relative h-full py-2 mx-auto sm:px-10">
      <div class="flex h-full">
        <div class="hidden min-h-full pl-4 mr-4 xl:flex xl:flex-col xl:w-6/12 relative">
          <AppLogo class="-enter-x" />
          <div class="my-auto">
            <img
              :alt="title"
              src="../../../assets/svg/login-box-bg.svg"
              class="w-1/2 -mt-16 -enter-x"
            />
            <div class="mt-10 font-medium text-white -enter-x">
              <span class="inline-block mt-4 text-3xl"> {{ t('sys.login.signInTitle') }}</span>
            </div>
            <div class="mt-5 font-normal text-white text-md dark:text-gray-500 -enter-x">
              <!-- {{ t('sys.login.signInDesc') }} -->
            </div>
          </div>
          <div v-if="version" class="text-white text-center version">版本号：{{ version }}</div>
        </div>
        <div class="flex w-full h-full py-5 xl:h-auto xl:py-0 xl:my-0 xl:w-6/12">
          <div
            :class="`${prefixCls}-form`"
            class="
              relative
              w-full
              px-5
              py-8
              mx-auto
              my-auto
              rounded-md
              shadow-md
              xl:ml-16 xl:bg-transparent
              sm:px-8
              xl:p-4 xl:shadow-none
              sm:w-3/4
              lg:w-2/4
              xl:w-auto
              enter-x
            "
          >
            <LoginForm />
            <ForgetPasswordForm />
            <RegisterForm />
            <MobileForm />
            <QrCodeForm />
          </div>
        </div>
      </div>
    </div>
    <teleport to="body">
      <!-- <div
        id="move_box"
        class="
          w-200px
          h-45px
          overflow-hidden
          px-20px
          py-3px
          fixed
          -left-25px
          bottom-100px
          bg-white
          rounded-full
          flex
          justify-items-center
          items-center
          z-999
        "
        :class="`${prefixCls}-label`"
      >
        <div class="w-35px ml-12px mr-6px rounded-full overflow-hidden">
          <img src="/resource/img/toweblogo.png" draggable="false" alt="" class="inline-block" />
        </div>
        <div>
          <div class="text-sm text-center text-blue-800">
            <span class="cursor-pointer hover:underline" @click="toWeb">点击前往</span>
          </div>
          <div class="text-sm text-black font-semibold">招标采购业务端</div>
        </div>
      </div> -->
      <div
        id="move_box"
        class="
          w-60px
          h-72px
          overflow-hidden
          rounded-md
          shadow-md
          fixed
          top-150px
          right-0px
          bg-white
          z-999
          cursor-pointer
          hover:shadow-1xl
        "
      >
        <img src="/resource/img/toWebLogo2.png" draggable="false" alt="" @click="toWeb" />
      </div>
    </teleport>
  </div>
</template>
<script lang="ts" setup>
  import { computed, toRaw, onMounted, ref } from 'vue';
  import { AppLogo } from '/@/components/Application';
  import { AppDarkModeToggle } from '/@/components/Application';
  import LoginForm from './LoginForm.vue';
  import ForgetPasswordForm from './ForgetPasswordForm.vue';
  import RegisterForm from './RegisterForm.vue';
  import MobileForm from './MobileForm.vue';
  import QrCodeForm from './QrCodeForm.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useRouter } from 'vue-router';
  import { WebPublicityRoute } from '/@/router/routes';
  import { getConfig } from '/@/utils/commonServe/businessUtil';
  // import { useLocaleStore } from '/@/store/modules/locale';
  import { getVersionLimit } from '/@/api/sys/user';

  const router = useRouter();

  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });

  const globSetting = useGlobSetting();
  const { prefixCls } = useDesign('login');
  const { t } = useI18n();
  // const localeStore = useLocaleStore();
  // const showLocale = localeStore.getShowPicker;
  const title = computed(() => globSetting?.title ?? '');
  const version = ref('');
  getConfig();

  onMounted(async () => {
    // 拖拽
    const el = document.getElementById('move_box');
    useMove(el);
    const versionData = await getVersionLimit();
    version.value = versionData[0] ? versionData[0]['versionNum'] : '';
  });
  const toWeb = () => {
    // router.push(WebPublicityRoute.path);

    // 路由跳转打开新窗口
    const { href } = router.resolve({
      name: WebPublicityRoute.name,
    });
    window.open(href, '_blank');
  };

  const useMove = (el: any) => {
    el.style.position = 'fixed';
    let offsetX: number, offsetY: number;
    if (el != null) {
      el.addEventListener('mousedown', function (event: any) {
        if (event.button == 0 && el != null) {
          const lexObj: any = getComputedStyle(el);
          offsetX = event.pageX - el.offsetLeft + parseInt(lexObj['margin-left']);
          offsetY = event.pageY - el.offsetTop + parseInt(lexObj['margin-right']);
          // offsetX = event.pageX - el.offsetLeft;
          // offsetY = event.pageY - el.offsetTop;
          const move = function (event: any) {
            if (el != null) {
              // let x = event.pageX - offsetX;
              let y = event.pageY - offsetY;

              // if (x < 0) {
              //   x = 0;
              // } else if (x > document.documentElement.clientWidth - el.offsetWidth) {
              //   x = document.documentElement.clientWidth - el.offsetWidth;
              // }

              if (y < 0) {
                y = 0;
              } else if (y > document.documentElement.clientHeight - el.offsetHeight) {
                y = document.documentElement.clientHeight - el.offsetHeight;
              }
              // el.style.left = x + 'px';
              el.style.top = y + 'px';
            }
            return false;
          };
          document.addEventListener('mousemove', move);
          const stop = function () {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', stop);
          };
          document.addEventListener('mouseup', stop);
        }
        return false;
      });
    }
  };
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-login';
  @logo-prefix-cls: ~'@{namespace}-app-logo';
  @countdown-prefix-cls: ~'@{namespace}-countdown-input';
  @dark-bg: #293146;

  html[data-theme='dark'] {
    .@{prefix-cls} {
      background-color: @dark-bg;

      &::before {
        background-image: url(/@/assets/svg/login-bg-dark.svg);
      }

      .ant-input,
      .ant-input-password {
        background-color: #232a3b;
      }

      .ant-btn:not(.ant-btn-link):not(.ant-btn-primary) {
        border: 1px solid #4a5569;
      }

      &-form {
        background: transparent !important;
      }

      .app-iconify {
        color: #fff;
      }
    }

    .@{prefix-cls}-label{
      background-color: white !important;
    }

    input.fix-auto-fill,
    .fix-auto-fill input {
      -webkit-text-fill-color: #c9d1d9 !important;
      box-shadow: inherit !important;
    }
  }

  .@{prefix-cls} {
    min-height: 100%;
    overflow: hidden;
    @media (max-width: @screen-xl) {
      background-color: #293146;

      .@{prefix-cls}-form {
        background-color: #fff;
      }
    }

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      margin-left: -48%;
      background-image: url(/@/assets/svg/login-bg.svg);
      background-position: 100%;
      background-repeat: no-repeat;
      background-size: auto 100%;
      content: '';
      @media (max-width: @screen-xl) {
        display: none;
      }
    }

    .@{logo-prefix-cls} {
      position: absolute;
      top: 12px;
      height: 30px;

      &__title {
        font-size: 16px;
        color: #fff;
      }

      img {
        width: 32px;
      }
    }

    .container {
      .@{logo-prefix-cls} {
        display: flex;
        width: 60%;
        height: 80px;

        &__title {
          font-size: 24px;
          color: #fff;
        }

        img {
          width: 48px;
        }
      }
    }

    &-sign-in-way {
      .anticon {
        font-size: 22px;
        color: #888;
        cursor: pointer;

        &:hover {
          color: @primary-color;
        }
      }
    }

    &-vben-login-form {
      input:not([type='checkbox']) {
        min-width: 360px;

        @media (max-width: @screen-xl) {
          min-width: 320px;
        }

        @media (max-width: @screen-lg) {
          min-width: 260px;
        }

        @media (max-width: @screen-md) {
          min-width: 240px;
        }

        @media (max-width: @screen-sm) {
          min-width: 160px;
        }
      }
    }

    .@{countdown-prefix-cls} input {
      min-width: unset;
    }

    .ant-divider-inner-text {
      font-size: 12px;
      color: @text-color-secondary;
    }
  }
  .version{
    position: absolute;
    bottom: 50px;
  }
  .ant-form-item{
    margin-bottom:20px;
  }
</style>
