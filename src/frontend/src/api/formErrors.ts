import type { ApiError } from './errors';

function toCamelCase(pascalKey: string): string {
  return pascalKey.charAt(0).toLowerCase() + pascalKey.slice(1);
}

/**
 * Convierte los fieldErrors de un ApiError (kind 'validation', claves en PascalCase
 * porque vienen del ValidationProblemDetails de ASP.NET Core) a un
 * Record<camelCase, primer mensaje>, listo para form.setErrors() de @mantine/form.
 */
export function toFormErrors(error: ApiError): Record<string, string> {
  if (!error.fieldErrors) return {};
  return Object.fromEntries(
    Object.entries(error.fieldErrors).map(([field, messages]) => [toCamelCase(field), messages[0]]),
  );
}
