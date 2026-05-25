import { useLiveQuery } from "dexie-react-hooks";
import { create } from "zustand";
import { db, type Project } from "./db";

const KEY = "paperassistant.currentProjectId";

interface State {
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
}

export const useCurrentProjectStore = create<State>((set) => ({
  currentProjectId: localStorage.getItem(KEY),
  setCurrentProjectId: (id) => {
    if (id) localStorage.setItem(KEY, id);
    else localStorage.removeItem(KEY);
    set({ currentProjectId: id });
  },
}));

export function useCurrentProject() {
  const { currentProjectId, setCurrentProjectId } = useCurrentProjectStore();
  const currentProject = useLiveQuery<Project | undefined>(
    () => (currentProjectId ? db.projects.get(currentProjectId) : Promise.resolve(undefined)),
    [currentProjectId],
  );
  return { currentProject, currentProjectId, setCurrentProjectId };
}
