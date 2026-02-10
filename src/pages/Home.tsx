import React, { useEffect } from 'react';
import { VMList } from '../components/VMList';
import { CommandExecutor } from '../components/CommandExecutor';
import { EnvironmentSelector } from '../components/EnvironmentSelector';
import { useVMStore } from '../store/vmStore';
import { useEnvStore } from '../store/envStore';

export default function Home() {
  const { fetchVMs } = useVMStore();
  const { fetchEnvironments, selectedEnvId } = useEnvStore();

  useEffect(() => {
    fetchEnvironments();
  }, [fetchEnvironments]);

  useEffect(() => {
    if (selectedEnvId) {
      fetchVMs(selectedEnvId);
    }
  }, [fetchVMs, selectedEnvId]);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      <EnvironmentSelector />
      <VMList />
      <CommandExecutor />
    </div>
  );
}
