import { exec } from "child_process";
import { getPreferenceValues } from "@raycast/api";
import { getEnv } from "./env";

const env = getEnv();

interface Preferences {
  windowClass: string;
}

export function openApp() {
  const { windowClass } = getPreferenceValues<Preferences>();
  return new Promise<void>((resolve, reject) => {
    exec(
      `hyprctl dispatch focuswindow class:${windowClass}`,
      { env },
      (error, _, stderr) => {
        if (error || stderr) {
          console.error("Failed to focus terminal window:", error?.message ?? stderr);
          exec(windowClass, { env }, (fallbackError, _, fallbackStderr) => {
            if (fallbackError || fallbackStderr) {
              return reject(`Failed to focus or launch ${windowClass}: ${error?.message ?? stderr}`);
            }
            return resolve();
          });
        } else {
          return resolve();
        }
      },
    );
  });
}
