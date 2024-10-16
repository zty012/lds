import students from "./data/students.json";
import React from "react";
import { useWish } from "./wish";
import { getVersion } from "@tauri-apps/api/app";
import cn from "./cn";
import { useStore } from "./store";
import { getTextColor } from "./utils";
import {
  Gauge,
  Hash,
  ListOrdered,
  Palette,
  RefreshCcw,
  Verified,
} from "lucide-react";

export default function App() {
  const [showSettings, setShowSettings] = React.useState(false);
  const wish = useWish(students);
  const [version, setVersion] = React.useState("");
  const [bg, setBg] = useStore("bg", "#000000");

  React.useEffect(() => {
    getVersion().then((v) => setVersion(v));
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(event.key);
      if (event.key === "Delete") {
        setShowSettings((v) => !v);
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
      <div
        className={cn(
          "container flex flex-wrap items-center justify-center gap-8 overflow-hidden text-center text-7xl font-bold opacity-90 transition duration-300",
          {
            "scale-90": wish.running,
          },
        )}
      >
        {wish.values.map((v, i) => (
          <span key={i}>{v}</span>
        ))}
      </div>
      <div
        className={cn(
          "fixed right-0 top-0 z-10 m-8 flex origin-top-right scale-90 flex-col gap-4 rounded-xl bg-black/20 p-8 text-white opacity-0 shadow-xl shadow-black/10 transition",
          {
            "scale-100 opacity-100": showSettings,
          },
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-3xl font-bold">设置 & 关于</h1>
        <div className="grid grid-cols-2 gap-4 *:flex *:flex-col *:gap-2 *:rounded-lg *:bg-neutral-700/20 *:p-4">
          <div>
            <Verified />
            <p>By ZTY</p>
          </div>
          <div>
            <Hash />
            <p>{version}</p>
          </div>
          <div>
            <Palette />
            <p>背景颜色: {bg}</p>
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
            />
          </div>
          <div>
            <Gauge />
            <p>
              抽数: {wish.count} / {wish.max}
            </p>
            <input
              type="range"
              min="-1"
              max="50"
              value={wish.max}
              onChange={(e) => wish.setMax(Number(e.target.value))}
            />
          </div>
          <div>
            <ListOrdered />
            <p>连抽: {wish.values.length}</p>
            <input
              type="range"
              min="1"
              max="50"
              value={wish.values.length}
              onChange={(e) => wish.setBulk(Number(e.target.value))}
            />
          </div>
          <div>
            <RefreshCcw />
            <p>重置权重</p>
            <button onClick={() => wish.reset()}>确定</button>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "fixed left-0 top-0 z-10 m-8 flex max-h-full origin-top-left scale-90 flex-col gap-4 overflow-auto rounded-xl bg-black/20 p-8 text-xs text-white opacity-0 shadow-xl shadow-black/10 transition",
          {
            "scale-100 opacity-100": showSettings,
          },
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>权重</th>
            </tr>
          </thead>
          <tbody>
            {wish.weights
              .sort((a, b) => a.value.localeCompare(b.value))
              .map((s) => (
                <tr key={s.value}>
                  <td>{s.value}</td>
                  <td>{s.weight}</td>
                  <td>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={s.weight}
                      onChange={(e) =>
                        wish.setWeights((weights) => [
                          ...weights.filter((w) => w.value !== s.value),
                          { value: s.value, weight: Number(e.target.value) },
                        ])
                      }
                      className="h-2 w-32"
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
