import { sessionUserSelect } from '@app/web/auth/getSessionUserFromSessionToken'
import {
  personneToEmployeuseActuelle,
  rattacherAUneEmployeuseDepuisSiret,
} from '@app/web/features/employeuse/server'
import { garantirCoordinateurDuDispositif } from '@app/web/features/utilisateurs/use-cases/dispositif/garantirCoordinateurDuDispositif'
import { prismaClient } from '@app/web/prismaClient'
import { getNextInscriptionStep, getStepPath } from '../../inscriptionFlow'
import {
  dispositifDepuisMain,
  profilDepuisDispositif,
} from './dispositifDepuisMain'

/**
 * Initialisation de l'inscription.
 *
 * Le dispositif conseiller numérique se lit désormais dans `main` — plus d'appel à l'API Dataspace.
 * La bascule ne change pas les règles du parcours : « connu du dispositif » remplace « trouvé dans
 * l'API », et le profil se déduit de la même table de décision.
 *
 * Ce qui disparaît en revanche, c'est la recopie : l'ancien chemin écrivait `is_conseiller_numerique`,
 * `dataspace_id` et `dataspace_user_id_pg` sur `coop.users`. Ces colonnes n'existent plus, et tout ce
 * qui les lisait dérive l'information par jointure.
 */
export type InitializeInscriptionResult = {
  nextStepPath: string | null
}

const debugStructureEmployeuseCreation = true

export type InitializeDebugLogger = (
  message: string,
  ...rest: unknown[]
) => void

const createDebugLogger = (enabled: boolean): InitializeDebugLogger => {
  if (!enabled) {
    return () => {
      // Intentional no-op when debug is disabled
    }
  }
  return (message: string, ...rest: unknown[]) => {
    // biome-ignore lint/suspicious/noConsole: Intentional debug logging
    console.log(`[initialize] ${message}`, ...rest)
  }
}

/** Crée le médiateur s'il manque — jamais de suppression, comme auparavant. */
const garantirMediateur = async (userId: string): Promise<string> => {
  const existant = await prismaClient.mediateur.findUnique({
    where: { userId },
    select: { id: true },
  })
  if (existant) return existant.id

  const cree = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  return cree.id
}

/**
 * Repli SIRET : quand le dispositif ne donne aucune employeuse, on tente celle déclarée à
 * l'inscription. L'échec est journalisé sans interrompre — l'étape « ma structure employeuse »
 * prendra le relais, elle, en refusant d'avancer.
 */
const replierSurSiret = async (
  userId: string,
  log: InitializeDebugLogger,
): Promise<void> => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      siret: true,
      personneMain: {
        select: {
          affectationsEmploi: {
            where: { estActive: true },
            select: { id: true },
          },
        },
      },
    },
  })

  const aDejaUneEmployeuse =
    (user?.personneMain?.affectationsEmploi.length ?? 0) > 0

  if (!user || aDejaUneEmployeuse || !user.siret) {
    log('Repli SIRET non applicable', {
      siret: user?.siret ?? null,
      aDejaUneEmployeuse,
    })
    return
  }

  const rattachement = await rattacherAUneEmployeuseDepuisSiret({
    userId,
    siret: user.siret,
  })
  log('Rattachement employeuse depuis SIRET', { resultat: rattachement._tag })
}

export const initializeInscription = async ({
  userId,
}: {
  userId: string
  email?: string
}): Promise<InitializeInscriptionResult> => {
  const log = createDebugLogger(debugStructureEmployeuseCreation)

  const dispositif = await dispositifDepuisMain(userId)
  const profilInscription = profilDepuisDispositif(dispositif)

  log('Dispositif lu dans main', { ...dispositif, profilInscription })

  if (profilInscription) {
    await prismaClient.user.update({
      where: { id: userId },
      data: { profilInscription },
      select: { id: true },
    })
  }

  // Le rôle coordinateur suit la même règle qu'avant : coordinateur ET dans le dispositif. La
  // garantie est celle de la connexion et du job nocturne — une seule définition, trois appelants.
  await garantirCoordinateurDuDispositif(userId)

  // ⚠ LES LIEUX D'ACTIVITÉ NE SONT PLUS PRÉ-REMPLIS.
  //
  // L'API Dataspace fournissait les lieux connus du dispositif, et l'inscription les importait une
  // fois pour toutes. `main` ne peut pas prendre le relais : ses affectations lieu
  // (`main.personne_affectations_lieu`) sont une VUE construite sur `coop.mediateurs_en_activite`,
  // donc sur ce que la coop sait déjà — et les 14 033 lignes de la table historique sont toutes de
  // source `coop`. Il n'existe aucune affectation lieu d'origine `idposte`.
  //
  // Conséquence assumée : un conseiller numérique qui s'inscrit déclare ses lieux à l'étape
  // `lieux-activite`, où le parcours l'emmène déjà faute de lieu existant. Rien n'est perdu pour les
  // comptes déjà inscrits, dont les lieux sont en base.
  if (dispositif.estConseillerNumerique && !dispositif.estCoordinateur) {
    await garantirMediateur(userId)
  }

  await replierSurSiret(userId, log)

  const updatedUser = await prismaClient.user.findUnique({
    where: { id: userId },
    select: sessionUserSelect,
  })

  if (!updatedUser) {
    throw new Error('User not found after initialization')
  }

  const hasLieuxActivite = (updatedUser.mediateur?._count.enActivite ?? 0) > 0

  const employeuseActuelle = personneToEmployeuseActuelle(
    updatedUser.personneMain,
  )

  log('État après initialisation', {
    hasStructureEmployeuse: employeuseActuelle !== null,
    hasLieuxActivite,
    profilInscription: updatedUser.profilInscription,
  })

  const nextStep = getNextInscriptionStep({
    currentStep: 'initialize',
    // « Connu du dispositif » remplace « trouvé dans l'API » : c'est le même embranchement.
    flowType: dispositif.connue ? 'withDataspace' : 'withoutDataspace',
    profilInscription: updatedUser.profilInscription,
    hasLieuxActivite,
    isConseillerNumerique: dispositif.estConseillerNumerique,
  })

  log('Initialisation terminée', { nextStep })

  return { nextStepPath: nextStep ? getStepPath(nextStep) : null }
}
