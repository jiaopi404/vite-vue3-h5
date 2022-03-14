// import { mount } from '@vue/test-utils';
// import { Button } from '/@/components/Button';
import { PathVariableParser } from '/@/utils/commonServe';

test('if jest is normal.', async () => {
  expect('jest').toEqual('jest');
});

// 测试 utils 的工具 PathVariableParse
test('if pathVariable is good.', async () => {
  const parser = new PathVariableParser();
  const result = parser.parse('/getModuleMenusList/{menuType}/{tagModules}', {
    menuType: 1,
    tagModules: 2,
  });
  expect(result).toEqual('/getModuleMenusList/1/2');
});

// TODO Vue component testing is not supported temporarily
// test('is a Vue instance.', async () => {
//   const wrapper = mount(Button, {
//     slots: {
//       default: 'Button text',
//     },
//   });
//   expect(wrapper.html()).toContain('Button text');
// });
