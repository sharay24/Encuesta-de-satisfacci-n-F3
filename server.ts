import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Persistent data directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Default Google Spreadsheet ID and Tab name provided by user
const DEFAULT_SPREADSHEET_ID = '1SFlReSHJILvvhHjKl_xZpdLaiwi7Kmt7Tj4nDc6CwtY';
const DEFAULT_SHEET_NAME = 'Encuesta F3';

interface StoredConfig {
  spreadsheetId: string;
  sheetName: string;
  webhookUrl: string;
}

function loadConfig(): StoredConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return {
        spreadsheetId: data.spreadsheetId || DEFAULT_SPREADSHEET_ID,
        sheetName: data.sheetName || DEFAULT_SHEET_NAME,
        webhookUrl: data.webhookUrl || '',
      };
    }
  } catch (e) {
    console.error('Error loading config:', e);
  }
  return {
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    sheetName: DEFAULT_SHEET_NAME,
    webhookUrl: '',
  };
}

function saveConfig(cfg: StoredConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving config:', e);
  }
}

interface ServerResponseItem {
  id?: string;
  timestamp: string;
  relation: string;
  program: string;
  frequency: string;
  equipmentStatus: string;
  connectivity: string;
  cleanlinessAndComfort: string;
  lightingAndVentilation: string;
  resourceAvailability: string;
  overallSatisfaction: string;
  improvementSuggestions: string;
  source?: 'server' | 'google_sheet';
}

function loadLocalResponses(): ServerResponseItem[] {
  try {
    if (fs.existsSync(RESPONSES_FILE)) {
      const data = JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.error('Error reading responses file:', e);
  }
  return [];
}

function saveLocalResponses(list: ServerResponseItem[]) {
  try {
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing responses file:', e);
  }
}

// Fetch live rows from the public Google Sheet tab "Encuesta F3"
async function fetchGoogleSheetRows(spreadsheetId: string, sheetName: string): Promise<ServerResponseItem[]> {
  try {
    const encodedSheet = encodeURIComponent(sheetName);
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodedSheet}`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const text = await res.text();
    // gviz response comes wrapped in /*O_o*/\ngoogle.visualization.Query.setResponse({...});
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
    if (!match || !match[1]) return [];

    const json = JSON.parse(match[1]);
    const rows = json.table?.rows || [];

    const parsed: ServerResponseItem[] = [];
    for (const r of rows) {
      const cells = r.c || [];
      const getVal = (idx: number) => {
        const c = cells[idx];
        if (!c) return '';
        return (c.f !== undefined && c.f !== null) ? String(c.f) : ((c.v !== undefined && c.v !== null) ? String(c.v) : '');
      };

      const ts = getVal(0);
      if (!ts) continue;

      parsed.push({
        timestamp: ts,
        relation: getVal(1) || 'Aprendiz',
        program: getVal(2) || 'Tecnólogo',
        frequency: getVal(3) || '2 o 3 veces por semana',
        equipmentStatus: getVal(4) || 'Bueno',
        connectivity: getVal(5) || 'Bueno',
        cleanlinessAndComfort: getVal(6) || 'Bueno',
        lightingAndVentilation: getVal(7) || 'Bueno',
        resourceAvailability: getVal(8) || 'Siempre',
        overallSatisfaction: getVal(9) || (getVal(8) ? 'Satisfecho' : 'Neutral'),
        improvementSuggestions: getVal(10) || '',
        source: 'google_sheet',
      });
    }

    return parsed;
  } catch (err) {
    console.warn('Could not fetch Google Sheet rows:', err);
    return [];
  }
}

// API Routes
app.get('/api/config', (req, res) => {
  const cfg = loadConfig();
  res.json({
    spreadsheetId: cfg.spreadsheetId,
    sheetName: cfg.sheetName,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${cfg.spreadsheetId}/edit`,
    webhookUrl: cfg.webhookUrl,
    hasWebhook: !!cfg.webhookUrl,
  });
});

app.post('/api/config', (req, res) => {
  const { webhookUrl, sheetName } = req.body;
  const cfg = loadConfig();
  if (typeof webhookUrl === 'string') cfg.webhookUrl = webhookUrl.trim();
  if (typeof sheetName === 'string' && sheetName.trim()) cfg.sheetName = sheetName.trim();
  saveConfig(cfg);
  res.json({ success: true, config: cfg });
});

app.get('/api/responses', async (req, res) => {
  const cfg = loadConfig();
  const localList = loadLocalResponses();
  const sheetList = await fetchGoogleSheetRows(cfg.spreadsheetId, cfg.sheetName);

  // Merge unique by timestamp + program
  const seen = new Set<string>();
  const merged: ServerResponseItem[] = [];

  for (const item of localList) {
    const key = `${item.timestamp}_${item.program}_${item.relation}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }

  for (const item of sheetList) {
    const key = `${item.timestamp}_${item.program}_${item.relation}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }

  res.json({
    responses: merged,
    totalCount: merged.length,
    spreadsheetId: cfg.spreadsheetId,
    sheetName: cfg.sheetName,
  });
});

app.post('/api/submit', async (req, res) => {
  try {
    const body = req.body as ServerResponseItem;
    const now =
      body.timestamp ||
      new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'short',
        timeStyle: 'medium',
        timeZone: 'America/Bogota',
      }).format(new Date());

    const newItem: ServerResponseItem = {
      id: `resp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now,
      relation: body.relation || 'Aprendiz',
      program: (body.program || '').trim(),
      frequency: body.frequency || '2 o 3 veces por semana',
      equipmentStatus: body.equipmentStatus || 'Bueno',
      connectivity: body.connectivity || 'Bueno',
      cleanlinessAndComfort: body.cleanlinessAndComfort || 'Bueno',
      lightingAndVentilation: body.lightingAndVentilation || 'Bueno',
      resourceAvailability: body.resourceAvailability || 'Siempre',
      overallSatisfaction: body.overallSatisfaction || 'Satisfecho',
      improvementSuggestions: (body.improvementSuggestions || '').trim(),
      source: 'server',
    };

    // Save locally on server
    const currentList = loadLocalResponses();
    currentList.unshift(newItem);
    saveLocalResponses(currentList);

    // If webhook is configured, forward asynchronously
    const cfg = loadConfig();
    if (cfg.webhookUrl) {
      fetch(cfg.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      }).catch((e) => console.warn('Webhook post error:', e));
    }

    res.json({
      success: true,
      item: newItem,
      totalCount: currentList.length,
      spreadsheetId: cfg.spreadsheetId,
      sheetName: cfg.sheetName,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al registrar respuesta';
    res.status(500).json({ success: false, error: msg });
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
