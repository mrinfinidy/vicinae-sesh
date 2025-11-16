import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  environmentPath: string;
}

export function getEnv(): NodeJS.ProcessEnv {
  const preferences = getPreferenceValues<Preferences>();
  return {
    ...process.env,
    PATH: preferences.environmentPath,
  };
}
