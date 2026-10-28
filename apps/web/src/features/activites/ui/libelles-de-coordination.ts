import type {
  ActiviteDeCoordination,
  Choix,
  EchelonTerritorial,
  Initiative,
  StructurePartenaire,
} from '../domain'
import {
  INITIATIVE_OPTIONS,
  THEMATIQUE_ANIMATION_OPTIONS,
  TYPE_ANIMATION_OPTIONS,
} from '../use-cases/cra/animation/labels'
import {
  ECHELON_TERRITORIAL_OPTIONS,
  ORGANISATEURS_OPTIONS,
  TYPE_EVENEMENT_OPTIONS,
} from '../use-cases/cra/evenement/labels'
import {
  NATURE_OPTIONS,
  TYPE_DE_STRUCTURE_PARTENAIRE_OPTIONS,
} from '../use-cases/cra/partenariat/labels'

type Option = { readonly value: string; readonly label: string }

const libelleDans =
  (options: readonly Option[]) =>
  (valeur: string): string =>
    options.find((option) => option.value === valeur)?.label ?? valeur

export const LIBELLES_DES_TYPES = [
  { value: 'Evenement', label: 'Évènement', complet: 'l’évènement' },
  { value: 'Partenariat', label: 'Partenariat', complet: 'le partenariat' },
  { value: 'Animation', label: 'Animation', complet: 'l’animation' },
] as const

const libellesDuType = (type: ActiviteDeCoordination['_tag']) =>
  LIBELLES_DES_TYPES.find(({ value }) => value === type)

export const libelleDuType = (type: ActiviteDeCoordination['_tag']): string =>
  libellesDuType(type)?.label ?? type

export const libelleCompletDuType = (
  type: ActiviteDeCoordination['_tag'],
): string => libellesDuType(type)?.complet ?? type

const AUTRE = 'Autre'

export type FormatDeLAutre = (precision: string | null) => string

export const autreOuPrecision: FormatDeLAutre = (precision) =>
  precision ?? AUTRE

export const autreAvecPrecision: FormatDeLAutre = (precision) =>
  precision === null ? AUTRE : `${AUTRE} : ${precision}`

const libelleDuChoix =
  (options: readonly Option[]) =>
  (autre: FormatDeLAutre) =>
  (choix: Choix<string>): string =>
    choix._tag === 'Autre'
      ? autre(choix.precision)
      : libelleDans(options)(choix.valeur)

export const objetsDe =
  (autre: FormatDeLAutre) =>
  (activite: ActiviteDeCoordination): readonly string[] => {
    if (activite._tag === 'Animation')
      return activite.typeDAnimation === null
        ? []
        : [
            libelleDuChoix(TYPE_ANIMATION_OPTIONS)(autre)(
              activite.typeDAnimation,
            ),
          ]
    if (activite._tag === 'Evenement')
      return activite.typeDEvenement === null
        ? []
        : [
            libelleDuChoix(TYPE_EVENEMENT_OPTIONS)(autre)(
              activite.typeDEvenement,
            ),
          ]
    return activite.natures.map(libelleDuChoix(NATURE_OPTIONS)(autre))
  }

export const thematiquesDe =
  (autre: FormatDeLAutre) =>
  (activite: ActiviteDeCoordination): readonly string[] =>
    activite._tag === 'Animation'
      ? activite.thematiques.map(
          libelleDuChoix(THEMATIQUE_ANIMATION_OPTIONS)(autre),
        )
      : []

export const organisateursDe =
  (autre: FormatDeLAutre) =>
  (activite: ActiviteDeCoordination): readonly string[] =>
    activite._tag === 'Evenement'
      ? activite.organisateurs.map(libelleDuChoix(ORGANISATEURS_OPTIONS)(autre))
      : []

export const libelleDeLInitiative = (initiative: Initiative): string =>
  libelleDans(INITIATIVE_OPTIONS)(initiative)

export const libelleDeLEchelon = (echelon: EchelonTerritorial): string =>
  libelleDans(ECHELON_TERRITORIAL_OPTIONS)(echelon)

export const libelleDuTypeDeStructure = (
  type: StructurePartenaire['type'],
): string | null =>
  type === null ? null : libelleDans(TYPE_DE_STRUCTURE_PARTENAIRE_OPTIONS)(type)

export const libelleCourtDuTypeDeStructure = (
  type: StructurePartenaire['type'],
): string | null =>
  type === null
    ? null
    : (TYPE_DE_STRUCTURE_PARTENAIRE_OPTIONS.find(({ value }) => value === type)
        ?.extra?.short ?? null)
