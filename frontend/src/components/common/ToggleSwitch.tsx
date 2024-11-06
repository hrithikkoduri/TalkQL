import { Switch } from '@headlessui/react';
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/24/outline';

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const ToggleSwitch = ({ enabled, setEnabled }: ToggleSwitchProps) => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
      <div className="relative bg-white/90 backdrop-blur-sm border border-gray-100/50 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex flex-col items-start gap-2">
          <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Visualization Mode
          </span>
          <div className="flex items-center gap-4 w-full">
            <Switch
              checked={enabled}
              onChange={setEnabled}
              className={`
                relative inline-flex items-center h-8 w-16 shrink-0 cursor-pointer rounded-full
                transition-colors duration-300 ease-in-out focus:outline-none
                ${enabled 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                  : 'bg-gray-200'
                }
              `}
            >
              <span className="sr-only">Enable visualization</span>
              <div
                className={`
                  absolute transform transition-transform duration-300 ease-in-out
                  ${enabled ? 'translate-x-9' : 'translate-x-1'}
                `}
              >
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-lg">
                  {enabled ? (
                    <ChartPieIcon className="h-3 w-3 text-purple-500" />
                  ) : (
                    <ChartBarIcon className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
            </Switch>
            <span 
              className={`
                text-sm font-medium transition-colors duration-300
                ${enabled 
                  ? 'text-purple-600' 
                  : 'text-gray-400'
                }
              `}
            >
              {enabled ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};