import { dateAsDayConventional } from '@app/web/utils/dateAsDay'
import { differenceInMonths } from 'date-fns'
import type { Contrat, EcheanceDuContrat, TypeDeContrat } from '../domain'

export type BadgeDEcheance = {
  readonly libelle: string
  readonly severite: 'warning' | 'error'
  readonly icone: boolean
}

export type ContratAffiche = {
  readonly type: string
  readonly debut: string | null
  readonly fin: string | null
  readonly badge: BadgeDEcheance | null
}

const LIBELLES_DES_TYPES: Record<TypeDeContrat, string> = {
  CDD: 'CDD',
  CDI: 'CDI',
  CDP: 'Contrat de projet',
  PEC: 'PEC',
}

const BADGES_D_ECHEANCE: Record<EcheanceDuContrat, BadgeDEcheance | null> = {
  EnCours: null,
  FinProchaine: {
    libelle: 'Fin de contrat prochaine',
    severite: 'warning',
    icone: true,
  },
  Termine: { libelle: 'Contrat terminé', severite: 'error', icone: false },
}

const dureeDe = ({ debut, fin }: Contrat): string | null =>
  debut == null || fin == null
    ? null
    : `Durée ${differenceInMonths(fin, debut)} mois`

export const contratAffiche = (contrat: Contrat): ContratAffiche => ({
  type: [
    contrat.type == null ? null : LIBELLES_DES_TYPES[contrat.type],
    dureeDe(contrat),
  ]
    .filter((partie) => partie != null)
    .join(' - '),
  debut: contrat.debut == null ? null : dateAsDayConventional(contrat.debut),
  fin: contrat.fin == null ? null : dateAsDayConventional(contrat.fin),
  badge: BADGES_D_ECHEANCE[contrat.echeance],
})
