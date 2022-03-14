<template>
  <ConfigProvider>
    <!-- <AppProvider> -->
    <div id="app">
      <RouterView />
    </div>
    <!-- </AppProvider> -->
  </ConfigProvider>
</template>

<script lang="ts" setup>
  // import { ConfigProvider } from 'ant-design-vue';
  import { ConfigProvider } from 'vant';
  // import { AppProvider } from '/@/components/Application';
  import { useTitle } from '/@/hooks/web/useTitle';
  // import { useLocale } from '/@/locales/useLocale';

  // support Multi-language
  // const { getAntdLocale } = useLocale();

  // Listening to page changes and dynamically changing site titles
  useTitle();
</script>

<style>
  body {
    min-width: 1200px;
  }
</style>
