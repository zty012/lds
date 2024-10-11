import students from "./data/students.json";
import React from "react";
import clsx from "clsx";
import { choose } from "./random";

export default function App() {
  const [running, setRunning] = React.useState(false);
  const [intervalId, setIntervalId] = React.useState<number>();
  const [weights, setWeights] = React.useState(
    students.map((s) => ({ value: s, weight: 1 })),
  );
  const [selected, setSelected] = React.useState<string>("");
  // 抽卡次数
  const [count, setCount] = React.useState(0);
  const [showDebug, setShowDebug] = React.useState(false);

  React.useEffect(() => {
    console.log(intervalId);
    if (running) {
      setIntervalId(
        setInterval(() => {
          setSelected(choose(weights));
        }, 1),
      );
    } else if (intervalId) {
      clearInterval(intervalId);
      setCount(count + 1);
      // 保底机制，如果抽数==10,则选中概率最低的学生
      if (count === 10) {
        setSelected(weights.sort((a, b) => a.weight - b.weight)[0].value);
        setCount(0);
      }
      // 给选中的学生降低概率
      const newWeights = weights.map((w) =>
        w.value === selected ? { ...w, weight: w.weight * 0.5 } : w,
      );
      setWeights(newWeights);
      // 如果所有学生的概率都是0,则重置概率
      if (newWeights.every((w) => w.weight === 0)) {
        setWeights(students.map((s) => ({ value: s, weight: 1 })));
      }
    }
  }, [running]);

  React.useEffect(() => {
    // 按F3显示调试信息
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(event.key);
      if (event.key === "F2") {
        setShowDebug((v) => !v);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 黑色背景，在页面中间显示一个div
  return (
    <div
      className={clsx(
        "flex h-screen select-none flex-col items-center justify-center overflow-hidden bg-black pb-20 text-white transition",
        {
          "bg-neutral-900": running,
        },
      )}
      onClick={() => setRunning(!running)}
    >
      <div className="flex flex-col overflow-hidden text-center text-7xl font-bold">
        {selected}
      </div>
      {showDebug && (
        <div className="fixed bottom-0 right-0 top-0 max-h-screen overflow-hidden text-xs">
          <div>抽数: {count}/10</div>
          <table>
            <tbody>
              {weights
                .sort((a, b) => b.weight - a.weight)
                .map((w) => (
                  <tr key={w.value}>
                    <td className="p-1">{w.value}</td>
                    <td className="p-1">
                      {((w.weight / students.length) * 100).toPrecision(10)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
