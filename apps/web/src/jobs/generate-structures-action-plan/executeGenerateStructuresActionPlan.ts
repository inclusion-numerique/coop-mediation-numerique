import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
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
  activitesRelCount: number
  emploisCount: number
  mediateursCount: number
}

// ── Normalisation et similarité (réutilisés de detect-duplicate-structures) ──

const stripDiacritics = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const baseNormalize = (s: string) =>
  stripDiacritics(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

// Préfixes normalisés vers un token canonique au lieu d'être supprimés.
// "commune de X" et "mairie de X" deviennent "ville X" → matchent ensemble.
// "EPN X" reste tel quel → ne matche pas avec "ville X".
const NOM_PREFIXES_NORMALIZATIONS: [RegExp, string][] = [
  [/^commune (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^com (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^mairie (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^ville (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^conseil departemental (?:de(?:s)?|du|de la|de l)\s+/, 'departement '],
  [/^departement (?:de(?:s)?|du|de la|de l)\s+/, 'departement '],
  [/^communaute de communes?\s+/, 'cc '],
  [/^communaute d agglomeration\s+/, 'cagglo '],
  [/^communaute com\s+/, 'cc '],
  [/^conseil regional (?:de(?:s)?|du|de la|de l)\s+/, 'region '],
  [/^region\s+/, 'region '],
]

// Mots-clés qui désignent un service spécifique (EPN, médiathèque, etc.).
// Si une structure les contient et l'autre non, ce sont des entités distinctes
// même avec un SIRET partagé.
const SERVICE_KEYWORDS = [
  'epn',
  'mediatheque',
  'bibliotheque',
  'ccas',
  'cias',
  'centre social',
  'maison quartier',
  'maison de quartier',
  'france services',
  'mjc',
  'espace numerique',
  'cyber espace',
  'cyberbase',
  'pole emploi',
  'mission locale',
  'point information',
  'point info',
  'fablab',
]

const detectServiceKeywords = (s: string): Set<string> => {
  const found = new Set<string>()
  for (const kw of SERVICE_KEYWORDS) {
    if (s.includes(kw)) found.add(kw)
  }
  return found
}

const hasAsymmetricServiceKeyword = (a: string, b: string): boolean => {
  const ka = detectServiceKeywords(a)
  const kb = detectServiceKeywords(b)
  if (ka.size === 0 && kb.size === 0) return false
  for (const k of ka) if (!kb.has(k)) return true
  for (const k of kb) if (!ka.has(k)) return true
  return false
}

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
  for (const [pattern, replacement] of NOM_PREFIXES_NORMALIZATIONS)
    n = n.replace(pattern, replacement)
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
  [/\bch\b/g, 'chemin'],
  [/\bsq\b/g, 'square'],
  [/\brte\b/g, 'route'],
  [/\brt\b/g, 'route'],
  [/\bres\b/g, 'residence'],
  [/\bvc\b/g, 'voie communale'],
  [/\bzi\b/g, 'zone industrielle'],
  [/\bza\b/g, 'zone artisanale'],
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

// Min length for the "contained" address heuristic: avoids matching on
// generic tokens like "rue" or "place" alone.
const MIN_CONTAINED_ADRESSE_LENGTH = 5

const scoreAdresse = (a: string, b: string): number => {
  if (
    a.length >= MIN_CONTAINED_ADRESSE_LENGTH &&
    b.length >= MIN_CONTAINED_ADRESSE_LENGTH
  ) {
    if (a.includes(b) || b.includes(a)) return 1
  }
  return diceSimilarity(a, b)
}

const computePairScore = (
  a: StructureData & { nomNorm: string; adrNorm: string },
  b: StructureData & { nomNorm: string; adrNorm: string },
) => {
  const sNom = diceSimilarity(a.nomNorm, b.nomNorm)

  // If one structure references a service kind (EPN, médiathèque, CCAS...)
  // and the other does not, they are distinct entities even with same
  // SIRET + address. Disable the "address contained" heuristic for them.
  const differentService = hasAsymmetricServiceKeyword(a.nomNorm, b.nomNorm)
  const sAdresse = differentService
    ? diceSimilarity(a.adrNorm, b.adrNorm)
    : scoreAdresse(a.adrNorm, b.adrNorm)

  let sGeo = 0
  const geoAvailable =
    a.latitude != null &&
    a.longitude != null &&
    b.latitude != null &&
    b.longitude != null
  if (geoAvailable) {
    const dist = haversineDistance(
      a.latitude as number,
      a.longitude as number,
      b.latitude as number,
      b.longitude as number,
    )
    if (dist < 50) sGeo = 1
    else if (dist <= 500) sGeo = 1 - (dist - 50) / 450
  }

  const sSiret = a.siret && b.siret && a.siret === b.siret ? 1 : 0

  const tA = normalizeTelephone(a.telephone)
  const tB = normalizeTelephone(b.telephone)
  const sTel = tA && tB && tA === tB ? 1 : 0

  // Ignore geo when it's unavailable OR when the address strongly indicates
  // the same place (>=0.85): missing coords or wrong coords should not
  // penalize a clear address match. But never ignore it when names indicate
  // distinct services (the geo distance is a valuable signal here).
  const ignoreGeo = !differentService && (!geoAvailable || sAdresse >= 0.85)
  const weightsSum = ignoreGeo
    ? POIDS_NOM + POIDS_ADRESSE + POIDS_SIRET + POIDS_TELEPHONE
    : 1
  const total =
    (sNom * POIDS_NOM +
      sAdresse * POIDS_ADRESSE +
      (ignoreGeo ? 0 : sGeo * POIDS_GEO) +
      sSiret * POIDS_SIRET +
      sTel * POIDS_TELEPHONE) /
    weightsSum

  const isSameLieu = sGeo >= 0.7 || sAdresse >= 0.85

  return { total, sNom, sAdresse, sGeo, isSameLieu }
}

// ── Union-Find ──

class UnionFind {
  private parent = new Map<string, string>()

  find(id: string): string {
    if (!this.parent.has(id)) this.parent.set(id, id)
    let root = id
    while (this.parent.get(root) !== root)
      root = this.parent.get(root) as string
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

const parseCsv = (content: string, separator = ';'): string[][] => {
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
          mediateursEnActivite: true,
          activites: true,
        },
      },
      structureAdministrative: {
        select: {
          _count: { select: { emplois: true, activites: true } },
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
      activitesRelCount:
        s._count.activites + (s.structureAdministrative?._count.activites ?? 0),
      emploisCount: s.structureAdministrative?._count.emplois ?? 0,
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
      s.activitesRelCount === 0 &&
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

  type PairInfo = {
    idA: string
    idB: string
    score: number
    isSameLieu: boolean
  }
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

  const siretIssues = new Map<string, { categorie: string; erreur: string }>()

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

  const siretAViderCsv = await readAuditCsvFile('sirets-to-remove.csv', ',')
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
    if (cluster.type === 'multi_site') continue

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
    const s = structuresById.get(id)
    if (!s || !s.siret) continue
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

  // d) Clusters mixtes : les paires sont déjà traitées dans la boucle a) ci-dessus
  // (mêmes règles de scoring que doublon_certain). Les structures restantes du
  // cluster (sans paire scorée vs la cible) ne reçoivent pas d'action automatique.

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
        adresseVide ? 'Adresse vide' : 'Adresse introuvable dans la BAN',
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
    if (adresseIssue && adresseIssue.anomalies.includes('ecart_geographique')) {
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
      addAction(
        id,
        'verifier_siret',
        5,
        "Établissement fermé selon l'API Entreprise",
      )
    } else if (
      issue.categorie === 'nom_et_adresse_divergents' ||
      issue.categorie === 'siret_invalide' ||
      issue.categorie === 'personne_physique'
    ) {
      addAction(id, 'verifier_siret', 5, `SIRET incohérent: ${issue.categorie}`)
    }
  }

  // Trier par priorité puis par action
  actionPlan.sort((a, b) => a.priorite - b.priorite)

  // ── 8. Export CSV plan d'action ──

  const csvLines = [actionPlanCsvHeader, ...actionPlan.map(rowToCsv)]
  const filePath = getAuditOutputPath('structures-action-plan.csv')
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  // ── 9. Export CSV de revue des fusions (format groupé par cluster) ──

  const reviewCsvHeader = [
    'cluster_id',
    'id',
    'role',
    'statut',
    'nom',
    'adresse',
    'commune',
    'siret',
    'activites',
    'emplois',
    'mediateurs',
    'raison',
  ].join(';')

  // Regrouper par cluster, trier clusters par score min asc (les plus douteux en premier),
  // sources triées par score asc
  const rowsByCluster = new Map<string, FusionReviewRow[]>()
  for (const row of fusionReviewRows) {
    const group = rowsByCluster.get(row.clusterId)
    if (group) group.push(row)
    else rowsByCluster.set(row.clusterId, [row])
  }

  const sortedClusters = [...rowsByCluster.entries()].sort((a, b) => {
    const minA = Math.min(...a[1].map((r) => r.scoreTotal))
    const minB = Math.min(...b[1].map((r) => r.scoreTotal))
    return minA - minB
  })

  const emptyLine = new Array(12).fill('').join(';')

  const reviewCsvLines: string[] = [reviewCsvHeader]

  for (const [clusterId, rows] of sortedClusters) {
    rows.sort((a, b) => a.scoreTotal - b.scoreTotal)
    const first = rows[0]

    // Ligne vide pour séparer du cluster précédent
    reviewCsvLines.push(emptyLine)

    // Ligne CIBLE
    reviewCsvLines.push(
      [
        clusterId,
        first.cibleId,
        'CIBLE',
        '',
        escapeCsvField(first.cibleNom),
        escapeCsvField(first.cibleAdresse),
        escapeCsvField(first.cibleCommune),
        first.cibleSiret,
        first.cibleActivites,
        first.cibleEmplois,
        first.cibleMediateurs,
        '',
      ].join(';'),
    )

    // Lignes sources
    for (const r of rows) {
      const raison = `${clusterId} | score=${r.scoreTotal.toFixed(3)} (nom=${r.scoreNom.toFixed(2)} adr=${r.scoreAdresse.toFixed(2)} geo=${r.scoreGeo.toFixed(2)})`
      reviewCsvLines.push(
        [
          clusterId,
          r.sourceId,
          'source',
          'a_fusionner',
          escapeCsvField(r.sourceNom),
          escapeCsvField(r.sourceAdresse),
          escapeCsvField(r.sourceCommune),
          r.sourceSiret,
          r.sourceActivites,
          r.sourceEmplois,
          r.sourceMediateurs,
          escapeCsvField(raison),
        ].join(';'),
      )
    }
  }

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
  output.log(`  fusionner_probable (0.8-0.9): ${fusionsProbable.length}`)
  output.log(`  fusionner_a_verifier (< 0.8): ${fusionsAVerifier.length}`)
  output.log(`  Total: ${totalFusions} sources`)
  output.log(`  Revue: ${fusionReviewRows.length} lignes → ${reviewFilePath}`)

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
