import { Package } from 'lucide-react';

/**
 * InventoryTab Component
 * Displays player inventory
 */
export default function InventoryTab({ player, onUseItem }) {
  if (!player) {
    return (
      <div className="p-6 text-center text-gray-400">
        Loading inventory...
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-slate-900/50 text-white overflow-y-auto h-full custom-scrollbar">
      <h2 className="text-2xl font-bold mb-4 text-gradient flex items-center gap-2">
        📦 Inventory
      </h2>
      
      {player.inventory && player.inventory.length > 0 ? (
        <div className="space-y-2">
          {player.inventory.map((item, idx) => {
            // Handle both string items and object items {name, quantity}
            const itemName = typeof item === 'string' ? item : item.name;
            const itemQuantity = typeof item === 'object' && item.quantity ? item.quantity : 1;
            
            return (
              <div
                key={idx}
                className="p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 border border-slate-700/50 hover:border-purple-500/50 cursor-pointer transition-all group transform hover:scale-105 hover:shadow-lg shadow-md"
                onClick={() => onUseItem && onUseItem(item)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-700/50 rounded-lg group-hover:bg-purple-600/30 transition-colors">
                      <Package size={20} className="text-slate-400 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                      {itemName}
                    </span>
                  </div>
                  {itemQuantity > 1 && (
                    <span className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1.5 rounded-full font-bold shadow-lg">
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
