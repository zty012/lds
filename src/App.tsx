import students from "./data/students.json";
import React from "react";
import { useWish } from "./wish";
import { getVersion } from "@tauri-apps/api/app";
import cn from "./cn";
import { useStore } from "./store";
import { getTextColor } from "./utils";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function App() {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const wish = useWish(students);
  const [version, setVersion] = React.useState("");
  const [bg, setBg] = useStore("bg", "#000000");

  React.useEffect(() => {
    getVersion().then((v) => setVersion(v));
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(event.key);
      if (event.key === "Delete") {
        setShowSidebar((v) => !v);
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
      className="flex h-screen select-none flex-col items-center justify-center overflow-hidden transition"
      style={{
        backgroundColor: bg,
        color: getTextColor(bg),
      }}
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
      <div
        className={cn(
          "fixed bottom-0 right-0 top-0 flex max-h-screen translate-x-full flex-col overflow-y-auto overflow-x-hidden rounded-lg bg-neutral-800/50 p-4 shadow-xl shadow-neutral-900/50 transition",
          {
            "translate-x-0": showSidebar,
          },
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div>Made By ZTY</div>
        <div>Version: {version}</div>
        <div>抽数: {wish.count}</div>
        <div>保底(-1=禁用保底): {wish.max}</div>
        <input
          type="range"
          min={-1}
          max={50}
          value={wish.max}
          onChange={(e) => {
            wish.setMax(parseInt(e.target.value));
          }}
        />
        <div>连抽: {wish.values.length}</div>
        <input
          type="range"
          min={1}
          max={50}
          value={wish.values.length}
          onChange={(e) => {
            wish.setBulk(parseInt(e.target.value));
          }}
        />
        <div>背景色: ↓点击选择颜色</div>
        <input
          type="color"
          className="h-8 w-full border border-white bg-transparent"
          value={bg}
          onChange={(e) => {
            setBg(e.target.value);
          }}
        />
        <button
          onClick={() => wish.reset()}
          className="bg-slate-800 py-1 transition hover:bg-slate-700"
        >
          重置权重
        </button>
        <button
          onClick={() => getCurrentWindow().setFullscreen(true)}
          className="bg-slate-800 py-1 transition hover:bg-slate-700"
        >
          全屏
        </button>
        <button
          onClick={() => getCurrentWindow().setFullscreen(false)}
          className="bg-slate-800 py-1 transition hover:bg-slate-700"
        >
          退出全屏
        </button>
        <div>权重:</div>
        <table className="text-xs">
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
    </div>
  );
}
