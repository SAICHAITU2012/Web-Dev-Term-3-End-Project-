import { useState } from "react";

export function useAsyncAction() {
  const [isRunning, setIsRunning] = useState(false);

  async function run<T>(action: () => Promise<T>) {
    setIsRunning(true);

    try {
      return await action();
    } finally {
      setIsRunning(false);
    }
  }

  return {
    isRunning,
    run,
  };
}
