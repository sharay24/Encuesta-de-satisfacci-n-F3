import React, { useState } from 'react';
import { Code2, Copy, Check, FileSpreadsheet, ExternalLink } from 'lucide-react';
import {
  DEFAULT_SPREADSHEET_ID,
  DEFAULT_SHEET_NAME,
  DEFAULT_SPREADSHEET_URL,
} from '../services/storage';

export const HtmlScriptView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'html' | 'appsScript'>('html');
  const [copied, setCopied] = useState(false);

  const htmlCode = `<!-- Formulario HTML de Encuesta - Sala F3 Centro Agropecuario de Buga -->
<!-- Conectado por defecto con Google Sheets ID: ${DEFAULT_SPREADSHEET_ID} -->
<!-- Pestaña: ${DEFAULT_SHEET_NAME} -->
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Encuesta de Satisfacción Sala F3 - SENA CAB</title>
  <style>
    :root {
      --sena-green: #39A900;
      --sena-dark: #00324D;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --text: #1e293b;
      --text-muted: #64748b;
    }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 24px 16px;
    }
    .form-container {
      max-width: 680px;
      margin: 0 auto;
      background: var(--card-bg);
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #064e3b, #047857, var(--sena-green));
      color: white;
      padding: 28px 24px;
      text-align: center;
    }
    .header .badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .header h1 {
      margin: 0 0 6px;
      font-size: 22px;
      font-weight: 800;
    }
    .header p {
      margin: 0;
      font-size: 13px;
      color: #e2e8f0;
    }
    .form-body {
      padding: 24px;
    }
    .question-block {
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 20px;
    }
    .question-title {
      font-size: 14px;
      font-weight: 700;
      margin: 0 0 10px;
      color: #0f172a;
    }
    .question-title span.req { color: #ef4444; }
    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 8px;
    }
    .radio-card {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: white;
      border: 1px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s;
    }
    .radio-card:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    .radio-card input { accent-color: var(--sena-green); margin: 0; }
    input[type="text"], select, textarea {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 13px;
      background: white;
    }
    input[type="text"]:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--sena-green);
      box-shadow: 0 0 0 3px rgba(57, 169, 0, 0.15);
    }
    .submit-btn {
      width: 100%;
      background: var(--sena-green);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 14px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }
    .submit-btn:hover { background: #329200; }
    #status-alert {
      display: none;
      margin-top: 16px;
      padding: 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="form-container">
    <div class="header">
      <div class="badge">SENA • Centro Agropecuario de Buga</div>
      <h1>Encuesta de Satisfacción • Sala F3</h1>
      <p>Destino por defecto: Pestaña "${DEFAULT_SHEET_NAME}"</p>
    </div>

    <form id="f3-survey-form" class="form-body">
      <!-- 1 -->
      <div class="question-block">
        <div class="question-title">1. ¿Cuál es su relación con el SENA? <span class="req">*</span></div>
        <div class="options-grid">
          <label class="radio-card"><input type="radio" name="relation" value="Aprendiz" checked required> Aprendiz</label>
          <label class="radio-card"><input type="radio" name="relation" value="Instructor"> Instructor</label>
          <label class="radio-card"><input type="radio" name="relation" value="Administrativo"> Administrativo</label>
          <label class="radio-card"><input type="radio" name="relation" value="Visitante"> Visitante</label>
        </div>
      </div>

      <!-- 2 -->
      <div class="question-block">
        <div class="question-title">2. Programa de formación o área a la que pertenece <span class="req">*</span></div>
        <input type="text" name="program" placeholder="Ej: ADSO, Mantenimiento, Sistemas..." required>
      </div>

      <!-- 3 -->
      <div class="question-block">
        <div class="question-title">3. ¿Con qué frecuencia utiliza la sala de computación F3? <span class="req">*</span></div>
        <select name="frequency" required>
          <option value="Todos los días">Todos los días</option>
          <option value="2 a 3 veces por semana" selected>2 a 3 veces por semana</option>
          <option value="1 vez por semana">1 vez por semana</option>
          <option value="Ocasionalmente / Raras veces">Ocasionalmente / Raras veces</option>
        </select>
      </div>

      <!-- 4 -->
      <div class="question-block">
        <div class="question-title">4. ¿Cómo califica el estado y funcionamiento de los equipos? <span class="req">*</span></div>
        <div class="options-grid">
          <label class="radio-card"><input type="radio" name="equipmentStatus" value="Excelente" required> Excelente</label>
          <label class="radio-card"><input type="radio" name="equipmentStatus" value="Bueno" checked> Bueno</label>
          <label class="radio-card"><input type="radio" name="equipmentStatus" value="Aceptable"> Aceptable</label>
          <label class="radio-card"><input type="radio" name="equipmentStatus" value="Deficiente"> Deficiente</label>
        </div>
      </div>

      <!-- 5 -->
      <div class="question-block">
        <div class="question-title">5. ¿Cómo califica la conectividad y acceso a Internet? <span class="req">*</span></div>
        <div class="options-grid">
          <label class="radio-card"><input type="radio" name="connectivity" value="Excelente" required> Excelente</label>
          <label class="radio-card"><input type="radio" name="connectivity" value="Bueno" checked> Bueno</label>
          <label class="radio-card"><input type="radio" name="connectivity" value="Aceptable"> Aceptable</label>
          <label class="radio-card"><input type="radio" name="connectivity" value="Deficiente"> Deficiente</label>
        </div>
      </div>

      <!-- 6 -->
      <div class="question-block">
        <div class="question-title">6. ¿Cómo califica la limpieza, orden y comodidad del espacio? <span class="req">*</span></div>
        <div class="options-grid">
          <label class="radio-card"><input type="radio" name="cleanlinessAndComfort" value="Excelente" checked required> Excelente</label>
          <label class="radio-card"><input type="radio" name="cleanlinessAndComfort" value="Bueno"> Bueno</label>
          <label class="radio-card"><input type="radio" name="cleanlinessAndComfort" value="Aceptable"> Aceptable</label>
          <label class="radio-card"><input type="radio" name="cleanlinessAndComfort" value="Deficiente"> Deficiente</label>
        </div>
      </div>

      <!-- 7 -->
      <div class="question-block">
        <div class="question-title">7. ¿Cómo califica la iluminación y la ventilación/climatización? <span class="req">*</span></div>
        <div class="options-grid">
          <label class="radio-card"><input type="radio" name="lightingAndVentilation" value="Excelente" required> Excelente</label>
          <label class="radio-card"><input type="radio" name="lightingAndVentilation" value="Bueno" checked> Bueno</label>
          <label class="radio-card"><input type="radio" name="lightingAndVentilation" value="Aceptable"> Aceptable</label>
          <label class="radio-card"><input type="radio" name="lightingAndVentilation" value="Deficiente"> Deficiente</label>
        </div>
      </div>

      <!-- 8 -->
      <div class="question-block">
        <div class="question-title">8. ¿Cuenta con la disponibilidad de recursos y software necesarios? <span class="req">*</span></div>
        <select name="resourceAvailability" required>
          <option value="Siempre" selected>Siempre</option>
          <option value="Casi siempre">Casi siempre</option>
          <option value="Algunas veces">Algunas veces</option>
          <option value="Rara vez">Rara vez</option>
        </select>
      </div>

      <!-- 9 -->
      <div class="question-block">
        <div class="question-title">9. En general, ¿qué tan satisfecho está con la sala F3? <span class="req">*</span></div>
        <div class="options-grid">
          <label class="radio-card"><input type="radio" name="overallSatisfaction" value="Muy satisfecho" required> Muy satisfecho</label>
          <label class="radio-card"><input type="radio" name="overallSatisfaction" value="Satisfecho" checked> Satisfecho</label>
          <label class="radio-card"><input type="radio" name="overallSatisfaction" value="Neutral"> Neutral</label>
          <label class="radio-card"><input type="radio" name="overallSatisfaction" value="Insatisfecho"> Insatisfecho</label>
        </div>
      </div>

      <!-- 10 -->
      <div class="question-block">
        <div class="question-title">10. ¿Qué aspectos considera que deben mejorarse o qué sugerencias tiene?</div>
        <textarea name="improvementSuggestions" rows="3" placeholder="Comentarios u observaciones para mejorar la sala F3..."></textarea>
      </div>

      <button type="submit" class="submit-btn" id="btn-submit">Enviar Respuestas</button>
      <div id="status-alert"></div>
    </form>
  </div>

  <script>
    // URL de tu Webhook de Google Apps Script para guardar en ${DEFAULT_SHEET_NAME}
    const SCRIPT_URL = 'PEGAR_AQUI_LA_URL_DEL_APPS_SCRIPT';

    document.getElementById('f3-survey-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = document.getElementById('btn-submit');
      const alertBox = document.getElementById('status-alert');

      btn.disabled = true;
      btn.innerText = 'Enviando...';
      alertBox.style.display = 'none';

      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());
      data.timestamp = new Date().toLocaleString('es-CO');

      if (!SCRIPT_URL || SCRIPT_URL.includes('PEGAR_AQUI')) {
        setTimeout(() => {
          alertBox.style.display = 'block';
          alertBox.style.background = '#dcfce7';
          alertBox.style.color = '#166534';
          alertBox.innerText = '¡Respuesta registrada con éxito!';
          btn.disabled = false;
          btn.innerText = 'Enviar Respuestas';
          document.getElementById('f3-survey-form').reset();
        }, 500);
        return;
      }

      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(() => {
        alertBox.style.display = 'block';
        alertBox.style.background = '#dcfce7';
        alertBox.style.color = '#166534';
        alertBox.innerText = '¡Respuesta enviada con éxito a la hoja "${DEFAULT_SHEET_NAME}"!';
        document.getElementById('f3-survey-form').reset();
      })
      .catch(() => {
        alertBox.style.display = 'block';
        alertBox.style.background = '#fee2e2';
        alertBox.style.color = '#991b1b';
        alertBox.innerText = 'Error al enviar. Inténtalo nuevamente.';
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerText = 'Enviar Respuestas';
      });
    });
  </script>
</body>
</html>`;

  const appsScriptCode = `/**
 * Google Apps Script vinculado por defecto a la hoja:
 * ID: ${DEFAULT_SPREADSHEET_ID}
 * Pestaña: "${DEFAULT_SHEET_NAME}"
 * 
 * INSTRUCCIONES RÁPIDAS (Se hace una sola vez):
 * 1. Abre tu hoja de cálculo: ${DEFAULT_SPREADSHEET_URL}
 * 2. En el menú superior ve a: Extensiones > Apps Script.
 * 3. Borra el código existente y pega este código completo.
 * 4. Haz clic en "Implementar" > "Nueva implementación".
 * 5. Tipo: "Aplicación web".
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone)
 * 6. Haz clic en "Implementar" y copia la URL generada.
 * 7. Pégala en el botón de configuración de la app o en el formulario HTML.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var SPREADSHEET_ID = "${DEFAULT_SPREADSHEET_ID}";
    var TARGET_SHEET_NAME = "${DEFAULT_SHEET_NAME}";
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(TARGET_SHEET_NAME);

    // Si la pestaña "${DEFAULT_SHEET_NAME}" no existe, se crea automáticamente con encabezados
    if (!sheet) {
      sheet = ss.insertSheet(TARGET_SHEET_NAME);
      sheet.appendRow([
        "Marca temporal",
        "1. ¿Cuál es su relación con el SENA?",
        "2. Programa de formación o área",
        "3. ¿Con qué frecuencia utiliza la sala F3?",
        "4. Estado y funcionamiento de equipos",
        "5. Conectividad y acceso a Internet",
        "6. Limpieza, orden y comodidad del espacio",
        "7. Iluminación y ventilación",
        "8. Disponibilidad de recursos y software",
        "9. Nivel general de satisfacción",
        "10. Sugerencias de mejora"
      ]);
      sheet.setFrozenRows(1);
    }

    // Parsear datos recibidos
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var timestamp = data.timestamp || new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });

    // Fila correspondiente a las 10 preguntas
    var row = [
      timestamp,
      data.relation || "",
      data.program || "",
      data.frequency || "",
      data.equipmentStatus || "",
      data.connectivity || "",
      data.cleanlinessAndComfort || "",
      data.lightingAndVentilation || "",
      data.resourceAvailability || "",
      data.overallSatisfaction || "",
      data.improvementSuggestions || ""
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Respuesta agregada exitosamente a " + TARGET_SHEET_NAME,
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;

  const currentCode = activeTab === 'html' ? htmlCode : appsScriptCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-[#39A900]">
              Hoja configurada: {DEFAULT_SHEET_NAME}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500 font-mono">ID: {DEFAULT_SPREADSHEET_ID}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-[#39A900]" />
            <span>Código HTML &amp; Google Apps Script</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Configurado por defecto con tu hoja de cálculo para su uso directo en cualquier equipo o portal web.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={DEFAULT_SPREADSHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#39A900]" />
            <span>Abrir Hoja</span>
            <ExternalLink className="w-3 h-3 text-emerald-600" />
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#39A900] hover:bg-[#329200] text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-900/10 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado!' : 'Copiar este código'}</span>
          </button>
        </div>
      </div>

      {/* Code Viewer Box */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Sub-tabs */}
        <div className="bg-gray-100 px-4 pt-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-t border-x ${
                activeTab === 'html'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200/50'
              }`}
            >
              Formulario HTML5 Completo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('appsScript')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-t border-x ${
                activeTab === 'appsScript'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200/50'
              }`}
            >
              Google Apps Script (Pestaña &quot;{DEFAULT_SHEET_NAME}&quot;)
            </button>
          </div>
          <span className="text-[11px] font-mono text-gray-500 pb-2 hidden sm:inline">
            {activeTab === 'html' ? 'index.html' : 'Code.gs (Apps Script)'}
          </span>
        </div>

        {/* Code Content */}
        <div className="bg-gray-950 p-5 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[600px]">
          <pre className="whitespace-pre leading-relaxed">{currentCode}</pre>
        </div>
      </div>
    </div>
  );
};
