import { dateAsDay } from '@app/web/utils/dateAsDay'
import type { Acteur } from '../../../domain'
import type { RegardDuLecteur, StatutDActivitePublic } from '../domain'

export type StatutAffiche = {
  readonly libelle: string
  readonly severite: 'success' | 'warning'
  readonly infobulle: boolean
}

export const statutAffiche = (statut: StatutDActivitePublic): StatutAffiche => {
  if (statut._tag === 'Actif') {
    return { libelle: 'Actif', severite: 'success', infobulle: false }
  }
  return {
    libelle:
      statut._tag === 'InactifDepuis'
        ? `Inactif depuis le ${dateAsDay(statut.derniereActivite)}`
        : 'Inactif',
    severite: 'warning',
    infobulle: true,
  }
}

export type ActionsDEquipe = {
  readonly inviter: boolean
  readonly retirer: boolean
  readonly invitationEnvoyeeLe: Date | null
  readonly archive: { readonly depuis: Date; readonly fin: Date } | null
}

const AUCUNE_ACTION: ActionsDEquipe = {
  inviter: false,
  retirer: false,
  invitationEnvoyeeLe: null,
  archive: null,
}

export const actionsDEquipe = (regard: RegardDuLecteur): ActionsDEquipe => {
  if (regard._tag === 'Mediateur') return AUCUNE_ACTION

  const { relation } = regard
  if (relation._tag === 'HorsEquipe') return { ...AUCUNE_ACTION, inviter: true }
  if (relation._tag === 'Invite') {
    return { ...AUCUNE_ACTION, invitationEnvoyeeLe: relation.invitationLe }
  }
  if (relation._tag === 'AncienMembre') {
    return {
      ...AUCUNE_ACTION,
      inviter: true,
      archive: { depuis: relation.depuis, fin: relation.fin },
    }
  }
  return relation._tag === 'Membre'
    ? { ...AUCUNE_ACTION, retirer: true }
    : AUCUNE_ACTION
}

export const membreDeLEquipe = (regard: RegardDuLecteur) =>
  regard._tag === 'Coordinateur' && regard.relation._tag === 'Membre'
    ? regard.relation
    : null

export const ancienMembreDe = (regard: RegardDuLecteur) =>
  regard._tag === 'Coordinateur' && regard.relation._tag === 'AncienMembre'
    ? {
        coordinateurId: regard.coordinateurId,
        depuis: regard.relation.depuis,
        fin: regard.relation.fin,
      }
    : null

export const encartDeLEmployeuse = (
  acteur: Acteur,
  regard: RegardDuLecteur,
) => ({
  referentVisible: membreDeLEquipe(regard) !== null,
  avisAuxConseillersNumeriques:
    acteur.profil.dispositif === 'ConseillerNumerique',
})

export const contratVisible = (acteur: Acteur, regard: RegardDuLecteur) =>
  membreDeLEquipe(regard) !== null &&
  acteur.profil.dispositif === 'ConseillerNumerique'
