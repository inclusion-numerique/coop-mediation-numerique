import { z } from 'zod'
import { dateAsDayConventional } from '@/libraries/date/dateAsDay'
import { ActivitesFilterValidations } from '../filtres/parametres-de-la-barre'

export type PeriodeChoisie = {
  readonly du?: string
  readonly au?: string
}

const PeriodeLue = z.object({
  du: ActivitesFilterValidations.du.catch(undefined),
  au: ActivitesFilterValidations.au.catch(undefined),
})

export const periodeChoisieDans = (
  parametres: Readonly<Record<string, unknown>>,
): PeriodeChoisie =>
  Object.fromEntries(
    Object.entries(PeriodeLue.parse(parametres)).filter(
      ([, valeur]) => valeur !== undefined,
    ),
  )

export const periodeDActivite = (
  premiere: string | null,
  derniere: string | null,
): string =>
  premiere === null || derniere === null
    ? 'Aucune activité enregistrée'
    : `Du ${dateAsDayConventional(new Date(premiere))} au ${dateAsDayConventional(new Date(derniere))}`

export const adresseDExport = (
  chemin: string,
  { du, au }: PeriodeChoisie,
): string => {
  const parametres = new URLSearchParams(
    Object.entries({ du, au }).flatMap(([cle, valeur]) =>
      valeur === undefined ? [] : [[cle, valeur]],
    ),
  ).toString()

  return parametres === '' ? chemin : `${chemin}?${parametres}`
}

export const titreDesStatistiques = ({
  coordinateur,
}: {
  readonly coordinateur: boolean
}): string => (coordinateur ? 'Statistiques, équipe comprise' : 'Statistiques')

export const adressesDesExports = (utilisateurId: string) => ({
  statistiques: `/administration/utilisateurs/${utilisateurId}/export/statistiques`,
  accompagnements: `/administration/utilisateurs/${utilisateurId}/export/accompagnements`,
})

export const bornesDuFiltreDePeriode = (
  premiere: string | null,
  { du, au }: PeriodeChoisie,
) => ({
  minDate: premiere === null ? undefined : new Date(premiere),
  defaultValue: du === undefined || au === undefined ? undefined : { du, au },
})
