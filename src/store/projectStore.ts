import { create } from 'zustand';
import type { Project } from '../types';

interface ProjectStoreState {
  projects: Project[];
  addProject: (project: Project) => void;
}

export const useProjectStore = create<ProjectStoreState>((set) => ({
  projects: [],
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
}));
