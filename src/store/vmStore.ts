import { create } from 'zustand';
import { VM, ExecutionLog, ExecutionStatus } from '../types';

interface VMState {
  vms: VM[];
  selectedVmIds: string[];
  logs: ExecutionLog[];
  statuses: Record<string, 'pending' | 'running' | 'success' | 'error'>;
  
  setVMs: (vms: VM[]) => void;
  toggleVMSelection: (id: string) => void;
  selectAllVMs: () => void;
  deselectAllVMs: () => void;
  addLog: (log: ExecutionLog) => void;
  updateStatus: (status: ExecutionStatus) => void;
  clearLogs: () => void;
  
  fetchVMs: (envId?: string) => Promise<void>;
  addVM: (vm: Omit<VM, 'id'>) => Promise<void>;
  updateVM: (id: string, vm: Partial<VM>) => Promise<void>;
  deleteVM: (id: string) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7002';

export const useVMStore = create<VMState>((set, get) => ({
  vms: [],
  selectedVmIds: [],
  logs: [],
  statuses: {},

  setVMs: (vms) => set({ vms }),
  
  toggleVMSelection: (id) => set((state) => ({
    selectedVmIds: state.selectedVmIds.includes(id)
      ? state.selectedVmIds.filter((vmId) => vmId !== id)
      : [...state.selectedVmIds, id]
  })),

  selectAllVMs: () => set((state) => ({ selectedVmIds: state.vms.map(v => v.id) })),
  deselectAllVMs: () => set({ selectedVmIds: [] }),

  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  
  updateStatus: ({ vmId, status }) => set((state) => ({
    statuses: { ...state.statuses, [vmId]: status }
  })),

  clearLogs: () => set({ logs: [], statuses: {} }),

  fetchVMs: async (envId) => {
    const { vms, selectedVmIds } = get();
    // Optimistic check: if we already have VMs for this env (filtered in memory), maybe don't fetch?
    // But we need fresh data. 
    // Let's implement simple caching or just rely on React Query / SWR in future.
    // For now, to reduce "stutter", we can avoid clearing state immediately.
    
    try {
      const url = envId 
        ? `${API_URL}/api/vms?environmentId=${envId}`
        : `${API_URL}/api/vms`;
      const res = await fetch(url);
      const newVms = await res.json();
      
      // Only update if data changed to avoid re-renders? 
      // JSON.stringify comparison is expensive but better than UI flicker for small datasets
      if (JSON.stringify(newVms) !== JSON.stringify(vms)) {
         set({ vms: newVms, selectedVmIds: [] });
      }
    } catch (error) {
      console.error('Failed to fetch VMs', error);
    }
  },

  addVM: async (vm) => {
    try {
      const res = await fetch(`${API_URL}/api/vms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vm),
      });
      const newVM = await res.json();
      set((state) => ({ vms: [...state.vms, newVM] }));
      
      // Update environment VM count
      // This is a bit of a hack to update the environment store from the vm store
      // ideally we would use a single store or an event bus
      // but for now, we can just trigger a fetch of environments
      // import { useEnvStore } from './envStore'; is not possible due to circular dependency
      // so we will rely on the component to refresh the environments if needed
      // OR we can export a function from envStore to update specific env
      
      // Better approach: Since we can't easily access the other store here directly without circular deps,
      // and we want real-time updates for the "Environment List" (which shows counts),
      // we should consider if we can just re-fetch environments.
      
      // Actually, we can just dispatch a custom event that the environment selector listens to
      window.dispatchEvent(new Event('vm-added'));
      
    } catch (error) {
      console.error('Failed to add VM', error);
    }
  },

  updateVM: async (id, vmData) => {
    try {
      const res = await fetch(`${API_URL}/api/vms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vmData),
      });
      const updatedVM = await res.json();
      set((state) => ({
        vms: state.vms.map((v) => (v.id === id ? updatedVM : v)),
      }));
    } catch (error) {
      console.error('Failed to update VM', error);
    }
  },

  deleteVM: async (id) => {
    try {
      await fetch(`${API_URL}/api/vms/${id}`, { method: 'DELETE' });
      set((state) => ({ 
        vms: state.vms.filter((v) => v.id !== id),
        selectedVmIds: state.selectedVmIds.filter((vmId) => vmId !== id)
      }));
      window.dispatchEvent(new Event('vm-deleted'));
    } catch (error) {
      console.error('Failed to delete VM', error);
    }
  },
}));
