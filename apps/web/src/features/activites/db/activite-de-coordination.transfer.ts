import type { Prisma } from '@app/web/generated/prisma/client'
import type { Model } from '@app/web/libraries/model'
import type { Result } from '@app/web/libraries/result'
import type { z } from 'zod'
import {
  type ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  type Choix,
  type ChoixMultiples,
  CoordinateurId,
  type CriteresDesCoordinations,
  choixMultiplesDe,
  DateDActivite,
  DureeEnMinutes,
  EchelonTerritorial,
  Effectif,
  Initiative,
  intervenantsDe,
  NatureDePartenariat,
  NomDeLActivite,
  NomDeStructure,
  NomDeTag,
  Notes,
  Organisateur,
  Precision,
  type StructurePartenaire,
  type StructuresPartenaires,
  structuresPartenairesDe,
  TagId,
  ThematiqueDAnimation,
  TypeDAnimation,
  TypeDEvenement,
  TypeDeStructurePartenaire,
} from '../domain'

export const activiteDeCoordinationSelect = {
  id: true,
  coordinateurId: true,
  type: true,
  date: true,
  duree: true,
  creation: true,
  modification: true,
  notes: true,
  nom: true,
  echelonTerritorial: true,
  mediateurs: true,
  structures: true,
  autresActeurs: true,
  typeAnimation: true,
  typeAnimationAutre: true,
  initiative: true,
  thematiquesAnimation: true,
  thematiqueAnimationAutre: true,
  participants: true,
  typeEvenement: true,
  typeEvenementAutre: true,
  organisateurs: true,
  organisateurAutre: true,
  naturePartenariat: true,
  naturePartenariatAutre: true,
  structuresPartenaires: true,
  tags: { select: { tag: { select: { id: true, nom: true } } } },
} satisfies Prisma.ActiviteCoordinationSelect

export type ActiviteDeCoordinationRow = Prisma.ActiviteCoordinationGetPayload<{
  select: typeof activiteDeCoordinationSelect
}>

const AUTRE = 'Autre' as const

export class ActiviteDeCoordinationIllisible extends Error {
  constructor(id: string, raison: string) {
    super(`Activité de coordination ${id} illisible : ${raison}`)
    this.name = 'ActiviteDeCoordinationIllisible'
  }
}

const valide =
  (id: string) =>
  <T, E extends { readonly _tag: string }>(resultat: Result<T, E>): T => {
    if (!resultat.success) {
      throw new ActiviteDeCoordinationIllisible(id, resultat.error._tag)
    }
    return resultat.data
  }

const renseigne = (valeur: string | null): string | null =>
  valeur === null || valeur.trim() === '' ? null : valeur

const precisionDe = (id: string, precision: string | null): Precision => {
  const renseignee = renseigne(precision)
  if (renseignee === null) {
    throw new ActiviteDeCoordinationIllisible(id, 'précision « autre » absente')
  }
  return Precision(renseignee)
}

const choixDe =
  <S extends z.ZodType>(modele: Model<S>) =>
  (
    id: string,
    valeur: string | null,
    precision: string | null,
  ): Choix<z.output<S>> => {
    if (valeur === null) {
      throw new ActiviteDeCoordinationIllisible(id, 'choix absent')
    }
    if (valeur === AUTRE) {
      return { _tag: 'Autre', precision: precisionDe(id, precision) }
    }
    if (renseigne(precision) !== null) {
      throw new ActiviteDeCoordinationIllisible(id, 'précision sans « autre »')
    }
    return { _tag: 'Liste', valeur: modele.schema.parse(valeur) }
  }

const choixMultiplesDeLaLigne =
  <S extends z.ZodType>(modele: Model<S>) =>
  (
    id: string,
    valeurs: readonly string[],
    precision: string | null,
  ): ChoixMultiples<z.output<S>> => {
    const avecAutre = valeurs.includes(AUTRE)
    if (!avecAutre && renseigne(precision) !== null) {
      throw new ActiviteDeCoordinationIllisible(id, 'précision sans « autre »')
    }
    return valide(id)(
      choixMultiplesDe({
        valeurs: valeurs
          .filter((valeur) => valeur !== AUTRE)
          .map((valeur) => modele.schema.parse(valeur)),
        autre: avecAutre ? precisionDe(id, precision) : null,
      }),
    )
  }

const sansDonneeDe = (
  row: ActiviteDeCoordinationRow,
  colonnes: readonly (keyof ActiviteDeCoordinationRow)[],
): void => {
  const remplie = colonnes.find((colonne) => {
    const valeur = row[colonne]
    return Array.isArray(valeur) ? valeur.length > 0 : valeur !== null
  })
  if (remplie !== undefined) {
    throw new ActiviteDeCoordinationIllisible(
      row.id,
      `${String(remplie)} hors de son type`,
    )
  }
}

const structurePartenaireDe =
  (id: string) =>
  (structure: Prisma.JsonValue): StructurePartenaire => {
    if (
      typeof structure !== 'object' ||
      structure === null ||
      Array.isArray(structure)
    ) {
      throw new ActiviteDeCoordinationIllisible(id, 'structure partenaire')
    }
    const type = structure.type
    const typeAutre = structure.typeAutre ?? null
    return {
      nom: NomDeStructure(String(structure.nom ?? '')),
      type: choixDe(TypeDeStructurePartenaire)(
        id,
        typeof type === 'string' ? type : null,
        typeof typeAutre === 'string' ? typeAutre : null,
      ),
    }
  }

const structuresPartenairesDeLaLigne = (
  row: ActiviteDeCoordinationRow,
): StructuresPartenaires =>
  valide(row.id)(
    structuresPartenairesDe(
      (Array.isArray(row.structuresPartenaires)
        ? row.structuresPartenaires
        : []
      ).map(structurePartenaireDe(row.id)),
    ),
  )

const HTML_VIDE = /^\s*(<p>\s*(<br\s*\/?>)?\s*<\/p>\s*)*$/

const notesDe = (notes: string | null): Notes | null =>
  notes === null || HTML_VIDE.test(notes) ? null : Notes(notes)

const nomDe = (nom: string | null): NomDeLActivite | null => {
  const renseigneNom = renseigne(nom)
  return renseigneNom === null ? null : NomDeLActivite(renseigneNom)
}

const echelonDe = (
  echelon: ActiviteDeCoordinationRow['echelonTerritorial'],
): EchelonTerritorial | null =>
  echelon === null ? null : EchelonTerritorial(echelon)

const COLONNES_D_ANIMATION = [
  'duree',
  'mediateurs',
  'structures',
  'autresActeurs',
  'typeAnimation',
  'typeAnimationAutre',
  'initiative',
  'thematiquesAnimation',
  'thematiqueAnimationAutre',
] as const

const COLONNES_D_EVENEMENT = [
  'participants',
  'typeEvenement',
  'typeEvenementAutre',
  'organisateurs',
  'organisateurAutre',
] as const

const COLONNES_DE_PARTENARIAT = [
  'naturePartenariat',
  'naturePartenariatAutre',
  'structuresPartenaires',
] as const

const COLONNES_D_EVENEMENT_OU_DE_PARTENARIAT = [
  'nom',
  'echelonTerritorial',
] as const

const effectifDe = (valeur: number | null): Effectif => Effectif(valeur ?? 0)

export const activiteDeCoordinationDe = (
  row: ActiviteDeCoordinationRow,
): ActiviteDeCoordination => {
  const commun = {
    id: ActiviteDeCoordinationId(row.id),
    coordinateurId: CoordinateurId(row.coordinateurId),
    date: DateDActivite(row.date.toISOString().slice(0, 10)),
    tags: row.tags.map(({ tag }) => ({
      id: TagId(tag.id),
      nom: NomDeTag(tag.nom),
    })),
    notes: notesDe(row.notes),
    creation: row.creation,
    modification: row.modification,
  }

  if (row.type === 'Animation') {
    sansDonneeDe(row, [
      ...COLONNES_D_EVENEMENT,
      ...COLONNES_DE_PARTENARIAT,
      ...COLONNES_D_EVENEMENT_OU_DE_PARTENARIAT,
    ])
    return {
      ...commun,
      _tag: 'Animation',
      duree: DureeEnMinutes(row.duree ?? 0),
      typeDAnimation: choixDe(TypeDAnimation)(
        row.id,
        row.typeAnimation,
        row.typeAnimationAutre,
      ),
      thematiques: choixMultiplesDeLaLigne(ThematiqueDAnimation)(
        row.id,
        row.thematiquesAnimation,
        row.thematiqueAnimationAutre,
      ),
      initiative: row.initiative === null ? null : Initiative(row.initiative),
      intervenants: valide(row.id)(
        intervenantsDe({
          mediateurs: effectifDe(row.mediateurs),
          structures: effectifDe(row.structures),
          autresActeurs: effectifDe(row.autresActeurs),
        }),
      ),
    }
  }

  if (row.type === 'Evenement') {
    sansDonneeDe(row, [...COLONNES_D_ANIMATION, ...COLONNES_DE_PARTENARIAT])
    return {
      ...commun,
      _tag: 'Evenement',
      nom: nomDe(row.nom),
      typeDEvenement: choixDe(TypeDEvenement)(
        row.id,
        row.typeEvenement,
        row.typeEvenementAutre,
      ),
      organisateurs: choixMultiplesDeLaLigne(Organisateur)(
        row.id,
        row.organisateurs,
        row.organisateurAutre,
      ),
      echelon: echelonDe(row.echelonTerritorial),
      participants: Effectif(row.participants ?? -1),
    }
  }

  sansDonneeDe(row, [...COLONNES_D_ANIMATION, ...COLONNES_D_EVENEMENT])
  return {
    ...commun,
    _tag: 'Partenariat',
    nom: nomDe(row.nom),
    natures: choixMultiplesDeLaLigne(NatureDePartenariat)(
      row.id,
      row.naturePartenariat,
      row.naturePartenariatAutre,
    ),
    structuresPartenaires: structuresPartenairesDeLaLigne(row),
    echelon: echelonDe(row.echelonTerritorial),
  }
}

type Colonnes = Omit<
  ActiviteDeCoordinationRow,
  | 'id'
  | 'coordinateurId'
  | 'type'
  | 'date'
  | 'notes'
  | 'creation'
  | 'modification'
  | 'tags'
>

const AUCUNE_COLONNE: Colonnes = {
  duree: null,
  mediateurs: null,
  structures: null,
  autresActeurs: null,
  typeAnimation: null,
  typeAnimationAutre: null,
  initiative: null,
  thematiquesAnimation: [],
  thematiqueAnimationAutre: null,
  participants: null,
  typeEvenement: null,
  typeEvenementAutre: null,
  organisateurs: [],
  organisateurAutre: null,
  naturePartenariat: [],
  naturePartenariatAutre: null,
  structuresPartenaires: null,
  nom: null,
  echelonTerritorial: null,
}

const valeurDuChoix = <V extends string>(choix: Choix<V>): V | typeof AUTRE =>
  choix._tag === 'Autre' ? AUTRE : choix.valeur

const precisionDuChoix = <V>(choix: Choix<V>): Precision | null =>
  choix._tag === 'Autre' ? choix.precision : null

const valeursDesChoix = <V extends string>(
  choix: ChoixMultiples<V>,
): readonly (V | typeof AUTRE)[] => {
  const autre: readonly (typeof AUTRE)[] = choix.autre === null ? [] : [AUTRE]
  return [...choix.valeurs, ...autre]
}

const colonnesDe = (activite: ActiviteDeCoordination): Colonnes => {
  if (activite._tag === 'Animation') {
    return {
      ...AUCUNE_COLONNE,
      duree: activite.duree,
      mediateurs: activite.intervenants.mediateurs,
      structures: activite.intervenants.structures,
      autresActeurs: activite.intervenants.autresActeurs,
      typeAnimation: valeurDuChoix(activite.typeDAnimation),
      typeAnimationAutre: precisionDuChoix(activite.typeDAnimation),
      initiative: activite.initiative,
      thematiquesAnimation: [...valeursDesChoix(activite.thematiques)],
      thematiqueAnimationAutre: activite.thematiques.autre,
    }
  }
  if (activite._tag === 'Evenement') {
    return {
      ...AUCUNE_COLONNE,
      participants: activite.participants,
      typeEvenement: valeurDuChoix(activite.typeDEvenement),
      typeEvenementAutre: precisionDuChoix(activite.typeDEvenement),
      organisateurs: [...valeursDesChoix(activite.organisateurs)],
      organisateurAutre: activite.organisateurs.autre,
      nom: activite.nom,
      echelonTerritorial: activite.echelon,
    }
  }
  return {
    ...AUCUNE_COLONNE,
    naturePartenariat: [...valeursDesChoix(activite.natures)],
    naturePartenariatAutre: activite.natures.autre,
    structuresPartenaires: activite.structuresPartenaires.map(
      ({ nom, type }) => ({
        nom,
        type: valeurDuChoix(type),
        typeAutre: precisionDuChoix(type),
      }),
    ),
    nom: activite.nom,
    echelonTerritorial: activite.echelon,
  }
}

export const activiteDeCoordinationVersLaBase = (
  activite: ActiviteDeCoordination,
): ActiviteDeCoordinationRow => ({
  id: activite.id,
  coordinateurId: activite.coordinateurId,
  type: activite._tag,
  date: new Date(`${activite.date}T00:00:00.000Z`),
  notes: activite.notes,
  creation: activite.creation,
  modification: activite.modification,
  tags: activite.tags.map(({ id, nom }) => ({ tag: { id, nom } })),
  ...colonnesDe(activite),
})

export const filtreDesCoordinations = ({
  coordinateurId,
  criteres: { periode, types, tags },
}: {
  coordinateurId: CoordinateurId
  criteres: CriteresDesCoordinations
}): Prisma.ActiviteCoordinationWhereInput => ({
  coordinateurId,
  suppression: null,
  ...(types.length > 0 ? { type: { in: [...types] } } : {}),
  ...(tags.length > 0 ? { tags: { some: { tagId: { in: [...tags] } } } } : {}),
  ...(periode === null ? {} : { date: { gte: periode.du, lte: periode.au } }),
})
