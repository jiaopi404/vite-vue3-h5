export type PromiseTaskType = (...args: any[]) => Promise<any>;

/**
 * promise queue
 * @returns
 */
export function usePromiseQueue() {
  const queue: PromiseTaskType[] = [];
  let loopIntervalId: NodeJS.Timer;

  const start = () => {
    loopIntervalId = setInterval(async () => {
      if (queue.length) {
        clearInterval(loopIntervalId);
        await execPromiseTask();
        return start();
      }
    }, 17);
  };

  const execPromiseTask = async () => {
    // for (const task of queue) {
    //   await task();
    //   queue.shift();
    // }
    while (queue.length) {
      const task = queue.shift();
      await task?.();
    }
  };

  const add = (promiseTask: PromiseTaskType) => {
    queue.push(promiseTask);
  };

  const destroy = () => {
    clearInterval(loopIntervalId);
  };

  return {
    start,
    add,
    destroy,
  };
}
