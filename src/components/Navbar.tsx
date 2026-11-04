import React from 'react';
import { ClipboardList, TableProperties, Code2 } from 'lucide-react';

export type NavTab = 'survey' | 'responses' | 'htmlScript';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  responsesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  responsesCount,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Centro CAB */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#39A900] flex items-center justify-center text-white font-black shadow-md shadow-emerald-900/10 flex-shrink-0">
              <svg
                viewBox="0 0 100 100"
                className="w-7 h-7 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="18" r="11" />
                <path d="M50 34c-12 0-22 9-24 21h48c-2-12-12-21-24-21z" />
                <path d="M22 61c-4 5-6 11-6 18h14c0-5 2-10 5-14l-13-4z" />
                <path d="M78 61l-13 4c3 4 5 9 5 14h14c0-7-2-13-6-18z" />
                <path d="M43 62h14v28H43z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#39A900]">
                  SENA CAB
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-500 font-medium">
                  Centro Agropecuario de Buga
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Sala de Computación F3
              </h1>
            </div>
          </div>

          {/* Three Top Tabs: Encuesta F3, Respuestas, HTML / Script */}
          <nav className="flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
            {/* Tab 1: Encuesta F3 */}
            <button
              type="button"
              onClick={() => onSelectTab('survey')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'survey'
                  ? 'bg-white text-emerald-900 shadow-sm border border-gray-200/80 scale-[1.02]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <ClipboardList className={`w-4 h-4 ${currentTab === 'survey' ? 'text-[#39A900]' : 'text-gray-500'}`} />
              <span>Encuesta F3</span>
            </button>

            {/* Tab 2: Respuestas */}
            <button
              type="button"
              onClick={() => onSelectTab('responses')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'responses'
                  ? 'bg-white text-emerald-900 shadow-sm border border-gray-200/80 scale-[1.02]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <TableProperties className={`w-4 h-4 ${currentTab === 'responses' ? 'text-[#39A900]' : 'text-gray-500'}`} />
              <span>Respuestas</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  currentTab === 'responses'
                    ? 'bg-emerald-100 text-[#39A900]'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {responsesCount}
              </span>
            </button>

            {/* Tab 3: HTML / Script */}
            <button
              type="button"
              onClick={() => onSelectTab('htmlScript')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'htmlScript'
                  ? 'bg-white text-emerald-900 shadow-sm border border-gray-200/80 scale-[1.02]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <Code2 className={`w-4 h-4 ${currentTab === 'htmlScript' ? 'text-[#39A900]' : 'text-gray-500'}`} />
              <span className="hidden sm:inline">HTML / Script</span>
              <span className="sm:hidden">&lt;/&gt;</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
