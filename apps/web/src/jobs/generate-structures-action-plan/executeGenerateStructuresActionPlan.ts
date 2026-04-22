import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import type { GenerateStructuresActionPlanJob } from './generateStructuresActionPlanJob'

// ── Types ──

type Action =
  | 'supprimer'
  | 'fusionner_auto'
  | 'fusionner_probable'
  | 'fusionner_a_verifier'
  | 'vider_siret'
  | 'corriger_adresse'
  | 'corriger_coordonnees'
  | 'verifier_siret'
  | 'verification_manuelle'

type ActionPlanRow = {
  id: string
  action: Action
  cibleFusion: string
  clusterId: string
  priorite: number
  raison: string
  nom: string
  adresse: string
  commune: string
  codePostal: string
  siret: string
  visibleCarto: boolean
  activitesCount: number
  emploisCount: number
  mediateursCount: number
}

type StructureData = {
  id: string
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string | null
  siret: string | null
  telephone: string | null
  latitude: number | null
  longitude: number | null
  visiblePourCartographieNationale: boolean
  activitesCount: number
  emploisCount: number
  mediateursCount: number
}

// ── Normalisation et similarité (réutilisés de detect-duplicate-structures) ──

const stripDiacritics = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const baseNormalize = (s: string) =>
  stripDiacritics(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const NOM_PREFIXES_TO_STRIP = [
  /^commune de\s+/,
  /^com de\s+/,
  /^mairie de\s+/,
  /^ville de\s+/,
  /^conseil departemental de(?:s)?\s+/,
  /^conseil departemental du\s+/,
  /^conseil departemental de l\s*/,
  /^departement de(?:s)?\s+/,
  /^departement du\s+/,
  /^departement de l\s*/,
  /^communaute de communes?\s+/,
  /^communaute d agglomeration\s+/,
  /^communaute com\s+/,
  /^conseil regional de\s+/,
  /^region\s+/,
]

const NOM_ABBREVIATIONS: [RegExp, string][] = [
  [/\bst\b/g, 'saint'],
  [/\bste\b/g, 'sainte'],
  [/\basse?\b/g, 'association'],
  [/\bassoc\b/g, 'association'],
  [/\bfed\b/g, 'federation'],
  [/\bfeder\b/g, 'federation'],
  [/\bdepart\b/g, 'departementale'],
  [/\bamic\b/g, 'amicale'],
  [/\bmdf\b/g, 'maison de la famille'],
]

const normalizeNom = (s: string): string => {
  let n = baseNormalize(s)
  for (const prefix of NOM_PREFIXES_TO_STRIP) n = n.replace(prefix, '')
  for (const [pattern, replacement] of NOM_ABBREVIATIONS)
    n = n.replace(pattern, replacement)
  return n
    .replace(/\b(de|du|des|le|la|les|l|d|et|en)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const ADRESSE_ABBREVIATIONS: [RegExp, string][] = [
  [/\bav\b/g, 'avenue'],
  [/\bbd\b/g, 'boulevard'],
  [/\bblvd\b/g, 'boulevard'],
  [/\bpl\b/g, 'place'],
  [/\bimp\b/g, 'impasse'],
  [/\bche\b/g, 'chemin'],
  [/\bsq\b/g, 'square'],
  [/\brte\b/g, 'route'],
  [/\bres\b/g, 'residence'],
  [/\b(\d+)bis\b/g, '$1'],
  [/\b(\d+)ter\b/g, '$1'],
  [/\b(\d+)b\b/g, '$1'],
]

const normalizeAdresse = (s: string): string => {
  let n = baseNormalize(s)
  for (const [pattern, replacement] of ADRESSE_ABBREVIATIONS)
    n = n.replace(pattern, replacement)
  return n
    .replace(/\b(de|du|des|le|la|les|l|d)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const bigrams = (s: string) => {
  const set = new Map<string, number>()
  for (let i = 0; i < s.length - 1; i++) {
    const bg = s.slice(i, i + 2)
    set.set(bg, (set.get(bg) ?? 0) + 1)
  }
  return set
}

const diceSimilarity = (a: string, b: string): number => {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0
  const ba = bigrams(a)
  const bb = bigrams(b)
  let inter = 0
  for (const [bg, c] of ba) inter += Math.min(c, bb.get(bg) ?? 0)
  return (2 * inter) / (a.length - 1 + b.length - 1)
}

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6_371_000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const normalizeTelephone = (tel: string | null): string => {
  if (!tel) return ''
  return tel.replace(/[\s.+\-()]/g, '').replace(/^0033/, '0')
}

// ── Scoring de doublons ──

const POIDS_NOM = 0.35
const POIDS_ADRESSE = 0.25
const POIDS_GEO = 0.2
const POIDS_SIRET = 0.15
const POIDS_TELEPHONE = 0.05

const computePairScore = (
  a: StructureData & { nomNorm: string; adrNorm: string },
  b: StructureData & { nomNorm: string; adrNorm: string },
) => {
  const sNom = diceSimilarity(a.nomNorm, b.nomNorm)
  const sAdresse = diceSimilarity(a.adrNorm, b.adrNorm)

  let sGeo = 0
  if (
    a.latitude != null &&
    a.longitude != null &&
    b.latitude != null &&
    b.longitude != null
  ) {
    const dist = haversineDistance(
      a.latitude,
      a.longitude,
      b.latitude,
      b.longitude,
    )
    if (dist < 50) sGeo = 1
    else if (dist <= 500) sGeo = 1 - (dist - 50) / 450
  }

  const sSiret =
    a.siret && b.siret && a.siret === b.siret ? 1 : 0

  const tA = normalizeTelephone(a.telephone)
  const tB = normalizeTelephone(b.telephone)
  const sTel = tA && tB && tA === tB ? 1 : 0

  const total =
    sNom * POIDS_NOM +
    sAdresse * POIDS_ADRESSE +
    sGeo * POIDS_GEO +
    sSiret * POIDS_SIRET +
    sTel * POIDS_TELEPHONE

  const isSameLieu = sGeo >= 0.7 || sAdresse >= 0.85

  return { total, sNom, sAdresse, sGeo, isSameLieu }
}

// ── Union-Find ──

class UnionFind {
  private parent = new Map<string, string>()

  find(id: string): string {
    if (!this.parent.has(id)) this.parent.set(id, id)
    let root = id
    while (this.parent.get(root) !== root) root = this.parent.get(root) as string
    let current = id
    while (current !== root) {
      const next = this.parent.get(current) as string
      this.parent.set(current, root)
      current = next
    }
    return root
  }

  union(a: string, b: string) {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra !== rb) this.parent.set(ra, rb)
  }
}

// ── Lecture des CSV d'audit ──

const parseCsv = (
  content: string,
  separator = ';',
): string[][] => {
  const lines = content.split('\n').filter((l) => l.trim())
  return lines.map((line) => {
    // Strip trailing \r
    const cleanLine = line.replace(/\r$/, '')
    const fields: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of cleanLine) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === separator && !inQuotes) {
        fields.push(current)
        current = ''
      } else {
        current += char
      }
    }
    fields.push(current)
    return fields
  })
}

const readAuditCsvFile = async (
  filename: string,
  separator = ';',
): Promise<{ header: string[]; rows: string[][] } | null> => {
  const filePath = getAuditOutputPath(filename)
  if (!existsSync(filePath)) return null
  const content = await readFile(filePath, 'utf-8')
  const [header, ...rows] = parseCsv(content, separator)
  return { header, rows }
}

const readCwdCsvFile = async (
  filename: string,
  separator = ',',
): Promise<{ header: string[]; rows: string[][] } | null> => {
  const filePath = join(process.cwd(), filename)
  if (!existsSync(filePath)) return null
  const content = await readFile(filePath, 'utf-8')
  const [header, ...rows] = parseCsv(content, separator)
  return { header, rows }
}

// ── Score de qualité d'une structure (pour choisir la cible de fusion) ──

const structureQualityScore = (s: StructureData): number =>
  (s.visiblePourCartographieNationale ? 10_000 : 0) +
  s.activitesCount * 10 +
  s.emploisCount * 100 +
  s.mediateursCount * 50

// ── CSV ──

const escapeCsvField = (value: string) =>
  value.includes(';') || value.includes('"') || value.includes('\n')
    ? `"${value.replace(/"/g, '""')}"`
    : value

const actionPlanCsvHeader = [
  'id',
  'action',
  'cible_fusion',
  'cluster_id',
  'priorite',
  'raison',
  'nom',
  'adresse',
  'commune',
  'code_postal',
  'siret',
  'visible_carto',
  'activites_count',
  'emplois_count',
  'mediateurs_count',
].join(';')

const rowToCsv = (r: ActionPlanRow): string =>
  [
    r.id,
    r.action,
    r.cibleFusion,
    r.clusterId,
    r.priorite,
    escapeCsvField(r.raison),
    escapeCsvField(r.nom),
    escapeCsvField(r.adresse),
    escapeCsvField(r.commune),
    r.codePostal,
    r.siret,
    r.visibleCarto ? 'oui' : 'non',
    r.activitesCount,
    r.emploisCount,
    r.mediateursCount,
  ].join(';')

// ── Job ──

export const executeGenerateStructuresActionPlan = async (
  job: GenerateStructuresActionPlanJob,
) => {
  const seuilScore = job.payload?.seuilScoreDoublon ?? 0.6

  output.log('generate-structures-action-plan: starting...')

  // ── 1. Charger toutes les structures ──

  const allStructures = await prismaClient.structure.findMany({
    where: { suppression: null },
    select: {
      id: true,
      nom: true,
      adresse: true,
      commune: true,
      codePostal: true,
      codeInsee: true,
      siret: true,
      telephone: true,
      latitude: true,
      longitude: true,
      visiblePourCartographieNationale: true,
      activitesCount: true,
      _count: {
        select: {
          emplois: true,
          mediateursEnActivite: true,
        },
      },
    },
  })

  const structuresById = new Map<string, StructureData>()
  for (const s of allStructures) {
    structuresById.set(s.id, {
      id: s.id,
      nom: s.nom,
      adresse: s.adresse,
      commune: s.commune,
      codePostal: s.codePostal,
      codeInsee: s.codeInsee,
      siret: s.siret,
      telephone: s.telephone,
      latitude: s.latitude,
      longitude: s.longitude,
      visiblePourCartographieNationale: s.visiblePourCartographieNationale,
      activitesCount: s.activitesCount,
      emploisCount: s._count.emplois,
      mediateursCount: s._count.mediateursEnActivite,
    })
  }

  output.log(
    `generate-structures-action-plan: ${structuresById.size} structures chargées`,
  )

  // ── 2. Détection des orphelines ──

  const orphelines = new Set<string>()
  for (const s of structuresById.values()) {
    if (
      s.activitesCount === 0 &&
      s.emploisCount === 0 &&
      s.mediateursCount === 0
    ) {
      orphelines.add(s.id)
    }
  }

  output.log(
    `generate-structures-action-plan: ${orphelines.size} structures orphelines`,
  )

  // ── 3. Détection des doublons (même logique que detect-duplicate-structures) ──

  type StructureNorm = StructureData & { nomNorm: string; adrNorm: string }

  const normById = new Map<string, StructureNorm>()
  const withNorm: StructureNorm[] = []

  for (const s of structuresById.values()) {
    if (!s.codeInsee) continue
    const sn: StructureNorm = {
      ...s,
      nomNorm: normalizeNom(s.nom),
      adrNorm: normalizeAdresse(s.adresse),
    }
    withNorm.push(sn)
    normById.set(s.id, sn)
  }

  const parCodeInsee = new Map<string, StructureNorm[]>()
  for (const s of withNorm) {
    const ci = s.codeInsee as string
    const group = parCodeInsee.get(ci)
    if (group) group.push(s)
    else parCodeInsee.set(ci, [s])
  }

  // Union-Find pour les clusters
  const uf = new UnionFind()
  // Union-Find pour les lieux physiques au sein des clusters
  const ufLieu = new UnionFind()

  type PairInfo = { idA: string; idB: string; score: number; isSameLieu: boolean }
  const paires: PairInfo[] = []

  for (const [, group] of parCodeInsee) {
    if (group.length < 2) continue
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const result = computePairScore(group[i], group[j])
        if (result.total >= seuilScore) {
          uf.union(group[i].id, group[j].id)
          paires.push({
            idA: group[i].id,
            idB: group[j].id,
            score: result.total,
            isSameLieu: result.isSameLieu,
          })
          if (result.isSameLieu) {
            ufLieu.union(group[i].id, group[j].id)
          }
        }
      }
    }
  }

  // Construire les clusters
  type ClusterType = 'doublon_certain' | 'multi_site' | 'mixte'
  type Cluster = {
    id: string
    ids: Set<string>
    type: ClusterType
    targetId: string
  }

  const clusterMap = new Map<string, { ids: Set<string> }>()
  for (const p of paires) {
    const root = uf.find(p.idA)
    let cluster = clusterMap.get(root)
    if (!cluster) {
      cluster = { ids: new Set() }
      clusterMap.set(root, cluster)
    }
    cluster.ids.add(p.idA)
    cluster.ids.add(p.idB)
  }

  const clusters: Cluster[] = []
  let clusterIdx = 0

  for (const [, raw] of clusterMap) {
    clusterIdx++

    // Classifier le cluster
    const lieux = new Set<string>()
    for (const id of raw.ids) lieux.add(ufLieu.find(id))

    let type: ClusterType
    if (lieux.size === 1) type = 'doublon_certain'
    else if (lieux.size === raw.ids.size) type = 'multi_site'
    else type = 'mixte'

    // Choisir la cible (meilleur score de qualité)
    let bestId = ''
    let bestScore = -1
    for (const id of raw.ids) {
      const s = structuresById.get(id)
      if (!s) continue
      const score = structureQualityScore(s)
      if (score > bestScore) {
        bestScore = score
        bestId = id
      }
    }

    clusters.push({
      id: `C${clusterIdx}`,
      ids: raw.ids,
      type,
      targetId: bestId,
    })
  }

  output.log(
    `generate-structures-action-plan: ${clusters.length} clusters détectés`,
  )

  // ── 4. Charger les résultats d'audit SIRET (si disponible) ──

  const siretIssues = new Map<
    string,
    { categorie: string; erreur: string }
  >()

  const siretCsv = await readAuditCsvFile('audit-siret-divergences.csv')
  if (siretCsv) {
    for (const row of siretCsv.rows) {
      // id=0, siret=1, categorie=2, ..., erreur=18
      if (row.length >= 3) {
        siretIssues.set(row[0], {
          categorie: row[2],
          erreur: row[18] ?? '',
        })
      }
    }
    output.log(
      `generate-structures-action-plan: ${siretIssues.size} divergences SIRET chargées`,
    )
  } else {
    output.log(
      'generate-structures-action-plan: audit-siret-divergences.csv non trouvé, SIRET issues ignorées',
    )
  }

  // ── 5. Charger les résultats d'audit adresse (si disponible) ──

  const adresseIssues = new Map<
    string,
    { categorie: string; anomalies: string }
  >()

  const adresseCsv = await readAuditCsvFile('audit-adresse-anomalies.csv')
  if (adresseCsv) {
    for (const row of adresseCsv.rows) {
      // id=0, categorie=1, anomalies=2
      if (row.length >= 3) {
        adresseIssues.set(row[0], {
          categorie: row[1],
          anomalies: row[2],
        })
      }
    }
    output.log(
      `generate-structures-action-plan: ${adresseIssues.size} anomalies adresse chargées`,
    )
  } else {
    output.log(
      'generate-structures-action-plan: audit-adresse-anomalies.csv non trouvé, adresse issues ignorées',
    )
  }

  // ── 6. Charger la liste des SIRET à vider (revue manuelle) ──

  const siretsAVider = new Set<string>()

  // Le nom du fichier contient des caractères spéciaux (accents), on le cherche par pattern
  const cwdFiles = await readdir(process.cwd())
  const siretAViderFilename = cwdFiles.find(
    (f) => f.includes('siret') && f.includes('vider') && f.endsWith('.csv'),
  )

  const siretAViderCsv = siretAViderFilename
    ? await readCwdCsvFile(siretAViderFilename)
    : null
  if (siretAViderCsv) {
    const actionCol = siretAViderCsv.header.indexOf('Action')
    const idCol = siretAViderCsv.header.indexOf('id')

    if (actionCol >= 0 && idCol >= 0) {
      for (const row of siretAViderCsv.rows) {
        if (row[actionCol]?.trim() === '1') {
          siretsAVider.add(row[idCol])
        }
      }
    }
    output.log(
      `generate-structures-action-plan: ${siretsAVider.size} SIRET à vider (revue manuelle)`,
    )
  } else {
    output.log(
      'generate-structures-action-plan: fichier SIRET à vider non trouvé, ignoré',
    )
  }

  // ── 7. Générer le plan d'action ──

  const actionPlan: ActionPlanRow[] = []
  const structuresTraitees = new Set<string>()

  const addAction = (
    id: string,
    action: Action,
    priorite: number,
    raison: string,
    cibleFusion = '',
    clusterId = '',
  ) => {
    if (structuresTraitees.has(id)) return
    structuresTraitees.add(id)

    const s = structuresById.get(id)
    if (!s) return

    actionPlan.push({
      id,
      action,
      cibleFusion,
      clusterId,
      priorite,
      raison,
      nom: s.nom,
      adresse: s.adresse,
      commune: s.commune,
      codePostal: s.codePostal,
      siret: s.siret ?? '',
      visibleCarto: s.visiblePourCartographieNationale,
      activitesCount: s.activitesCount,
      emploisCount: s.emploisCount,
      mediateursCount: s.mediateursCount,
    })
  }

  // a) Clusters doublon_certain : fusionner les sources vers la cible
  type FusionReviewRow = {
    clusterId: string
    sourceId: string
    sourceNom: string
    sourceAdresse: string
    sourceCommune: string
    sourceSiret: string
    sourceActivites: number
    sourceEmplois: number
    sourceMediateurs: number
    cibleId: string
    cibleNom: string
    cibleAdresse: string
    cibleCommune: string
    cibleSiret: string
    cibleActivites: number
    cibleEmplois: number
    cibleMediateurs: number
    scoreTotal: number
    scoreNom: number
    scoreAdresse: number
    scoreGeo: number
    action: string
  }

  const fusionReviewRows: FusionReviewRow[] = []

  for (const cluster of clusters) {
    if (cluster.type !== 'doublon_certain') continue

    const targetNorm = normById.get(cluster.targetId)
    const targetData = structuresById.get(cluster.targetId)

    for (const id of cluster.ids) {
      if (id === cluster.targetId) continue
      const s = structuresById.get(id)
      if (!s) continue

      // Calculer le score direct source → cible
      const sourceNorm = normById.get(id)
      let scoreTotal = 0
      let scoreNom = 0
      let scoreAdresse = 0
      let scoreGeo = 0

      if (sourceNorm && targetNorm) {
        const result = computePairScore(sourceNorm, targetNorm)
        scoreTotal = result.total
        scoreNom = result.sNom
        scoreAdresse = result.sAdresse
        scoreGeo = result.sGeo
      }

      // Classifier selon le score direct
      let action: Action
      let priorite: number
      if (scoreTotal >= 0.9) {
        action = 'fusionner_auto'
        priorite = 2
      } else if (scoreTotal >= 0.8) {
        action = 'fusionner_probable'
        priorite = 3
      } else {
        action = 'fusionner_a_verifier'
        priorite = 4
      }

      addAction(
        id,
        action,
        priorite,
        `${cluster.id} | score=${scoreTotal.toFixed(3)} (nom=${scoreNom.toFixed(2)} adr=${scoreAdresse.toFixed(2)} geo=${scoreGeo.toFixed(2)})`,
        cluster.targetId,
        cluster.id,
      )

      // Ajouter au fichier de revue si pas auto
      if (action !== 'fusionner_auto' && targetData) {
        fusionReviewRows.push({
          clusterId: cluster.id,
          sourceId: id,
          sourceNom: s.nom,
          sourceAdresse: s.adresse,
          sourceCommune: s.commune,
          sourceSiret: s.siret ?? '',
          sourceActivites: s.activitesCount,
          sourceEmplois: s.emploisCount,
          sourceMediateurs: s.mediateursCount,
          cibleId: cluster.targetId,
          cibleNom: targetData.nom,
          cibleAdresse: targetData.adresse,
          cibleCommune: targetData.commune,
          cibleSiret: targetData.siret ?? '',
          cibleActivites: targetData.activitesCount,
          cibleEmplois: targetData.emploisCount,
          cibleMediateurs: targetData.mediateursCount,
          scoreTotal,
          scoreNom,
          scoreAdresse,
          scoreGeo,
          action,
        })
      }
    }
  }

  // b) SIRET à vider (revue manuelle par un collègue)
  for (const id of siretsAVider) {
    if (structuresTraitees.has(id)) continue
    addAction(
      id,
      'vider_siret',
      2,
      'SIRET à vider (revue manuelle : SIRET ne correspond pas à cette structure)',
    )
  }

  // c) Orphelines (hors celles déjà traitées par fusion)
  for (const id of orphelines) {
    if (structuresTraitees.has(id)) continue

    const s = structuresById.get(id)
    if (!s) continue

    // Ne supprimer que si vraiment aucune donnée
    addAction(id, 'supprimer', 1, 'Structure orpheline sans données associées')
  }

  // d) Clusters mixtes : vérification manuelle
  for (const cluster of clusters) {
    if (cluster.type !== 'mixte') continue

    for (const id of cluster.ids) {
      if (structuresTraitees.has(id)) continue

      addAction(
        id,
        'verification_manuelle',
        6,
        `Cluster mixte ${cluster.id} (${cluster.ids.size} structures | doublons + multi-site mélangés)`,
        '',
        cluster.id,
      )
    }
  }

  // e) Adresses vides ou introuvables
  for (const s of structuresById.values()) {
    if (structuresTraitees.has(s.id)) continue

    const adresseVide = !s.adresse || s.adresse.trim().length <= 1
    const adresseIntrouvable =
      adresseIssues.get(s.id)?.categorie === 'adresse_introuvable'

    if (adresseVide || adresseIntrouvable) {
      addAction(
        s.id,
        'corriger_adresse',
        3,
        adresseVide
          ? 'Adresse vide'
          : 'Adresse introuvable dans la BAN',
      )
    }
  }

  // f) Coordonnées manquantes ou incohérentes (DOM-TOM etc.)
  for (const s of structuresById.values()) {
    if (structuresTraitees.has(s.id)) continue

    if (s.latitude == null || s.longitude == null) {
      addAction(s.id, 'corriger_coordonnees', 4, 'Coordonnées manquantes')
      continue
    }

    const adresseIssue = adresseIssues.get(s.id)
    if (
      adresseIssue &&
      adresseIssue.anomalies.includes('ecart_geographique')
    ) {
      addAction(
        s.id,
        'corriger_coordonnees',
        4,
        'Écart géographique significatif avec la BAN',
      )
    }
  }

  // g) Problèmes SIRET
  for (const [id, issue] of siretIssues) {
    if (structuresTraitees.has(id)) continue

    if (issue.categorie === 'etablissement_ferme') {
      addAction(id, 'verifier_siret', 5, 'Établissement fermé selon l\'API Entreprise')
    } else if (
      issue.categorie === 'nom_et_adresse_divergents' ||
      issue.categorie === 'siret_invalide' ||
      issue.categorie === 'personne_physique'
    ) {
      addAction(
        id,
        'verifier_siret',
        5,
        `SIRET incohérent: ${issue.categorie}`,
      )
    }
  }

  // Trier par priorité puis par action
  actionPlan.sort((a, b) => a.priorite - b.priorite)

  // ── 8. Export CSV plan d'action ──

  const csvLines = [actionPlanCsvHeader, ...actionPlan.map(rowToCsv)]
  const filePath = getAuditOutputPath('structures-action-plan.csv')
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  // ── 9. Export CSV de revue des fusions ──

  const reviewCsvHeader = [
    'cluster_id',
    'action',
    'score_total',
    'score_nom',
    'score_adresse',
    'score_geo',
    'source_id',
    'source_nom',
    'source_adresse',
    'source_commune',
    'source_siret',
    'source_activites',
    'source_emplois',
    'source_mediateurs',
    'cible_id',
    'cible_nom',
    'cible_adresse',
    'cible_commune',
    'cible_siret',
    'cible_activites',
    'cible_emplois',
    'cible_mediateurs',
  ].join(';')

  // Trier par score croissant (les plus douteux en premier)
  fusionReviewRows.sort((a, b) => a.scoreTotal - b.scoreTotal)

  const reviewCsvLines = [
    reviewCsvHeader,
    ...fusionReviewRows.map((r) =>
      [
        r.clusterId,
        r.action,
        r.scoreTotal.toFixed(3),
        r.scoreNom.toFixed(3),
        r.scoreAdresse.toFixed(3),
        r.scoreGeo.toFixed(3),
        r.sourceId,
        escapeCsvField(r.sourceNom),
        escapeCsvField(r.sourceAdresse),
        escapeCsvField(r.sourceCommune),
        r.sourceSiret,
        r.sourceActivites,
        r.sourceEmplois,
        r.sourceMediateurs,
        r.cibleId,
        escapeCsvField(r.cibleNom),
        escapeCsvField(r.cibleAdresse),
        escapeCsvField(r.cibleCommune),
        r.cibleSiret,
        r.cibleActivites,
        r.cibleEmplois,
        r.cibleMediateurs,
      ].join(';'),
    ),
  ]

  const reviewFilePath = getAuditOutputPath('structures-fusion-review.csv')
  await writeFile(reviewFilePath, reviewCsvLines.join('\n'), 'utf-8')

  // ── 10. Rapport console ──

  output.log(`\n=== PLAN D'ACTION - RÉSULTATS ===`)

  const actionCounts: Record<string, number> = {}
  for (const row of actionPlan) {
    actionCounts[row.action] = (actionCounts[row.action] ?? 0) + 1
  }

  output.log(`Total structures avec action: ${actionPlan.length}`)
  for (const [action, count] of Object.entries(actionCounts).sort(
    (a, b) => b[1] - a[1],
  )) {
    output.log(`  ${action}: ${count}`)
  }

  // Impact des fusions
  const fusionsAuto = actionPlan.filter((r) => r.action === 'fusionner_auto')
  const fusionsProbable = actionPlan.filter(
    (r) => r.action === 'fusionner_probable',
  )
  const fusionsAVerifier = actionPlan.filter(
    (r) => r.action === 'fusionner_a_verifier',
  )
  const totalFusions =
    fusionsAuto.length + fusionsProbable.length + fusionsAVerifier.length

  output.log(`\n--- Fusions ---`)
  output.log(`  fusionner_auto (score ≥ 0.9): ${fusionsAuto.length}`)
  output.log(
    `  fusionner_probable (0.8-0.9): ${fusionsProbable.length}`,
  )
  output.log(
    `  fusionner_a_verifier (< 0.8): ${fusionsAVerifier.length}`,
  )
  output.log(`  Total: ${totalFusions} sources`)
  output.log(
    `  Revue: ${fusionReviewRows.length} lignes → ${reviewFilePath}`,
  )

  // Impact des suppressions
  const suppressions = actionPlan.filter((r) => r.action === 'supprimer')
  output.log(`\nSuppressions: ${suppressions.length} structures sans données`)

  // Structures non traitées
  const nonTraitees = structuresById.size - structuresTraitees.size
  output.log(`Structures sans action requise: ${nonTraitees}`)

  output.log(`\nExports:`)
  output.log(`  Plan d'action: ${filePath} (${actionPlan.length} lignes)`)
  output.log(
    `  Revue fusions: ${reviewFilePath} (${fusionReviewRows.length} lignes)`,
  )

  output.log(`\ngenerate-structures-action-plan: terminé`)

  return {
    total: structuresById.size,
    actions: actionCounts,
    fusions: {
      auto: fusionsAuto.length,
      probable: fusionsProbable.length,
      aVerifier: fusionsAVerifier.length,
    },
    suppressions: suppressions.length,
    nonTraitees,
    exports: {
      actionPlan: filePath,
      fusionReview: reviewFilePath,
    },
  }
}
