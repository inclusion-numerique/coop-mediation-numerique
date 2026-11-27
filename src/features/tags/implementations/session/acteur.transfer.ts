import { CodeDepartement } from '@/libraries/insee'
import {
  type Acteur,
  CoordinateurId,
  type Equipe,
  MediateurId,
  NomDuCoordinateur,
  role,
} from '../../domain'

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
  coordonneePar: nom === null ? null : NomDuCoordinateur(nom),
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
  departement:
    profil.departement === null ? null : CodeDepartement(profil.departement),
})
