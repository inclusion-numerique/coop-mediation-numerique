import type { SelectOption } from '@app/ui/components/Form/utils/options'

export const SOURCES_DANS_L_URL = ['', 'v1', 'v2'] as const

export type SourceDansLURL = (typeof SOURCES_DANS_L_URL)[number]

export const libellesDesSources: Readonly<Record<SourceDansLURL, string>> = {
  '': 'Toutes les sources de données',
  v1: 'Espace Coop (V1)',
  v2: 'La Coop de la médiation numérique',
}

export const optionsDesSources: readonly SelectOption<SourceDansLURL>[] = [
  { value: '', label: libellesDesSources[''] },
  { value: 'v1', label: libellesDesSources.v1 },
  { value: 'v2', label: libellesDesSources.v2 },
]
