import type { UtilisateurId } from '../identifiants/utilisateur-id'
import type { AdresseCourriel } from '../identite/adresse-courriel'
import type { Prenom } from '../identite/prenom'
import type { RattachementsDuCompte } from '../rattachements'
import type { ActionDeRelance, SituationDeRelance } from './relance'

export type ProfilDuDestinataire =
  | { readonly _tag: 'SansRole' }
  | { readonly _tag: 'Mediateur' }
  | { readonly _tag: 'Coordinateur' }
  | { readonly _tag: 'MediateurEtCoordinateur' }

export type DestinataireDeRelance = {
  readonly utilisateurId: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly prenom: Prenom | null
  readonly profil: ProfilDuDestinataire
}

export type CompteARelancer = {
  readonly utilisateurId: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly prenom: Prenom | null
  readonly rattachements: RattachementsDuCompte
  readonly situation: SituationDeRelance
}

const PROFIL_DES_RATTACHEMENTS: Readonly<
  Record<RattachementsDuCompte['_tag'], ProfilDuDestinataire>
> = {
  aucun: { _tag: 'SansRole' },
  mediateur: { _tag: 'Mediateur' },
  coordinateur: { _tag: 'Coordinateur' },
  mediateurEtCoordinateur: { _tag: 'MediateurEtCoordinateur' },
}

export const destinataireDe = ({
  utilisateurId,
  courriel,
  prenom,
  rattachements,
}: CompteARelancer): DestinataireDeRelance => ({
  utilisateurId,
  courriel,
  prenom,
  profil: PROFIL_DES_RATTACHEMENTS[rattachements._tag],
})

export type ActionDecidee = Exclude<ActionDeRelance, { readonly _tag: 'Rien' }>

export type RapportDeRelance = {
  readonly utilisateurId: UtilisateurId
  readonly profil: ProfilDuDestinataire
  readonly action: ActionDecidee
} & (
  | { readonly issue: 'fait' }
  | { readonly issue: 'echec'; readonly cause: string }
)

export type RelancesDeroulees = readonly RapportDeRelance[]
