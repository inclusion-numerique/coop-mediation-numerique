import type { ProfilInscription } from '@app/web/features/inscription/domain'
import { UserId } from '@app/web/features/inscription/domain'
import { prismaClient } from '@app/web/prismaClient'
import { After, Before, setDefaultTimeout } from '@cucumber/cucumber'
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

const adresseDeTest = {
  adresse: '1 rue de la Paix',
  commune: 'Paris',
  codePostal: '75001',
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
  data: { nom?: string } = {},
): Promise<string> => {
  const id = v4()
  await prismaClient.lieuInclusion.create({
    data: { id, nom: data.nom ?? 'Lieu d’activité de test', ...adresseDeTest },
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

Before(async () => {
  inscriptionUserId = v4()
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
  await prismaClient.employeStructure.deleteMany({
    where: { userId: inscriptionUserId },
  })
  await prismaClient.mediateurEnActivite.deleteMany({
    where: { mediateur: { userId: inscriptionUserId } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { userId: inscriptionUserId },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { userId: inscriptionUserId },
  })
  await prismaClient.user.deleteMany({ where: { id: inscriptionUserId } })
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
  await prismaClient.personneMain.deleteMany({
    where: { coopId: inscriptionUserId },
  })
  await prismaClient.structureAdministrativeMain.deleteMany({
    where: { id: { in: [...trackedEmployeuseMainIds] } },
  })
  await prismaClient.adresseMain.deleteMany({
    where: { id: { in: [...trackedAdresseMainIds] } },
  })
})
