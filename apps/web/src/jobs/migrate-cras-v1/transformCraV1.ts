import type { CraConseillerNumeriqueV1 } from '@prisma/client'
import {
  Prisma,
  StructureDeRedirection,
  Thematique,
  TrancheAge,
  TypeActivite,
  TypeLieu,
} from '@prisma/client'
import { v4 } from 'uuid'
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

export type TransformCraV1Output = {
  activite: Prisma.ActiviteUncheckedCreateInput & {
    id: string
    v1CraId: string
  }
  beneficiaires: Array<
    Prisma.BeneficiaireUncheckedCreateInput & {
      id: string
      mediateurId: string
    }
  >
  accompagnements: Array<
    Prisma.AccompagnementUncheckedCreateInput & {
      id: string
    }
  >
}

export type TransformCraV1Context = {
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
}

export const transformCraV1 = (
  craV1: CraConseillerNumeriqueV1,
  context: TransformCraV1Context,
): TransformCraV1Output => {
  const { v1StructuresIdsMap, v1PermanencesIdsMap, v1ConseillersIdsMap } =
    context

  const v1CraId = craV1.id
  const v1ConseillerId = craV1.v1ConseillerNumeriqueId
  const v1StructureId = craV1.structureId ?? undefined
  const v1PermanenceId = craV1.permanenceId ?? undefined

  const mediateurId =
    v1ConseillersIdsMap.get(v1ConseillerId)?.mediateurId ??
    missingConseillerV1.mediateurId

  const structureEmployeuseId = mapRequiredV1IdToV2({
    v1Id: v1StructureId,
    idsMap: v1StructuresIdsMap,
    field: 'structureEmployeuseId',
  })

  const type: TypeActivite = mapV1ActiviteToV2Type(craV1.activite)

  const typeLieu: TypeLieu = mapV1CanalToV2TypeLieu(craV1.canal)

  const { structureId, lieu } = deriveLieuAndStructure({
    typeLieu,
    v1PermanenceId,
    v1StructureId,
    v1PermanencesIdsMap,
    v1StructuresIdsMap,
    craV1,
  })

  const dureeMinutes = craV1.dureeMinutes
  const thematiques = mapV1ThemesToV2Thematiques(craV1.themes)

  const accompagnementsCount = computeAccompagnementsCount({
    type,
    nbParticipants: craV1.nbParticipants,
  })

  const activite: Prisma.ActiviteUncheckedCreateInput & {
    id: string
    v1CraId: string
  } = {
    id: v4(),
    type,
    mediateurId,
    accompagnementsCount,
    date: new Date(craV1.dateAccompagnement),
    duree: dureeMinutes,
    notes: mapNotesFromAnnotations(craV1),
    rdvServicePublicId: undefined,
    structureEmployeuseId,
    typeLieu,
    structureId,
    lieuCodePostal: lieu?.codePostal,
    lieuCommune: lieu?.commune,
    lieuCodeInsee: lieu?.codeInsee,
    creation: new Date(craV1.createdAt),
    modification: new Date(craV1.createdAt),
    suppression: undefined,
    materiel: [],
    thematiques,
    structureDeRedirection: mapV1OrganismesToStructureDeRedirection(
      craV1.organismes,
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

  // --- Build anonymous beneficiaires and accompagnements ---
  const totalParticipants = type === 'Collectif' ? craV1.nbParticipants : 1
  const recurringParticipants = Math.min(
    craV1.nbParticipantsRecurrents ?? 0,
    totalParticipants,
  )

  const age: AgeDistribution = {
    moins12ans: craV1.ageMoins12Ans ?? 0,
    de12a18ans: craV1.ageDe12a18Ans ?? 0,
    de18a35ans: craV1.ageDe18a35Ans ?? 0,
    de35a60ans: craV1.ageDe35a60Ans ?? 0,
    plus60ans: craV1.agePlus60Ans ?? 0,
  }

  const trancheAgeCounts = splitAgeDistribution(age, defaultAgeSplitProportions)
  const trancheAgeAssignments: (TrancheAge | undefined)[] = []
  for (const key of Object.keys(trancheAgeCounts) as TrancheAge[]) {
    const count = trancheAgeCounts[key] ?? 0
    for (let index = 0; index < count; index++) trancheAgeAssignments.push(key)
  }
  // Normalize to exactly totalParticipants length
  if (trancheAgeAssignments.length < totalParticipants) {
    while (trancheAgeAssignments.length < totalParticipants)
      trancheAgeAssignments.push(undefined)
  } else if (trancheAgeAssignments.length > totalParticipants) {
    trancheAgeAssignments.length = totalParticipants
  }

  const beneficiaires: (Prisma.BeneficiaireUncheckedCreateInput & {
    id: string
  })[] = trancheAgeAssignments.map((assignedTranche) => ({
    id: v4(),
    mediateurId,
    anonyme: true,
    trancheAge: assignedTranche,
  }))

  const accompagnements: (Prisma.AccompagnementUncheckedCreateInput & {
    id: string
  })[] = beneficiaires.map((beneficiaire, index) => ({
    id: v4(),
    beneficiaireId: beneficiaire.id,
    activiteId: activite.id,
    premierAccompagnement: index >= recurringParticipants,
  }))

  return { activite, beneficiaires, accompagnements }
}

// Helpers: IDs and relations

const mapRequiredV1IdToV2 = ({
  v1Id,
  idsMap,
  field,
}: {
  v1Id?: string
  idsMap: Map<string, { id: string }>
  field: string
}): string => {
  const v2Id = v1Id ? idsMap.get(v1Id)?.id : undefined
  if (!v2Id) {
    throw new Error(
      `Missing required mapping for ${field} (v1Id=${v1Id ?? 'null'})`,
    )
  }
  return v2Id
}

const mapV1ActiviteToV2Type = (activite: string): TypeActivite => {
  // 'individuel'|'collectif', map 'ponctuel' -> Individuel
  if (activite === 'collectif') return 'Collectif'
  return 'Individuel'
}

const mapV1CanalToV2TypeLieu = (canal: string): TypeLieu => {
  if (canal === 'domicile') return 'Domicile'
  if (canal === 'distance') return 'ADistance'
  if (canal === 'autre lieu') return 'Autre'
  return 'LieuActivite'
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
  return cra.annotation?.trim() || undefined
}

const deriveLieuAndStructure = ({
  typeLieu,
  v1PermanenceId,
  v1StructureId,
  v1PermanencesIdsMap,
  v1StructuresIdsMap,
  craV1,
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
  craV1: CraConseillerNumeriqueV1
}): {
  structureId?: string
  lieu?: { codePostal?: string; commune?: string; codeInsee?: string }
} => {
  if (typeLieu === 'LieuActivite') {
    // Prefer permanence mapping when present, fallback to structure mapping
    const fromPermanence = v1PermanenceId
      ? v1PermanencesIdsMap.get(v1PermanenceId)
      : undefined
    const fromStructure =
      !fromPermanence && v1StructureId
        ? v1StructuresIdsMap.get(v1StructureId)
        : undefined
    const chosen = fromPermanence ?? fromStructure
    return { structureId: chosen?.id }
  }

  if (typeLieu === 'ADistance') {
    // Assign to the commune of the structure employeuse using provided map
    const structureEmployeuse = v1StructureId
      ? v1StructuresIdsMap.get(v1StructureId)
      : undefined
    return {
      lieu: {
        codePostal: structureEmployeuse?.codePostal ?? undefined,
        commune: structureEmployeuse?.commune ?? undefined,
        codeInsee: structureEmployeuse?.codeInsee ?? undefined,
      },
    }
  }

  // Domicile or Autre -> use provided CRA location fields
  return {
    lieu: {
      codePostal: craV1.codePostal,
      commune: craV1.nomCommune,
      codeInsee: craV1.codeCommune,
    },
  }
}

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
  for (let index = 0; index < age.de18a35ans; index++) {
    const randomValue = Math.random()
    if (randomValue < proportions.eighteenToThirtyFiveToEighteenToTwentyFour) {
      add('DixHuitVingtQuatre', 1)
    } else {
      add('VingtCinqTrenteNeuf', 1)
    }
  }

  add('QuaranteCinquanteNeuf', age.de35a60ans)

  // Split 60+ -> 60-69 and 70+
  for (let index = 0; index < age.plus60ans; index++) {
    const randomValue = Math.random()
    if (randomValue < proportions.sixtyPlusToSixtyToSixtyNine) {
      add('SoixanteSoixanteNeuf', 1)
    } else {
      add('SoixanteDixPlus', 1)
    }
  }

  return result
}

const extractAndNormalizeOrganismes = (organismes: unknown): string[] => {
  if (!organismes) return []

  // Test if object has keys, else return empty array
  if (typeof organismes !== 'object' || organismes === null) return []
  if (Object.keys(organismes as Record<string, unknown>).length === 0) return []

  // Exctract keys and sort by values DESC
  const entries = Object.entries(organismes as Record<string, number>).sort(
    (a, b) => {
      const va = a[1]
      const vb = b[1]
      if (typeof va === 'number' && typeof vb === 'number') return vb - va
      return 0
    },
  )
  return entries
    .map(([k]) =>
      k
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '') // strip diacritics
        .replace(/\s+/g, ' '),
    )
    .filter((k) => k.length > 0)
}

// --- Structure de redirection
export const mapV1OrganismesToStructureDeRedirection = (
  organismes: unknown,
): StructureDeRedirection | undefined => {
  const keys = extractAndNormalizeOrganismes(organismes)
  if (keys.length === 0) return undefined

  // V1 -> V2 mapping rules helper functions (order matters)
  const matches = (re: RegExp) => keys.some((o) => re.test(o))
  const matchesAny = (vals: string[]) => keys.some((o) => vals.includes(o))

  // Operateurs ou organismes en charge de la demarche
  if (
    matchesAny(['cnav', 'carsat', 'ants', 'caf', 'dgfip', 'cefs']) ||
    matches(/\bcpam\b|\bameli\b|assurance maladie/) ||
    matches(
      /assurance retraite|cnav|carsat|msa|urssaf|pension|retraite reunion/,
    ) ||
    matches(/ofii/) // Office français de l'immigration et de l'intégration
  ) {
    return 'OperateurOuOrganismeEnCharge'
  }

  // Insertion professionnelle (Pôle emploi / France Travail / Mission locale...)
  if (
    matches(
      /p[ôo]le emploi|france travail|mission locale|\bcci\b|chambre de commerce/,
    )
  ) {
    return 'InsertionProfessionnelle'
  }

  // Aide aux démarches administratives (France Services...)
  if (matches(/france services|maison de services au public|mdsp/)) {
    return 'AideAuxDemarchesAdministratives'
  }

  // Aide sociale (CCAS, maisons des solidarités, centre social...)
  if (
    matches(/\bccas\b|solidarit|centre social|maison des solidarit|\bmjc\b/)
  ) {
    return 'AideSociale'
  }

  // Autre structure de médiation numérique (tiers-lieu, fablab, réseaux médiation)
  if (
    matches(
      /tiers[- ]?lieu|fablab|mediati?on num|emmaus connect|emmausconnect|transnumeric|atelier informatique|cours d'informatique/,
    )
  ) {
    return 'MediationNumerique'
  }

  // Administration (mairie, préfecture, département)
  if (matches(/mairie|pr[ee]fecture|departement|conseil departemental/)) {
    return 'Administration'
  }

  return undefined
}
