import React, { useState } from 'react';
import {
  FileSpreadsheet,
  PlusCircle,
  Link2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';
import { SheetInfo } from '../types/survey';
import {
  createNewSpreadsheet,
  fetchSpreadsheetInfo,
  ensureEncuestaTabExists,
  extractSpreadsheetId,
} from '../services/sheets';

interface SheetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  currentSheet: SheetInfo | null;
  onSheetSelected: (sheet: SheetInfo) => void;
  onSignInRequired: () => void;
}

export const SheetConfigModal: React.FC<SheetConfigModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  currentSheet,
  onSheetSelected,
  onSignInRequired,
}) => {
  const [sheetUrlInput, setSheetUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateNew = async () => {
    if (!accessToken) {
      onSignInRequired();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const newSheet = await createNewSpreadsheet(accessToken);
      onSheetSelected(newSheet);
      setSuccessMessage(
        `¡Hoja de cálculo creada con éxito! Se configuró la pestaña "Encuesta IA" con todos los encabezados.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al crear la hoja';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      onSignInRequired();
      return;
    }

    const cleanId = extractSpreadsheetId(sheetUrlInput);
    if (!cleanId) {
      setErrorMessage('Por favor ingresa una URL válida o el ID de tu hoja de cálculo de Google.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Ensure "Encuesta IA" tab and headers exist
      await ensureEncuestaTabExists(accessToken, cleanId);
      const updatedInfo = await fetchSpreadsheetInfo(accessToken, cleanId);
      onSheetSelected(updatedInfo);
      setSuccessMessage(
        `¡Vinculación exitosa con "${updatedInfo.name}"! La pestaña "Encuesta IA" está lista para recibir respuestas.`
      );
      setSheetUrlInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al vincular la hoja de cálculo';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-[#39A900] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            <h3 className="text-lg font-bold">Configuración de Google Sheets</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Message */}
          {errorMessage && (
            <div className="flex items-start space-x-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Ocurrió un inconveniente:</p>
                <p className="text-red-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start space-x-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Current Connected Sheet Info */}
          {currentSheet && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                    Hoja de cálculo activa
                  </span>
                  <h4 className="text-base font-bold text-gray-900 mt-0.5">
                    {currentSheet.name}
                  </h4>
                  <p className="text-xs text-emerald-700 font-medium mt-1">
                    ✓ Pestaña destino:{' '}
                    <span className="font-mono font-bold bg-emerald-100 px-1 py-0.5 rounded">
                      Encuesta IA
                    </span>
                  </p>
                </div>
                <a
                  href={currentSheet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 shadow-xs"
                >
                  <span>Abrir</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Option 1: Quick Create */}
          <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 text-xs font-bold mb-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-800" />
                  <span>Recomendado (1 clic)</span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm">
                  Crear automáticamente una nueva hoja de cálculo
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Se creará un archivo nuevo en tu Google Drive con la pestaña{' '}
                  <strong>&quot;Encuesta IA&quot;</strong>, encabezados de las 10 preguntas y
                  formato listo para recibir respuestas.
                </p>
              </div>
            </div>
            <div className="mt-3.5">
              <button
                type="button"
                onClick={handleCreateNew}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 bg-[#39A900] hover:bg-[#329200] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isLoading ? 'Creando hoja...' : 'Crear nueva hoja de Google'}</span>
              </button>
            </div>
          </div>

          {/* Option 2: Connect Existing */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h4 className="font-bold text-gray-900 text-sm">
              O vincular una hoja de cálculo existente
            </h4>
            <p className="text-xs text-gray-500 mt-1 mb-3">
              Pega el enlace o ID de tu hoja de cálculo. Crearemos automáticamente la pestaña{' '}
              <strong>&quot;Encuesta IA&quot;</strong> si aún no existe.
            </p>
            <form onSubmit={handleConnectExisting} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/1aBcD.../edit"
                  value={sheetUrlInput}
                  onChange={(e) => setSheetUrlInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-[#39A900]"
                />
                <Link2 className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
              <button
                type="submit"
                disabled={isLoading || !sheetUrlInput.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <span>{isLoading ? 'Verificando...' : 'Vincular y preparar pestaña "Encuesta IA"'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
