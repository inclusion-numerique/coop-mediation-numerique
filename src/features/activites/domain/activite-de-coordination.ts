import { failure, type Result, success } from '@app/web/libraries/result'
import type { ActiviteDeCoordinationId } from './activite-de-coordination-id'
import type { Choix, ChoixMultiples } from './choix'
import type { CoordinateurId } from './coordinateur-id'
import type { DateDActivite } from './date-d-activite'
import type { DureeEnMinutes } from './duree-en-minutes'
import type { EchelonTerritorial } from './echelon-territorial'
import { Effectif } from './effectif'
import { AucuneStructurePartenaire, AucunIntervenant } from './errors'
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
  readonly type: Choix<TypeDeStructurePartenaire>
}

export type Intervenants = {
  readonly mediateurs: Effectif
  readonly structures: Effectif
  readonly autresActeurs: Effectif
}

type Commun = {
  readonly id: ActiviteDeCoordinationId
  readonly coordinateurId: CoordinateurId
  readonly date: DateDActivite
  readonly tags: readonly TagDeLActivite[]
  readonly notes: Notes | null
  readonly creation: Date
  readonly modification: Date
}

export type Animation = Commun & {
  readonly _tag: 'Animation'
  readonly duree: DureeEnMinutes
  readonly typeDAnimation: Choix<TypeDAnimation>
  readonly thematiques: ChoixMultiples<ThematiqueDAnimation>
  readonly initiative: Initiative | null
  readonly intervenants: Intervenants
}

export type Evenement = Commun & {
  readonly _tag: 'Evenement'
  readonly nom: NomDeLActivite | null
  readonly typeDEvenement: Choix<TypeDEvenement>
  readonly organisateurs: ChoixMultiples<Organisateur>
  readonly echelon: EchelonTerritorial | null
  readonly participants: Effectif
}

export type StructuresPartenaires = readonly [
  StructurePartenaire,
  ...StructurePartenaire[],
]

export type Partenariat = Commun & {
  readonly _tag: 'Partenariat'
  readonly nom: NomDeLActivite | null
  readonly natures: ChoixMultiples<NatureDePartenariat>
  readonly structuresPartenaires: StructuresPartenaires
  readonly echelon: EchelonTerritorial | null
}

export type ActiviteDeCoordination = Animation | Evenement | Partenariat

export const intervenantsDe = (
  intervenants: Intervenants,
): Result<Intervenants, AucunIntervenant> =>
  intervenants.mediateurs +
    intervenants.structures +
    intervenants.autresActeurs ===
  0
    ? failure(AucunIntervenant())
    : success(intervenants)

export const structuresPartenairesDe = (
  structures: readonly StructurePartenaire[],
): Result<StructuresPartenaires, AucuneStructurePartenaire> => {
  const [premiere, ...autres] = structures
  return premiere === undefined
    ? failure(AucuneStructurePartenaire())
    : success([premiere, ...autres])
}

const total = (effectifs: readonly Effectif[]): Effectif =>
  Effectif(effectifs.reduce<number>((somme, effectif) => somme + effectif, 0))

export const participantsDe = (activite: ActiviteDeCoordination): Effectif => {
  if (activite._tag === 'Animation') {
    const { mediateurs, structures, autresActeurs } = activite.intervenants
    return total([mediateurs, structures, autresActeurs])
  }
  if (activite._tag === 'Evenement') return activite.participants
  return Effectif(0)
}

export const partenairesDe = (activite: ActiviteDeCoordination): Effectif =>
  Effectif(
    activite._tag === 'Partenariat' ? activite.structuresPartenaires.length : 0,
  )
