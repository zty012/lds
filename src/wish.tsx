import React from "react";
import { choose } from "./random";

/**
 * 抽卡核心逻辑
 * @param items 所有item的数组
 * @param bulk 默认连抽次数
 */
export function useWish<T>(items: T[] = [], bulk: number = 1) {
  const [running, setRunning] = React.useState(false);
  const [intervalId, setIntervalId] = React.useState<number>();
  /** 每个item的权重 */
  const [weights, setWeights] = React.useState<{ value: T; weight: number }[]>(
    items.map((s) => ({ value: s, weight: 1 })),
  );
  /** 选中的item */
  const [values, setValues] = React.useState<T[]>(
    Array(bulk)
      .fill(null)
      .map(() => pick()),
  );
  /** 抽卡次数 */
  const [count, setCount] = React.useState(0);
  /** 抽x次触发保底机制 */
  const [max, setMax] = React.useState(15);

  /**
   * 开始抽卡
   * @param interval 更新间隔
   */
  function start(interval: number = 1) {
    console.log("start");
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
    console.log("stop");
    if (!intervalId) {
      return;
    }
    clearInterval(intervalId);
    setRunning(false);
    // 记录抽卡次数
    setCount(count + 1);

    let vs = values;

    // 保底机制，如果抽数是max的倍数，则设置结果为概率最低的一些item
    if (max >= 0 && count >= max) {
      setCount(0);
      // lds:这样不行，第一次保底会抽到一个倒霉蛋，后面的保底都会抽到那个倒霉蛋
      // // 把item按照权重从低到高排序
      // const sorted = weights.sort((a, b) => a.weight - b.weight);
      // // 选取权重最低的value.length个item
      // const lowWeightItems = sorted.slice(0, values.length);
      // // 设置结果
      // vs = lowWeightItems.map((w) => w.value);
      // 找到所有权重!==1的item，从大到小排序
      const lowWeightItems = weights
        .filter((w) => w.weight !== 1)
        .sort((a, b) => b.weight - a.weight);
      // 选取最大权重的item.length个item
      const shuffled = lowWeightItems.slice(0, values.length);
      // 打乱顺序
      shuffled.sort(() => Math.random() - 0.5);
      // 设置结果
      vs = shuffled.map((w) => w.value);
    }

    // 给上次选中的学生降低50%的概率
    for (const value of vs) {
      console.log(value);
      setWeights((prev) =>
        prev.map((w) =>
          w.value === value ? { ...w, weight: w.weight * 0.5 } : w,
        ),
      );
    }

    setValues(vs);
  }
  /**
   * 抽取一个item，不会保底或修改权重
   * @returns 选中的item
   */
  function pick() {
    const value = choose(weights);
    return value;
  }
  /**
   * 重置
   */
  function reset() {
    setWeights((v) => v.map((w) => ({ ...w, weight: 1 })));
    setCount(0);
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
  /**
   * 设置所有item
   * @param items 所有item的数组
   */
  function setItems(items: T[]) {
    setWeights(items.map((s) => ({ value: s, weight: 1 })));
    reset();
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
    setWeights,
    setItems,
  };
}
