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

const adresseDeTest = {
  adresse: '1 rue de la Paix',
  commune: 'Paris',
  codePostal: '75001',
}

export const currentInscriptionUserId = (): UserId => UserId(inscriptionUserId)

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

Before(async () => {
  inscriptionUserId = v4()
  trackedStructureEmployeuseIds.clear()
  trackedLieuActiviteIds.clear()
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
    where: { id: { in: [...trackedLieuActiviteIds] } },
  })
})
