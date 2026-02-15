import React, { useState, useEffect } from 'react';
import { useEnvStore } from '../store/envStore';
import { useVMStore } from '../store/vmStore';
import { useAuthStore } from '../store/authStore';
import { Layers, Plus, Trash2, Settings, Save, LogOut } from 'lucide-react';

export const EnvironmentSelector: React.FC = () => {
  const { environments, selectedEnvId, fetchEnvironments, addEnvironment, deleteEnvironment, selectEnvironment, updateEnvironment } = useEnvStore();
  const { fetchVMs } = useVMStore();
  const { user, logout } = useAuthStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [editingEnv, setEditingEnv] = useState<string | null>(null);
  const [editCommand, setEditCommand] = useState('');

  useEffect(() => {
    fetchEnvironments();

    const handleVMChange = () => {
      fetchEnvironments();
    };

    window.addEventListener('vm-added', handleVMChange);
    window.addEventListener('vm-deleted', handleVMChange);

    return () => {
      window.removeEventListener('vm-added', handleVMChange);
      window.removeEventListener('vm-deleted', handleVMChange);
    };
  }, [fetchEnvironments]);

  useEffect(() => {
    if (selectedEnvId) {
      fetchVMs(selectedEnvId);
    }
  }, [selectedEnvId, fetchVMs]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEnvName) {
      await addEnvironment(newEnvName);
      setNewEnvName('');
      setIsAdding(false);
    }
  };

  const handleEdit = (env: { id: string; command?: string }) => {
    setEditingEnv(env.id);
    setEditCommand(env.command || '');
  };

  const saveCommand = async (id: string) => {
    await updateEnvironment(id, { command: editCommand });
    setEditingEnv(null);
  };

  return (
    <div className="w-full md:w-64 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col h-full">
      {/* User Info Section */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
        <div className="flex items-center gap-3">
          {user?.photos?.[0]?.value ? (
            <img src={user.photos[0].value} alt="User" className="w-8 h-8 rounded-full border border-zinc-700" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-medium truncate">{user?.displayName || 'User'}</div>
            <button
              onClick={() => logout()}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-0.5"
            >
              <LogOut size={10} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider text-zinc-400">
          <Layers size={16} /> Environments
        </h2>
        <button onClick={() => setIsAdding(!isAdding)} className="text-zinc-500 hover:text-white">
          <Plus size={16} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="p-2 border-b border-zinc-800">
          <input
            autoFocus
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-white mb-2"
            placeholder="Env Name"
            value={newEnvName}
            onChange={(e) => setNewEnvName(e.target.value)}
          />
          <div className="flex justify-end gap-1">
            <button type="button" onClick={() => setIsAdding(false)} className="text-xs px-2 py-1 text-zinc-400">Cancel</button>
            <button type="submit" className="text-xs px-2 py-1 bg-blue-600 rounded text-white">Add</button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto">
        {environments.map((env) => (
          <div key={env.id} className="border-b border-zinc-900">
            <div
              className={`group flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-900 ${selectedEnvId === env.id ? 'bg-zinc-900 border-l-2 border-blue-500' : 'border-l-2 border-transparent'
                }`}
              onClick={() => selectEnvironment(env.id)}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="font-medium text-sm truncate">{env.name}</span>
                {env.vmCount !== undefined && (
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full">
                    {env.vmCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(env); }}
                  className="p-1 hover:text-blue-400 text-zinc-500 transition-colors"
                  title="Edit Command"
                >
                  <Settings size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const pin = window.prompt(`Please enter the security key to delete the "${env.name}" environment:`);
                    if (pin === null) return; // Cancelled

                    if (useAuthStore.getState().verifyPin(pin)) {
                      deleteEnvironment(env.id);
                    } else {
                      alert("Invalid security key. Deletion cancelled.");
                    }
                  }}
                  className="p-1 hover:text-red-400 text-zinc-500 transition-colors"
                  title="Delete Environment"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {editingEnv === env.id && (
              <div className="p-2 bg-zinc-900/50 space-y-2">
                <label className="text-xs text-zinc-500">Custom Command for {env.name}</label>
                <textarea
                  className="w-full bg-black border border-zinc-700 rounded p-2 text-xs font-mono h-20"
                  value={editCommand}
                  onChange={(e) => setEditCommand(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingEnv(null)} className="text-xs text-zinc-400">Cancel</button>
                  <button onClick={() => saveCommand(env.id)} className="flex items-center gap-1 text-xs text-blue-400">
                    <Save size={12} /> Save
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
