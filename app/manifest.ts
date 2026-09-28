import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NeoGénesis — Asistente PTU NG',
    short_name: 'NeoGénesis',
    description: 'Gestor de personajes, campañas y asistente para PTU NeoGénesis.',
    start_url: '/',
    display: 'standalone',
    background_color: '#071018',
    theme_color: '#071018',
    lang: 'es',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  }
}
