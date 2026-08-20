/**
 * Ajustes de Mermaid con la paleta del sitio, para que los diagramas no
 * desentonen con el resto de la entrada. Se usan igual en la página publicada
 * y en la vista previa del editor.
 */
export function configuracionMermaid(oscuro: boolean) {
  return {
    startOnLoad: false,
    securityLevel: 'strict' as const,
    theme: 'base' as const,
    themeVariables: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: '14px',
      background: 'transparent',
      primaryColor: oscuro ? '#2A2A28' : '#FFFFFF',
      primaryTextColor: oscuro ? '#D4D4D4' : '#37352F',
      primaryBorderColor: oscuro ? '#3D3D3A' : '#DFDEDB',
      secondaryColor: oscuro ? '#3A2A1B' : '#FBECDD',
      secondaryTextColor: oscuro ? '#FFA344' : '#D9730D',
      secondaryBorderColor: oscuro ? '#4A3722' : '#F0D8C2',
      tertiaryColor: oscuro ? '#202020' : '#F7F7F5',
      tertiaryTextColor: oscuro ? '#D4D4D4' : '#37352F',
      tertiaryBorderColor: oscuro ? '#2F2F2F' : '#E9E9E7',
      lineColor: oscuro ? '#6F6F6F' : '#9B9A97',
      textColor: oscuro ? '#D4D4D4' : '#37352F',
      mainBkg: oscuro ? '#2A2A28' : '#FFFFFF',
      nodeBorder: oscuro ? '#3D3D3A' : '#DFDEDB',
      clusterBkg: oscuro ? '#202020' : '#F7F7F5',
      edgeLabelBackground: oscuro ? '#191919' : '#FFFFFF',
    },
  };
}
