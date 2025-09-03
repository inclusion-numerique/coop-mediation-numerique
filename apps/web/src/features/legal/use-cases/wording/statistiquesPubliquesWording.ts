import { dateAsDay } from '@app/web/utils/dateAsDay'

export const datesDonneesRecolteesEtMisesAJour = (
  {
    since = '15.11.2024',
    updated = dateAsDay(new Date()),
  }: {
    since?: string
    updated?: string
  } = {
    since: '15.11.2024',
    updated: dateAsDay(new Date()),
  },
) => {
  return `Données récoltées depuis le ${since} · Dernière mise à jour le ${updated}`
}

export const totalDepuis = (
  { since = '15.11.2024' }: { since?: string } = { since: '15.11.2024' },
) => {
  return `Total depuis le ${since}`
}
