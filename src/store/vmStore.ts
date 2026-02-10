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
    try {
      const url = envId 
        ? `${API_URL}/api/vms?environmentId=${envId}`
        : `${API_URL}/api/vms`;
      const res = await fetch(url);
      const vms = await res.json();
      set({ vms, selectedVmIds: [] }); // Clear selection when switching envs/reloading
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
    } catch (error) {
      console.error('Failed to delete VM', error);
    }
  },
}));
