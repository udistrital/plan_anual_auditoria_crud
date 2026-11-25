/**
 * Sanitización básica del HTML de texto enriquecido guardado en las observaciones.
 *
 * El contenido lo produce el editor del front (Quill), pero como el CRUD no valida roles ni
 * confía ciegamente en el emisor, se eliminan los vectores de ejecución antes de persistir para
 * cumplir el criterio "no ejecutar contenido no permitido":
 *   - etiquetas <script>, <iframe>, <object>, <embed>, <style>
 *   - atributos de evento (on*, p. ej. onclick, onerror)
 *   - URLs con esquema javascript:
 *
 * No es un sanitizador de propósito general; conserva el HTML de formato de Quill (negritas,
 * listas, encabezados, imágenes, enlaces) y solo retira lo potencialmente ejecutable. Para las
 * observaciones con imágenes, el front guarda el HTML en Nuxeo y aquí llega "NuxeoEnlace:<uuid>",
 * que no se ve afectado por esta función.
 */
const ETIQUETAS_PELIGROSAS = /<\/?(script|iframe|object|embed|style)\b[^>]*>/gi;
const CONTENIDO_SCRIPT_STYLE =
  /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
const ATRIBUTOS_EVENTO = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const URLS_JAVASCRIPT =
  /\s+(href|src)\s*=\s*("\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi;

export function sanitizarHtmlObservacion<T>(valor: T): T {
  if (typeof valor !== 'string') return valor;
  const limpio = valor
    .replace(CONTENIDO_SCRIPT_STYLE, '')
    .replace(ETIQUETAS_PELIGROSAS, '')
    .replace(ATRIBUTOS_EVENTO, '')
    .replace(URLS_JAVASCRIPT, '');
  return limpio as unknown as T;
}
