import { create } from 'zustand';
import { StudioMode, Job, VisualDNA } from '@/types';
import { DEFAULT_DNA } from '@/lib/visualDNA';

interface StudioState {
  mode: StudioMode;
  selectedTopicId: string | null;
  selectedTemplateId: string | null;
  selectedModelId: string | null;
  
  // Clone Mode
  cloneInputText: string;
  visualDNA: VisualDNA;
  
  // Batch Mode
  batchSize: number;
  jobs: Job[];
  
  // Actions
  setMode: (mode: StudioMode) => void;
  setTopic: (id: string) => void;
  setTemplate: (id: string) => void;
  setModel: (id: string) => void;
  setCloneInput: (text: string) => void;
  setVisualDNA: (dna: VisualDNA) => void;
  setBatchSize: (size: number) => void;
  addJobs: (newJobs: Job[]) => void;
  updateJobStatus: (id: string, status: Job['status'], resultUrl?: string, error?: string) => void;
  clearJobs: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  mode: 'single',
  selectedTopicId: null,
  selectedTemplateId: null,
  selectedModelId: null,
  
  cloneInputText: '',
  visualDNA: DEFAULT_DNA,
  
  batchSize: 10,
  jobs: [],
  
  setMode: (mode) => set({ mode }),
  setTopic: (id) => set({ selectedTopicId: id, selectedTemplateId: null }), // Reset template on topic change
  setTemplate: (id) => set({ selectedTemplateId: id }),
  setModel: (id) => set({ selectedModelId: id }),
  setCloneInput: (text) => set({ cloneInputText: text }),
  setVisualDNA: (dna) => set({ visualDNA: dna }),
  setBatchSize: (size) => set({ batchSize: size }),
  
  addJobs: (newJobs) => set((state) => ({ jobs: [...state.jobs, ...newJobs] })),
  
  updateJobStatus: (id, status, resultUrl, error) => set((state) => ({
    jobs: state.jobs.map(j => j.id === id ? { ...j, status, resultUrl, error } : j)
  })),
  
  clearJobs: () => set({ jobs: [] }),
}));
