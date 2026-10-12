export const TIPOS = ['prompt', 'plantilla', 'guia', 'paso-a-paso'] as const;
export type TipoRecurso = (typeof TIPOS)[number];
export const ETIQUETAS_TIPO: Record<TipoRecurso, string> = {
  prompt: 'Prompt',
  plantilla: 'Plantilla',
  guia: 'Guía',
  'paso-a-paso': 'Paso a paso',
};

export const TEMAS = [
  'clinicas', 'inmobiliarias', 'retail', 'gestion',
  'atencion-cliente', 'finanzas', 'contenido', 'productividad',
  'ia-practica',
] as const;
export type Tema = (typeof TEMAS)[number];
export const ETIQUETAS_TEMA: Record<Tema, string> = {
  clinicas: 'Clínicas',
  inmobiliarias: 'Inmobiliarias',
  retail: 'Tiendas',
  gestion: 'Gestión',
  'atencion-cliente': 'Atención al cliente',
  finanzas: 'Finanzas',
  contenido: 'Contenido',
  productividad: 'Productividad',
  'ia-practica': 'IA práctica',
};

export const HERRAMIENTAS = [
  'claude', 'claude-code', 'chatgpt', 'gemini', 'n8n', 'make', 'manychat',
  'whatsapp', 'google-sheets', 'excel', 'notion', 'canva',
] as const;
export type Herramienta = (typeof HERRAMIENTAS)[number];
export const ETIQUETAS_HERRAMIENTA: Record<Herramienta, string> = {
  claude: 'Claude',
  'claude-code': 'Claude Code',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  n8n: 'n8n',
  make: 'Make',
  manychat: 'ManyChat',
  whatsapp: 'WhatsApp',
  'google-sheets': 'Google Sheets',
  excel: 'Excel',
  notion: 'Notion',
  canva: 'Canva',
};
