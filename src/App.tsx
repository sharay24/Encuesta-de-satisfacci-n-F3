import { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { SurveyFormDirect } from './components/SurveyFormDirect';
import { ResponsesView } from './components/ResponsesView';
import { HtmlScriptView } from './components/HtmlScriptView';
import { fetchAllResponses, DEFAULT_SPREADSHEET_ID, DEFAULT_SHEET_NAME } from './services/storage';
import { SurveyResponse } from './types/survey';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('survey');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchAllResponses();
      setResponses(data.responses);
    } catch (err) {
      console.error('Error fetching responses:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans">
      {/* Top Navigation Bar with the 3 requested tabs */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'responses') {
            loadData();
          }
        }}
        responsesCount={responses.length}
      />

      {/* Main Content Area based on currentTab */}
      <main className="flex-1">
        {currentTab === 'survey' && (
          <SurveyFormDirect
            onResponseSubmitted={loadData}
            onGoToResponses={() => {
              loadData();
              setCurrentTab('responses');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'responses' && (
          <ResponsesView
            responses={responses}
            onResponsesUpdated={loadData}
            isRefreshing={isRefreshing}
            onGoToSurvey={() => {
              setCurrentTab('survey');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'htmlScript' && <HtmlScriptView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-[#39A900] text-white flex items-center justify-center font-bold text-xs">
              SENA
            </div>
            <div>
              <p className="font-bold text-gray-800">
                Centro Agropecuario de Buga (CAB) • Regional Valle
              </p>
              <p className="text-gray-400">
                Encuesta de Satisfacción Sala F3 • Conectado por defecto a: &quot;{DEFAULT_SHEET_NAME}&quot; (ID: {DEFAULT_SPREADSHEET_ID})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-500">
            <button
              type="button"
              onClick={() => setCurrentTab('survey')}
              className="hover:text-emerald-700 font-medium transition-colors"
            >
              Encuesta F3
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                loadData();
                setCurrentTab('responses');
              }}
              className="hover:text-emerald-700 font-medium transition-colors"
            >
              Respuestas ({responses.length})
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setCurrentTab('htmlScript')}
              className="hover:text-emerald-700 font-medium transition-colors"
            >
              HTML / Script
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
