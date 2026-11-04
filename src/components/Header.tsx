import React from 'react';
import { User } from 'firebase/auth';
import { FileSpreadsheet, LogOut, Settings2, ExternalLink, ShieldCheck } from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { SheetInfo } from '../types/survey';

interface HeaderProps {
  user: User | null;
  sheetInfo: SheetInfo | null;
  isLoadingAuth: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenSheetConfig: () => void;
  onOpenHtmlSnippet: () => void;
  onOpenResponsesViewer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  sheetInfo,
  isLoadingAuth,
  onSignIn,
  onSignOut,
  onOpenSheetConfig,
  onOpenHtmlSnippet,
  onOpenResponsesViewer,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Institution Brand */}
          <div className="flex items-center space-x-3.5">
            {/* SENA Logo Symbol */}
            <div className="w-12 h-12 rounded-xl bg-[#39A900] flex items-center justify-center text-white font-black shadow-md shadow-emerald-900/10 flex-shrink-0">
              <svg
                viewBox="0 0 100 100"
                className="w-8 h-8 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Simplified SENA Colombian institutional emblem */}
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
                  SENA • Regional Valle
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-500 font-medium">
                  Centro Agropecuario de Buga
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                Ambiente F3 • Sala de Computación
              </h1>
            </div>
          </div>

          {/* Right Actions & Auth Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* HTML Export Button */}
            <button
              type="button"
              onClick={onOpenHtmlSnippet}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Ver código HTML y Script para integrar en cualquier sitio web"
            >
              <span>&lt;/&gt; Código HTML</span>
            </button>

            {/* Google Sheets Status */}
            {user ? (
              <div className="flex items-center space-x-2">
                {sheetInfo ? (
                  <button
                    type="button"
                    onClick={onOpenSheetConfig}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors max-w-[200px] truncate"
                    title={`Hoja vinculada: ${sheetInfo.name} (Pestaña "Encuesta IA")`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{sheetInfo.name}</span>
                    <Settings2 className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenSheetConfig}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                    <span>Configurar Hoja</span>
                  </button>
                )}

                {/* View Responses Button */}
                {sheetInfo && (
                  <button
                    type="button"
                    onClick={onOpenResponsesViewer}
                    className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                    title="Ver respuestas en Google Sheets"
                  >
                    <span>Respuestas ({sheetInfo.totalResponsesCount ?? 0})</span>
                  </button>
                )}

                {/* User Info & Logout */}
                <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Usuario'}
                      className="w-8 h-8 rounded-full border border-gray-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#39A900] font-semibold text-xs flex items-center justify-center">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Cerrar sesión de Google"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <GoogleSignInButton
                onClick={onSignIn}
                isLoading={isLoadingAuth}
                label="Conectar Google Sheets"
                size="sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* Sub-banner for Google Sheets tab confirmation */}
      <div className="bg-emerald-900 text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Respuestas vinculadas a Google Sheets en la página:{' '}
              <strong className="underline underline-offset-2 tracking-wide font-mono bg-emerald-800/80 px-1.5 py-0.5 rounded text-emerald-200">
                Encuesta IA
              </strong>
            </span>
          </div>
          {sheetInfo && (
            <a
              href={sheetInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-emerald-200 hover:text-white transition-colors"
            >
              <span>Abrir hoja en Google Sheets</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
