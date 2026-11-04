import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Table,
  Layers,
} from 'lucide-react';
import { Header } from './components/Header';
import { SurveyForm } from './components/SurveyForm';
import { SheetConfigModal } from './components/SheetConfigModal';
import { ResponsesViewerModal } from './components/ResponsesViewerModal';
import { HtmlSnippetModal } from './components/HtmlSnippetModal';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/auth';
import { fetchSpreadsheetInfo } from './services/sheets';
import { SheetInfo } from './types/survey';

const SAVED_SHEET_KEY = 'sena_f3_survey_sheet_id';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [sheetInfo, setSheetInfo] = useState<SheetInfo | null>(null);
  const [isSheetConfigOpen, setIsSheetConfigOpen] = useState(false);
  const [isResponsesViewerOpen, setIsResponsesViewerOpen] = useState(false);
  const [isHtmlSnippetOpen, setIsHtmlSnippetOpen] = useState(false);

  // Load saved sheet if available
  const loadSavedSheet = useCallback(async (token: string) => {
    const savedId = localStorage.getItem(SAVED_SHEET_KEY);
    if (!savedId) return;

    try {
      const info = await fetchSpreadsheetInfo(token, savedId);
      setSheetInfo(info);
    } catch (e) {
      console.warn('Could not restore saved sheet:', e);
    }
  }, []);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      async (authenticatedUser, token) => {
        setUser(authenticatedUser);
        setAccessToken(token);
        if (token) {
          loadSavedSheet(token);
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [loadSavedSheet]);

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        await loadSavedSheet(result.accessToken);

        // If no sheet is configured yet, offer to open config
        const saved = localStorage.getItem(SAVED_SHEET_KEY);
        if (!saved) {
          setIsSheetConfigOpen(true);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con Google';
      setAuthError(msg);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  const handleSheetSelected = (newSheet: SheetInfo) => {
    setSheetInfo(newSheet);
    localStorage.setItem(SAVED_SHEET_KEY, newSheet.id);
  };

  const refreshSheetData = async () => {
    const token = accessToken || (await getAccessToken());
    if (token && sheetInfo) {
      try {
        const updated = await fetchSpreadsheetInfo(token, sheetInfo.id);
        setSheetInfo(updated);
      } catch (err) {
        console.error('Error refreshing sheet:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans">
      {/* Top Navigation & SENA Header */}
      <Header
        user={user}
        sheetInfo={sheetInfo}
        isLoadingAuth={isLoadingAuth}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onOpenSheetConfig={() => setIsSheetConfigOpen(true)}
        onOpenHtmlSnippet={() => setIsHtmlSnippetOpen(true)}
        onOpenResponsesViewer={() => setIsResponsesViewerOpen(true)}
      />

      {/* Auth Alert if any */}
      {authError && (
        <div className="max-w-4xl mx-auto mt-4 px-4 w-full">
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-800 text-sm">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              type="button"
              onClick={() => setAuthError(null)}
              className="text-xs font-semibold text-red-600 underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Banner if user is not signed in yet */}
        {!user && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-b border-emerald-100 py-3.5 px-4 text-center">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-xs sm:text-sm text-emerald-950">
              <span className="font-semibold flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#39A900]" />
                Conecta tu cuenta de Google para enviar automáticamente a la pestaña &quot;Encuesta IA&quot;:
              </span>
              <GoogleSignInButton
                onClick={handleSignIn}
                isLoading={isLoadingAuth}
                label="Conectar Google Sheets"
                size="sm"
              />
            </div>
          </div>
        )}

        {/* Survey Form */}
        <SurveyForm
          accessToken={accessToken}
          sheetInfo={sheetInfo}
          onOpenSheetConfig={() => setIsSheetConfigOpen(true)}
          onSignInRequired={handleSignIn}
          onResponseAdded={refreshSheetData}
        />
      </main>

      {/* Modals */}
      <SheetConfigModal
        isOpen={isSheetConfigOpen}
        onClose={() => setIsSheetConfigOpen(false)}
        accessToken={accessToken}
        currentSheet={sheetInfo}
        onSheetSelected={handleSheetSelected}
        onSignInRequired={handleSignIn}
      />

      <ResponsesViewerModal
        isOpen={isResponsesViewerOpen}
        onClose={() => setIsResponsesViewerOpen(false)}
        accessToken={accessToken}
        sheetInfo={sheetInfo}
      />

      <HtmlSnippetModal
        isOpen={isHtmlSnippetOpen}
        onClose={() => setIsHtmlSnippetOpen(false)}
        spreadsheetId={sheetInfo?.id}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-xs text-gray-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#39A900] text-white flex items-center justify-center font-bold text-xs">
              SENA
            </div>
            <div>
              <p className="font-bold text-gray-800">
                Servicio Nacional de Aprendizaje • SENA
              </p>
              <p className="text-gray-500">
                Centro Agropecuario de Buga (CAB) • Regional Valle del Cauca
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-gray-600">
            <button
              type="button"
              onClick={() => setIsHtmlSnippetOpen(true)}
              className="hover:text-emerald-700 font-medium"
            >
              Código HTML & Webhook
            </button>
            {sheetInfo && (
              <a
                href={sheetInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-700 font-medium inline-flex items-center gap-1"
              >
                <span>Google Sheets</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <span className="text-gray-400">Pestaña: &quot;Encuesta IA&quot;</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
