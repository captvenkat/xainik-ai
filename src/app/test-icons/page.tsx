import Icon from '@/components/ui/Icon'

export default function TestIcons() {
  const icons = [
    { name: 'soldier', label: 'Soldier' },
    { name: 'medal', label: 'Medal' },
    { name: 'trophy', label: 'Trophy' },
    { name: 'people', label: 'People' },
    { name: 'money', label: 'Money' },
    { name: 'calendar', label: 'Calendar' },
    { name: 'email', label: 'Email' },
    { name: 'spy', label: 'Spy' },
    { name: 'handshake', label: 'Handshake' },
    { name: 'target', label: 'Target' }
  ] as const

  return (
    <div className="min-h-screen bg-premium-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-premium-white mb-8 text-center">
          Icon Test Page
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {icons.map((icon) => (
            <div key={icon.name} className="text-center">
              <div className="bg-premium-gray/30 p-6 rounded-2xl border border-military-gold/20 mb-4">
                <Icon 
                  name={icon.name} 
                  size="xl" 
                  className="text-military-gold mx-auto mb-2" 
                />
                <p className="text-premium-white text-sm">{icon.label}</p>
              </div>
              
              <div className="space-y-2">
                <div className="bg-premium-gray/20 p-3 rounded-lg">
                  <Icon name={icon.name} size="sm" className="text-military-gold mx-auto" />
                  <p className="text-gray-400 text-xs mt-1">Small</p>
                </div>
                
                <div className="bg-premium-gray/20 p-3 rounded-lg">
                  <Icon name={icon.name} size="md" className="text-military-gold mx-auto" />
                  <p className="text-gray-400 text-xs mt-1">Medium</p>
                </div>
                
                <div className="bg-premium-gray/20 p-3 rounded-lg">
                  <Icon name={icon.name} size="lg" className="text-military-gold mx-auto" />
                  <p className="text-gray-400 text-xs mt-1">Large</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="/donor-wall" 
            className="inline-block bg-military-gold hover:bg-yellow-500 text-black font-semibold px-8 py-4 rounded-xl transition-all duration-300"
          >
            View Donor Wall
          </a>
        </div>
      </div>
    </div>
  )
}
