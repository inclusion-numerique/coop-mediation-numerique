import type { InitializeDebugLogger } from '@app/web/features/inscription/use-cases/initialize/initializeInscription'
import { findOrCreateStructureAdministrative } from '@app/web/features/structures/findOrCreateStructureAdministrative'
import { dualWriteEmployeuseAffectation } from '@app/web/features/structures/main/ensureAffectationEmploiMain'
import { fetchSiretApiData } from '@app/web/features/structures/siret/fetchSiretData'
import { prismaClient } from '@app/web/prismaClient'

// No-op logger for when debug logging is not needed
const noopLogger: InitializeDebugLogger = () => {
  // Intentional no-op
}

/**
 * Import structure employeuse from SIRET only (using the public Recherche d'entreprises API).
 * ADR-002 échange final : garantit l'employeuse dans `main.structure_administrative` et pose
 * l'affectation active main (plus d'emploi coop). Gracefully handles API errors - logs but doesn't throw.
 */
export const importStructureEmployeuseFromSiret = async ({
  userId,
  siret,
  log = noopLogger,
}: {
  userId: string
  siret: string
  log?: InitializeDebugLogger
}): Promise<{
  structureMainId: number | null
} | null> => {
  log('fetchSiretApiData: calling Recherche d’entreprises API', { siret })

  // Fetch full SIRET data from the public Recherche d'entreprises API
  const siretResult = await fetchSiretApiData(siret)

  // Handle API errors gracefully
  if ('error' in siretResult) {
    log('fetchSiretApiData: API error', {
      siret,
      statusCode: siretResult.error.statusCode,
      message: siretResult.error.message,
    })
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error(
      `Failed to fetch SIRET data for ${siret}:`,
      siretResult.error.statusCode,
      siretResult.error.message,
    )
    return null
  }

  log('fetchSiretApiData: success', { siret })

  const {
    data: {
      unite_legale: { personne_morale_attributs },
      etat_administratif,
      adresse,
    },
  } = siretResult

  log('SIRET API data parsed', {
    siret,
    raisonSociale: personne_morale_attributs?.raison_sociale ?? null,
    etatAdministratif: etat_administratif,
    codePostal: adresse.code_postal,
    codeCommune: adresse.code_commune,
    libelleCommune: adresse.libelle_commune,
  })

  // Validate that it's a personne morale with a name
  if (!personne_morale_attributs?.raison_sociale) {
    log('SIRET validation failed: no raison sociale', { siret })
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error(
      `SIRET ${siret} does not correspond to a personne morale with raison sociale`,
    )
    return null
  }

  // Skip closed establishments
  if (etat_administratif === 'F') {
    log('SIRET validation failed: establishment closed', { siret })
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error(`Establishment ${siret} is closed`)
    return null
  }

  // Build full address string
  const adresseComplete = [
    adresse.numero_voie,
    adresse.indice_repetition_voie,
    adresse.type_voie,
    adresse.libelle_voie,
    adresse.complement_adresse,
  ]
    .filter((part) => Boolean(part) && part !== 'null')
    .join(' ')

  log('Finding or creating structure', {
    siret,
    nom: personne_morale_attributs.raison_sociale,
    adresse: adresseComplete,
    codePostal: adresse.code_postal,
    codeInsee: adresse.code_commune || '',
    commune: adresse.libelle_commune || '',
  })

  // Use SIRET API data to find or create structure administrative (employeuse) — MAIN uniquement.
  const structure = await findOrCreateStructureAdministrative({
    siret,
    nom: personne_morale_attributs.raison_sociale,
    adresse: adresseComplete,
    codePostal: adresse.code_postal,
    codeInsee: adresse.code_commune || '',
    commune: adresse.libelle_commune || '',
  })

  log('Structure found or created', { structureMainId: structure.mainId })

  // Écriture MAIN : personne + affectation active (l'employeuse courante se lit depuis main).
  // ADR-002 échange final : plus d'emploi `coop.employes_structures`.
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })
  if (user) {
    await dualWriteEmployeuseAffectation({
      coopUserId: userId,
      email: user.email,
      structureMainId: structure.mainId,
    })
  }

  return { structureMainId: structure.mainId }
}
