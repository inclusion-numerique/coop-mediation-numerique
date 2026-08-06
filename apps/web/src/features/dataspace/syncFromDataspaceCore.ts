import { updateBrevoContact } from '@app/web/external-apis/brevo/updateBrevoContact'
import type {
  DataspaceLieuActivite,
  DataspaceMediateur,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { findOrCreateLieuInclusion } from '@app/web/features/structures/findOrCreateLieuInclusion'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'

/**
 * Core sync logic shared between initializeInscription and updateUserFromDataspaceData
 *
 * Business Rules:
 * - Dataspace null response → NO-OP
 * - Coordinateur (is_coordinateur AND is_conseiller_numerique) → create (never delete)
 * - is_conseiller_numerique flag → mis à jour sur `user` (source Brevo/dispositif)
 *
 * ADR-002 échange final : la synchro des STRUCTURES / EMPLOIS employeuses dans coop a été RETIRÉE.
 * L'employeuse d'un conseiller numérique vit dans `main.personne_affectations_emploi`
 * (`source=idposte`, possédée par l'Entrepôt) et se lit depuis main. Dupliquer ces emplois dans
 * `coop.employes_structures` / `coop.structure_administrative` n'avait plus d'utilité (données mortes,
 * non lues) — seule la bascule de statut (Brevo) et le coordinateur restent gérés ici.
 *
 * Note: Lieux d'activité are NOT synced here. They are only imported once during inscription.
 */

// ============================================================================
// Types
// ============================================================================

export type SyncChanges = {
  conseillerNumeriqueCreated: boolean
  conseillerNumeriqueRemoved: boolean
  coordinateurCreated: boolean
  coordinateurUpdated: boolean
  structuresSynced: number
  structuresRemoved: number
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build full address from Dataspace address format
 */
export const buildAdresseFromDataspace = (adresse: {
  numero_voie: number | null
  nom_voie: string | null
  repetition: string | null
}): string => {
  const parts: string[] = []

  if (adresse.numero_voie) {
    parts.push(adresse.numero_voie.toString())
  }

  if (adresse.repetition && adresse.repetition !== 'null') {
    parts.push(adresse.repetition)
  }

  if (adresse.nom_voie && adresse.nom_voie !== 'null') {
    parts.push(adresse.nom_voie)
  }

  return parts.join(' ').trim()
}

// ============================================================================
// Core Sync Operations
// ============================================================================

/**
 * Create Coordinateur if not exists (never delete)
 * Only creates if is_coordinateur is true from Dataspace
 */
export const upsertCoordinateur = async ({
  userId,
}: {
  userId: string
}): Promise<{ coordinateurId: string; created: boolean }> => {
  const existingCoordinateur = await prismaClient.coordinateur.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (existingCoordinateur) {
    return { coordinateurId: existingCoordinateur.id, created: false }
  }

  // Create new coordinateur
  const newCoordinateur = await prismaClient.coordinateur.create({
    data: {
      userId,
    },
    select: { id: true },
  })

  return { coordinateurId: newCoordinateur.id, created: true }
}

/**
 * Create Mediateur if not exists (never delete)
 * Only creates if explicitly called (typically during first-time lieux import)
 */
export const upsertMediateur = async ({
  userId,
}: {
  userId: string
}): Promise<{ mediateurId: string; created: boolean }> => {
  const existingMediateur = await prismaClient.mediateur.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (existingMediateur) {
    return { mediateurId: existingMediateur.id, created: false }
  }

  // Create new mediateur
  const newMediateur = await prismaClient.mediateur.create({
    data: {
      userId,
    },
    select: { id: true },
  })

  return { mediateurId: newMediateur.id, created: true }
}

/**
 * Import lieux d'activité from Dataspace data for a mediateur (one-time import)
 * Creates MediateurEnActivite links for each lieu
 * This is NOT part of regular sync - only called during inscription
 */
export const importLieuxActiviteFromDataspace = async ({
  mediateurId,
  lieuxActivite,
}: {
  mediateurId: string
  lieuxActivite: DataspaceLieuActivite[]
}): Promise<{ structureIds: string[] }> => {
  const structureIds: string[] = []

  for (const lieuActivite of lieuxActivite) {
    // Some lieux activite from dataspace are lacking required data, we ignore them :
    // e.g :     {
    //   "nom": "Médiathèque de Saint-Quentin-la-Poterie",
    //   "siret": null,
    //   "adresse": {
    //     "nom_voie": null,
    //     "code_insee": null,
    //     "repetition": null,
    //     "code_postal": null,
    //     "nom_commune": null,
    //     "numero_voie": null
    //   },
    //   "contact": null
    // },

    if (
      !lieuActivite.adresse.code_insee ||
      !lieuActivite.adresse.code_postal ||
      !lieuActivite.adresse.nom_commune ||
      !lieuActivite.adresse.nom_voie ||
      !lieuActivite.adresse.nom_voie.trim()
    ) {
      continue
    }

    const adresse = buildAdresseFromDataspace(lieuActivite.adresse)

    // Find or create structure
    const structure = await findOrCreateLieuInclusion({
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

    structureIds.push(structure.id)

    // Create mediateurEnActivite link if not exists
    const existingActivite = await prismaClient.mediateurEnActivite.findFirst({
      where: {
        mediateurId,
        structureId: structure.id,
        suppression: null,
        fin: null,
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
          debut: new Date(),
        },
      })
    }
  }

  return { structureIds }
}

// ============================================================================
// Main Sync Core Function
// ============================================================================

/**
 * Core idempotent sync from Dataspace data
 *
 * This function handles:
 * 1. Coordinateur creation (only if both is_coordinateur and
 *    is_conseiller_numerique are true, never delete)
 * 2. User `is_conseiller_numerique` flag + transition markers (Brevo)
 *
 * ADR-002 échange final : plus de sync des structures/emplois employeuses dans coop (main = source
 * de vérité, lue depuis `main.personne_affectations_emploi`).
 *
 * Note: Lieux d'activité are NOT synced here. They are only imported once during inscription.
 *
 * @param userId - The user ID to sync
 * @param dataspaceData - The Dataspace API response (null = no-op)
 * @param wasConseillerNumerique - Previous CN status (for transition logic)
 */
export const syncFromDataspaceCore = async ({
  userId,
  dataspaceData,
  wasConseillerNumerique = false,
}: {
  userId: string
  dataspaceData: DataspaceMediateur | null
  wasConseillerNumerique?: boolean
}): Promise<{
  success: boolean
  noOp: boolean
  changes: SyncChanges
  coordinateurId: string | null
}> => {
  const changes: SyncChanges = {
    conseillerNumeriqueCreated: false,
    conseillerNumeriqueRemoved: false,
    coordinateurCreated: false,
    coordinateurUpdated: false,
    structuresSynced: 0,
    structuresRemoved: 0,
  }

  // Null response = NO-OP
  if (dataspaceData === null) {
    return {
      success: true,
      noOp: true,
      changes,
      coordinateurId: null,
    }
  }

  const isConseillerNumeriqueInApi = dataspaceData.is_conseiller_numerique
  const isCoordinateurInApi = dataspaceData.is_coordinateur

  // --- Update User base fields ---
  // On ne réécrit les champs de contenu (et donc ne bumpe `updated`) que s'ils
  // changent vraiment ; sinon on n'avance que le marqueur technique
  // `lastSyncedFromDataspace` (classé « non-contenu »), pour éviter un churn
  // quotidien de toute la table `user` lors de la synchro Dataspace.
  const currentUser = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      dataspaceId: true,
      dataspaceUserIdPg: true,
      isConseillerNumerique: true,
    },
  })

  const userContentChanged =
    currentUser?.dataspaceId !== dataspaceData.id ||
    currentUser?.dataspaceUserIdPg !== dataspaceData.pg_id ||
    currentUser?.isConseillerNumerique !== isConseillerNumeriqueInApi

  await prismaClient.user.update({
    where: { id: userId },
    data: userContentChanged
      ? {
          dataspaceId: dataspaceData.id,
          dataspaceUserIdPg: dataspaceData.pg_id,
          lastSyncedFromDataspace: new Date(),
          isConseillerNumerique: isConseillerNumeriqueInApi,
        }
      : { lastSyncedFromDataspace: new Date() },
  })

  // --- Coordinateur: Only create if coordo is in dispositif (never delete) ---
  const coordinateurId =
    isCoordinateurInApi && isConseillerNumeriqueInApi
      ? await upsertCoordinateur({ userId }).then((result) => {
          if (result.created) {
            changes.coordinateurCreated = true
          }
          return result.coordinateurId
        })
      : null

  // --- Conseiller Numérique flag transitions (pour Brevo) ---
  // ADR-002 échange final : plus de sync des structures/emplois employeuses (main = source de vérité).
  if (isConseillerNumeriqueInApi && !wasConseillerNumerique) {
    changes.conseillerNumeriqueCreated = true
  }
  if (!isConseillerNumeriqueInApi && wasConseillerNumerique) {
    changes.conseillerNumeriqueRemoved = true
  }

  if (
    changes.conseillerNumeriqueCreated ||
    changes.conseillerNumeriqueRemoved ||
    changes.coordinateurCreated
  ) {
    await updateBrevoContact(userId)
  }

  return {
    success: true,
    noOp: false,
    changes,
    coordinateurId,
  }
}
