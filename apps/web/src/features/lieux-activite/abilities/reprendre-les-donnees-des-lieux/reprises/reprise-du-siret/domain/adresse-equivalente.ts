import {
  nettoyerVoie,
  normaliserAdresse,
} from '@gouvfr-anct/lieux-de-mediation-numerique'

const SUFFIXES: Readonly<Record<string, string>> = {
  b: 'bis',
  t: 'ter',
  q: 'quater',
}

const NUMERO_ET_SUFFIXE = /^(\d+)\s*(bis|ter|quater|[a-z])\b\s*/u

const voieNormalisee = (voie: string): string =>
  normaliserAdresse(nettoyerVoie(voie))
    .replace(
      NUMERO_ET_SUFFIXE,
      (_tout, numero: string, suffixe: string) =>
        `${numero}${SUFFIXES[suffixe] ?? suffixe} `,
    )
    .trim()

export const motsDeLaVoie = (voie: string): string =>
  [...new Set(voieNormalisee(voie).split(/\s+/u))].sort().join(' ')
