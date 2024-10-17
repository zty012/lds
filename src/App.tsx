import yb18 from "./data/students.json";
import React from "react";
import { useWish } from "./wish";
import { getVersion } from "@tauri-apps/api/app";
import cn from "./cn";
import { useStore } from "./store";
import { getTextColor } from "./utils";
import {
  Fullscreen,
  Gauge,
  Hash,
  List,
  ListOrdered,
  Palette,
  RefreshCcw,
  Verified,
  X,
} from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function App() {
  const [showWeights, setShowWeights] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const wish = useWish(yb18);
  const [version, setVersion] = React.useState("");
  const [bg, setBg] = useStore("bg", "#000000");
  const [tc, setTc] = useStore("tc", "#FFFFFF");

  React.useEffect(() => {
    getVersion().then((v) => setVersion(v));
    const handleKeyDown = (event: KeyboardEvent) => {
      // Insert显示权重
      if (event.key === "Insert") {
        setShowWeights((v) => !v);
      }
      // Delete显示设置面板
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
        color: tc,
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
        className="fixed left-0 right-0 top-0 z-10 h-12 transition hover:bg-neutral-700/20"
        data-tauri-drag-region
      ></div>
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
          "pointer-events-none fixed right-0 top-0 z-20 m-8 flex origin-top-right scale-90 flex-col gap-4 rounded-xl bg-black/20 p-8 text-white opacity-0 shadow-xl shadow-black/10 transition",
          {
            "pointer-events-auto scale-100 opacity-100": showSettings,
          },
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-2 gap-4 *:flex *:flex-col *:gap-2 *:rounded-lg *:bg-neutral-700/20 *:p-4 *:transition hover:*:opacity-70 active:*:scale-90">
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
              onChange={(e) => {
                setBg(e.target.value);
                setTc(getTextColor(e.target.value));
              }}
            />
          </div>
          <div>
            <Palette />
            <p>文字颜色: {tc}</p>
            <input
              type="color"
              value={tc}
              onChange={(e) => setTc(e.target.value)}
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
          <div onClick={() => wish.reset()}>
            <RefreshCcw />
            <p>重置</p>
          </div>
          <div
            onClick={() =>
              getCurrentWindow()
                .isFullscreen()
                .then((v) => getCurrentWindow().setFullscreen(!v))
            }
          >
            <Fullscreen />
            <p>全屏</p>
          </div>
          <div
            onDragEnter={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                const file = files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                  const data = e.target?.result;
                  if (typeof data !== "string") return;
                  if (data.startsWith("[")) {
                    const json = JSON.parse(data);
                    if (Array.isArray(json)) {
                      wish.setItems(json);
                    }
                  } else {
                    const lines = data.split("\n");
                    const items = lines.filter((l) => l.trim() !== "");
                    wish.setItems(items);
                  }
                };
                reader.readAsText(file);
              }
            }}
          >
            <List />
            <p>拖拽json或txt到此处可导入</p>
            <button onClick={() => wish.setItems(yb18)}>预备18班</button>
            <button
              onClick={() =>
                wish.setItems(
                  Array.from({ length: 45 }, (_, i) => (i + 1).toString()),
                )
              }
            >
              数字1-45
            </button>
          </div>
          <div onClick={() => getCurrentWindow().close()}>
            <X />
            <p>退出</p>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-20 m-8 flex max-h-full origin-top-left scale-90 flex-col gap-4 overflow-auto rounded-xl bg-black/20 p-8 text-xs text-white opacity-0 shadow-xl shadow-black/10 transition",
          {
            "pointer-events-auto scale-100 opacity-100": showWeights,
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
