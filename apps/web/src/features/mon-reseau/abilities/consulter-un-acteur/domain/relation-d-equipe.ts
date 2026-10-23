import type { Acteur } from '../../../domain'
import type { Lecteur } from './lecteur'

export type AdhesionLue =
  | { readonly _tag: 'EnCours' }
  | { readonly _tag: 'Terminee'; readonly debut: Date; readonly fin: Date }

export type LienDEquipe =
  | { readonly _tag: 'NonCoordonnable' }
  | { readonly _tag: 'HorsEquipe' }
  | { readonly _tag: 'Invite'; readonly invitationLe: Date }
  | { readonly _tag: 'AncienMembre'; readonly depuis: Date; readonly fin: Date }
  | { readonly _tag: 'Membre' }

type Terminee = Extract<AdhesionLue, { _tag: 'Terminee' }>

const plusRecente = (
  derniere: Terminee | null,
  adhesion: AdhesionLue,
): Terminee | null =>
  adhesion._tag === 'Terminee' &&
  (derniere === null || adhesion.fin > derniere.fin)
    ? adhesion
    : derniere

export const lienDEquipe = ({
  lecteur,
  acteur,
  adhesions,
  invitationEnCours,
}: {
  lecteur: Extract<Lecteur, { _tag: 'Coordinateur' }>
  acteur: Acteur
  adhesions: readonly AdhesionLue[]
  invitationEnCours: Date | null
}): LienDEquipe => {
  if (
    acteur.profil.mediation === null ||
    acteur.acteurId === lecteur.acteurId
  ) {
    return { _tag: 'NonCoordonnable' }
  }
  if (adhesions.some(({ _tag }) => _tag === 'EnCours'))
    return { _tag: 'Membre' }
  if (invitationEnCours !== null) {
    return { _tag: 'Invite', invitationLe: invitationEnCours }
  }

  const derniere = adhesions.reduce(plusRecente, null)
  return derniere === null
    ? { _tag: 'HorsEquipe' }
    : { _tag: 'AncienMembre', depuis: derniere.debut, fin: derniere.fin }
}
