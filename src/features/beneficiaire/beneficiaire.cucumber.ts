import { After, Before, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { Prisma } from '@/generated/prisma/client'

setDefaultTimeout(60_000)

/**
 * Support Cucumber partagé pour la feature bénéficiaire.
 * Les hooks de cycle de vie vivent ici une seule fois ; les fichiers .steps.ts
 * ne définissent que Given/When/Then et s'appuient sur ces helpers, ce qui évite
 * les interférences entre hooks de plusieurs fichiers.
 */
const UTILISATEUR_DE_TEST = 'e59fda11-a62a-4cc4-aadc-7c8ebf837026'

export const testMediateurId = MediateurId(
  '1599abd5-e053-4a2e-835c-99b9e56a2538',
)

const semerLeMediateurDeTest = async (
  utilisateurId: string,
  mediateurId: string,
  courriel: string,
) => {
  await prismaClient.user.upsert({
    where: { id: utilisateurId },
    create: { id: utilisateurId, email: courriel, isFixture: true },
    update: {},
  })
  await prismaClient.mediateur.upsert({
    where: { id: mediateurId },
    create: { id: mediateurId, userId: utilisateurId },
    update: {},
  })
}

const trackedBeneficiaireIds = new Set<string>()

export const suivreLeBeneficiaire = (id: string): void => {
  trackedBeneficiaireIds.add(id)
}

export const nombreDeBeneficiairesDuMediateur = async (): Promise<number> =>
  (
    await prismaClient.mediateur.findUniqueOrThrow({
      where: { id: testMediateurId },
      select: { beneficiairesCount: true },
    })
  ).beneficiairesCount

let beneficiairesCountBefore = 0

export const nombreDeBeneficiairesAuDebutDuScenario = (): number =>
  beneficiairesCountBefore

/** Crée un bénéficiaire de test (suivi pour nettoyage). */
export const seedBeneficiaire = async (
  data: Partial<Prisma.BeneficiaireUncheckedCreateInput> = {},
): Promise<string> => {
  const id = data.id ?? v4()
  await prismaClient.beneficiaire.create({
    data: { anonyme: false, ...data, id, mediateurId: testMediateurId },
  })
  suivreLeBeneficiaire(id)
  return id
}

BeforeAll({ timeout: 120_000 }, async () => {
  await semerLeMediateurDeTest(
    UTILISATEUR_DE_TEST,
    testMediateurId,
    'beneficiaire-cucumber@test.local',
  )
})

Before(async () => {
  trackedBeneficiaireIds.clear()
  beneficiairesCountBefore = await nombreDeBeneficiairesDuMediateur()
})

After(async () => {
  if (trackedBeneficiaireIds.size > 0) {
    await prismaClient.beneficiaire.deleteMany({
      where: { id: { in: [...trackedBeneficiaireIds] } },
    })
  }
})

/**
 * Portefeuille isolé pour l'ability `anonymiser-portefeuille`.
 *
 * Elle efface TOUT le portefeuille d'un médiateur : elle ne peut donc pas
 * s'exercer sur le médiateur de fixtures que se partagent les autres scénarios.
 * Un compte jetable est créé pour chaque scénario, et retiré derrière lui.
 */
type PortefeuilleSeme = {
  readonly userId: string
  readonly mediateurId: string
}

let portefeuille: PortefeuilleSeme | undefined

export const portefeuilleSeme = (): PortefeuilleSeme => {
  if (!portefeuille) throw new Error('Aucun portefeuille semé')
  return portefeuille
}

export const semerPortefeuille = async (): Promise<PortefeuilleSeme> => {
  const userId = v4()

  await prismaClient.user.create({
    data: { id: userId, email: `portefeuille-${userId}@example.com` },
  })

  const mediateur = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })

  await prismaClient.beneficiaire.createMany({
    data: [1, 2].map((rang) => ({
      mediateurId: mediateur.id,
      prenom: `Paul${rang}`,
      nom: 'Durand',
      telephone: '+33611111111',
      email: `paul${rang}.durand@example.com`,
      notes: 'Note confidentielle',
      adresse: '2 rue des Lilas',
      anneeNaissance: 1980,
      commune: 'Reims',
      genre: 'Masculin' as const,
    })),
  })

  portefeuille = { userId, mediateurId: mediateur.id }

  return portefeuille
}

After(async () => {
  const semé = portefeuille
  portefeuille = undefined
  if (!semé) return

  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: semé.mediateurId },
  })
  await prismaClient.mediateur.deleteMany({ where: { id: semé.mediateurId } })
  await prismaClient.user.deleteMany({ where: { id: semé.userId } })
})
