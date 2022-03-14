export interface PromiseQueueOptions {
  interval?: number;
}

export default class PromiseQueue {
  private interval?: any;
  // 选项
  private options: PromiseQueueOptions;
  // 锁定
  private lock = false;
  // 队列
  private queue: (() => Promise<any>)[] = [];
  static instance(options: PromiseQueueOptions = {}): PromiseQueue {
    if (options.interval == undefined) options.interval = 200;
    return new PromiseQueue(options);
  }
  constructor(options: PromiseQueueOptions) {
    this.options = options;
    this.interval = setInterval(async () => {
      // 没有任务或者任务执行中情况不执行
      if (this.queue.length > 0 && !this.lock) {
        // console.log('execute queue');
        // 锁定
        this.lock = true;
        // 取出函数
        const f = this.queue.shift();
        // 解锁
        await f!();
        this.lock = false;
      }
    }, options.interval);
  }
  // 加入队列
  push(f: () => Promise<any>) {
    this.queue.push(f);
  }
  // 释放队列
  destory() {
    clearInterval(this.interval);
  }
}
