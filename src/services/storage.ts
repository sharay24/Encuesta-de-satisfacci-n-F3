import { SurveyResponse } from '../types/survey';
import * as XLSX from 'xlsx';

export const DEFAULT_SPREADSHEET_ID = '1SFlReSHJILvvhHjKl_xZpdLaiwi7Kmt7Tj4nDc6CwtY';
export const DEFAULT_SHEET_NAME = 'Encuesta F3';
export const DEFAULT_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit`;

const LOCAL_STORAGE_KEY = 'sena_f3_local_backup_responses';

export const EXCEL_HEADERS = [
  'Marca temporal',
  '1. ¿Cuál es su relación con el SENA?',
  '2. Programa de formación o área a la que pertenece',
  '3. ¿Con qué frecuencia utiliza el ambiente F3?',
  '4. ¿Cómo califica el estado y funcionamiento de los equipos?',
  '5. ¿Cómo califica la conectividad y el acceso a internet?',
  '6. ¿Cómo califica la limpieza, orden y comodidad del espacio?',
  '7. ¿Cómo califica la iluminación y la ventilación?',
  '8. ¿Cuenta con la disponibilidad de recursos y software necesarios?',
  '9. En general, ¿qué tan satisfecho está con el ambiente F3?',
  '10. ¿Qué aspectos considera que deben mejorarse o sugerencias?',
];

export async function fetchAllResponses(): Promise<{
  responses: SurveyResponse[];
  spreadsheetId: string;
  sheetName: string;
  excelUrl?: string;
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
          excelUrl: data.excelUrl || '/api/download-excel',
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
        excelUrl: '/api/download-excel',
      };
    }
  } catch {
    // ignore
  }

  return {
    responses: [],
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    sheetName: DEFAULT_SHEET_NAME,
    excelUrl: '/api/download-excel',
  };
}

export async function submitResponseToServer(response: SurveyResponse): Promise<{
  success: boolean;
  item: SurveyResponse;
  totalCount: number;
  excelUrl?: string;
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
        excelUrl: data.excelUrl || '/api/download-excel',
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
    excelUrl: '/api/download-excel',
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

export function downloadNativeExcel(responses: SurveyResponse[]): void {
  try {
    // Attempt direct download from backend
    const link = document.createElement('a');
    link.href = '/api/download-excel';
    link.download = `Encuesta_F3_SENA_CAB_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    // Client-side fallback using SheetJS
    const rows = responses.map((r) => [
      r.timestamp || '',
      r.relation || '',
      r.program || '',
      r.frequency || '',
      r.equipmentStatus || '',
      r.connectivity || '',
      r.cleanlinessAndComfort || '',
      r.lightingAndVentilation || '',
      r.resourceAvailability || '',
      r.overallSatisfaction || '',
      r.improvementSuggestions || '',
    ]);

    const aoaData = [EXCEL_HEADERS, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoaData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, DEFAULT_SHEET_NAME);
    XLSX.writeFile(wb, `Encuesta_F3_SENA_CAB_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}

export function exportResponsesToCSV(responses: SurveyResponse[]): void {
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
    '\uFEFF' + [EXCEL_HEADERS.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

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
