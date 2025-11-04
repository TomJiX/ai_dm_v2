import { Package } from 'lucide-react';

/**
 * InventoryTab Component
 * Displays player inventory
 */
export default function InventoryTab({ player, onUseItem }) {
  if (!player) {
    return (
      <div className="p-6 text-center text-purple-400">
        Loading inventory...
      </div>
    );
  }
  
  return (
    <div className="p-4 text-white h-full">      
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
                className={`p-3 bg-gradient-to-br ${getItemColor(itemName)} rounded-xl hover:scale-105 border cursor-pointer transition-all group shadow-md hover:shadow-xl`}
                onClick={() => onUseItem && onUseItem(item)}
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
                  {itemQuantity > 1 && (
                    <span className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2.5 py-1 rounded-full font-bold shadow-lg">
                      ×{itemQuantity}
                    </span>
                  )}
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
          💡 <strong className="text-white">Tip:</strong> Click an item to use it, or describe how you want to use it in chat.
        </p>
      </div>
    </div>
  );
}
