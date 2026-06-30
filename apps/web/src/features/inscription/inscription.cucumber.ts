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

const trackedStructureIds = new Set<string>()

export const currentInscriptionUserId = (): UserId => UserId(inscriptionUserId)

/** Crée une structure de test (suivie pour nettoyage) et renvoie son id. */
export const seedStructure = async (
  data: { nom?: string } = {},
): Promise<string> => {
  const id = v4()
  await prismaClient.structure.create({
    data: {
      id,
      nom: data.nom ?? 'Structure de test',
      adresse: '1 rue de la Paix',
      commune: 'Paris',
      codePostal: '75001',
    },
  })
  trackedStructureIds.add(id)
  return id
}

Before(async () => {
  inscriptionUserId = v4()
  trackedStructureIds.clear()
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
  await prismaClient.structure.deleteMany({
    where: { id: { in: [...trackedStructureIds] } },
  })
})
