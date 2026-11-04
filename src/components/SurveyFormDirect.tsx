import React, { useState, useId } from 'react';
import {
  CheckCircle2,
  Send,
  Sparkles,
  Laptop,
  Wifi,
  Sparkle,
  SunMedium,
  CheckCheck,
  Star,
  MessageSquare,
  AlertTriangle,
  RotateCcw,
  TableProperties,
  ExternalLink,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { SurveyResponse } from '../types/survey';
import {
  submitResponseToServer,
  downloadNativeExcel,
  DEFAULT_SPREADSHEET_ID,
  DEFAULT_SHEET_NAME,
  DEFAULT_SPREADSHEET_URL,
} from '../services/storage';

interface SurveyFormDirectProps {
  onResponseSubmitted: () => void;
  onGoToResponses: () => void;
}

const RELATION_OPTIONS = [
  'Aprendiz',
  'Instructor',
  'Funcionario administrativo',
  'Contratista',
  'Egresado / Visitante',
];

const PROGRAM_SUGGESTIONS = [
  'Tecnólogo en ADSO',
  'Sistemas y Computación',
  'Gestión Agroempresarial',
  'Mantenimiento de Equipos',
  'Producción Agropecuaria',
  'Administración',
];

const FREQUENCY_OPTIONS = [
  'Todos los días',
  '2 o 3 veces por semana',
  '1 vez por semana',
  'Ocasionalmente / Raras veces',
];

const RATING_OPTIONS = [
  { label: 'Excelente', emoji: '🌟', color: 'hover:border-emerald-500 hover:bg-emerald-50' },
  { label: 'Bueno', emoji: '👍', color: 'hover:border-blue-500 hover:bg-blue-50' },
  { label: 'Aceptable', emoji: '😐', color: 'hover:border-amber-500 hover:bg-amber-50' },
  { label: 'Deficiente', emoji: '👎', color: 'hover:border-rose-500 hover:bg-rose-50' },
];

const RESOURCE_OPTIONS = ['Siempre', 'Casi siempre', 'Algunas veces', 'Rara vez'];

const QUICK_SUGGESTIONS = [
  'Mayor velocidad en la conexión a internet',
  'Mantenimiento a aires acondicionados / ventilación',
  'Actualización de software y licencias especializadas',
  'Reemplazo de teclados y ratones en mal estado',
  'Ampliación de tomas eléctricas para portátiles',
];

export const SurveyFormDirect: React.FC<SurveyFormDirectProps> = ({
  onResponseSubmitted,
  onGoToResponses,
}) => {
  const initialFormState: SurveyResponse = {
    relation: 'Aprendiz',
    program: '',
    frequency: '2 o 3 veces por semana',
    equipmentStatus: 'Bueno',
    connectivity: 'Bueno',
    cleanlinessAndComfort: 'Excelente',
    lightingAndVentilation: 'Bueno',
    resourceAvailability: 'Casi siempre',
    overallSatisfaction: 'Satisfecho',
    improvementSuggestions: '',
  };

  const [formData, setFormData] = useState<SurveyResponse>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submissionTime, setSubmissionTime] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const programInputId = useId();
  const suggestionsInputId = useId();

  // Calculate completion percentage
  const answeredCount = [
    formData.relation,
    formData.program.trim(),
    formData.frequency,
    formData.equipmentStatus,
    formData.connectivity,
    formData.cleanlinessAndComfort,
    formData.lightingAndVentilation,
    formData.resourceAvailability,
    formData.overallSatisfaction,
    formData.improvementSuggestions.trim(),
  ].filter(Boolean).length;

  const progressPercent = Math.round((answeredCount / 10) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.program.trim()) {
      setErrorMessage('Por favor ingresa tu programa de formación o área (Pregunta 2).');
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'short',
        timeStyle: 'medium',
        timeZone: 'America/Bogota',
      }).format(new Date());

      const finalResponse: SurveyResponse = {
        ...formData,
        timestamp: now,
      };

      // Submit to backend - registers to Google Sheets and updates the Excel file
      await submitResponseToServer(finalResponse);

      setSubmissionTime(now);
      setSubmittedSuccess(true);
      onResponseSubmitted();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al guardar la respuesta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData(initialFormState);
    setSubmittedSuccess(false);
    setSubmissionTime(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addSuggestion = (text: string) => {
    setFormData((prev) => {
      const current = prev.improvementSuggestions.trim();
      const updated = current ? `${current}. ${text}` : text;
      return { ...prev, improvementSuggestions: updated };
    });
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-100 text-[#39A900] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <span className="inline-block px-3 py-1 bg-emerald-50 text-[#39A900] font-bold text-xs rounded-full uppercase tracking-wider mb-2">
            ¡Respuesta Registrada con Éxito!
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            ¡Muchas gracias por su opinión!
          </h2>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-4">
            Su respuesta para la <strong className="text-gray-900">Sala de Computación F3</strong> del{' '}
            <strong className="text-gray-900">Centro Agropecuario de Buga</strong> ha sido registrada exitosamente.
          </p>

          {/* Registration badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#39A900]" />
              <span>Hoja de Cálculo: <strong>{DEFAULT_SHEET_NAME}</strong></span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-50 text-green-900 border border-green-200">
              <Download className="w-3.5 h-3.5 text-green-700" />
              <span>Registrado en Excel: <strong>.xlsx</strong></span>
            </span>
          </div>

          {submissionTime && (
            <div className="inline-flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl mb-6">
              <span>Registrado el:</span>
              <strong className="text-gray-800">{submissionTime} (hora Colombia)</strong>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => downloadNativeExcel([formData])}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-900/10 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Hoja de Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={onGoToResponses}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#39A900] hover:bg-[#329200] text-white font-bold text-sm rounded-xl shadow-md transition-colors"
            >
              <TableProperties className="w-4 h-4" />
              <span>Ver en &quot;Respuestas&quot;</span>
            </button>

            <a
              href={DEFAULT_SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3.5 bg-white hover:bg-gray-50 text-emerald-900 font-semibold text-sm rounded-xl border border-emerald-300 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#39A900]" />
              <span>Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            </a>

            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs rounded-xl border border-gray-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Otra respuesta</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-[#39A900] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none">
          <Laptop className="w-64 h-64" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>SENA CAB • Buga</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Encuesta de Satisfacción • Sala F3
          </h2>
          <p className="mt-2 text-emerald-100 text-sm sm:text-base leading-relaxed max-w-2xl">
            Tus respuestas se envían directamente y quedan registradas tanto en la hoja de cálculo{' '}
            <strong className="text-white underline font-mono">{DEFAULT_SHEET_NAME}</strong> como en la hoja de cálculo de{' '}
            <strong className="text-white underline font-mono">Excel (.xlsx)</strong> descargable.
          </p>

          {/* Progress Indicator */}
          <div className="mt-6 pt-5 border-t border-white/20">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-emerald-100">Progreso del formulario</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full">
                {answeredCount} de 10 preguntas ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Por favor revisa el formulario:</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form with 10 questions */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pregunta 1 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
          <span className="text-xs font-bold text-[#39A900] uppercase tracking-wider">
            Pregunta 1 de 10
          </span>
          <h3 className="text-base font-bold text-gray-900 mt-1">
            ¿Cuál es su relación con el SENA? <span className="text-red-500">*</span>
          </h3>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {RELATION_OPTIONS.map((option) => {
              const isSelected = formData.relation === option;
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => setFormData((p) => ({ ...p, relation: option }))}
                  className={`p-3 text-left rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    isSelected
                      ? 'border-[#39A900] bg-emerald-50/70 text-emerald-950 ring-2 ring-[#39A900]/20'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#39A900] bg-[#39A900]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pregunta 2 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
          <span className="text-xs font-bold text-[#39A900] uppercase tracking-wider">
            Pregunta 2 de 10
          </span>
          <h3 className="text-base font-bold text-gray-900 mt-1">
            Programa de formación o área a la que pertenece <span className="text-red-500">*</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Escribe o selecciona tu tecnólogo, técnica, curso o dependencia:
          </p>

          <div className="mt-3">
            <input
              id={programInputId}
              type="text"
              required
              value={formData.program}
              onChange={(e) => setFormData((p) => ({ ...p, program: e.target.value }))}
              placeholder="Ej: ADSO, Mantenimiento de Cómputo, Gestión Agroempresarial..."
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#39A900] focus:border-[#39A900]"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-gray-400 mr-1">Opciones frecuentes:</span>
            {PROGRAM_SUGGESTIONS.map((prog) => (
              <button
                type="button"
                key={prog}
                onClick={() => setFormData((p) => ({ ...p, program: prog }))}
                className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-transparent rounded-lg text-gray-600 transition-colors"
              >
                + {prog}
              </button>
            ))}
          </div>
        </div>

        {/* Pregunta 3 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
          <span className="text-xs font-bold text-[#39A900] uppercase tracking-wider">
            Pregunta 3 de 10
          </span>
          <h3 className="text-base font-bold text-gray-900 mt-1">
            ¿Con qué frecuencia utiliza la sala de computación F3? <span className="text-red-500">*</span>
          </h3>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {FREQUENCY_OPTIONS.map((freq) => {
              const isSelected = formData.frequency === freq;
              return (
                <button
                  type="button"
                  key={freq}
                  onClick={() => setFormData((p) => ({ ...p, frequency: freq }))}
                  className={`p-3 text-left rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    isSelected
                      ? 'border-[#39A900] bg-emerald-50/70 text-emerald-950 ring-2 ring-[#39A900]/20'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#39A900] bg-[#39A900]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span>{freq}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pregunta 4 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
          <div className="flex items-center space-x-2 text-[#39A900]">
            <Laptop className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Pregunta 4 de 10</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mt-1">
            ¿Cómo califica el estado y funcionamiento de los equipos de cómputo (PC, pantallas, mouse, teclados)?{' '}
            <span className="text-red-500">*</span>
          </h3>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {RATING_OPTIONS.map((item) => {
              const isSelected = formData.equipmentStatus === item.label;
              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => setFormData((p) => ({ ...p, equipmentStatus: item.label }))}
                  className={`p-3 rounded-xl border text-center transition-all ${item.color} ${
                    isSelected
                      ? 'border-[#39A900] bg-emerald-50 text-emerald-950 font-bold ring-2 ring-[#39A900]/30 shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 font-medium'
                  }`}
                >
                  <span className="text-xl block mb-1">{item.emoji}</span>
                  <span className="text-xs sm:text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pregunta 5 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
          <div className="flex items-center space-x-2 text-[#39A900]">
            <Wifi className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Pregunta 5 de 10</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mt-1">
            ¿Cómo califica la conectividad y el acceso a Internet en la sala F3?{' '}
            <span className="text-red-500">*</span>
          </h3>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {RATING_OPTIONS.map((item) => {
              const isSelected = formData.connectivity === item.label;
              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => setFormData((p) => ({ ...p, connectivity: item.label }))}
                  className={`p-3 rounded-xl border text-center transition-all ${item.color} ${
                    isSelected
                      ? 'border-[#39A900] bg-emerald-50 text-emerald-950 font-bold ring-2 ring-[#39A900]/30 shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 font-medium'
                  }`}
                >
                  <span className="text-xl block mb-1">{item.emoji}</span>
                  <span className="text-xs sm:text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pregunta 6 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
          <div className="flex items-center space-x-2 text-[#39A900]">
            <Sparkle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Pregunta 6 de 10</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mt-1">
            ¿Cómo califica la limpieza, orden y comodidad del espacio físico (sillas, mesas)?{' '}
            <span className="text-red-500">*</span>
          </h3>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {RATING_OPTIONS.map((item) => {
              const isSelected = formData.cleanlinessAndComfort === item.label;
              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => setFormData((p) => ({ ...p, cleanlinessAndComfort: item.label }))}
                  className={`p-3 rounded-xl border text-center transition-all ${item.color} ${
                    isSelected
                      ? 'border-[#39A900] bg-emerald-50 text-emerald-950 font-bold ring-2 ring-[#39A900]/30 shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 font-medium'
                  }`}
                >
                  <span className="text-xl block mb-1">{item.emoji}</span>
                  <span className="text-xs sm:text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pregunta 7 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
          <div className="flex items-center space-x-2 text-[#39A900]">
            <SunMedium className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Pregunta 7 de 10</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mt-1">
            ¿Cómo califica la iluminación y la ventilación / climatización?{' '}
            <span className="text-red-500">*</span>
          </h3>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {RATING_OPTIONS.map((item) => {
              const isSelected = formData.lightingAndVentilation === item.label;
              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => setFormData((p) => ({ ...p, lightingAndVentilation: item.label }))}
                  className={`p-3 rounded-xl border text-center transition-all ${item.color} ${
                    isSelected
                      ? 'border-[#39A900] bg-emerald-50 text-emerald-950 font-bold ring-2 ring-[#39A900]/30 shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 font-medium'
                  }`}
                >
                  <span className="text-xl block mb-1">{item.emoji}</span>
                  <span className="text-xs sm:text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pregunta 8 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
          <div className="flex items-center space-x-2 text-[#39A900]">
            <CheckCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Pregunta 8 de 10</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mt-1">
            ¿La sala cuenta con la disponibilidad de recursos y software necesarios para sus actividades?{' '}
            <span className="text-red-500">*</span>
          </h3>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {RESOURCE_OPTIONS.map((opt) => {
              const isSelected = formData.resourceAvailability === opt;
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setFormData((p) => ({ ...p, resourceAvailability: opt }))}
                  className={`p-3 rounded-xl border text-center text-xs sm:text-sm font-semibold transition-all ${
                    isSelected
                      ? 'border-[#39A900] bg-emerald-50/80 text-emerald-950 ring-2 ring-[#39A900]/20'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pregunta 9 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
          <div className="flex items-center space-x-2 text-[#39A900]">
            <Star className="w-4 h-4 fill-[#39A900]" />
            <span className="text-xs font-bold uppercase tracking-wider">Pregunta 9 de 10</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mt-1">
            En general, ¿qué tan satisfecho está con la sala de computación F3?{' '}
            <span className="text-red-500">*</span>
          </h3>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: 'Muy insatisfecho', stars: 1 },
              { label: 'Insatisfecho', stars: 2 },
              { label: 'Neutral', stars: 3 },
              { label: 'Satisfecho', stars: 4 },
              { label: 'Muy satisfecho', stars: 5 },
            ].map((rating) => {
              const isSelected = formData.overallSatisfaction === rating.label;
              return (
                <button
                  type="button"
                  key={rating.label}
                  onClick={() => setFormData((p) => ({ ...p, overallSatisfaction: rating.label }))}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-[#39A900] bg-emerald-50 text-emerald-950 font-bold ring-2 ring-[#39A900]/20'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-center space-x-0.5 mb-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rating.stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs">{rating.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pregunta 10 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
          <div className="flex items-center space-x-2 text-[#39A900]">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Pregunta 10 de 10</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mt-1">
            ¿Qué aspectos considera que deben mejorarse o qué sugerencias tiene para el ambiente F3?
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Observaciones o aportes para la coordinación académica y soporte técnico:
          </p>

          <div className="mt-3">
            <textarea
              id={suggestionsInputId}
              rows={4}
              value={formData.improvementSuggestions}
              onChange={(e) =>
                setFormData((p) => ({ ...p, improvementSuggestions: e.target.value }))
              }
              placeholder="Escribe tus sugerencias de mejora..."
              className="w-full p-3.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#39A900] focus:border-[#39A900]"
            />
          </div>

          <div className="mt-3">
            <span className="text-xs text-gray-400 block mb-1.5">Sugerencias frecuentes:</span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((sug) => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => addSuggestion(sug)}
                  className="px-2.5 py-1 text-xs bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 border border-gray-200 rounded-lg transition-colors"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Direct Submit Button Bar */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 text-center sm:text-left">
            <span className="block font-medium text-gray-800">
              Centro Agropecuario de Buga (CAB)
            </span>
            <span>
              Registro automático en Google Sheets y en Hoja de Cálculo Excel ({DEFAULT_SHEET_NAME})
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-[#39A900] hover:bg-[#329200] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-emerald-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Registrando respuestas...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Enviar Respuestas</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
