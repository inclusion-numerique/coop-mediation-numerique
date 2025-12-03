import type { DataspaceLieuActivite } from '@app/web/external-apis/dataspace/dataSpaceApiClient'
import { findOrCreateStructure } from '@app/web/features/structures/findOrCreateStructure'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'

/**
 * Build full address from Dataspace address format
 */
const buildAdresseFromDataspace = (adresse: {
  numero_voie: number
  nom_voie: string
  repetition: string | null
}): string => {
  const parts = [adresse.numero_voie.toString()]

  if (adresse.repetition) {
    parts.push(adresse.repetition)
  }

  parts.push(adresse.nom_voie)

  return parts.join(' ').trim()
}

/**
 * Import a single lieu d'activité from Dataspace API data
 */
const importSingleLieuActivite = async ({
  mediateurId,
  lieuActivite,
}: {
  mediateurId: string
  lieuActivite: DataspaceLieuActivite
}): Promise<{ structureId: string }> => {
  const adresse = buildAdresseFromDataspace(lieuActivite.adresse)

  // Use generic helper to find or create structure
  const structure = await findOrCreateStructure({
    siret: lieuActivite.siret,
    nom: lieuActivite.nom,
    adresse,
    codePostal: lieuActivite.adresse.code_postal,
    codeInsee: lieuActivite.adresse.code_insee,
    commune: lieuActivite.adresse.nom_commune,
    nomReferent: lieuActivite.contact
      ? `${lieuActivite.contact.prenom} ${lieuActivite.contact.nom}`.trim()
      : null,
    courrielReferent:
      lieuActivite.contact?.courriels?.mail_gestionnaire ??
      lieuActivite.contact?.courriels?.mail_pro ??
      null,
    telephoneReferent: lieuActivite.contact?.telephone ?? null,
  })

  // Create mediateurEnActivite link if not exists
  const existingActivite = await prismaClient.mediateurEnActivite.findFirst({
    where: {
      mediateurId,
      structureId: structure.id,
      suppression: null,
    },
    select: {
      id: true,
    },
  })

  if (!existingActivite) {
    await prismaClient.mediateurEnActivite.create({
      data: {
        id: v4(),
        mediateurId,
        structureId: structure.id,
      },
    })
  }

  return { structureId: structure.id }
}

/**
 * Import all lieux d'activité from Dataspace API data
 */
export const importLieuxActiviteFromDataspace = async ({
  mediateurId,
  lieuxActivite,
}: {
  mediateurId: string
  lieuxActivite: DataspaceLieuActivite[]
}): Promise<{ structureIds: string[] }> => {
  const results = await Promise.all(
    lieuxActivite.map((lieuActivite) =>
      importSingleLieuActivite({ mediateurId, lieuActivite }),
    ),
  )

  return {
    structureIds: results.map((result) => result.structureId),
  }
}

