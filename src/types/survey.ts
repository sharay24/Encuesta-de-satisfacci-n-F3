export interface SurveyResponse {
  timestamp?: string;
  relation: string; // 1. Relación con el SENA
  program: string; // 2. Programa o área
  frequency: string; // 3. Frecuencia de uso
  equipmentStatus: string; // 4. Estado de equipos
  connectivity: string; // 5. Conectividad / internet
  cleanlinessAndComfort: string; // 6. Limpieza y comodidad
  lightingAndVentilation: string; // 7. Iluminación y ventilación
  resourceAvailability: string; // 8. Recursos y software
  overallSatisfaction: string; // 9. Satisfacción general
  improvementSuggestions: string; // 10. Sugerencias y mejoras
}

export interface SheetInfo {
  id: string;
  name: string;
  url: string;
  hasEncuestaIATab: boolean;
  totalResponsesCount?: number;
}
