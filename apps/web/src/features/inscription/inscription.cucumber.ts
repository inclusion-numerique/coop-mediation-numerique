import type { ProfilInscription } from '@app/web/features/inscription/domain'
import { UserId } from '@app/web/features/inscription/domain'
import { prismaClient } from '@app/web/prismaClient'
import { After, Before, setDefaultTimeout } from '@cucumber/cucumber'
import type { Typologie } from '@prisma/client'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

/**
 * Support Cucumber partagé pour la feature inscription. Chaque scénario démarre
 * sur un utilisateur fraîchement authentifié mais non démarré (sans profil ni
 * rôle), nettoyé après coup. Les .steps.ts ne définissent que Given/When/Then.
 */
let inscriptionUserId = ''

const trackedStructureEmployeuseIds = new Set<string>()
const trackedLieuActiviteIds = new Set<string>()
const trackedEmployeuseMainIds = new Set<number>()
const trackedAdresseMainIds = new Set<number>()
// Le lieu matérialisé depuis une employeuse ne reprend plus son id : on le
// retrouve, pour le nettoyage comme en production, par sa dénomination.
const trackedEmployeuseMainNoms = new Set<string>()
// Utilisateurs autres que celui du scénario (collègues de la même employeuse) :
// suivis à part, le nettoyage ne connaissant sinon que l'utilisateur courant.
const trackedAutresUserIds = new Set<string>()

/**
 * Toute adresse de la coop vient de l'API adresse, qui rend systématiquement un
 * code INSEE — aucun des 12 477 lieux de la base n'en est dépourvu. Les fixtures
 * le portent donc aussi : c'est par lui, et lui seul, que se ratissent les
 * candidats à la corrélation.
 */
const adresseDeTest = {
  adresse: '1 rue de la Paix',
  commune: 'Paris',
  codePostal: '75001',
  codeInsee: '75101',
}

export const currentInscriptionUserId = (): UserId => UserId(inscriptionUserId)

/**
 * Amène l'utilisateur courant à l'état `EnCours` sans passer par l'ability
 * `choisir-profil` : les scénarios des étapes suivantes ont besoin d'un profil
 * posé, pas d'une dépendance vers une autre ability.
 */
export const seedProfilChoisi = async (
  profil: ProfilInscription,
): Promise<void> => {
  await prismaClient.user.update({
    where: { id: inscriptionUserId },
    data: { profilInscription: profil, acceptationCgu: new Date() },
  })
}

/** Amène l'utilisateur courant à l'état terminal `Validee` sur un profil donné. */
export const seedInscriptionValidee = async (
  profil: ProfilInscription,
): Promise<void> => {
  await prismaClient.user.update({
    where: { id: inscriptionUserId },
    data: {
      profilInscription: profil,
      acceptationCgu: new Date(),
      inscriptionValidee: new Date(),
    },
  })
}

/**
 * Structure employeuse de test (suivie pour nettoyage). Depuis le split, un
 * emploi pointe sur `StructureAdministrative` — à ne pas confondre avec le lieu
 * d'activité, qui est un `LieuInclusion`.
 */
export const seedStructureEmployeuse = async (
  data: { nom?: string } = {},
): Promise<string> => {
  const id = v4()
  await prismaClient.structureAdministrative.create({
    data: { id, nom: data.nom ?? 'Structure de test', ...adresseDeTest },
  })
  trackedStructureEmployeuseIds.add(id)
  return id
}

/** Lieu d'activité de test (suivi pour nettoyage) : cible de `MediateurEnActivite`. */
export const seedLieuActivite = async (
  data: {
    nom?: string
    /** Un SIRET de fixture est réputé vérifié (API entreprise), comme en prod. */
    siret?: string | null
    /** SIRET de provenance inconnue (ex. cartographie) : sans date de vérification. */
    siretNonVerifie?: string | null
    structureCartographieNationaleId?: string | null
    visiblePourCartographieNationale?: boolean
    supprime?: boolean
    typologies?: Typologie[]
    adresse?: {
      adresse: string
      commune: string
      codePostal: string
      codeInsee: string | null
    }
    position?: { latitude: number; longitude: number }
  } = {},
): Promise<string> => {
  const id = v4()
  const now = new Date()
  await prismaClient.lieuInclusion.create({
    data: {
      id,
      nom: data.nom ?? 'Lieu d’activité de test',
      siret: data.siret ?? data.siretNonVerifie ?? null,
      synchronisationSiret: data.siret == null ? null : now,
      structureCartographieNationaleId:
        data.structureCartographieNationaleId ?? null,
      visiblePourCartographieNationale:
        data.visiblePourCartographieNationale ?? false,
      suppression: data.supprime ? now : null,
      // Les écrans de création imposent au moins une typologie : un lieu de la
      // coop en porte toujours une, et la corrélation compare des typologies
      // déclarées de part et d'autre.
      typologies: data.typologies ?? ['ASSO'],
      ...(data.adresse ?? adresseDeTest),
      ...(data.position ?? {}),
    },
  })
  trackedLieuActiviteIds.add(id)
  return id
}

/** Suit un lieu créé hors seed (ex. matérialisé par une ability) pour le nettoyage. */
export const trackLieuActivite = (id: string): void => {
  trackedLieuActiviteIds.add(id)
}

/**
 * Employeuse de test dans `main` (suivie pour nettoyage). Depuis l'échange final
 * de l'ADR-002, l'employeuse est une `main.structure_administrative` et c'est son
 * identifiant entier que reçoivent les écrans d'inscription — à ne pas confondre
 * avec la `coop.structure_administrative` de `seedStructureEmployeuse`.
 */
export const seedEmployeuseMain = async (
  data: { nom?: string } = {},
): Promise<number> => {
  const nom = data.nom ?? 'Employeuse main de test'

  const adresse = await prismaClient.adresseMain.create({
    data: {
      numeroVoie: 1,
      nomVoie: 'rue de la Paix',
      nomCommune: adresseDeTest.commune,
      codePostal: adresseDeTest.codePostal,
      codeInsee: '75101',
    },
    select: { id: true },
  })

  const structure = await prismaClient.structureAdministrativeMain.create({
    data: { denominationAntenne: nom, adresseId: adresse.id },
    select: { id: true },
  })

  trackedAdresseMainIds.add(adresse.id)
  trackedEmployeuseMainIds.add(structure.id)
  trackedEmployeuseMainNoms.add(nom)

  return structure.id
}

/**
 * Rattache un utilisateur à une employeuse `main` par le chemin que lit la
 * production : `coop.users → main.personne` (par `coop_id`) → affectation
 * active. Sans lui, l'employeuse existe mais n'est celle de personne — et les
 * abilities qui la dérivent de l'acteur ne trouvent rien.
 *
 * Idempotent des deux côtés : un utilisateur peut être rattaché à plusieurs
 * employeuses, et deux scénarios peuvent rejouer le même rattachement.
 */
export const rattacherAEmployeuseMain = async ({
  userId,
  structureAdministrativeId,
}: {
  userId: string
  structureAdministrativeId: number
}): Promise<void> => {
  const personne = await prismaClient.personneMain.upsert({
    where: { coopId: userId },
    create: { coopId: userId },
    update: {},
    select: { id: true },
  })

  await prismaClient.personneAffectationEmploiMain.upsert({
    where: {
      personneId_structureAdministrativeId_source: {
        personneId: personne.id,
        structureAdministrativeId,
        source: 'coop',
      },
    },
    create: {
      personneId: personne.id,
      structureAdministrativeId,
      source: 'coop',
      estActive: true,
    },
    update: { estActive: true },
  })
}

/**
 * Médiateur tiers rattaché à la même employeuse : de quoi vérifier qu'un lieu
 * matérialisé depuis une employeuse est partagé, et non recréé par collègue.
 */
export const seedCollegueMediateur = async (): Promise<UserId> => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `collegue-${userId}@test.local` },
  })
  await prismaClient.mediateur.create({ data: { id: v4(), userId } })
  trackedAutresUserIds.add(userId)
  return UserId(userId)
}

Before(async () => {
  inscriptionUserId = v4()
  trackedAutresUserIds.clear()
  trackedStructureEmployeuseIds.clear()
  trackedLieuActiviteIds.clear()
  trackedEmployeuseMainIds.clear()
  trackedAdresseMainIds.clear()
  trackedEmployeuseMainNoms.clear()
  await prismaClient.user.create({
    data: {
      id: inscriptionUserId,
      email: `inscription-${inscriptionUserId}@test.local`,
    },
  })
})

After(async () => {
  const userIds = [inscriptionUserId, ...trackedAutresUserIds]
  await prismaClient.employeStructure.deleteMany({
    where: { userId: { in: userIds } },
  })
  await prismaClient.mediateurEnActivite.deleteMany({
    where: { mediateur: { userId: { in: userIds } } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { userId: { in: userIds } },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { userId: { in: userIds } },
  })
  await prismaClient.personneAffectationEmploiMain.deleteMany({
    where: { personne: { coopId: { in: userIds } } },
  })
  await prismaClient.personneMain.deleteMany({
    where: { coopId: { in: userIds } },
  })
  await prismaClient.user.deleteMany({ where: { id: { in: userIds } } })
  await prismaClient.structureAdministrative.deleteMany({
    where: { id: { in: [...trackedStructureEmployeuseIds] } },
  })
  await prismaClient.lieuInclusion.deleteMany({
    // Inclut les employeuses matérialisées en lieu par l'ability « structure
    // employeuse en lieu d'activité » : elles ne reprennent plus l'id de la
    // structure, on les retrouve donc par leur dénomination.
    where: {
      OR: [
        {
          id: {
            in: [...trackedLieuActiviteIds, ...trackedStructureEmployeuseIds],
          },
        },
        { nom: { in: [...trackedEmployeuseMainNoms] } },
      ],
    },
  })
  await prismaClient.personneAffectationEmploiMain.deleteMany({
    where: { structureAdministrativeId: { in: [...trackedEmployeuseMainIds] } },
  })
  await prismaClient.structureAdministrativeMain.deleteMany({
    where: { id: { in: [...trackedEmployeuseMainIds] } },
  })
  await prismaClient.adresseMain.deleteMany({
    where: { id: { in: [...trackedAdresseMainIds] } },
  })
})
