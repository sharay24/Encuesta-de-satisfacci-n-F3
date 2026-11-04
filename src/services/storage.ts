import { SurveyResponse } from '../types/survey';

const RESPONSES_KEY = 'sena_f3_survey_responses_v2';
const WEBHOOK_URL_KEY = 'sena_f3_apps_script_webhook_url';

export const INITIAL_SEED_RESPONSES: SurveyResponse[] = [
  {
    timestamp: '27/10/2026, 8:59:01 p. m.',
    relation: 'Aprendiz',
    program: 'Tecnólogo en ADSO',
    frequency: '2 o 3 veces por semana',
    equipmentStatus: 'Excelente',
    connectivity: 'Aceptable',
    cleanlinessAndComfort: 'Bueno',
    lightingAndVentilation: 'Excelente',
    resourceAvailability: 'Siempre',
    overallSatisfaction: 'Satisfecho',
    improvementSuggestions: 'Mayor velocidad en la conexión a internet en horas pico.',
  },
  {
    timestamp: '28/10/2026, 10:15:33 a. m.',
    relation: 'Instructor',
    program: 'Sistemas e Informática',
    frequency: 'Todos los días',
    equipmentStatus: 'Bueno',
    connectivity: 'Bueno',
    cleanlinessAndComfort: 'Excelente',
    lightingAndVentilation: 'Bueno',
    resourceAvailability: 'Siempre',
    overallSatisfaction: 'Muy satisfecho',
    improvementSuggestions: 'Revisión periódica de los teclados y mouse.',
  },
];

export function getStoredResponses(): SurveyResponse[] {
  try {
    const raw = localStorage.getItem(RESPONSES_KEY);
    if (!raw) {
      localStorage.setItem(RESPONSES_KEY, JSON.stringify(INITIAL_SEED_RESPONSES));
      return INITIAL_SEED_RESPONSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SEED_RESPONSES;
  } catch {
    return INITIAL_SEED_RESPONSES;
  }
}

export function saveResponse(newResponse: SurveyResponse): SurveyResponse[] {
  const current = getStoredResponses();
  const updated = [newResponse, ...current];
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteResponse(index: number): SurveyResponse[] {
  const current = getStoredResponses();
  const updated = current.filter((_, i) => i !== index);
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(updated));
  return updated;
}

export function clearAllResponses(): SurveyResponse[] {
  localStorage.setItem(RESPONSES_KEY, JSON.stringify([]));
  return [];
}

export function getWebhookUrl(): string {
  return localStorage.getItem(WEBHOOK_URL_KEY) || '';
}

export function saveWebhookUrl(url: string): void {
  localStorage.setItem(WEBHOOK_URL_KEY, url.trim());
}

export async function sendToWebhookIfConfigured(response: SurveyResponse): Promise<boolean> {
  const url = getWebhookUrl();
  if (!url) return false;

  try {
    // Google Apps Script requires no-cors for direct browser forms
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    });
    return true;
  } catch (err) {
    console.warn('Error sending to Google Apps Script webhook:', err);
    return false;
  }
}

export function exportResponsesToCSV(responses: SurveyResponse[]): void {
  const headers = [
    'Marca temporal',
    '1. Relación con el SENA',
    '2. Programa o Área',
    '3. Frecuencia de uso',
    '4. Estado de equipos',
    '5. Conectividad y acceso a Internet',
    '6. Limpieza y comodidad',
    '7. Iluminación y ventilación',
    '8. Disponibilidad de recursos y software',
    '9. Nivel general de satisfacción',
    '10. Sugerencias de mejora',
  ];

  const rows = responses.map((r) => [
    `"${(r.timestamp || '').replace(/"/g, '""')}"`,
    `"${(r.relation || '').replace(/"/g, '""')}"`,
    `"${(r.program || '').replace(/"/g, '""')}"`,
    `"${(r.frequency || '').replace(/"/g, '""')}"`,
    `"${(r.equipmentStatus || '').replace(/"/g, '""')}"`,
    `"${(r.connectivity || '').replace(/"/g, '""')}"`,
    `"${(r.cleanlinessAndComfort || '').replace(/"/g, '""')}"`,
    `"${(r.lightingAndVentilation || '').replace(/"/g, '""')}"`,
    `"${(r.resourceAvailability || '').replace(/"/g, '""')}"`,
    `"${(r.overallSatisfaction || '').replace(/"/g, '""')}"`,
    `"${(r.improvementSuggestions || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Respuestas_Sala_F3_Encuesta_IA_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
