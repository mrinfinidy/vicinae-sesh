import { getPreferenceValues } from "@raycast/api";
import { exec } from "child_process";
import { getEnv } from "./env";

const env = getEnv();

export function openApp() {
  return new Promise<void>((resolve, reject) => {
    // Use Hyprland CLI to focus WezTerm window
    exec(`hyprctl dispatch focuswindow class:me.mloeper.wezterm_tmux_main`, { env }, (error, _, stderr) => {
      if (error || stderr) {
        console.error("Failed to focus WezTerm window:", error?.message ?? stderr);
        // Fallback: try to launch WezTerm if focus fails
        exec(`wezterm`, { env }, (fallbackError, _, fallbackStderr) => {
          if (fallbackError || fallbackStderr) {
            return reject(`Failed to focus or launch WezTerm: ${error?.message ?? stderr}`);
          }
          return resolve();
        });
      } else {
        return resolve();
      }
    });
  });
}
