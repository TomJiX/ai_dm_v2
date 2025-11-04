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
    <div className="p-6 bg-gray-900 text-white overflow-y-auto h-full">
      <h2 className="text-2xl font-bold mb-4">Inventory</h2>
      
      {player.inventory && player.inventory.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {player.inventory.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition group"
              onClick={() => onUseItem && onUseItem(item)}
            >
              <div className="flex items-center gap-3">
                <Package size={24} className="text-gray-400 group-hover:text-blue-400" />
                <span className="font-medium">{item}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-12">
          Your inventory is empty
        </p>
      )}
      
      {/* Help text */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg text-sm">
        <p className="text-blue-300">
          💡 <strong>Tip:</strong> Click an item to use it, or describe how you want to use it in chat.
        </p>
      </div>
    </div>
  );
}
