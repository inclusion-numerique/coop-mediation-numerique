import {
  IdentiteEmployeuse,
  rattacherAUneEmployeuse,
} from '@app/web/features/employeuse'
import type { InitializeDebugLogger } from '@app/web/features/inscription/use-cases/initialize/initializeInscription'
import { fetchSiretApiData } from '@app/web/features/structures/siret/fetchSiretData'

// No-op logger for when debug logging is not needed
const noopLogger: InitializeDebugLogger = () => {
  // Intentional no-op
}

/**
 * Rattache un utilisateur à son employeuse à partir du seul SIRET, l'identité étant résolue par
 * l'API Recherche d'entreprises. Adaptateur : il traduit une réponse d'API en identité du domaine
 * et délègue le rattachement à la feature employeuse. Tolérant aux pannes — il journalise et rend
 * `null` plutôt que de jeter, car ses appelants (inscription, ProConnect) ne doivent pas échouer
 * pour autant.
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

  const siretResult = await fetchSiretApiData(siret)

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

  // Skip closed establishments
  if (etat_administratif === 'F') {
    log('SIRET validation failed: establishment closed', { siret })
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error(`Establishment ${siret} is closed`)
    return null
  }

  const adresseComplete = [
    adresse.numero_voie,
    adresse.indice_repetition_voie,
    adresse.type_voie,
    adresse.libelle_voie,
    adresse.complement_adresse,
  ]
    .filter((part) => Boolean(part) && part !== 'null')
    .join(' ')

  // Forme totale : une réponse d'API sans raison sociale ni commune ne permet pas de créer une
  // employeuse identifiable — on préfère ne rien écrire dans `main` (constructeur strict).
  const identite = IdentiteEmployeuse.safe({
    siret,
    denomination: personne_morale_attributs?.raison_sociale ?? '',
    adresse: {
      voie: adresseComplete,
      commune: adresse.libelle_commune ?? '',
      codePostal: adresse.code_postal,
      codeInsee: adresse.code_commune ?? null,
    },
  })

  if (!identite) {
    log('SIRET validation failed: identité insuffisante', { siret })
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error(
      `SIRET ${siret} : identité insuffisante pour créer l’employeuse`,
    )
    return null
  }

  const rattachement = await rattacherAUneEmployeuse({ userId, identite })

  log('Rattachement employeuse', { rattachement: rattachement._tag })

  return {
    structureMainId:
      rattachement._tag === 'rattachee' ? rattachement.employeuseId : null,
  }
}
