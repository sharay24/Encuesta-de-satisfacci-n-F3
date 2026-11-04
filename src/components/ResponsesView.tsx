import React, { useState } from 'react';
import {
  TableProperties,
  Download,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Link,
  Laptop,
  Smile,
  Users,
  Settings,
} from 'lucide-react';
import { SurveyResponse } from '../types/survey';
import {
  exportResponsesToCSV,
  deleteResponse,
  clearAllResponses,
  getWebhookUrl,
  saveWebhookUrl,
} from '../services/storage';

interface ResponsesViewProps {
  responses: SurveyResponse[];
  onResponsesUpdated: () => void;
  onGoToSurvey: () => void;
}

export const ResponsesView: React.FC<ResponsesViewProps> = ({
  responses,
  onResponsesUpdated,
  onGoToSurvey,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Todos');
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [webhookInput, setWebhookInput] = useState(getWebhookUrl());
  const [webhookSavedNotice, setWebhookSavedNotice] = useState(false);

  // Filtered responses
  const filtered = responses.filter((r) => {
    const matchesRole = selectedRole === 'Todos' || r.relation === selectedRole;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      r.program.toLowerCase().includes(term) ||
      r.relation.toLowerCase().includes(term) ||
      r.improvementSuggestions.toLowerCase().includes(term) ||
      (r.timestamp && r.timestamp.toLowerCase().includes(term));
    return matchesRole && matchesSearch;
  });

  // Calculate statistics
  const total = responses.length;
  const satisfiedCount = responses.filter(
    (r) => r.overallSatisfaction === 'Satisfecho' || r.overallSatisfaction === 'Muy satisfecho'
  ).length;
  const satisfiedPercent = total > 0 ? Math.round((satisfiedCount / total) * 100) : 0;

  const goodEquipmentCount = responses.filter(
    (r) => r.equipmentStatus === 'Excelente' || r.equipmentStatus === 'Bueno'
  ).length;
  const goodEquipmentPercent = total > 0 ? Math.round((goodEquipmentCount / total) * 100) : 0;

  const handleDelete = (index: number) => {
    if (window.confirm('¿Deseas eliminar esta respuesta?')) {
      deleteResponse(index);
      onResponsesUpdated();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que deseas borrar todas las respuestas registradas?')) {
      clearAllResponses();
      onResponsesUpdated();
    }
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    saveWebhookUrl(webhookInput);
    setWebhookSavedNotice(true);
    setTimeout(() => setWebhookSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-[#39A900]">
              Pestaña: &quot;Encuesta IA&quot;
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500 font-medium">SENA Centro Agropecuario de Buga</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <TableProperties className="w-6 h-6 text-[#39A900]" />
            <span>Respuestas Recibidas • Sala F3</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Registro consolidado de las 10 preguntas de la encuesta de satisfacción.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowWebhookConfig(!showWebhookConfig)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl shadow-xs transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-gray-500" />
            <span>{showWebhookConfig ? 'Ocultar Webhook' : 'Webhook Google Sheets'}</span>
          </button>

          <button
            type="button"
            onClick={() => exportResponsesToCSV(responses)}
            disabled={responses.length === 0}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#39A900] hover:bg-[#329200] rounded-xl shadow-sm shadow-emerald-900/10 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Optional Webhook Setup Card */}
      {showWebhookConfig && (
        <div className="mb-6 p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl animate-in fade-in duration-150">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
              <Link className="w-4 h-4 text-[#39A900]" />
              <h4>Sincronización Directa con Google Sheets (Sin inicio de sesión)</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowWebhookConfig(false)}
              className="text-xs text-gray-400 hover:text-gray-700 font-semibold"
            >
              Cerrar
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1 max-w-3xl leading-relaxed">
            Si deseas que cada respuesta enviada por los aprendices o instructores viaje instantáneamente a tu
            hoja de Google en la pestaña <strong>&quot;Encuesta IA&quot;</strong> sin necesidad de que inicien sesión,
            pega aquí la URL de la aplicación web de Google Apps Script (el código completo está en la pestaña{' '}
            <strong>HTML / Script</strong>).
          </p>

          <form onSubmit={handleSaveWebhook} className="mt-3 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={webhookInput}
              onChange={(e) => setWebhookInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#39A900] focus:border-[#39A900]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Guardar Webhook
            </button>
          </form>

          {webhookSavedNotice && (
            <div className="mt-2 text-xs font-semibold text-emerald-800 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>¡URL del Webhook guardada exitosamente!</span>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase">Total Respuestas</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{total}</div>
          <span className="text-[11px] text-gray-400">Registros en Sala F3</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase">Satisfacción Alta</span>
            <Smile className="w-4 h-4 text-[#39A900]" />
          </div>
          <div className="text-2xl font-black text-[#39A900]">{satisfiedPercent}%</div>
          <span className="text-[11px] text-gray-400">Satisfecho / Muy satisfecho</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase">Estado de Equipos</span>
            <Laptop className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{goodEquipmentPercent}%</div>
          <span className="text-[11px] text-gray-400">Bueno o Excelente</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase">Pestaña Destino</span>
            <TableProperties className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-sm font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg mt-1 inline-block">
            Encuesta IA
          </div>
          <span className="text-[11px] text-gray-400 block mt-1">Google Sheets</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por programa o texto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#39A900] focus:border-[#39A900]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium">Filtrar por rol:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#39A900]"
          >
            <option value="Todos">Todos ({responses.length})</option>
            <option value="Aprendiz">Aprendiz</option>
            <option value="Instructor">Instructor</option>
            <option value="Funcionario administrativo">Administrativo</option>
            <option value="Contratista">Contratista</option>
            <option value="Egresado / Visitante">Visitante</option>
          </select>

          {responses.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ml-auto"
              title="Borrar todas las respuestas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Responses Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
          <TableProperties className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No se encontraron respuestas</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {total === 0
              ? 'Aún no hay respuestas registradas. Completa la encuesta para ver el primer resultado.'
              : 'Ninguna respuesta coincide con el filtro o búsqueda actual.'}
          </p>
          {total === 0 && (
            <button
              type="button"
              onClick={onGoToSurvey}
              className="mt-4 px-5 py-2.5 bg-[#39A900] hover:bg-[#329200] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Ir a Encuesta F3
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-800 font-bold">
                <tr>
                  <th className="px-3 py-3 whitespace-nowrap">#</th>
                  <th className="px-3 py-3 whitespace-nowrap">Marca temporal</th>
                  <th className="px-3 py-3 whitespace-nowrap">1. Relación</th>
                  <th className="px-3 py-3 whitespace-nowrap">2. Programa / Área</th>
                  <th className="px-3 py-3 whitespace-nowrap">3. Frecuencia</th>
                  <th className="px-3 py-3 whitespace-nowrap">4. Equipos</th>
                  <th className="px-3 py-3 whitespace-nowrap">5. Conectividad</th>
                  <th className="px-3 py-3 whitespace-nowrap">6. Limpieza</th>
                  <th className="px-3 py-3 whitespace-nowrap">7. Iluminación/Vent.</th>
                  <th className="px-3 py-3 whitespace-nowrap">8. Recursos</th>
                  <th className="px-3 py-3 whitespace-nowrap">9. Satisfacción</th>
                  <th className="px-3 py-3 whitespace-nowrap">10. Sugerencias</th>
                  <th className="px-3 py-3 whitespace-nowrap text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-3 py-2.5 font-bold text-gray-400">{filtered.length - idx}</td>
                    <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                      {item.timestamp || '—'}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                        {item.relation}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap max-w-[160px] truncate" title={item.program}>
                      {item.program}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.frequency}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.equipmentStatus === 'Excelente'
                            ? 'bg-emerald-50 text-emerald-800'
                            : item.equipmentStatus === 'Bueno'
                            ? 'bg-blue-50 text-blue-800'
                            : item.equipmentStatus === 'Aceptable'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-red-50 text-red-800'
                        }`}
                      >
                        {item.equipmentStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.connectivity === 'Excelente'
                            ? 'bg-emerald-50 text-emerald-800'
                            : item.connectivity === 'Bueno'
                            ? 'bg-blue-50 text-blue-800'
                            : item.connectivity === 'Aceptable'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-red-50 text-red-800'
                        }`}
                      >
                        {item.connectivity}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.cleanlinessAndComfort}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.lightingAndVentilation}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.resourceAvailability}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.overallSatisfaction === 'Muy satisfecho' || item.overallSatisfaction === 'Satisfecho'
                            ? 'bg-[#39A900]/10 text-[#39A900]'
                            : item.overallSatisfaction === 'Neutral'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {item.overallSatisfaction}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-xs truncate" title={item.improvementSuggestions}>
                      {item.improvementSuggestions || <span className="text-gray-300 italic">Sin sugerencias</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDelete(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar fila"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <span>
              Mostrando <strong>{filtered.length}</strong> de <strong>{total}</strong> respuestas
            </span>
            <span className="font-mono text-emerald-800 font-semibold">
              Estructura lista para pestaña &quot;Encuesta IA&quot;
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
