import {
  CoordinateurId,
  Email,
  MediateurId,
  NomComplet,
  Prenom,
  type Visiteur,
} from '../../domain'

export type UtilisateurConnecte = {
  readonly firstName: string | null
  readonly name: string | null
  readonly email: string
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: { readonly id: string } | null
  readonly hasSeenOnboarding: string | null
}

export const visiteurDe = (user: UtilisateurConnecte): Visiteur => ({
  prenom: Prenom.safe(user.firstName ?? ''),
  nomComplet: NomComplet.safe(user.name ?? ''),
  email: Email(user.email),
  mediateurId: user.mediateur == null ? null : MediateurId(user.mediateur.id),
  coordinateurId:
    user.coordinateur == null ? null : CoordinateurId(user.coordinateur.id),
  presentationVue: user.hasSeenOnboarding !== null,
})
