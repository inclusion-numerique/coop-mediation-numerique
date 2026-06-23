import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'

// Préfixes administratifs interchangeables, normalisés vers un token canonique.
// "commune de X", "mairie de X", "ville de X", "hôtel de ville de X" → "ville X"
// Permet à findOrCreateStructure de matcher "MAIRIE DU PRÊCHEUR" avec
// "COMMUNE DU PRECHEUR" pour le même SIRET, et ainsi d'éviter les doublons
// quand le Dataspace renvoie une variante de nom différente de la base.
const NOM_PREFIXES_NORMALIZATIONS: [RegExp, string][] = [
  [/^commune (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^com (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^mairie (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^ville (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^hotel de ville (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^conseil departemental (?:de(?:s)?|du|de la|de l)\s+/, 'departement '],
  [/^departement (?:de(?:s)?|du|de la|de l)\s+/, 'departement '],
  [/^communaute de communes?\s+/, 'cc '],
  [/^communaute d agglomeration\s+/, 'cagglo '],
  [/^communaute com\s+/, 'cc '],
  [/^conseil regional (?:de(?:s)?|du|de la|de l)\s+/, 'region '],
  [/^region\s+/, 'region '],
]

const baseNormalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeNom = (s: string): string => {
  let n = baseNormalize(s)
  for (const [pattern, replacement] of NOM_PREFIXES_NORMALIZATIONS) {
    n = n.replace(pattern, replacement)
  }
  return n.trim()
}

// Mots-clés désignant un service spécifique d'une entité plus large.
// Si l'un des deux noms en contient un et pas l'autre, ce sont des entités
// distinctes (ex: EPN Fleury vs Commune de Fleury).
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

// Département prefix: 3 chars for overseas (97x/98x), 2 otherwise.
const departementOf = (codeInsee: string): string =>
  codeInsee.startsWith('97') || codeInsee.startsWith('98')
    ? codeInsee.slice(0, 3)
    : codeInsee.slice(0, 2)

// The geocoded codeInsee is only trusted when it stays in the same département
// as the payload. Guards against BAN mis-geocoding overseas (DOM) addresses to
// mainland France (e.g. a Martinique 972xx address resolved to a Gironde 33xxx
// codeInsee), which would otherwise corrupt the stored codeInsee.
export const sameDepartement = (a: string, b: string): boolean =>
  departementOf(a) === departementOf(b)

export const isContainedName = (a: string, b: string): boolean => {
  const na = normalizeNom(a)
  const nb = normalizeNom(b)
  if (hasAsymmetricServiceKeyword(na, nb)) return false
  return na === nb || na.includes(nb) || nb.includes(na)
}

export type StructureInput = {
  coopId?: string | null
  siret: string | null
  nom: string
  adresse: string
  codePostal: string
  codeInsee: string
  commune: string
  // Optional fields
  nomReferent?: string | null
  courrielReferent?: string | null
  telephoneReferent?: string | null
  creationParId?: string | null
}

const findExistingBySiretOrNom = async ({
  siret,
  nom,
  codeInsee,
}: {
  siret: string | null
  nom: string
  codeInsee: string
}): Promise<{ id: string } | null> => {
  const where = siret
    ? { siret, codeInsee, suppression: null }
    : { nom, codeInsee, suppression: null }

  const existing = await prismaClient.structure.findFirst({
    where,
    select: { id: true, suppression: true },
    orderBy: { creation: 'desc' },
  })

  if (existing) {
    await undeleteStructureIfDeleted(
      existing as { id: string; suppression: Date | null },
    )
    return existing
  }

  // Fallback: same SIRET, any codeInsee, with contained name match.
  // Handles codeInsee divergence between Dataspace and coop.
  // The asymmetric-service-keyword check inside isContainedName prevents
  // matching an EPN against its parent town hall (same SIRET, different role).
  if (siret) {
    const candidatesBySiret = await prismaClient.structure.findMany({
      where: { siret, suppression: null },
      select: { id: true, nom: true, suppression: true },
      orderBy: { creation: 'desc' },
    })

    const match = candidatesBySiret.find((s) => isContainedName(s.nom, nom))

    if (match) {
      await undeleteStructureIfDeleted(match)
      return match
    }
  }

  return null
}

const undeleteStructureIfDeleted = async ({
  id,
  suppression,
}: {
  id: string
  suppression: Date | null
}) => {
  if (suppression) {
    await prismaClient.structure.update({
      where: { id },
      data: {
        suppression: null,
        suppressionParId: null,
      },
    })
  }
}

/**
 * Generic helper to find or create a structure following this hierarchy:
 * 1. Find existing Structure by coopId (surest match)
 * 2. Geocode the address once (BAN) to resolve a canonical codeInsee used by
 *    every lookup below AND by the final create (kept symmetric on purpose)
 * 3. Find existing Structure by SIRET + resolved codeInsee
 * 4. Find existing Structure by nom + resolved codeInsee (if no SIRET)
 * 5. Fallback: create from the geocoded address (or raw fields if geocoding failed)
 *
 * Note : on n'importe plus de structure depuis la cartographie nationale par SIRET
 * (le SIRET de la carto n'est pas fiable, seule l'API entreprise fait foi).
 * This is reusable for both V1 imports and Dataspace imports.
 */
export const findOrCreateStructure = async ({
  coopId,
  siret,
  nom,
  adresse,
  codePostal,
  codeInsee,
  commune,
  nomReferent,
  courrielReferent,
  telephoneReferent,
  creationParId,
}: StructureInput): Promise<{ id: string }> => {
  // If coopId is provided, it is the surest way to find the structure
  if (coopId) {
    const existingStructure = await prismaClient.structure.findFirst({
      where: {
        id: coopId,
      },
      select: {
        id: true,
        suppression: true,
      },
    })
    if (existingStructure) {
      await undeleteStructureIfDeleted(existingStructure)
      return existingStructure
    }
  }

  // Normalize codeInsee via BAN so lookups use the same value stored on
  // creation. The Dataspace payload sometimes carries a codeInsee variant
  // (siège vs antenne) that diverges from the geocoded one, which made the
  // exact (siret, codeInsee) lookup miss an existing active structure and
  // recreate a duplicate. Geocode once here and reuse it for the final create.
  const fullAdresse = `${adresse}, ${codePostal} ${commune}`
  const adresseResult = await searchAdresse(fullAdresse)
  const banData = adresseResult
    ? banFeatureToAdresseBanData(adresseResult)
    : null
  // Only trust the geocoding when it stays in the payload's département,
  // otherwise treat it as if nothing was geocoded (lookup and create fall back
  // to the raw payload codeInsee).
  const trustedBanData =
    banData && sameDepartement(banData.codeInsee, codeInsee) ? banData : null
  const resolvedCodeInsee = trustedBanData?.codeInsee ?? codeInsee

  // Step 1: Find existing Structure by SIRET + codeInsee
  if (siret) {
    const existingStructure = await prismaClient.structure.findFirst({
      where: {
        siret,
        codeInsee: resolvedCodeInsee,
        suppression: null,
      },
      select: {
        id: true,
        suppression: true,
      },
      orderBy: [
        {
          suppression: {
            sort: 'desc',
            nulls: 'last',
          },
        },
        {
          creation: 'desc',
        },
      ],
    })

    if (existingStructure) {
      await undeleteStructureIfDeleted(existingStructure)
      return existingStructure
    }
  }

  // Step 2: Try to find existing structure by nom if no siret
  if (!siret) {
    const existingByNom = await prismaClient.structure.findFirst({
      where: {
        nom,
        codeInsee: resolvedCodeInsee,
      },
      select: {
        id: true,
        suppression: true,
      },
      orderBy: [
        {
          suppression: {
            sort: 'desc',
            nulls: 'last',
          },
        },
        {
          creation: 'desc',
        },
      ],
    })

    if (existingByNom) {
      await undeleteStructureIfDeleted(existingByNom)
      return existingByNom
    }
  }

  // Step 3: Fallback - reuse the geocoded address (already fetched) and create
  // Guard: re-check before creating to prevent duplicates
  const existingGuard = await findExistingBySiretOrNom({
    siret,
    nom,
    codeInsee: resolvedCodeInsee,
  })
  if (existingGuard) return existingGuard

  if (trustedBanData) {
    return prismaClient.structure.create({
      data: {
        id: v4(),
        siret,
        nom,
        adresse: trustedBanData.nom,
        commune: trustedBanData.commune,
        codePostal: trustedBanData.codePostal,
        codeInsee: trustedBanData.codeInsee,
        latitude: trustedBanData.latitude,
        longitude: trustedBanData.longitude,
        nomReferent,
        courrielReferent,
        telephoneReferent,
        creationParId,
      },
      select: {
        id: true,
      },
    })
  }

  // No geocoding result - create without coordinates
  return prismaClient.structure.create({
    data: {
      id: v4(),
      siret,
      nom,
      adresse,
      commune,
      codePostal,
      codeInsee,
      nomReferent,
      courrielReferent,
      telephoneReferent,
      creationParId,
    },
    select: {
      id: true,
    },
  })
}
