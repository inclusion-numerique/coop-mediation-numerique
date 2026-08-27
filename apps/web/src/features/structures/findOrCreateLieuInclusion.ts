import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import { nomsCorrespondent } from '@app/web/libraries/nom-etablissement'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'

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

export type FindOrCreateInput = {
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

/**
 * Cherche un lieu existant au même endroit et sous une dénomination qui
 * correspond.
 *
 * Le SIRET n'y participe pas, bien qu'il soit stocké sur le lieu. Il identifie
 * une entité juridique, pas un endroit : une association dont le siège est à
 * Paris déclare légitimement ce SIRET pour son antenne de Nantes, et deux
 * structures peuvent partager l'adresse d'un tiers-lieu. La provenance de la
 * valeur n'y change rien — un SIRET exact de l'API entreprise ne dit toujours
 * pas où l'on se trouve.
 *
 * C'est pourquoi il n'y a plus de repli « même SIRET, n'importe quelle
 * commune » : il fusionnait précisément les antennes d'un même réseau.
 */
const findExistingByNom = async ({
  nom,
  codeInsee,
}: {
  nom: string
  codeInsee: string
}): Promise<{ id: string } | null> => {
  const existing = await prismaClient.lieuInclusion.findFirst({
    where: { nom, codeInsee, suppression: null },
    select: { id: true, suppression: true },
    orderBy: { creation: 'desc' },
  })

  if (!existing) return null

  await undeleteStructureIfDeleted(existing)
  return existing
}

const undeleteStructureIfDeleted = async ({
  id,
  suppression,
}: {
  id: string
  suppression: Date | null
}) => {
  if (suppression) {
    await prismaClient.lieuInclusion.update({
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
 * 3. Find existing Structure by nom + resolved codeInsee
 * 4. Fallback: create from the geocoded address (or raw fields if geocoding failed)
 *
 * Note : le SIRET ne sert à AUCUN rapprochement, quelle que soit sa provenance —
 * il identifie une entité juridique, pas un endroit (cf. `findExistingByNom`).
 * This is reusable for both V1 imports and Dataspace imports.
 */
export const findOrCreateLieuInclusion = async ({
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
}: FindOrCreateInput): Promise<{ id: string }> => {
  // If coopId is provided, it is the surest way to find the structure
  if (coopId) {
    const existingStructure = await prismaClient.lieuInclusion.findFirst({
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
  // exact (nom, codeInsee) lookup miss an existing active structure and
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

  // Step 1: Find existing Structure by nom + resolved codeInsee.
  // Le SIRET ne rapproche rien : cette étape en cherchait un identique dans la
  // commune et concluait à l'identité SANS regarder la dénomination, ce qui
  // confondait deux implantations d'une même structure.
  const existingByNom = await prismaClient.lieuInclusion.findFirst({
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

  // Step 3: Fallback - reuse the geocoded address (already fetched) and create
  // Guard: re-check before creating to prevent duplicates
  const existingGuard = await findExistingByNom({
    nom,
    codeInsee: resolvedCodeInsee,
  })
  if (existingGuard) return existingGuard

  if (trustedBanData) {
    return prismaClient.lieuInclusion.create({
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
  return prismaClient.lieuInclusion.create({
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
