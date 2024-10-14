import React from "react";
import { createStore, Store } from "@tauri-apps/plugin-store";

export function useStore<T = string>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [value, setValue] = React.useState<T>(defaultValue);
  const [store, setStore] = React.useState<Store | null>(null);

  React.useEffect(() => {
    createStore("store.json")
      .then((s) => {
        setStore(s);
        console.log("Store created", store);
        return s.get<T>(key);
      })
      .then((value) => {
        setValue(value || defaultValue);
      });
  }, []);

  function updateValue(value: T) {
    console.log("Updating store", store, key, value);
    store?.set(key, value);
    setValue(value);
    store?.save();
  }

  return [value, updateValue];
}
