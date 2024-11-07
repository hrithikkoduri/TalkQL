import { TabularModeToggle } from './TabularModeToggle';
import { ToggleSwitch } from './ToggleSwitch';

interface ResponseModesProps {
  tabularEnabled: boolean;
  setTabularEnabled: (enabled: boolean) => void;
  vizEnabled: boolean;
  setVizEnabled: (enabled: boolean) => void;
}

export const ResponseModes = ({ 
    tabularEnabled, 
    setTabularEnabled, 
    vizEnabled, 
    setVizEnabled 
  }: ResponseModesProps) => {
    return (
      <div className="relative group w-full">
        {/* Gradient blur effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-all duration-300" />
        
        {/* Main container */}
        <div className="relative bg-white/90 backdrop-blur-sm border border-gray-100/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Heading section */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Response Display Modes
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Customize how your query results are displayed
            </p>
            <div className="h-0.5 w-16 mx-auto mt-3 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full" />
          </div>
  
          {/* Toggle switches */}
          <div className="space-y-3">
            <TabularModeToggle enabled={tabularEnabled} setEnabled={setTabularEnabled} />
            <ToggleSwitch enabled={vizEnabled} setEnabled={setVizEnabled} />
          </div>
        </div>
      </div>
    );
  };