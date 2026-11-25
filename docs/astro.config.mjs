import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import mermaid from 'astro-mermaid'

export default defineConfig({
  integrations: [
    mermaid({ theme: 'default', autoTheme: true }),
    starlight({
      title: 'La Coop de la médiation numérique',
      description:
        'Décisions, spécifications exécutables, architecture et rapports de la Coop de la médiation numérique',
      customCss: ['../documentation.css'],
      defaultLocale: 'root',
      locales: { root: { label: 'Français', lang: 'fr' } },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/inclusion-numerique/coop-mediation-numerique',
        },
      ],
      sidebar: [
        {
          label: 'Décisions',
          items: [{ autogenerate: { directory: 'decisions' } }],
        },
        {
          label: 'Spécifications',
          collapsed: true,
          items: [
            { autogenerate: { directory: 'specifications', collapsed: true } },
          ],
        },
        {
          label: 'Architecture',
          items: [{ autogenerate: { directory: 'architecture' } }],
        },
        { label: 'Rapports', slug: 'rapports' },
      ],
    }),
  ],
})
