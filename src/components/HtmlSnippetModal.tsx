import React, { useState } from 'react';
import { Code2, Copy, Check, X, FileSpreadsheet, Terminal } from 'lucide-react';

interface HtmlSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreadsheetId?: string;
}

export const HtmlSnippetModal: React.FC<HtmlSnippetModalProps> = ({
  isOpen,
  onClose,
  spreadsheetId = 'TU_ID_DE_HOJA_DE_CALCULO',
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'appsScript'>('html');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const htmlCode = `<!-- Formulario HTML de Encuesta - Sala F3 Centro Agropecuario de Buga -->
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Encuesta de Satisfacción Sala F3 - SENA CAB</title>
  <style>
    :root { --sena-green: #39A900; --sena-dark: #00324D; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; color: #333; }
    .container { max-width: 680px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.06); }
    .header { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 18px; margin-bottom: 24px; }
    .badge { background: #e8f5e9; color: #2e7d32; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
    h2 { margin: 10px 0 4px; color: #111827; }
    p.desc { margin: 0; font-size: 14px; color: #6b7280; }
    .form-group { margin-bottom: 22px; }
    label.title { display: block; font-weight: 600; margin-bottom: 8px; font-size: 14px; color: #1f2937; }
    input[type="text"], select, textarea { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
    input[type="text"]:focus, select:focus, textarea:focus { border-color: var(--sena-green); outline: none; box-shadow: 0 0 0 3px rgba(57,169,0,0.15); }
    .options { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; }
    .opt-label { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; cursor: pointer; }
    .opt-label:hover { background: #f3f4f6; }
    .opt-label input { accent-color: var(--sena-green); }
    button.submit-btn { width: 100%; background: var(--sena-green); color: white; padding: 14px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
    button.submit-btn:hover { background: #329200; }
    #status-msg { margin-top: 15px; font-size: 14px; text-align: center; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">SENA • Centro Agropecuario de Buga</span>
      <h2>Encuesta de Satisfacción • Sala F3</h2>
      <p class="desc">Tus respuestas se envían directamente a la pestaña "Encuesta IA" de Google Sheets.</p>
    </div>

    <form id="survey-form">
      <!-- 1. Relación con el SENA -->
      <div class="form-group">
        <label class="title">1. ¿Cuál es su relación con el SENA? *</label>
        <div class="options">
          <label class="opt-label"><input type="radio" name="relation" value="Aprendiz" required> Aprendiz</label>
          <label class="opt-label"><input type="radio" name="relation" value="Instructor"> Instructor</label>
          <label class="opt-label"><input type="radio" name="relation" value="Administrativo"> Administrativo</label>
          <label class="opt-label"><input type="radio" name="relation" value="Visitante/Egresado"> Visitante</label>
        </div>
      </div>

      <!-- 2. Programa de formación -->
      <div class="form-group">
        <label class="title">2. Programa de formación o área a la que pertenece *</label>
        <input type="text" name="program" placeholder="Ej: ADSO, Sistemas, Gestión Agroempresarial..." required>
      </div>

      <!-- 3. Frecuencia de uso -->
      <div class="form-group">
        <label class="title">3. ¿Con qué frecuencia utiliza la sala de computación F3? *</label>
        <select name="frequency" required>
          <option value="">Seleccione una opción...</option>
          <option value="Todos los días">Todos los días</option>
          <option value="2 a 3 veces por semana">2 a 3 veces por semana</option>
          <option value="1 vez por semana">1 vez por semana</option>
          <option value="Ocasionalmente">Ocasionalmente</option>
        </select>
      </div>

      <!-- 4. Estado de equipos -->
      <div class="form-group">
        <label class="title">4. ¿Cómo califica el estado y funcionamiento de los equipos de cómputo? *</label>
        <div class="options">
          <label class="opt-label"><input type="radio" name="equipmentStatus" value="Excelente" required> Excelente</label>
          <label class="opt-label"><input type="radio" name="equipmentStatus" value="Bueno"> Bueno</label>
          <label class="opt-label"><input type="radio" name="equipmentStatus" value="Regular"> Regular</label>
          <label class="opt-label"><input type="radio" name="equipmentStatus" value="Deficiente"> Deficiente</label>
        </div>
      </div>

      <!-- 5. Conectividad -->
      <div class="form-group">
        <label class="title">5. ¿Cómo califica la conectividad y acceso a Internet? *</label>
        <div class="options">
          <label class="opt-label"><input type="radio" name="connectivity" value="Excelente" required> Excelente</label>
          <label class="opt-label"><input type="radio" name="connectivity" value="Bueno"> Bueno</label>
          <label class="opt-label"><input type="radio" name="connectivity" value="Regular"> Regular</label>
          <label class="opt-label"><input type="radio" name="connectivity" value="Deficiente"> Deficiente</label>
        </div>
      </div>

      <!-- 6. Limpieza y comodidad -->
      <div class="form-group">
        <label class="title">6. ¿Cómo califica la limpieza, orden y comodidad del espacio? *</label>
        <div class="options">
          <label class="opt-label"><input type="radio" name="cleanlinessAndComfort" value="Excelente" required> Excelente</label>
          <label class="opt-label"><input type="radio" name="cleanlinessAndComfort" value="Bueno"> Bueno</label>
          <label class="opt-label"><input type="radio" name="cleanlinessAndComfort" value="Regular"> Regular</label>
          <label class="opt-label"><input type="radio" name="cleanlinessAndComfort" value="Deficiente"> Deficiente</label>
        </div>
      </div>

      <!-- 7. Iluminación y ventilación -->
      <div class="form-group">
        <label class="title">7. ¿Cómo califica la iluminación y la ventilación/climatización? *</label>
        <div class="options">
          <label class="opt-label"><input type="radio" name="lightingAndVentilation" value="Excelente" required> Excelente</label>
          <label class="opt-label"><input type="radio" name="lightingAndVentilation" value="Bueno"> Bueno</label>
          <label class="opt-label"><input type="radio" name="lightingAndVentilation" value="Regular"> Regular</label>
          <label class="opt-label"><input type="radio" name="lightingAndVentilation" value="Deficiente"> Deficiente</label>
        </div>
      </div>

      <!-- 8. Disponibilidad de recursos -->
      <div class="form-group">
        <label class="title">8. ¿La sala cuenta con la disponibilidad de recursos y software necesarios? *</label>
        <select name="resourceAvailability" required>
          <option value="">Seleccione una opción...</option>
          <option value="Siempre">Siempre</option>
          <option value="Casi siempre">Casi siempre</option>
          <option value="Algunas veces">Algunas veces</option>
          <option value="Rara vez">Rara vez</option>
        </select>
      </div>

      <!-- 9. Satisfacción general -->
      <div class="form-group">
        <label class="title">9. En general, ¿qué tan satisfecho está con el ambiente F3? *</label>
        <div class="options">
          <label class="opt-label"><input type="radio" name="overallSatisfaction" value="Muy satisfecho" required> Muy satisfecho</label>
          <label class="opt-label"><input type="radio" name="overallSatisfaction" value="Satisfecho"> Satisfecho</label>
          <label class="opt-label"><input type="radio" name="overallSatisfaction" value="Neutral"> Neutral</label>
          <label class="opt-label"><input type="radio" name="overallSatisfaction" value="Insatisfecho"> Insatisfecho</label>
        </div>
      </div>

      <!-- 10. Sugerencias -->
      <div class="form-group">
        <label class="title">10. ¿Qué aspectos considera que deben mejorarse o qué sugerencias tiene?</label>
        <textarea name="improvementSuggestions" rows="3" placeholder="Escribe tus observaciones o propuestas para la sala F3..."></textarea>
      </div>

      <button type="submit" class="submit-btn" id="submit-btn">Enviar Respuestas</button>
      <div id="status-msg"></div>
    </form>
  </div>

  <script>
    // URL de tu Webhook de Google Apps Script o endpoint backend
    const SCRIPT_URL = 'PEGAR_AQUI_LA_URL_DEL_SCRIPT';

    document.getElementById('survey-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = document.getElementById('submit-btn');
      const status = document.getElementById('status-msg');
      btn.disabled = true;
      btn.innerText = 'Enviando respuestas...';
      status.innerText = '';

      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());
      data.timestamp = new Date().toLocaleString('es-CO');

      fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        mode: 'no-cors'
      })
      .then(() => {
        status.innerHTML = '<span style="color:#2e7d32; font-weight:bold;">¡Respuesta enviada con éxito a la pestaña "Encuesta IA"!</span>';
        document.getElementById('survey-form').reset();
      })
      .catch(err => {
        status.innerHTML = '<span style="color:#c62828;">Error al enviar. Inténtalo nuevamente.</span>';
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
 * Código de Google Apps Script para recibir respuestas y guardarlas
 * en la pestaña llamada "Encuesta IA"
 * 
 * INSTRUCCIONES:
 * 1. Abre tu Hoja de Cálculo en Google Sheets.
 * 2. Ve al menú superior: Extensiones > Apps Script.
 * 3. Borra cualquier código existente y pega este código.
 * 4. Haz clic en "Implementar" > "Nueva implementación".
 * 5. Tipo: "Aplicación web".
 * 6. "Ejecutar como": Yo.
 * 7. "Quién tiene acceso": "Cualquier usuario" (Anyone).
 * 8. Copia la URL de la aplicación web generada y úsala en tu formulario HTML.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = "Encuesta IA";
    var sheet = ss.getSheetByName(sheetName);

    // Si la pestaña "Encuesta IA" no existe, se crea automáticamente
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Encabezados
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
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    var timestamp = data.timestamp || new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });

    // Fila con las 10 preguntas
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
      result: "success",
      message: "Respuesta agregada exitosamente a Encuesta IA",
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      error: error.toString()
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold">Código HTML y Script de Integración</h3>
              <p className="text-xs text-gray-400">
                Pestaña de destino: <strong className="text-emerald-400">Encuesta IA</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-gray-100 px-6 pt-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-t border-x ${
                activeTab === 'html'
                  ? 'bg-white text-gray-900 border-gray-200 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 border-transparent'
              }`}
            >
              Formulario HTML Puro
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('appsScript')}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-t border-x ${
                activeTab === 'appsScript'
                  ? 'bg-white text-gray-900 border-gray-200 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 border-transparent'
              }`}
            >
              Google Apps Script (Webhook)
            </button>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors mb-2"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado!' : 'Copiar código'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-950 font-mono text-xs text-gray-200">
          <pre className="whitespace-pre overflow-x-auto leading-relaxed">{currentCode}</pre>
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {activeTab === 'html'
              ? 'Código HTML5 listo para incrustar en cualquier portal o web del SENA.'
              : 'Pega este código en Extensiones > Apps Script en tu Google Sheets.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
