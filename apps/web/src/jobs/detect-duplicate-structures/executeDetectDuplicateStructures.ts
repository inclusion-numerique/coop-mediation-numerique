import { writeFile } from 'node:fs/promises'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { DetectDuplicateStructuresJob } from './detectDuplicateStructuresJob'

type StructureLight = {
  id: string
  nom: string
  nomNormalise: string
  siret: string | null
  adresse: string
  adresseNormalisee: string
  commune: string
  codePostal: string
  codeInsee: string | null
  telephone: string | null
  latitude: number | null
  longitude: number | null
  visiblePourCartographieNationale: boolean
  activitesCount: number
  emploisCount: number
  mediateursCount: number
}

type PaireDoublon = {
  idA: string
  nomA: string
  siretA: string
  adresseA: string
  communeA: string
  idB: string
  nomB: string
  siretB: string
  adresseB: string
  communeB: string
  codeInsee: string
  scoreNom: number
  scoreAdresse: number
  scoreGeo: number
  scoreSiret: number
  scoreTelephone: number
  scoreTotal: number
  activitesA: number
  activitesB: number
  emploisA: number
  emploisB: number
  mediateursA: number
  mediateursB: number
  visibleCartoA: boolean
  visibleCartoB: boolean
}

// ── Pondérations ──

const POIDS_NOM = 0.35
const POIDS_ADRESSE = 0.25
const POIDS_GEO = 0.2
const POIDS_SIRET = 0.15
const POIDS_TELEPHONE = 0.05

// ── Utilitaires ──

const stripDiacritics = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const baseNormalize = (s: string) =>
  stripDiacritics(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

// ── Normalisation des noms de structures ──

/**
 * Préfixes administratifs interchangeables.
 * "commune de X", "mairie de X", "ville de X" → "X"
 * "conseil départemental de X", "département de X" → "X"
 * "communauté de communes de X", "communauté d'agglomération de X", etc.
 */
const NOM_PREFIXES_TO_STRIP = [
  // Communes
  /^commune de\s+/,
  /^com de\s+/,
  /^mairie de\s+/,
  /^ville de\s+/,
  // Départements
  /^conseil departemental de(?:s)?\s+/,
  /^conseil departemental du\s+/,
  /^conseil departemental de l\s*/,
  /^departement de(?:s)?\s+/,
  /^departement du\s+/,
  /^departement de l\s*/,
  // Intercommunalités
  /^communaute de communes?\s+/,
  /^communaute d agglomeration\s+/,
  /^communaute com\s+/,
  // Régions
  /^conseil regional de\s+/,
  /^region\s+/,
]

/**
 * Abréviations courantes dans les noms de structures.
 */
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

  for (const prefix of NOM_PREFIXES_TO_STRIP) {
    n = n.replace(prefix, '')
  }

  for (const [pattern, replacement] of NOM_ABBREVIATIONS) {
    n = n.replace(pattern, replacement)
  }

  // Retirer les mots-outils en fin de normalisation
  n = n
    .replace(/\b(de|du|des|le|la|les|l|d|et|en)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return n
}

// ── Normalisation des adresses ──

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

  for (const [pattern, replacement] of ADRESSE_ABBREVIATIONS) {
    n = n.replace(pattern, replacement)
  }

  // Retirer les mots-outils
  n = n
    .replace(/\b(de|du|des|le|la|les|l|d)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return n
}

// ── Similarité ──

const bigrams = (s: string) => {
  const set = new Map<string, number>()
  for (let i = 0; i < s.length - 1; i++) {
    const bigram = s.slice(i, i + 2)
    set.set(bigram, (set.get(bigram) ?? 0) + 1)
  }
  return set
}

const diceSimilarity = (a: string, b: string): number => {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0

  const bigramsA = bigrams(a)
  const bigramsB = bigrams(b)

  let intersection = 0
  for (const [bigram, countA] of bigramsA) {
    const countB = bigramsB.get(bigram) ?? 0
    intersection += Math.min(countA, countB)
  }

  return (2 * intersection) / (a.length - 1 + b.length - 1)
}

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6_371_000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Score géographique : 1.0 si < 50m, décroissance linéaire jusqu'à 0 à 500m
 */
const scoreGeo = (a: StructureLight, b: StructureLight): number => {
  if (
    a.latitude == null ||
    a.longitude == null ||
    b.latitude == null ||
    b.longitude == null
  ) {
    return 0
  }

  const distance = haversineDistance(
    a.latitude,
    a.longitude,
    b.latitude,
    b.longitude,
  )

  if (distance < 50) return 1
  if (distance > 500) return 0
  return 1 - (distance - 50) / 450
}

const scoreSiret = (a: StructureLight, b: StructureLight): number => {
  if (!a.siret || !b.siret) return 0
  return a.siret === b.siret ? 1 : 0
}

const normalizeTelephone = (tel: string | null): string => {
  if (!tel) return ''
  return tel.replace(/[\s.+\-()]/g, '').replace(/^0033/, '0')
}

const scoreTelephone = (a: StructureLight, b: StructureLight): number => {
  const telA = normalizeTelephone(a.telephone)
  const telB = normalizeTelephone(b.telephone)
  if (!telA || !telB) return 0
  return telA === telB ? 1 : 0
}

const computeScore = (
  a: StructureLight,
  b: StructureLight,
): {
  scoreNom: number
  scoreAdresse: number
  scoreGeo: number
  scoreSiret: number
  scoreTelephone: number
  scoreTotal: number
} => {
  const sNom = diceSimilarity(a.nomNormalise, b.nomNormalise)
  const sAdresse = diceSimilarity(a.adresseNormalisee, b.adresseNormalisee)
  const sGeo = scoreGeo(a, b)
  const sSiret = scoreSiret(a, b)
  const sTelephone = scoreTelephone(a, b)

  const scoreTotal =
    sNom * POIDS_NOM +
    sAdresse * POIDS_ADRESSE +
    sGeo * POIDS_GEO +
    sSiret * POIDS_SIRET +
    sTelephone * POIDS_TELEPHONE

  return {
    scoreNom: sNom,
    scoreAdresse: sAdresse,
    scoreGeo: sGeo,
    scoreSiret: sSiret,
    scoreTelephone: sTelephone,
    scoreTotal,
  }
}

// ── CSV ──

const escapeCsvField = (value: string) =>
  value.includes(';') || value.includes('"') || value.includes('\n')
    ? `"${value.replace(/"/g, '""')}"`
    : value

const csvHeader = [
  'id_a',
  'nom_a',
  'siret_a',
  'adresse_a',
  'commune_a',
  'activites_a',
  'emplois_a',
  'mediateurs_a',
  'visible_carto_a',
  'id_b',
  'nom_b',
  'siret_b',
  'adresse_b',
  'commune_b',
  'activites_b',
  'emplois_b',
  'mediateurs_b',
  'visible_carto_b',
  'code_insee',
  'score_nom',
  'score_adresse',
  'score_geo',
  'score_siret',
  'score_telephone',
  'score_total',
].join(';')

const paireToCsv = (p: PaireDoublon): string =>
  [
    p.idA,
    escapeCsvField(p.nomA),
    p.siretA,
    escapeCsvField(p.adresseA),
    escapeCsvField(p.communeA),
    p.activitesA,
    p.emploisA,
    p.mediateursA,
    p.visibleCartoA ? 'oui' : 'non',
    p.idB,
    escapeCsvField(p.nomB),
    p.siretB,
    escapeCsvField(p.adresseB),
    escapeCsvField(p.communeB),
    p.activitesB,
    p.emploisB,
    p.mediateursB,
    p.visibleCartoB ? 'oui' : 'non',
    p.codeInsee,
    p.scoreNom.toFixed(3),
    p.scoreAdresse.toFixed(3),
    p.scoreGeo.toFixed(3),
    p.scoreSiret.toFixed(3),
    p.scoreTelephone.toFixed(3),
    p.scoreTotal.toFixed(3),
  ].join(';')

// ── Job ──

export const executeDetectDuplicateStructures = async (
  job: DetectDuplicateStructuresJob,
) => {
  const seuilScore = job.payload?.seuilScore ?? 0.6
  const limit = job.payload?.limit

  output.log(
    `detect-duplicate-structures: starting (seuil: ${seuilScore})${limit ? ` (limit: ${limit} codes INSEE)` : ''}...`,
  )

  const structures = await prismaClient.structure.findMany({
    where: {
      suppression: null,
      codeInsee: { not: null },
    },
    select: {
      id: true,
      nom: true,
      siret: true,
      adresse: true,
      commune: true,
      codePostal: true,
      codeInsee: true,
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

  // Regrouper par code INSEE
  const parCodeInsee = new Map<string, StructureLight[]>()
  for (const s of structures) {
    const codeInsee = s.codeInsee as string
    const light: StructureLight = {
      id: s.id,
      nom: s.nom,
      nomNormalise: normalizeNom(s.nom),
      siret: s.siret,
      adresse: s.adresse,
      adresseNormalisee: normalizeAdresse(s.adresse),
      commune: s.commune,
      codePostal: s.codePostal,
      codeInsee: s.codeInsee,
      telephone: s.telephone,
      latitude: s.latitude,
      longitude: s.longitude,
      visiblePourCartographieNationale: s.visiblePourCartographieNationale,
      activitesCount: s.activitesCount,
      emploisCount: s._count.emplois,
      mediateursCount: s._count.mediateursEnActivite,
    }
    const group = parCodeInsee.get(codeInsee)
    if (group) {
      group.push(light)
    } else {
      parCodeInsee.set(codeInsee, [light])
    }
  }

  // Filtrer les groupes avec au moins 2 structures
  const groupesComparables = [...parCodeInsee.entries()].filter(
    ([, group]) => group.length >= 2,
  )

  const groupesATraiter = limit
    ? groupesComparables.slice(0, limit)
    : groupesComparables

  const totalComparaisons = groupesATraiter.reduce(
    (sum, [, group]) => sum + (group.length * (group.length - 1)) / 2,
    0,
  )

  output.log(
    `detect-duplicate-structures: ${structures.length} structures, ${groupesComparables.length} codes INSEE avec ≥2 structures, ${totalComparaisons} comparaisons à effectuer`,
  )

  const paires: PaireDoublon[] = []
  let comparaisonsEffectuees = 0

  for (const [codeInsee, group] of groupesATraiter) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i]
        const b = group[j]
        comparaisonsEffectuees++

        const scores = computeScore(a, b)

        if (scores.scoreTotal >= seuilScore) {
          paires.push({
            idA: a.id,
            nomA: a.nom,
            siretA: a.siret ?? '',
            adresseA: a.adresse,
            communeA: a.commune,
            activitesA: a.activitesCount,
            emploisA: a.emploisCount,
            mediateursA: a.mediateursCount,
            visibleCartoA: a.visiblePourCartographieNationale,
            idB: b.id,
            nomB: b.nom,
            siretB: b.siret ?? '',
            adresseB: b.adresse,
            communeB: b.commune,
            activitesB: b.activitesCount,
            emploisB: b.emploisCount,
            mediateursB: b.mediateursCount,
            visibleCartoB: b.visiblePourCartographieNationale,
            codeInsee,
            ...scores,
          })
        }
      }
    }

    if (comparaisonsEffectuees % 50_000 === 0) {
      output.log(
        `detect-duplicate-structures: progress ${comparaisonsEffectuees}/${totalComparaisons} comparaisons, ${paires.length} paires trouvées`,
      )
    }
  }

  // Trier par score décroissant
  paires.sort((a, b) => b.scoreTotal - a.scoreTotal)

  // ── Export CSV ──

  const csvLines = [csvHeader, ...paires.map(paireToCsv)]
  const filePath = getAuditOutputPath('detect-duplicate-structures.csv')
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  // ── Rapport console ──

  output.log(`\n=== DÉTECTION DOUBLONS FLOUS - RÉSULTATS ===`)
  output.log(`Structures analysées: ${structures.length}`)
  output.log(`Codes INSEE avec ≥2 structures: ${groupesComparables.length}`)
  output.log(`Comparaisons effectuées: ${comparaisonsEffectuees}`)
  output.log(`Paires détectées (score ≥ ${seuilScore}): ${paires.length}`)

  // Distribution des scores
  if (paires.length > 0) {
    const ranges = [
      { label: '0.9 - 1.0', min: 0.9, max: 1.01 },
      { label: '0.8 - 0.9', min: 0.8, max: 0.9 },
      { label: '0.7 - 0.8', min: 0.7, max: 0.8 },
      { label: '0.6 - 0.7', min: 0.6, max: 0.7 },
      { label: '< 0.6', min: 0, max: 0.6 },
    ]
    output.log(`\n--- Distribution des scores ---`)
    for (const range of ranges) {
      const count = paires.filter(
        (p) => p.scoreTotal >= range.min && p.scoreTotal < range.max,
      ).length
      if (count > 0) {
        output.log(`  ${range.label}: ${count}`)
      }
    }
  }

  // ── Regroupement en clusters (composantes connexes) ──

  const parent = new Map<string, string>()

  const find = (id: string): string => {
    if (!parent.has(id)) parent.set(id, id)
    let root = id
    while (parent.get(root) !== root) root = parent.get(root) as string
    // Path compression
    let current = id
    while (current !== root) {
      const next = parent.get(current) as string
      parent.set(current, root)
      current = next
    }
    return root
  }

  const union = (a: string, b: string) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }

  for (const p of paires) {
    union(p.idA, p.idB)
  }

  // Construire les clusters

  type ClusterType = 'doublon_certain' | 'multi_site' | 'mixte'

  type Cluster = {
    ids: Set<string>
    paires: PaireDoublon[]
    scoreMax: number
    type: ClusterType
    nbLieuxDistincts: number
  }

  const clusterMap = new Map<string, Cluster>()

  for (const p of paires) {
    const root = find(p.idA)
    let cluster = clusterMap.get(root)
    if (!cluster) {
      cluster = {
        ids: new Set(),
        paires: [],
        scoreMax: 0,
        type: 'doublon_certain',
        nbLieuxDistincts: 1,
      }
      clusterMap.set(root, cluster)
    }
    cluster.ids.add(p.idA)
    cluster.ids.add(p.idB)
    cluster.paires.push(p)
    if (p.scoreTotal > cluster.scoreMax) cluster.scoreMax = p.scoreTotal
  }

  // ── Classification des clusters par lieux physiques ──
  // Deux structures sont au même lieu si :
  // - scoreGeo ≥ 0.7 (~200m) : proximité géographique
  // - OU scoreAdresse ≥ 0.85 : adresse quasi identique (fallback sans coordonnées)

  const SEUIL_MEME_LIEU_GEO = 0.7
  const SEUIL_MEME_LIEU_ADRESSE = 0.85

  const isSameLieu = (p: PaireDoublon): boolean =>
    p.scoreGeo >= SEUIL_MEME_LIEU_GEO ||
    p.scoreAdresse >= SEUIL_MEME_LIEU_ADRESSE

  for (const cluster of clusterMap.values()) {
    // Union-Find local pour regrouper les structures par lieu physique
    const lieuParent = new Map<string, string>()

    const findLieu = (id: string): string => {
      if (!lieuParent.has(id)) lieuParent.set(id, id)
      let root = id
      while (lieuParent.get(root) !== root)
        root = lieuParent.get(root) as string
      let current = id
      while (current !== root) {
        const next = lieuParent.get(current) as string
        lieuParent.set(current, root)
        current = next
      }
      return root
    }

    const unionLieu = (a: string, b: string) => {
      const ra = findLieu(a)
      const rb = findLieu(b)
      if (ra !== rb) lieuParent.set(ra, rb)
    }

    // Initialiser tous les IDs
    for (const id of cluster.ids) findLieu(id)

    // Regrouper les structures proches géographiquement ou par adresse
    for (const p of cluster.paires) {
      if (isSameLieu(p)) {
        unionLieu(p.idA, p.idB)
      }
    }

    // Compter les lieux distincts
    const lieux = new Set<string>()
    for (const id of cluster.ids) lieux.add(findLieu(id))

    cluster.nbLieuxDistincts = lieux.size

    if (lieux.size === 1) {
      cluster.type = 'doublon_certain'
    } else if (lieux.size === cluster.ids.size) {
      cluster.type = 'multi_site'
    } else {
      cluster.type = 'mixte'
    }
  }

  const clusters = [...clusterMap.values()].sort(
    (a, b) => b.ids.size - a.ids.size,
  )

  const structuresImpliquees = new Set<string>()
  for (const c of clusters) {
    for (const id of c.ids) structuresImpliquees.add(id)
  }

  // ── Rapport clusters ──

  output.log(`\n--- Clusters ---`)
  output.log(`Clusters trouvés: ${clusters.length}`)

  const clusterSizeDistrib = new Map<number, number>()
  for (const c of clusters) {
    const size = c.ids.size
    clusterSizeDistrib.set(size, (clusterSizeDistrib.get(size) ?? 0) + 1)
  }
  output.log(`Distribution par taille:`)
  for (const [size, count] of [...clusterSizeDistrib.entries()].sort(
    (a, b) => b[0] - a[0],
  )) {
    output.log(`  ${size} structures: ${count} clusters`)
  }

  // Classification par type
  const typeDistrib: Record<ClusterType, number> = {
    doublon_certain: 0,
    multi_site: 0,
    mixte: 0,
  }
  const structuresParType: Record<ClusterType, number> = {
    doublon_certain: 0,
    multi_site: 0,
    mixte: 0,
  }
  for (const c of clusters) {
    typeDistrib[c.type]++
    structuresParType[c.type] += c.ids.size
  }

  output.log(`\n--- Classification ---`)
  for (const type of ['doublon_certain', 'multi_site', 'mixte'] as const) {
    output.log(
      `  ${type}: ${typeDistrib[type]} clusters (${structuresParType[type]} structures)`,
    )
  }

  // Top 10 clusters les plus gros
  output.log(`\n--- Top 10 plus gros clusters ---`)
  for (const cluster of clusters.slice(0, 10)) {
    const exemple = cluster.paires[0]
    const noms = new Set<string>()
    const sirets = new Set<string>()
    for (const p of cluster.paires) {
      noms.add(p.nomA)
      noms.add(p.nomB)
      if (p.siretA) sirets.add(p.siretA)
      if (p.siretB) sirets.add(p.siretB)
    }
    output.log(
      `  [${cluster.type}] [${cluster.ids.size} structures, ${cluster.nbLieuxDistincts} lieux, score_max=${cluster.scoreMax.toFixed(3)}]`,
    )
    output.log(
      `    Noms: ${[...noms]
        .slice(0, 3)
        .map((n) => `"${n}"`)
        .join(', ')}${noms.size > 3 ? ` (+${noms.size - 3})` : ''}`,
    )
    output.log(
      `    Commune: ${exemple.communeA} | SIRETs: ${sirets.size > 0 ? [...sirets].join(', ') : '—'}`,
    )
  }

  // Top 10 paires les plus intéressantes (hors doublons stricts)
  const pairesInteressantes = paires.filter(
    (p) =>
      !(p.scoreNom >= 0.95 && p.scoreAdresse >= 0.95 && p.scoreSiret === 1),
  )

  // Dédupliquer par cluster pour varier les exemples
  const clustersVus = new Set<string>()
  const pairesVariees: PaireDoublon[] = []
  for (const p of pairesInteressantes) {
    const root = find(p.idA)
    if (!clustersVus.has(root)) {
      clustersVus.add(root)
      pairesVariees.push(p)
      if (pairesVariees.length >= 10) break
    }
  }

  output.log(`\n--- Top 10 paires (hors doublons stricts, 1 par cluster) ---`)
  for (const p of pairesVariees) {
    output.log(
      `  score=${p.scoreTotal.toFixed(3)} [nom=${p.scoreNom.toFixed(2)} adr=${p.scoreAdresse.toFixed(2)} geo=${p.scoreGeo.toFixed(2)} siret=${p.scoreSiret.toFixed(0)}]`,
    )
    output.log(`    "${p.nomA}" ↔ "${p.nomB}" | ${p.communeA}`)
    output.log(
      `    "${p.adresseA}" ↔ "${p.adresseB}" | SIRET: ${p.siretA || '—'} / ${p.siretB || '—'}`,
    )
  }

  output.log(`\nStructures uniques impliquées: ${structuresImpliquees.size}`)
  output.log(`Export: ${filePath} (${paires.length} paires)`)

  // ── Export CSV clusters ──

  const clustersCsvHeader = [
    'cluster_id',
    'type',
    'taille',
    'nb_lieux_distincts',
    'paires',
    'score_max',
    'noms',
    'sirets',
    'commune',
    'ids',
  ].join(';')

  const clustersCsvLines = [
    clustersCsvHeader,
    ...clusters.map((c, i) => {
      const noms = new Set<string>()
      const sirets = new Set<string>()
      const communes = new Set<string>()
      for (const p of c.paires) {
        noms.add(p.nomA)
        noms.add(p.nomB)
        if (p.siretA) sirets.add(p.siretA)
        if (p.siretB) sirets.add(p.siretB)
        communes.add(p.communeA)
      }
      return [
        i + 1,
        c.type,
        c.ids.size,
        c.nbLieuxDistincts,
        c.paires.length,
        c.scoreMax.toFixed(3),
        escapeCsvField([...noms].join(' | ')),
        [...sirets].join(' | ') || '',
        escapeCsvField([...communes].join(' | ')),
        [...c.ids].join(' | '),
      ].join(';')
    }),
  ]

  const clustersFilePath = getAuditOutputPath('detect-duplicate-clusters.csv')
  await writeFile(clustersFilePath, clustersCsvLines.join('\n'), 'utf-8')

  output.log(
    `Export clusters: ${clustersFilePath} (${clusters.length} clusters)`,
  )

  output.log(`\ndetect-duplicate-structures: terminé`)

  return {
    structuresAnalysees: structures.length,
    codesInseeAvecDoublons: groupesComparables.length,
    comparaisonsEffectuees,
    pairesDetectees: paires.length,
    clusters: {
      total: clusters.length,
      doublon_certain: typeDistrib.doublon_certain,
      multi_site: typeDistrib.multi_site,
      mixte: typeDistrib.mixte,
    },
    structuresImpliquees: structuresImpliquees.size,
    seuilScore,
    exports: {
      paires: filePath,
      clusters: clustersFilePath,
    },
  }
}
