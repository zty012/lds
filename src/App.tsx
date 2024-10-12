import students from "./data/students.json";
import React from "react";
import clsx from "clsx";
import { useWish } from "./wish";
import { getVersion } from "@tauri-apps/api/app";

export default function App() {
  const [showDebug, setShowDebug] = React.useState(false);
  const wish = useWish(students);
  const [version, setVersion] = React.useState("");

  React.useEffect(() => {
    getVersion().then((v) => setVersion(v));
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(event.key);
      if (event.key === "Delete") {
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
          "bg-neutral-900": wish.running,
        },
      )}
      onClick={() => {
        if (wish.running) {
          wish.stop();
        } else {
          wish.start();
        }
      }}
    >
      <div className="container flex flex-wrap items-center justify-center gap-8 overflow-hidden text-center text-7xl font-bold">
        {wish.values.map((v, i) => (
          <span key={i}>{v}</span>
        ))}
      </div>
      {showDebug && (
        <div
          className="fixed bottom-0 right-0 top-0 max-h-screen overflow-auto text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div>Made By ZTY</div>
          <div>Version: {version}</div>
          <div>抽数: {wish.count}</div>
          <div>保底: {wish.max}</div>
          <input
            type="range"
            min={-1}
            max={100}
            value={wish.max}
            onChange={(e) => {
              wish.setMax(parseInt(e.target.value));
            }}
          />
          <div>连抽: {wish.values.length}</div>
          <input
            type="range"
            min={1}
            max={10}
            value={wish.values.length}
            onChange={(e) => {
              wish.setBulk(parseInt(e.target.value));
            }}
          />
          <button onClick={() => wish.reset()}>【重置概率】</button>
          <table>
            <tbody>
              {wish.weights
                .sort((a, b) => b.weight - a.weight)
                .map((w) => (
                  <tr key={w.value} className="leading-none">
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
