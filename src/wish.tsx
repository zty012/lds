import React from "react";
import { choose } from "./random";

export function useWish<T>(items: T[], bulk: number = 1) {
  const [running, setRunning] = React.useState(false);
  const [intervalId, setIntervalId] = React.useState<number>();
  /** 每个item的权重 */
  const [weights, setWeights] = React.useState(
    items.map((s) => ({ value: s, weight: 1 })),
  );
  /** 选中的item */
  const [values, setValues] = React.useState<T[]>([]);
  /** 抽卡次数 */
  const [count, setCount] = React.useState(0);
  /** 抽x次触发保底机制 */
  const [max, setMax] = React.useState(15);

  React.useEffect(() => {
    setBulk(bulk);
  }, [bulk]);

  /**
   * 开始抽卡
   * @param interval 更新间隔
   */
  function start(interval: number = 1) {
    if (running) {
      return;
    }
    setRunning(true);
    setIntervalId(
      setInterval(() => {
        setValues((v) => v.map(() => pick()));
      }, interval),
    );
  }
  /**
   * 停止抽卡
   */
  function stop() {
    if (!intervalId) {
      return;
    }
    clearInterval(intervalId);
    setRunning(false);
    // 记录抽卡次数
    setCount(count + 1);
    // 保底机制，如果抽数是max的倍数，则设置结果为概率最低的一些item
    if (count % max === 0) {
      // 把item按照权重从低到高排序
      const sorted = weights.sort((a, b) => a.weight - b.weight);
      // 选取权重最低的value.length个item
      const lowWeightItems = sorted.slice(0, values.length);
      // 设置结果
      setValues(lowWeightItems.map((s) => s.value));
    }
    // 给选中的学生降低50%的概率
    for (const value of values) {
      setWeights(
        weights.map((w) =>
          w.value === value ? { ...w, weight: w.weight * 0.5 } : w,
        ),
      );
    }
  }
  /**
   * 抽取一个item，不会修改权重
   * @returns 选中的item
   */
  function pick() {
    return choose(weights);
  }
  /**
   * 重置概率
   */
  function reset() {
    setWeights(items.map((s) => ({ value: s, weight: 1 })));
  }
  /**
   * 设置连抽次数
   * @param num 连抽次数
   */
  function setBulk(num: number) {
    setValues(
      Array(num)
        .fill(null)
        .map(() => pick()),
    );
  }

  return {
    start,
    stop,
    setBulk,
    values,
    weights,
    count,
    running,
    max,
    setMax,
    reset,
  };
}
