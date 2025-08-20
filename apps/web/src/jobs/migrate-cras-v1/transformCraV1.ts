import {
  Prisma,
  StructureDeRedirection,
  TypeActivite,
  TypeLieu,
  Thematique,
  TrancheAge,
} from '@prisma/client'
import type { CraConseillerNumeriqueV1 } from '@prisma/client'
import { v4 } from 'uuid'
import { prismaClient } from '@app/web/prismaClient'
import { missingConseillerV1 } from '../migrate-users-v1/missingConseillerV1'

/**
 * How to transform tranches d'ages :
 *  Concernant l'âge si on n'a pas d'autres infos à recouper, je propose quelque chose de très basique :
 *  - ventiler la tranche d'âge V1 de 18-35 ans dans  les tranches d'âge V2 18-24 ans et 25-39 ans en respectant les proportions actuelles de ces deux dernières tranche d'âge.
 *  - Concrètement : à date, dans la Coop V2, il y a 95 248 accompagnements qui correspondent à la fusion des tranches de 18 à 39 ans. En proportion de ce nbre d'accompagnements total la tranche 18-24 ans représente 29% (28 022) et la tranche 25-39 ans représente 71% (67 266).
 *  - Il suffirait donc de distribuer le nbre d'accompagnement de la tranche d'âge V1 18-35 ans à 29% dans la tranche V2 18-24 ans et 71% dans la tranche V2 25-39 ans.
 *  - Idem pour la tranche V1 60 ans et + au sein des tranches V2 60-69 ans et 70 ans et +.
 */

// Local lightweight type matching the legacy age distribution notion
type AgeDistribution = {
  moins12ans: number
  de12a18ans: number
  de18a35ans: number
  de35a60ans: number
  plus60ans: number
}

export const transformCraV1 = async (
  cra: CraConseillerNumeriqueV1,
  context: {
    v1StructuresIdsMap: Map<
      string,
      {
        id: string
        codePostal?: string | null
        commune?: string | null
        codeInsee?: string | null
      }
    >
    v1PermanencesIdsMap: Map<
      string,
      {
        id: string
        codePostal?: string | null
        commune?: string | null
        codeInsee?: string | null
      }
    >
    v1ConseillersIdsMap: Map<string, { userId: string; mediateurId: string }>
  },
): Promise<Prisma.ActiviteCreateInput> => {
  const { v1StructuresIdsMap, v1PermanencesIdsMap, v1ConseillersIdsMap } =
    context

  const v1CraId = cra.id
  const v1ConseillerId = cra.v1ConseillerNumeriqueId
  const v1StructureId = cra.structureId ?? undefined
  const v1PermanenceId = cra.permanenceId ?? undefined

  const mediateurId = v1ConseillerId
    ? (v1ConseillersIdsMap.get(v1ConseillerId)?.mediateurId ??
      missingConseillerV1.mediateurId)
    : missingConseillerV1.mediateurId

  const structureEmployeuseId = mapRequiredV1IdToV2({
    v1Id: v1StructureId,
    map: v1StructuresIdsMap,
    field: 'structureEmployeuseId',
  })

  const type: TypeActivite = mapV1ActiviteToV2Type(cra.activite)

  const typeLieu: TypeLieu = mapV1CanalToV2TypeLieu(cra.canal)

  const { structureId, lieu } = await deriveLieuAndStructure({
    typeLieu,
    v1PermanenceId,
    v1StructureId,
    v1PermanencesIdsMap,
    v1StructuresIdsMap,
    cra,
    structureEmployeuseId,
  })

  const dureeMinutes = cra.dureeMinutes ?? parseDureeToMinutes(cra.duree)
  const thematiques = mapV1ThemesToV2Thematiques(cra.themes)

  const accompagnementsCount = computeAccompagnementsCount({
    type,
    nbParticipants: cra.nbParticipants,
  })

  const data: Prisma.ActiviteCreateInput = {
    id: v4(),
    type,
    mediateur: { connect: { id: mediateurId } },
    accompagnementsCount,
    date: new Date(cra.dateAccompagnement),
    duree: dureeMinutes,
    notes: mapNotesFromAnnotations(cra),
    rdvServicePublicId: undefined,
    structureEmployeuse: { connect: { id: structureEmployeuseId } },
    typeLieu,
    structure: structureId ? { connect: { id: structureId } } : undefined,
    lieuCodePostal: lieu?.codePostal,
    lieuCommune: lieu?.commune,
    lieuCodeInsee: lieu?.codeInsee,
    creation: new Date(cra.createdAt),
    modification: new Date(cra.createdAt),
    suppression: undefined,
    materiel: [],
    thematiques,
    structureDeRedirection: mapV1OrganismesToStructureDeRedirection(
      Array.isArray(cra.organismes)
        ? (cra.organismes as unknown as string[])
        : null,
    ),
    orienteVersStructure: undefined,
    precisionsDemarche: undefined,
    titreAtelier: undefined,
    niveau: undefined,
    tags: undefined,
    v1CraId,
    v1StructureId: v1StructureId ?? undefined,
    v1PermanenceId: v1PermanenceId ?? undefined,
  }

  return data
}

// Helpers: IDs and relations

const mapRequiredV1IdToV2 = ({
  v1Id,
  map,
  field,
}: {
  v1Id?: string
  map: Map<string, { id: string }>
  field: string
}): string => {
  const v2Id = v1Id ? map.get(v1Id)?.id : undefined
  if (!v2Id) {
    throw new Error(
      `Missing required mapping for ${field} (v1Id=${v1Id ?? 'null'})`,
    )
  }
  return v2Id
}

// Helpers: high-level mapping scaffolding
const mapV1ActiviteToV2Type = (activite: string): TypeActivite => {
  // TODO: refine rules. Default: 'individuel'|'collectif', map 'ponctuel' -> Individuel
  if (activite === 'collectif') return 'Collectif'
  return 'Individuel'
}

const mapV1CanalToV2TypeLieu = (canal: string): TypeLieu => {
  // TODO: refine mapping when specs are available
  if (canal === 'domicile') return 'Domicile'
  if (canal === 'distance') return 'ADistance'
  if (canal === 'autre lieu') return 'Autre'
  return 'LieuActivite'
}

const parseDureeToMinutes = (duree: string | number): number => {
  // TODO: support more formats; for now, if number assume minutes; if HH:MM, parse
  if (typeof duree === 'number') return Math.max(0, Math.floor(duree))
  const trimmed = duree.trim()
  const hhmm = /^([0-9]{1,2}):([0-9]{2})$/
  const match = trimmed.match(hhmm)
  if (match) {
    const hours = Number(match[1])
    const minutes = Number(match[2])
    if (!Number.isNaN(hours) && !Number.isNaN(minutes))
      return hours * 60 + minutes
  }
  const asNumber = Number(trimmed)
  if (!Number.isNaN(asNumber)) return Math.max(0, Math.floor(asNumber))
  return 0
}

const mapV1ThemesToV2Thematiques = (themes: string[]): Thematique[] => {
  const result: Set<Thematique> = new Set()

  for (const theme of themes) {
    const mapped = V1_THEME_TO_V2_THEMATIQUES[theme]
    if (mapped && mapped.length > 0) {
      for (const t of mapped) result.add(t)
    }
  }

  return Array.from(result)
}

const computeAccompagnementsCount = ({
  type,
  nbParticipants,
}: {
  type: TypeActivite
  nbParticipants: number
}): number => {
  if (type === 'Collectif') return nbParticipants
  return 1
}

const mapNotesFromAnnotations = (
  cra: CraConseillerNumeriqueV1,
): string | undefined => {
  return cra.annotation ?? undefined
}

const deriveLieuAndStructure = async ({
  typeLieu,
  v1PermanenceId,
  v1StructureId,
  v1PermanencesIdsMap,
  v1StructuresIdsMap,
  cra,
  structureEmployeuseId,
}: {
  typeLieu: TypeLieu
  v1PermanenceId?: string
  v1StructureId?: string
  v1PermanencesIdsMap: Map<
    string,
    {
      id: string
      codePostal?: string | null
      commune?: string | null
      codeInsee?: string | null
    }
  >
  v1StructuresIdsMap: Map<
    string,
    {
      id: string
      codePostal?: string | null
      commune?: string | null
      codeInsee?: string | null
    }
  >
  cra: CraConseillerNumeriqueV1
  structureEmployeuseId: string
}): Promise<{
  structureId?: string
  lieu?: { codePostal?: string; commune?: string; codeInsee?: string }
}> => {
  if (typeLieu === 'LieuActivite') {
    // Prefer permanence mapping when present, fallback to structure mapping
    const fromPerm = v1PermanenceId
      ? v1PermanencesIdsMap.get(v1PermanenceId)
      : undefined
    const fromStruct =
      !fromPerm && v1StructureId
        ? v1StructuresIdsMap.get(v1StructureId)
        : undefined
    const chosen = fromPerm ?? fromStruct
    return { structureId: chosen?.id }
  }

  if (typeLieu === 'ADistance') {
    // Assign to the commune of the structure employeuse
    const se = await prismaClient.structure.findUnique({
      where: { id: structureEmployeuseId },
      select: { codePostal: true, commune: true, codeInsee: true },
    })
    return {
      lieu: {
        codePostal: se?.codePostal,
        commune: se?.commune,
        codeInsee: se?.codeInsee ?? undefined,
      },
    }
  }

  // Domicile or Autre -> use provided CRA location fields
  return {
    lieu: {
      codePostal: cra.codePostal,
      commune: cra.nomCommune,
      codeInsee: cra.codeCommune,
    },
  }
}

// --- Mapping dictionaries (from specs) ---
const V1_THEME_TO_V2_THEMATIQUES: Record<string, Thematique[]> = {
  diagnostic: ['DiagnosticNumerique'],
  'equipement informatique': [
    'PrendreEnMainDuMateriel',
    'GereSesContenusNumeriques',
  ],
  internet: ['NavigationSurInternet'],
  courriel: ['Email'],
  'traitement texte': ['Bureautique'],
  'contenus numeriques': ['CreerAvecLeNumerique'],
  echanger: ['ReseauxSociaux'],
  sante: ['Sante'],
  scolaire: ['ScolariteEtNumerique'],
  'accompagner enfant': ['Parentalite'],
  'trouver emploi': ['InsertionProfessionnelle'],
  budget: ['BanqueEtAchatsEnLigne'],
  'tpe/pme': ['Entrepreneuriat'],
  'fraude et harcelement': ['SecuriteNumerique'],
  securite: ['SecuriteNumerique'],
  smartphone: ['PrendreEnMainDuMateriel'],
  'demarche en ligne': ['AideAuxDemarchesAdministratives'],
  vocabulaire: ['CultureNumerique'],
  autre: [],
}

// --- Age distribution mapping scaffolding ---
export type AgeSplitProportions = {
  eighteenToThirtyFiveToEighteenToTwentyFour: number // 0..1
  sixtyPlusToSixtyToSixtyNine: number // 0..1
}

export const defaultAgeSplitProportions: AgeSplitProportions = {
  // based on proportions on v2 tranches d'ages sur les bénéficiaires
  eighteenToThirtyFiveToEighteenToTwentyFour: 0.2915, // 29% to 18-24, 71% to 25-39
  sixtyPlusToSixtyToSixtyNine: 0.4805, // 48% to 60-69, 52% to 70+
}

export const splitAgeDistribution = (
  age: AgeDistribution,
  proportions: AgeSplitProportions,
): Partial<Record<TrancheAge, number>> => {
  const result: Partial<Record<TrancheAge, number>> = {}

  const add = (bucket: TrancheAge, count: number) => {
    result[bucket] = (result[bucket] ?? 0) + count
  }

  add('MoinsDeDouze', age.moins12ans)
  add('DouzeDixHuit', age.de12a18ans) // note: v2 is 12-17; adjustment can be applied later if needed

  // Split 18-35 -> 18-24 and 25-39 using random assignment with proportion
  for (let i = 0; i < age.de18a35ans; i++) {
    const r = Math.random()
    if (r < proportions.eighteenToThirtyFiveToEighteenToTwentyFour) {
      add('DixHuitVingtQuatre', 1)
    } else {
      add('VingtCinqTrenteNeuf', 1)
    }
  }

  add('QuaranteCinquanteNeuf', age.de35a60ans)

  // Split 60+ -> 60-69 and 70+
  for (let i = 0; i < age.plus60ans; i++) {
    const r = Math.random()
    if (r < proportions.sixtyPlusToSixtyToSixtyNine) {
      add('SoixanteSoixanteNeuf', 1)
    } else {
      add('SoixanteDixPlus', 1)
    }
  }

  return result
}

// --- Structure de redirection mapping scaffolding ---
export const mapV1OrganismesToStructureDeRedirection = (
  organismes: string[] | null | undefined,
): StructureDeRedirection | undefined => {
  if (!organismes || organismes.length === 0) return undefined
  const normalized = organismes.map((o) => o.trim().toLowerCase())

  if (
    normalized.some((o) =>
      ['cnav', 'carsat', 'ants', 'caf', 'dgfip', 'cefs'].includes(o),
    )
  ) {
    return 'OperateurOuOrganismeEnCharge'
  }
  if (normalized.some((o) => /p[ôo]le emploi|france travail/.test(o))) {
    return 'InsertionProfessionnelle'
  }
  if (normalized.some((o) => /france services/.test(o))) {
    return 'AideAuxDemarchesAdministratives'
  }
  if (normalized.some((o) => /ccas|solidarit|centre social/.test(o))) {
    return 'AideSociale'
  }
  if (normalized.some((o) => /tiers-lieu|fablab|m[ée]diation num/.test(o))) {
    return 'MediationNumerique'
  }
  if (normalized.some((o) => /mairie|pr[ée]fecture|d[ée]partement/.test(o))) {
    return 'Administration'
  }
  return 'Autre'
}
