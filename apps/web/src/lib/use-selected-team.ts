import { useSyncExternalStore } from "react";

const STORAGE_KEY = "pr-round-robbin:selected-team";

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

export function getSelectedTeamId(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function selectTeamId(teamId: string) {
  localStorage.setItem(STORAGE_KEY, teamId);
  emitChange();
}

export function clearSelectedTeamId() {
  localStorage.removeItem(STORAGE_KEY);
  emitChange();
}

export function useSelectedTeam() {
  const teamId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    teamId,
    selectTeam: selectTeamId,
    clearTeam: clearSelectedTeamId,
  };
}
