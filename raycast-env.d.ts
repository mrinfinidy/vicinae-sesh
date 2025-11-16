/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `cmd-connect` command */
  export type CmdConnect = ExtensionPreferences & {
  /** Open with (required) - Open with */
  "openWithApp"?: import("@raycast/api").Application,
  /** Environment Path - Colon-separated PATH (Unix-style), e.g /usr/local/bin:/usr/bin */
  "environmentPath": string
}
}

declare namespace Arguments {
  /** Arguments passed to the `cmd-connect` command */
  export type CmdConnect = {}
}

