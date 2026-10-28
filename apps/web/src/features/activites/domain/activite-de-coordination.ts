import type { ActiviteDeCoordinationId } from './activite-de-coordination-id'
import type { Choix } from './choix'
import type { DureeEnMinutes } from './duree-en-minutes'
import type { EchelonTerritorial } from './echelon-territorial'
import { Effectif } from './effectif'
import type { Initiative } from './initiative'
import type { NatureDePartenariat } from './nature-de-partenariat'
import type { NomDeLActivite } from './nom-de-l-activite'
import type { NomDeStructure } from './nom-de-structure'
import type { NomDeTag } from './nom-de-tag'
import type { Notes } from './notes'
import type { Organisateur } from './organisateur'
import type { TagId } from './tag-id'
import type { ThematiqueDAnimation } from './thematique-d-animation'
import type { TypeDAnimation } from './type-d-animation'
import type { TypeDEvenement } from './type-d-evenement'
import type { TypeDeStructurePartenaire } from './type-de-structure-partenaire'

export type TagDeLActivite = {
  readonly id: TagId
  readonly nom: NomDeTag
}

export type StructurePartenaire = {
  readonly nom: NomDeStructure
  readonly type: TypeDeStructurePartenaire | null
}

export type Intervenants = {
  readonly mediateurs: Effectif | null
  readonly structures: Effectif | null
  readonly autresActeurs: Effectif | null
}

type Commun = {
  readonly id: ActiviteDeCoordinationId
  readonly date: Date
  readonly duree: DureeEnMinutes | null
  readonly tags: readonly TagDeLActivite[]
  readonly notes: Notes | null
  readonly creation: Date
  readonly modification: Date
}

export type Animation = Commun & {
  readonly _tag: 'Animation'
  readonly typeDAnimation: Choix<TypeDAnimation> | null
  readonly thematiques: readonly Choix<ThematiqueDAnimation>[]
  readonly initiative: Initiative | null
  readonly intervenants: Intervenants
}

export type Evenement = Commun & {
  readonly _tag: 'Evenement'
  readonly nom: NomDeLActivite | null
  readonly typeDEvenement: Choix<TypeDEvenement> | null
  readonly organisateurs: readonly Choix<Organisateur>[]
  readonly echelon: EchelonTerritorial | null
  readonly participants: Effectif | null
}

export type Partenariat = Commun & {
  readonly _tag: 'Partenariat'
  readonly nom: NomDeLActivite | null
  readonly natures: readonly Choix<NatureDePartenariat>[]
  readonly structuresPartenaires: readonly StructurePartenaire[]
  readonly echelon: EchelonTerritorial | null
}

export type ActiviteDeCoordination = Animation | Evenement | Partenariat

const total = (effectifs: readonly (Effectif | null)[]): Effectif =>
  Effectif(
    effectifs.reduce<number>((somme, effectif) => somme + (effectif ?? 0), 0),
  )

export const participantsDe = (activite: ActiviteDeCoordination): Effectif => {
  if (activite._tag === 'Animation') {
    const { mediateurs, structures, autresActeurs } = activite.intervenants
    return total([mediateurs, structures, autresActeurs])
  }
  if (activite._tag === 'Evenement') return activite.participants ?? Effectif(0)
  return Effectif(0)
}

export const partenairesDe = (activite: ActiviteDeCoordination): Effectif =>
  Effectif(
    activite._tag === 'Partenariat' ? activite.structuresPartenaires.length : 0,
  )
