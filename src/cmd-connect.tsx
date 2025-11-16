import { useState, useEffect } from "react";

import {
  Icon,
  List,
  Action,
  ActionPanel,
  closeMainWindow,
  clearSearchBar,
  showToast,
  Toast,
  Color,
  confirmAlert,
} from "@raycast/api";
import { getSessions, connectToSession, closeSession, isTmuxRunning, shouldFocusSession, Session } from "./sesh";
import { openApp } from "./app";

function getIcon(session: Session) {
  switch (session.Src) {
    case "tmux":
      return {
        source: Icon.Bolt,
        tintColor: session.Attached >= 1 ? Color.Green : Color.Blue,
        tooltip: session.Attached >= 1 ? "Attached" : "Detached",
      };
    case "tmuxinator":
      return {
        source: Icon.Box,
        tintColor: Color.Magenta,
      };
    case "config":
      return {
        source: Icon.Cog,
        tintColor: Color.SecondaryText,
      };
    case "zoxide":
    default:
      return {
        source: Icon.Folder,
        tintColor: Color.SecondaryText,
      };
  }
}

function formatScore(score: number) {
  if (score === 0) return undefined;
  return String(Number.isInteger(score) ? score : score.toFixed(2));
}

export default function ConnectCommand() {
  const [sessions, setSessions] = useState<Array<Session>>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function getAndSetSessions() {
    try {
      const sessions = await getSessions();
      setSessions(sessions);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Couldn't get sessions",
        message: typeof error === "string" ? error : "Unknown reason",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      if (!(await isTmuxRunning())) {
        await showToast({
          style: Toast.Style.Failure,
          title: "tmux isn't running",
          message: "Please start tmux before using this command.",
        });
        setIsLoading(false);
        return;
      }
      await getAndSetSessions();
    })();
  }, []);

  async function connect(session: string) {
    try {
      setIsLoading(true);
      await connectToSession(session);
      
      // Only focus the window if the session has focus = true in sesh.toml
      if (shouldFocusSession(session)) {
        await openApp();
      }
      
      await closeMainWindow();
      await clearSearchBar();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Couldn't connect to session",
        message: typeof error === "string" ? error : "Unknown reason",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function killSession(session: string) {
    const confirmed = await confirmAlert({
      title: "Close Session",
      message: `Are you sure you want to close the session "${session}"?`,
      primaryAction: {
        title: "Close Session",
      },
      dismissAction: {
        title: "Cancel",
      },
    });

    if (!confirmed) return;

    try {
      await closeSession(session);
      await showToast({
        style: Toast.Style.Success,
        title: "Session closed",
        message: `Successfully closed session "${session}"`,
      });
      // Refresh the sessions list
      await getAndSetSessions();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Couldn't close session",
        message: typeof error === "string" ? error : "Unknown reason",
      });
      console.error(error);
    }
  }

  return (
    <List isLoading={isLoading}>
      {sessions.map((session, index) => {
        const accessories = [];

        if (session.Src === "tmux") {
          accessories.push({
            icon: Icon.AppWindow,
            text: String(session.Windows),
            tooltip: session.Windows === 1 ? "Window" : "Windows",
          });
        } else {
          accessories.push({
            text: formatScore(session.Score),
            icon: session.Src === "tmuxinator" ? Icon.Box : Icon.Racket,
            tooltip: "Score",
          });
        }

        return (
          <List.Item
            key={index}
            title={session.Name}
            icon={getIcon(session)}
            accessories={accessories}
            actions={
              <ActionPanel>
                <Action title="Connect to Session" onAction={() => connect(session.Name)} />
                <Action
                  title="Close Session"
                  icon={Icon.XMarkCircle}
                  shortcut={{ modifiers: ["ctrl"], key: "x" }}
                  onAction={() => killSession(session.Name)}
                  style={Action.Style.Destructive}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
