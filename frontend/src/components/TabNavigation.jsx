/**
 * TabNavigation Component
 * Switches between character sheet and inventory tabs
 */
export default function TabNavigation({ activeTab, onChange }) {
  const tabs = [
    { id: 'character', label: 'Character', icon: '⚔️' },
    { id: 'inventory', label: 'Inventory', icon: '🎒' }
  ];
  
  return (
    <div className="flex border-b border-gray-700 bg-gray-900">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 px-4 py-3 font-medium transition ${
            activeTab === tab.id
              ? 'bg-gray-800 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
