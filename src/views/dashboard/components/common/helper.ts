import { useBreakpoints } from '@vueuse/core';

const breakpoints = useBreakpoints({
  small: 1440,
});

export const largeScreenRef = breakpoints.greater('small');
