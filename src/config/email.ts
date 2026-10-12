/** Captura de email (premium y newsletter). Apagada salvo EMAIL_ACTIVO=1. Spec: "Email apagado". */
export const emailActivo = (): boolean => process.env.EMAIL_ACTIVO === '1';
