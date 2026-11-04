import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, RefreshCw, X, ExternalLink, AlertCircle } from 'lucide-react';
import { SheetInfo } from '../types/survey';
import { fetchRecentResponses } from '../services/sheets';

interface ResponsesViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  sheetInfo: SheetInfo | null;
}

export const ResponsesViewerModal: React.FC<ResponsesViewerModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  sheetInfo,
}) => {
  const [rows, setRows] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!accessToken || !sheetInfo) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRecentResponses(accessToken, sheetInfo.id);
      setRows(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar las respuestas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, accessToken, sheetInfo?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-[#39A900] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="text-base font-bold">Respuestas registradas en &quot;Encuesta IA&quot;</h3>
              <p className="text-xs text-emerald-100">
                {sheetInfo?.name} • Visualización en tiempo real
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Recargar respuestas"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {error && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs mb-4">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-8 h-8 border-3 border-[#39A900] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Consultando respuestas en Google Sheets...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16">
              <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-gray-700">Aún no hay respuestas registradas</h4>
              <p className="text-xs text-gray-500 mt-1">
                Completa y envía el formulario para ver la primera respuesta aquí.
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-emerald-50 text-emerald-950 font-bold">
                  <tr>
                    {rows[0]?.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-3.5 py-2.5 whitespace-nowrap border-r border-emerald-100 last:border-0"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {rows.slice(1).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-50/80 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-3.5 py-2 text-gray-700 border-r border-gray-100 last:border-0 whitespace-nowrap max-w-xs truncate"
                          title={cell}
                        >
                          {cell || <span className="text-gray-300 italic">vacío</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Total de filas:{' '}
            <strong className="text-gray-900">{Math.max(0, rows.length - 1)}</strong> respuestas
          </span>
          <div className="flex items-center space-x-3">
            {sheetInfo && (
              <a
                href={sheetInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
              >
                <span>Abrir en Google Sheets completo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
