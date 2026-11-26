import type { CoordinateurId } from './coordinateur-id'
import type { MediateurId } from './mediateur-id'
import type { Identite, Salutation } from './salutation'

export type ProfilDAccueil =
  | {
      readonly _tag: 'Coordinateur'
      readonly coordinateurId: CoordinateurId
    }
  | {
      readonly _tag: 'Mediateur'
      readonly mediateurId: MediateurId
      readonly bienvenue: boolean
    }

type ProfilDe<Tag extends ProfilDAccueil['_tag']> = Extract<
  ProfilDAccueil,
  { readonly _tag: Tag }
>

export type SelonLeProfil<T> = {
  readonly [Tag in ProfilDAccueil['_tag']]: (profil: ProfilDe<Tag>) => T
}

export const selonLeProfil = <T>(
  profil: ProfilDAccueil,
  selon: SelonLeProfil<T>,
): T =>
  profil._tag === 'Coordinateur'
    ? selon.Coordinateur(profil)
    : selon.Mediateur(profil)

export type Accueil = {
  readonly salutation: Salutation
  readonly profil: ProfilDAccueil
}

export type Visiteur = Identite & {
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
  readonly presentationVue: boolean
}
