import { exec } from "child_process";
import { getEnv } from "./env";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import * as toml from "toml";

const env = getEnv();

export interface Session {
  Src: string; // tmux or zoxide
  Name: string; // The display name
  Path: string; // The absolute directory path
  Score: number; // The score of the session (from Zoxide)
  Attached: number; // Whether the session is currently attached
  Windows: number; // The number of windows in the session
}

interface SessionConfig {
  name: string;
  focus?: boolean;
  [key: string]: unknown;
}

export function getSessions() {
  return new Promise<Session[]>((resolve, reject) => {
    exec(`sesh list --json`, { env }, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error("stderr ", stderr);
        console.error("error ", error);
        return reject(`Please upgrade to the latest version of the sesh CLI`);
      }
      const sessions = JSON.parse(stdout);
      return resolve(sessions ?? []);
    });
  });
}

export function connectToSession(session: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    exec(`sesh connect --switch "${session}"`, { env }, (error, _, stderr) => {
      if (error || stderr) {
        console.error("error ", error);
        console.error("stderr ", stderr);
        return reject(error?.message ?? stderr);
      }
      return resolve();
    });
  });
}

export function closeSession(session: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    exec(`sesh kill "${session}"`, { env }, (error, _, stderr) => {
      if (error || stderr) {
        console.error("error ", error);
        console.error("stderr ", stderr);
        return reject(error?.message ?? stderr);
      }
      return resolve();
    });
  });
}

export function shouldFocusSession(sessionName: string): boolean {
  try {
    const configPath = join(homedir(), ".config", "sesh", "sesh.toml");
    const configContent = readFileSync(configPath, "utf-8");
    const config = toml.parse(configContent);

    // Check if there's a session configuration with focus = true
    if (config.session && Array.isArray(config.session)) {
      const sessionConfig = config.session.find((s: SessionConfig) => s.name === sessionName);
      return sessionConfig?.focus === true;
    }

    // If no specific session config found, default to false
    return false;
  } catch (error) {
    // If config file doesn't exist or can't be parsed, default to false
    console.error("Could not read sesh.toml:", error);
    return false;
  }
}

export function isTmuxRunning(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    exec(`tmux ls`, { env }, (error, _, stderr) => resolve(!(error || stderr)));
  });
}
