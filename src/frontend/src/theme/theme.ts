import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Paleta "El Registro": ink navy como color de marca, ambar como acento
// puntual (nunca fondo de botón con texto encima), rojo tarjeta para
// acciones destructivas. Ver docs/api-spec-frontend.md para el contexto
// de dominio; la justificación de la paleta vive en la conversación de
// diseño del feature frontend-setup.
const navy: MantineColorsTuple = [
  '#EEF1F7',
  '#D7DEEA',
  '#AFC0DB',
  '#8AA0C7',
  '#6683B0',
  '#4D6A97',
  '#16233F',
  '#111C33',
  '#0D1526',
  '#080D19',
];

const amber: MantineColorsTuple = [
  '#FBF3E2',
  '#F5E4BE',
  '#EFCE8E',
  '#E6B85E',
  '#DBA23A',
  '#CE9328',
  '#C48A1E',
  '#A8730E',
  '#8B5D0A',
  '#6E4907',
];

const danger: MantineColorsTuple = [
  '#FBE9E7',
  '#F5CAC4',
  '#E9A199',
  '#DC786D',
  '#CE5548',
  '#C13B2C',
  '#B3261E',
  '#971F18',
  '#7C1913',
  '#5F120E',
];

export const theme = createTheme({
  primaryColor: 'navy',
  primaryShade: 6,
  colors: { navy, amber, danger },
  fontFamily: '"Source Sans 3", system-ui, -apple-system, sans-serif',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  headings: {
    fontFamily: '"Space Grotesk", system-ui, -apple-system, sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'sm',
  radius: {
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
  },
  black: '#14181D',
  white: '#FFFFFF',
  other: {
    pageBackground: '#F6F7F5',
    mutedText: '#5B6370',
  },
});
