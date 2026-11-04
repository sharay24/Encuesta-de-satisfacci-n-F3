import { SurveyResponse } from '../types/survey';

export const DEFAULT_SPREADSHEET_ID = '1SFlReSHJILvvhHjKl_xZpdLaiwi7Kmt7Tj4nDc6CwtY';
export const DEFAULT_SHEET_NAME = 'Encuesta F3';
export const DEFAULT_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit`;

const LOCAL_STORAGE_KEY = 'sena_f3_local_backup_responses';

export async function fetchAllResponses(): Promise<{
  responses: SurveyResponse[];
  spreadsheetId: string;
  sheetName: string;
}> {
  try {
    const res = await fetch('/api/responses');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.responses)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.responses));
        return {
          responses: data.responses,
          spreadsheetId: data.spreadsheetId || DEFAULT_SPREADSHEET_ID,
          sheetName: data.sheetName || DEFAULT_SHEET_NAME,
        };
      }
    }
  } catch (err) {
    console.warn('Network fetch error, falling back to local cache:', err);
  }

  // Fallback to local cache if offline
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return {
        responses: JSON.parse(cached),
        spreadsheetId: DEFAULT_SPREADSHEET_ID,
        sheetName: DEFAULT_SHEET_NAME,
      };
    }
  } catch {
    // ignore
  }

  return {
    responses: [],
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    sheetName: DEFAULT_SHEET_NAME,
  };
}

export async function submitResponseToServer(response: SurveyResponse): Promise<{
  success: boolean;
  item: SurveyResponse;
  totalCount: number;
}> {
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        item: data.item || response,
        totalCount: data.totalCount || 1,
      };
    }
  } catch (err) {
    console.warn('Submit to backend failed, saving to local cache:', err);
  }

  // Local backup
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  const list = cached ? JSON.parse(cached) : [];
  list.unshift(response);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));

  return {
    success: true,
    item: response,
    totalCount: list.length,
  };
}

export async function saveWebhookConfig(webhookUrl: string): Promise<boolean> {
  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getBackendConfig(): Promise<{
  spreadsheetId: string;
  sheetName: string;
  spreadsheetUrl: string;
  webhookUrl: string;
  hasWebhook: boolean;
}> {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }

  return {
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    sheetName: DEFAULT_SHEET_NAME,
    spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
    webhookUrl: '',
    hasWebhook: false,
  };
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
    `Respuestas_Sala_F3_Encuesta_F3_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
