import { Package, PlusCircle, MinusCircle, Trash2 } from 'lucide-react';

/**
 * InventoryTab Component
 * Displays player inventory
 */
import { useState } from 'react';

export default function InventoryTab({ player, onUseItem, onAddItem, onRemoveItem }) {
  const [newItemName, setNewItemName] = useState('');
  if (!player) {
    return (
      <div className="p-6 text-center text-purple-400">
        Loading inventory...
      </div>
    );
  }
  
  return (
    <div className="p-4 text-white h-full">     
      {/* Manage bar */}
      <div className="mb-3 flex items-center gap-2">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add item (e.g., Map)"
          className="flex-1 px-3 py-2 bg-slate-800/70 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />
        <button
          onClick={() => { if (newItemName.trim()) { onAddItem?.(newItemName.trim()); setNewItemName(''); } }}
          className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-3 py-2 rounded-lg text-sm shadow"
          title="Add Item"
        >
          <PlusCircle size={16} /> Add
        </button>
      </div>
      
      {player.inventory && player.inventory.length > 0 ? (
        <div className="space-y-2">
          {player.inventory.map((item, idx) => {
            // Handle both string items and object items {name, quantity}
            const itemName = typeof item === 'string' ? item : item.name;
            const itemQuantity = typeof item === 'object' && item.quantity ? item.quantity : 1;
            
            // Determine item color based on type
            const getItemColor = (name) => {
              const lowerName = name.toLowerCase();
              if (lowerName.includes('potion') || lowerName.includes('healing')) return 'from-red-600/30 to-pink-600/30 border-red-500/30';
              if (lowerName.includes('sword') || lowerName.includes('weapon') || lowerName.includes('dagger')) return 'from-orange-600/30 to-yellow-600/30 border-orange-500/30';
              if (lowerName.includes('armor') || lowerName.includes('shield') || lowerName.includes('mail')) return 'from-blue-600/30 to-cyan-600/30 border-blue-500/30';
              if (lowerName.includes('spell') || lowerName.includes('magic') || lowerName.includes('scroll') || lowerName.includes('book')) return 'from-purple-600/30 to-indigo-600/30 border-purple-500/30';
              return 'from-slate-700/50 to-slate-600/50 border-slate-600/50';
            };
            
            return (
              <div
                key={idx}
                className={`relative p-3 bg-gradient-to-br ${getItemColor(itemName)} rounded-xl hover:scale-105 border transition-all group shadow-md hover:shadow-xl`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-900/40 rounded-lg group-hover:bg-slate-900/60 transition-colors">
                      <Package size={18} className="text-slate-300 group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-medium text-slate-100 group-hover:text-white transition-colors text-sm">
                      {itemName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {itemQuantity > 1 && (
                      <span className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2.5 py-1 rounded-full font-bold shadow-lg">
                        ×{itemQuantity}
                      </span>
                    )}
                    <button
                      className="p-1 rounded bg-slate-900/40 hover:bg-slate-900/70 border border-slate-700/60"
                      title="Decrease quantity"
                      onClick={() => onRemoveItem?.(itemName, 1)}
                    >
                      <MinusCircle size={14} />
                    </button>
                    <button
                      className="p-1 rounded bg-slate-900/40 hover:bg-slate-900/70 border border-slate-700/60 text-red-300 hover:text-red-200"
                      title="Remove item"
                      onClick={() => onRemoveItem?.(itemName, itemQuantity || 1)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Hover info overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute right-2 top-2 text-[10px] bg-slate-900/80 border border-slate-600/60 rounded-md px-2 py-1 text-slate-200 shadow-lg">
                    Hovering: {itemName}
                  </div>
                  <div className="absolute left-2 bottom-2 text-[11px] text-slate-300">
                    Tip: type "use {itemName.toLowerCase()}" in chat
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-30">📦</div>
          <p className="text-slate-500 text-lg">
            Your inventory is empty
          </p>
        </div>
      )}
      
      {/* Help text */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-xl text-sm shadow-lg">
        <p className="text-blue-200">
          💡 <strong className="text-white">Tip:</strong> Hover an item to see details. To use an item, say it in chat, e.g., <em className="text-purple-300">"use healing potion"</em>.
        </p>
      </div>
    </div>
  );
}
