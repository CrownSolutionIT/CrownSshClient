import { useState, useEffect } from "react";
import { EnvironmentSelector } from "@/components/EnvironmentSelector";
import { VMList } from "@/components/VMList";
import { CommandExecutor } from "@/components/CommandExecutor";
import { useVMStore } from "../store/vmStore";
import { useEnvStore } from "../store/envStore";
import { Layers, Server, Terminal } from "lucide-react";

export default function Home() {
  const { fetchVMs } = useVMStore();
  const { fetchEnvironments, selectedEnvId } = useEnvStore();
  const [activeTab, setActiveTab] = useState<'env' | 'vm' | 'exec'>('env');

  useEffect(() => {
    fetchEnvironments();
  }, [fetchEnvironments]);

  useEffect(() => {
    if (selectedEnvId) {
      fetchVMs(selectedEnvId);
    }
  }, [fetchVMs, selectedEnvId]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black text-white overflow-hidden font-sans">
      {/* Mobile: Environment Selector */}
      <div className={`${activeTab === 'env' ? 'flex' : 'hidden'} md:flex flex-1 md:flex-none h-full overflow-hidden`}>
        <EnvironmentSelector />
      </div>

      {/* Mobile: VM List */}
      <div className={`${activeTab === 'vm' ? 'flex' : 'hidden'} md:flex flex-1 md:flex-none h-full overflow-hidden`}>
        <VMList />
      </div>

      {/* Mobile: Command Executor */}
      <div className={`${activeTab === 'exec' ? 'flex' : 'hidden'} md:flex flex-1 h-full overflow-hidden`}>
        <CommandExecutor />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden flex items-center justify-around bg-zinc-950 border-t border-zinc-800 p-2 shrink-0 z-50">
        <button
          onClick={() => setActiveTab('env')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            activeTab === 'env' ? 'text-blue-500 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Layers size={20} />
          <span className="text-[10px] font-medium uppercase tracking-wide">Env</span>
        </button>
        <button
          onClick={() => setActiveTab('vm')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            activeTab === 'vm' ? 'text-blue-500 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Server size={20} />
          <span className="text-[10px] font-medium uppercase tracking-wide">VMs</span>
        </button>
        <button
          onClick={() => setActiveTab('exec')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            activeTab === 'exec' ? 'text-blue-500 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Terminal size={20} />
          <span className="text-[10px] font-medium uppercase tracking-wide">Exec</span>
        </button>
      </div>
    </div>
  );
}
