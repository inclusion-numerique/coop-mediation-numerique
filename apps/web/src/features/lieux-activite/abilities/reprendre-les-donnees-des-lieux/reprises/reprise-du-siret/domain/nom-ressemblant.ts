import { similarite } from '@gouvfr-anct/lieux-de-mediation-numerique'

const motsRanges = (texte: string): string =>
  [
    ...new Set(
      texte
        .normalize('NFD')
        .replaceAll(/[̀-ͯ]/gu, '')
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/gu, ' ')
        .trim()
        .split(' ')
        .filter((mot) => mot !== ''),
    ),
  ]
    .sort()
    .join(' ')

export const ressemblanceDesNoms = (un: string, autre: string): number =>
  Math.max(
    similarite(un.toLowerCase(), autre.toLowerCase()),
    similarite(motsRanges(un), motsRanges(autre)),
  )
