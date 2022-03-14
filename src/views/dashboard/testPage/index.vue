<template>
  <div class="page-test-page_cyk">
    this is a test page
    <div>
      <AButton @click="i++">this is a button: {{ i }}</AButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  let i = ref(20);

  // const handleButtonClick = () => {
  //   i.value++;
  // };
</script>
