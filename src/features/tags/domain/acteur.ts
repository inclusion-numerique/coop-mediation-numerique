import { CodeDepartement } from '@/libraries/insee'
import { CoordinateurId } from './coordinateur-id'
import { MediateurId } from './mediateur-id'
import { NomDuCoordinateur } from './nom-du-coordinateur'

export type Equipe = {
  readonly coordinateurId: CoordinateurId
  readonly coordonneePar: NomDuCoordinateur | null
}

export type Role =
  | { readonly _tag: 'Mediateur'; readonly mediateurId: MediateurId }
  | { readonly _tag: 'Coordinateur'; readonly coordinateurId: CoordinateurId }
  | {
      readonly _tag: 'MediateurEtCoordinateur'
      readonly mediateurId: MediateurId
      readonly coordinateurId: CoordinateurId
    }
  | { readonly _tag: 'SansRole' }

export type Acteur = Role & {
  readonly equipes: readonly Equipe[]
  readonly departement: CodeDepartement | null
}

export const role = (
  mediateurId: MediateurId | null,
  coordinateurId: CoordinateurId | null,
): Role => {
  if (mediateurId !== null && coordinateurId !== null)
    return { _tag: 'MediateurEtCoordinateur', mediateurId, coordinateurId }
  if (mediateurId !== null) return { _tag: 'Mediateur', mediateurId }
  if (coordinateurId !== null) return { _tag: 'Coordinateur', coordinateurId }
  return { _tag: 'SansRole' }
}

export const mediateurDe = (acteur: Role): MediateurId | null =>
  acteur._tag === 'Mediateur' || acteur._tag === 'MediateurEtCoordinateur'
    ? acteur.mediateurId
    : null

export const coordinateurDe = (acteur: Role): CoordinateurId | null =>
  acteur._tag === 'Coordinateur' || acteur._tag === 'MediateurEtCoordinateur'
    ? acteur.coordinateurId
    : null

export type ProfilDeLActeur = {
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
  readonly equipes: readonly {
    readonly coordinateurId: string
    readonly nom: string | null
  }[]
  readonly departement: string | null
}

const equipe = ({
  coordinateurId,
  nom,
}: ProfilDeLActeur['equipes'][number]): Equipe => ({
  coordinateurId: CoordinateurId(coordinateurId),
  coordonneePar: NomDuCoordinateur.safe(nom ?? ''),
})

const sansDoublon = (equipes: readonly Equipe[]): readonly Equipe[] =>
  equipes.filter(
    ({ coordinateurId }, index) =>
      equipes.findIndex((autre) => autre.coordinateurId === coordinateurId) ===
      index,
  )

export const acteurDe = (profil: ProfilDeLActeur): Acteur => ({
  ...role(
    profil.mediateurId === null ? null : MediateurId(profil.mediateurId),
    profil.coordinateurId === null
      ? null
      : CoordinateurId(profil.coordinateurId),
  ),
  equipes: sansDoublon(profil.equipes.map(equipe)),
  departement: CodeDepartement.safe(profil.departement ?? ''),
})
