import type { Prisma } from '@app/web/generated/prisma/client'
import type { Model } from '@app/web/libraries/model'
import type { z } from 'zod'
import {
  type ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  type Choix,
  type CoordinateurId,
  type CriteresDesCoordinations,
  DureeEnMinutes,
  EchelonTerritorial,
  Effectif,
  Initiative,
  NatureDePartenariat,
  NomDeLActivite,
  NomDeStructure,
  NomDeTag,
  Notes,
  Organisateur,
  Precision,
  type StructurePartenaire,
  TagId,
  ThematiqueDAnimation,
  TypeDAnimation,
  TypeDEvenement,
  TypeDeStructurePartenaire,
} from '../domain'

export const activiteDeCoordinationSelect = {
  id: true,
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

const AUTRE = 'Autre'

const lire = <S extends z.ZodType>(
  modele: Model<S>,
  valeur: unknown,
): z.output<S> | null => {
  const lue = modele.schema.safeParse(valeur)
  return lue.success ? lue.data : null
}

const choixDe =
  <S extends z.ZodType>(modele: Model<S>) =>
  (
    valeur: string | null,
    precision: string | null,
  ): Choix<z.output<S>> | null => {
    if (valeur === null) return null
    if (valeur === AUTRE)
      return { _tag: 'Autre', precision: Precision.safe(precision ?? '') }
    const lue = lire(modele, valeur)
    return lue === null ? null : { _tag: 'Liste', valeur: lue }
  }

const choixMultiplesDe =
  <S extends z.ZodType>(modele: Model<S>) =>
  (valeurs: readonly string[], precision: string | null) =>
    valeurs.flatMap((valeur) => {
      const choix = choixDe(modele)(valeur, precision)
      return choix === null ? [] : [choix]
    })

const effectifDe = (valeur: number | null): Effectif | null =>
  valeur === null ? null : Effectif.safe(valeur)

const structuresPartenairesDe = (
  json: Prisma.JsonValue | null,
): readonly StructurePartenaire[] =>
  (Array.isArray(json) ? json : []).flatMap((structure) => {
    if (typeof structure !== 'object' || structure === null) return []
    if (Array.isArray(structure)) return []
    const nom = NomDeStructure.safe(String(structure.nom ?? ''))
    if (nom === null) return []
    return [
      {
        nom,
        type: lire(TypeDeStructurePartenaire, structure.type),
      },
    ]
  })

export const activiteDeCoordinationDe = (
  row: ActiviteDeCoordinationRow,
): ActiviteDeCoordination => {
  const commun = {
    id: ActiviteDeCoordinationId(row.id),
    date: row.date,
    duree: row.duree === null ? null : DureeEnMinutes.safe(row.duree),
    tags: row.tags.flatMap(({ tag }) => {
      const nom = NomDeTag.safe(tag.nom)
      return nom === null ? [] : [{ id: TagId(tag.id), nom }]
    }),
    notes: Notes.safe(row.notes ?? ''),
    creation: row.creation,
    modification: row.modification,
  }
  const nom = NomDeLActivite.safe(row.nom ?? '')
  const echelon =
    row.echelonTerritorial === null
      ? null
      : EchelonTerritorial.safe(row.echelonTerritorial)

  if (row.type === 'Animation')
    return {
      ...commun,
      _tag: 'Animation',
      typeDAnimation: choixDe(TypeDAnimation)(
        row.typeAnimation,
        row.typeAnimationAutre,
      ),
      thematiques: choixMultiplesDe(ThematiqueDAnimation)(
        row.thematiquesAnimation,
        row.thematiqueAnimationAutre,
      ),
      initiative:
        row.initiative === null ? null : Initiative.safe(row.initiative),
      intervenants: {
        mediateurs: effectifDe(row.mediateurs),
        structures: effectifDe(row.structures),
        autresActeurs: effectifDe(row.autresActeurs),
      },
    }

  if (row.type === 'Evenement')
    return {
      ...commun,
      _tag: 'Evenement',
      nom,
      typeDEvenement: choixDe(TypeDEvenement)(
        row.typeEvenement,
        row.typeEvenementAutre,
      ),
      organisateurs: choixMultiplesDe(Organisateur)(
        row.organisateurs,
        row.organisateurAutre,
      ),
      echelon,
      participants: effectifDe(row.participants),
    }

  return {
    ...commun,
    _tag: 'Partenariat',
    nom,
    natures: choixMultiplesDe(NatureDePartenariat)(
      row.naturePartenariat,
      row.naturePartenariatAutre,
    ),
    structuresPartenaires: structuresPartenairesDe(row.structuresPartenaires),
    echelon,
  }
}

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
