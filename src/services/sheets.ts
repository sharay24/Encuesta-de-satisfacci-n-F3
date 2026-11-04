import { SurveyResponse, SheetInfo } from '../types/survey';

export const ENCUESTA_SHEET_NAME = 'Encuesta IA';

export const SURVEY_HEADERS = [
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

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  // Check if it's a full Google Docs/Sheets URL
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // Otherwise, if it looks like a spreadsheet ID
  if (/^[a-zA-Z0-9-_]{15,}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

export async function fetchSpreadsheetInfo(
  accessToken: string,
  spreadsheetId: string
): Promise<SheetInfo> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message ||
        `Error al acceder a la hoja de cálculo (${response.status} ${response.statusText}). Verifica el ID o los permisos.`
    );
  }

  const data = await response.json();
  const sheets: Array<{ properties: { title: string } }> = data.sheets || [];
  const hasEncuestaIATab = sheets.some((s) => s.properties?.title === ENCUESTA_SHEET_NAME);

  let totalResponsesCount = 0;
  if (hasEncuestaIATab) {
    try {
      const rowsRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
          ENCUESTA_SHEET_NAME
        )}!A:A`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (rowsRes.ok) {
        const rowsData = await rowsRes.json();
        // Minus 1 for header row if exists
        const rowCount = (rowsData.values || []).length;
        totalResponsesCount = Math.max(0, rowCount - 1);
      }
    } catch {
      // Ignore count error
    }
  }

  return {
    id: cleanId,
    name: data.properties?.title || 'Hoja de Cálculo de Google',
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${cleanId}`,
    hasEncuestaIATab,
    totalResponsesCount,
  };
}

export async function createNewSpreadsheet(accessToken: string): Promise<SheetInfo> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'Encuesta de Satisfacción Sala F3 - Centro Agropecuario de Buga',
      },
      sheets: [
        {
          properties: {
            title: ENCUESTA_SHEET_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: SURVEY_HEADERS.map((header) => ({
                    userEnteredValue: { stringValue: header },
                  })),
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message ||
        `No se pudo crear la hoja de cálculo (${response.status}). Intenta nuevamente.`
    );
  }

  const data = await response.json();
  return {
    id: data.spreadsheetId,
    name: data.properties?.title,
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`,
    hasEncuestaIATab: true,
    totalResponsesCount: 0,
  };
}

export async function ensureEncuestaTabExists(
  accessToken: string,
  spreadsheetId: string
): Promise<void> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const info = await fetchSpreadsheetInfo(accessToken, cleanId);

  if (!info.hasEncuestaIATab) {
    // Add sheet tab named "Encuesta IA"
    const addSheetRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: ENCUESTA_SHEET_NAME,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                },
              },
            },
          ],
        }),
      }
    );

    if (!addSheetRes.ok) {
      const err = await addSheetRes.json().catch(() => ({}));
      throw new Error(
        err?.error?.message || `No se pudo crear la pestaña "${ENCUESTA_SHEET_NAME}".`
      );
    }
  }

  // Ensure header row is set in Encuesta IA
  const checkHeadersRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
      ENCUESTA_SHEET_NAME
    )}!A1:K1`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  let hasHeaders = false;
  if (checkHeadersRes.ok) {
    const headerData = await checkHeadersRes.json();
    if (headerData.values && headerData.values.length > 0 && headerData.values[0].length > 0) {
      hasHeaders = true;
    }
  }

  if (!hasHeaders) {
    // Write headers
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
        ENCUESTA_SHEET_NAME
      )}!A1:K1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: `${ENCUESTA_SHEET_NAME}!A1:K1`,
          majorDimension: 'ROWS',
          values: [SURVEY_HEADERS],
        }),
      }
    );
  }
}

export async function appendSurveyResponse(
  accessToken: string,
  spreadsheetId: string,
  response: SurveyResponse
): Promise<{ updatedRows: number }> {
  const cleanId = extractSpreadsheetId(spreadsheetId);

  // Guarantee tab exists
  await ensureEncuestaTabExists(accessToken, cleanId);

  const timestamp =
    response.timestamp ||
    new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeStyle: 'medium',
      timeZone: 'America/Bogota',
    }).format(new Date());

  const rowValues = [
    timestamp,
    response.relation || '',
    response.program || '',
    response.frequency || '',
    response.equipmentStatus || '',
    response.connectivity || '',
    response.cleanlinessAndComfort || '',
    response.lightingAndVentilation || '',
    response.resourceAvailability || '',
    response.overallSatisfaction || '',
    response.improvementSuggestions || '',
  ];

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
      ENCUESTA_SHEET_NAME
    )}!A:K:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `${ENCUESTA_SHEET_NAME}!A:K`,
        majorDimension: 'ROWS',
        values: [rowValues],
      }),
    }
  );

  if (!appendRes.ok) {
    const errorData = await appendRes.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message ||
        `Error al registrar respuesta en Google Sheets (${appendRes.status}).`
    );
  }

  const result = await appendRes.json();
  return { updatedRows: result.updates?.updatedRows || 1 };
}

export async function fetchRecentResponses(
  accessToken: string,
  spreadsheetId: string
): Promise<string[][]> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
      ENCUESTA_SHEET_NAME
    )}!A1:K20`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.values || [];
}
