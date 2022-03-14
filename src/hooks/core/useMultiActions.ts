type ActionFunc<T> = (...args: any) => T;
type ActionFuncReturnType<T> = T;

type PromiseActionFunc<T> = (...args: any) => Promise<T>;

/**
 * 多 action 构造器 同步
 * @param { resultProcessor, processBreaker }
 * // resultProcessor 对结果进行处理，包含了
 * // processBreaker 中断，对于非 promise
 * @returns
 */
export function useMultiActions<T>(options?: {
  resultProcessor?: (resultList: ActionFuncReturnType<T>[]) => ActionFuncReturnType<T>;
  processBreaker?: (result: T) => boolean;
}) {
  const { resultProcessor, processBreaker } = options || {};
  const actions: ActionFunc<T>[] = [];
  function registerAction(func: ActionFunc<T>) {
    actions.push(func);
  }
  function execActions(...args) {
    const resultList: ActionFuncReturnType<T>[] = [];
    for (const action of actions) {
      const result = action(...args);
      if (processBreaker) {
        // 非 promise 起效果
        if (processBreaker(result)) {
          return result;
        }
      }
      resultList.push(result);
    }
    // const promiseActMap = resultList.reduce((map, item, index) => {
    //   if (item instanceof Promise) {
    //     map.set(index, item);
    //   }
    //   return map;
    // }, new Map<number, Promise<T>>());
    // try {
    //   const promiseResultList = await Promise.all(promiseActMap.values());
    //   const promiseActMapKeys = promiseActMap.keys();
    //   promiseResultList.forEach((pr, prIndex) => {
    //     resultList.fill(pr, promiseActMapKeys[prIndex], promiseActMapKeys[prIndex] + 1);
    //   });
    //   if (resultProcessor) {
    //     return resultProcessor(resultList);
    //   }
    // } catch (err) {
    //   return Promise.reject(err);
    // }
    if (resultProcessor) {
      return resultProcessor(resultList);
    } else {
      return resultList;
    }
  }
  return {
    registerAction,
    execActions,
  };
}

/**
 * promise 的 action
 * @param options
 * @returns
 */
export function useMultiPromiseActions<T>(options?: {
  resultProcessor?: (resultList: ActionFuncReturnType<T>[]) => ActionFuncReturnType<T>;
  processBreaker?: (result: T) => boolean;
}) {
  const { resultProcessor, processBreaker } = options || {};
  const actions: PromiseActionFunc<T>[] = [];
  function registerPromiseAction(func: PromiseActionFunc<T>) {
    actions.push(func);
  }
  async function execPromiseActions(...args) {
    const resultList: ActionFuncReturnType<T>[] = [];
    for (const action of actions) {
      const result = await action(...args);
      if (processBreaker) {
        // 非 promise 起效果
        if (processBreaker(result)) {
          return result;
        }
      }
      resultList.push(result);
    }
    // const promiseActMap = resultList.reduce((map, item, index) => {
    //   if (item instanceof Promise) {
    //     map.set(index, item);
    //   }
    //   return map;
    // }, new Map<number, Promise<T>>());
    // try {
    //   const promiseResultList = await Promise.all(promiseActMap.values());
    //   const promiseActMapKeys = promiseActMap.keys();
    //   promiseResultList.forEach((pr, prIndex) => {
    //     resultList.fill(pr, promiseActMapKeys[prIndex], promiseActMapKeys[prIndex] + 1);
    //   });
    //   if (resultProcessor) {
    //     return resultProcessor(resultList);
    //   }
    // } catch (err) {
    //   return Promise.reject(err);
    // }
    if (resultProcessor) {
      return resultProcessor(resultList);
    } else {
      return resultList;
    }
  }
  return {
    registerPromiseAction,
    execPromiseActions,
  };
}
