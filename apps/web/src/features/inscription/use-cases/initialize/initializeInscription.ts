import { sessionUserSelect } from '@app/web/auth/getSessionUserFromSessionToken'
import {
  personneToEmployeuseActuelle,
  rattacherAUneEmployeuseDepuisSiret,
} from '@app/web/features/employeuse/server'
import { garantirCoordinateurDuDispositif } from '@app/web/features/utilisateurs/use-cases/dispositif/garantirCoordinateurDuDispositif'
import { prismaClient } from '@app/web/prismaClient'
import { getNextInscriptionStep, getStepPath } from '../../inscriptionFlow'
import {
  type DispositifPersonne,
  dispositifDepuisMain,
  profilDepuisDispositif,
} from './dispositifDepuisMain'
import { importerLieuxActiviteDepuisMain } from './importerLieuxActiviteDepuisMain'

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

/**
 * Les lieux du dispositif ne sont importés qu'une fois, et seulement si l'utilisateur n'en a aucun :
 * après quoi ils lui appartiennent, et un ré-import écraserait ses propres choix.
 */
const importerLieuxUneSeuleFois = async ({
  userId,
  mediateurId,
  log,
}: {
  userId: string
  mediateurId: string
  log: InitializeDebugLogger
}): Promise<void> => {
  const mediateur = await prismaClient.mediateur.findUnique({
    where: { id: mediateurId },
    select: {
      _count: {
        select: { enActivite: { where: { suppression: null, fin: null } } },
      },
    },
  })

  if ((mediateur?._count.enActivite ?? 0) > 0) {
    log('Lieux déjà présents, import ignoré', {
      existants: mediateur?._count.enActivite,
    })
    return
  }

  const { structureIds } = await importerLieuxActiviteDepuisMain({
    userId,
    mediateurId,
  })

  if (structureIds.length === 0) return

  await prismaClient.user.update({
    where: { id: userId },
    data: { importedLieuxFromDataspace: new Date() },
    select: { id: true },
  })

  log('Lieux d’activité importés depuis main', { count: structureIds.length })
}

/**
 * Le médiateur n'est créé que pour qui exerce : un coordinateur pur (coordinateur sans lieu
 * d'activité) n'en a pas besoin. Règle inchangée, sur des valeurs dérivées.
 */
const doitAvoirUnMediateur = (
  dispositif: DispositifPersonne,
  aDesLieux: boolean,
): boolean =>
  dispositif.estConseillerNumerique &&
  (!dispositif.estCoordinateur || aDesLieux)

/** Combien de lieux le dispositif propose, sans rien écrire : sert à décider du rôle médiateur. */
const lieuxDisponibles = async (userId: string): Promise<number> => {
  const [row] = await prismaClient.$queryRaw<{ total: bigint }[]>`
    SELECT count(DISTINCT li.structure_coop_id) AS total
    FROM main.personne p
    JOIN main.personne_affectations_lieu al
      ON al.personne_id = p.id AND al.est_active
    JOIN main.lieu_inclusion li
      ON li.id = al.lieu_id AND li.deleted_at IS NULL
    WHERE p.coop_id = ${userId}::uuid
      AND li.structure_coop_id IS NOT NULL`

  return Number(row?.total ?? 0)
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

  // Le médiateur d'abord : sans lui, aucun lieu ne peut être rattaché. Il n'est créé que pour qui
  // exerce — un coordinateur pur n'en a pas besoin.
  const lieuxDuDispositif = await lieuxDisponibles(userId)

  if (doitAvoirUnMediateur(dispositif, lieuxDuDispositif > 0)) {
    await importerLieuxUneSeuleFois({
      userId,
      mediateurId: await garantirMediateur(userId),
      log,
    })
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
