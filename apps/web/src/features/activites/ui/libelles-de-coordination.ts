import {
  INITIATIVE_OPTIONS,
  THEMATIQUE_ANIMATION_OPTIONS,
  TYPE_ANIMATION_OPTIONS,
} from '@app/web/features/activites/ui/libelles/animation'
import {
  ECHELON_TERRITORIAL_OPTIONS,
  ORGANISATEURS_OPTIONS,
  TYPE_EVENEMENT_OPTIONS,
} from '@app/web/features/activites/ui/libelles/evenement'
import {
  NATURE_OPTIONS,
  TYPE_DE_STRUCTURE_PARTENAIRE_OPTIONS,
} from '@app/web/features/activites/ui/libelles/partenariat'
import type {
  ActiviteDeCoordination,
  Choix,
  ChoixMultiples,
  EchelonTerritorial,
  Initiative,
  StructurePartenaire,
} from '../domain'

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

const libellesDesChoix =
  (options: readonly Option[]) =>
  (autre: FormatDeLAutre) =>
  (choix: ChoixMultiples<string>): readonly string[] => [
    ...choix.valeurs.map(libelleDans(options)),
    ...(choix.autre === null ? [] : [autre(choix.autre)]),
  ]

export const objetsDe =
  (autre: FormatDeLAutre) =>
  (activite: ActiviteDeCoordination): readonly string[] => {
    if (activite._tag === 'Animation')
      return [
        libelleDuChoix(TYPE_ANIMATION_OPTIONS)(autre)(activite.typeDAnimation),
      ]
    if (activite._tag === 'Evenement')
      return [
        libelleDuChoix(TYPE_EVENEMENT_OPTIONS)(autre)(activite.typeDEvenement),
      ]
    return libellesDesChoix(NATURE_OPTIONS)(autre)(activite.natures)
  }

export const thematiquesDe =
  (autre: FormatDeLAutre) =>
  (activite: ActiviteDeCoordination): readonly string[] =>
    activite._tag === 'Animation'
      ? libellesDesChoix(THEMATIQUE_ANIMATION_OPTIONS)(autre)(
          activite.thematiques,
        )
      : []

export const organisateursDe =
  (autre: FormatDeLAutre) =>
  (activite: ActiviteDeCoordination): readonly string[] =>
    activite._tag === 'Evenement'
      ? libellesDesChoix(ORGANISATEURS_OPTIONS)(autre)(activite.organisateurs)
      : []

export const libelleDeLInitiative = (initiative: Initiative): string =>
  libelleDans(INITIATIVE_OPTIONS)(initiative)

export const libelleDeLEchelon = (echelon: EchelonTerritorial): string =>
  libelleDans(ECHELON_TERRITORIAL_OPTIONS)(echelon)

export const libelleDuTypeDeStructure = (
  type: StructurePartenaire['type'],
): string =>
  libelleDuChoix(TYPE_DE_STRUCTURE_PARTENAIRE_OPTIONS)(autreAvecPrecision)(type)

export const libelleCourtDuTypeDeStructure = (
  type: StructurePartenaire['type'],
): string =>
  type._tag === 'Autre'
    ? type.precision
    : (TYPE_DE_STRUCTURE_PARTENAIRE_OPTIONS.find(
        ({ value }) => value === type.valeur,
      )?.extra?.short ?? type.valeur)
