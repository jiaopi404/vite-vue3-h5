import { watch } from 'vue';
import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
export const usefloatBtn = () => {
  /**
   * postion: fixed;
   * bottom:
   * transform: translateX(-50%);
   * left: calc((100vw - ${w}px) / 2);
   */
  const { getRealWidth } = useMenuSetting();
  //   const leftDistance = ref(0);
  watch(
    () => getRealWidth.value,
    (nv) => {
      //   leftDistance.value = 100vw - nv;
      const flotBtn = document.getElementById('float_btn');
      if (flotBtn) {
        flotBtn.style.left = `calc(${nv}px / 2 + 50vw - 3px)`;
      }
    },
  );
  const reload = () => {
    const flotBtn = document.getElementById('float_btn');
    if (flotBtn) {
      flotBtn.style.left = `calc(${getRealWidth.value}px / 2 + 50vw - 3px)`;
    }
  };
  // watch(
  //   () => btnEl.value,
  //   (nv) => {
  //     if (nv) {
  //       console.log('456');
  //       // btnEl.value && (btnEl.value.style.left = `calc((100vw - ${getRealWidth.value}px) / 2)`);
  //     }
  //     //   leftDistance.value = 100vw - nv;
  //   },
  // );
  return {
    reload,
  };
};
