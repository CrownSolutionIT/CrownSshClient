import React, { memo } from 'react';
import { VM } from '../types';
import { Pin, CheckSquare, Square, Edit2, Trash2 } from 'lucide-react';

interface VMListItemProps {
  vm: VM;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onEdit: (vm: VM, e: React.MouseEvent) => void;
  onDelete: (id: string) => void;
}

export const VMListItem = memo(({ vm, isSelected, onToggle, onPin, onEdit, onDelete }: VMListItemProps) => {
  return (
    <div
      className={`group flex items-center justify-between p-2 rounded cursor-pointer ${
        isSelected ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
      }`}
      onClick={() => onToggle(vm.id)}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {vm.isPinned && !isSelected ? (
           <Pin size={16} className="text-yellow-500 flex-shrink-0" fill="currentColor" />
        ) : isSelected ? (
          <CheckSquare size={16} className="text-blue-500 flex-shrink-0" />
        ) : (
          <Square size={16} className="text-zinc-600 flex-shrink-0" />
        )}
        <div className="truncate">
          <div className="font-medium text-sm truncate">{vm.name || vm.ip}</div>
          <div className="text-xs text-zinc-500 truncate">{vm.username}@{vm.ip}</div>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
         <button
          onClick={(e) => {
            e.stopPropagation();
            onPin(vm.id, !vm.isPinned);
          }}
          className={`p-1 hover:text-yellow-400 transition-colors ${vm.isPinned ? 'text-yellow-500 opacity-100' : 'text-zinc-500'}`}
          title={vm.isPinned ? "Unpin VM" : "Pin VM"}
        >
          <Pin size={14} fill={vm.isPinned ? "currentColor" : "none"} />
        </button>
         <button
          onClick={(e) => onEdit(vm, e)}
          className="p-1 hover:text-blue-400 transition-colors text-zinc-500"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if(confirm('Are you sure you want to delete this VM?')) onDelete(vm.id);
          }}
          className="p-1 hover:text-red-400 transition-colors text-zinc-500"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
});

VMListItem.displayName = 'VMListItem';
