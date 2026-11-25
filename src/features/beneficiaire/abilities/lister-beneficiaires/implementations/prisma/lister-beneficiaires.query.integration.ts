import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { listerBeneficiaires } from './lister-beneficiaires.query'

const ids = {
  utilisateur: 'a1f1c4e2-0000-4000-8000-000000000001',
  mediateur: 'a1f1c4e2-0000-4000-8000-000000000011',
  beneficiaires: [
    'a1f1c4e2-0000-4000-8000-000000000021',
    'a1f1c4e2-0000-4000-8000-000000000022',
    'a1f1c4e2-0000-4000-8000-000000000023',
  ],
  activite: 'a1f1c4e2-0000-4000-8000-000000000031',
} as const

const nettoyer = async () => {
  await prismaClient.accompagnement.deleteMany({
    where: { activite: { mediateurId: ids.mediateur } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: ids.mediateur },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: ids.mediateur },
  })
  await prismaClient.mediateur.deleteMany({ where: { id: ids.mediateur } })
  await prismaClient.user.deleteMany({ where: { id: ids.utilisateur } })
}

const preparer = async () => {
  await nettoyer()
  await prismaClient.user.create({
    data: { id: ids.utilisateur, email: 'compteurs-beneficiaires@example.com' },
  })
  await prismaClient.mediateur.create({
    data: { id: ids.mediateur, userId: ids.utilisateur },
  })
  await prismaClient.beneficiaire.createMany({
    data: ids.beneficiaires.map((id) => ({
      id,
      mediateurId: ids.mediateur,
      prenom: 'Camille',
      nom: 'Compteurs',
    })),
  })
  await prismaClient.activite.create({
    data: {
      id: ids.activite,
      mediateurId: ids.mediateur,
      type: 'Collectif',
      typeLieu: 'ADistance',
      date: new Date('2026-11-02'),
      duree: 60,
      accompagnements: {
        create: ids.beneficiaires.map((beneficiaireId) => ({ beneficiaireId })),
      },
    },
  })
}

const marquerLaSuppression = (suppression: Date | null) =>
  prismaClient.activite.update({
    where: { id: ids.activite },
    data: { suppression },
  })

const accompagnementsDesBeneficiaires = async () =>
  (
    await listerBeneficiaires({ mediateurId: MediateurId(ids.mediateur) })
  ).items.map(({ accompagnementsCount }) => accompagnementsCount)

describe('accompagnements des bénéficiaires dans la liste du médiateur', () => {
  describe('après la saisie d’une activité', () => {
    beforeAll(preparer)

    afterAll(nettoyer)

    it('compte l’accompagnement de chaque bénéficiaire', async () => {
      expect(await accompagnementsDesBeneficiaires()).toEqual([1, 1, 1])
    })
  })

  describe('après la suppression de l’activité', () => {
    beforeAll(async () => {
      await preparer()
      await marquerLaSuppression(new Date())
    })

    afterAll(nettoyer)

    it('ne compte plus l’accompagnement de l’activité supprimée', async () => {
      expect(await accompagnementsDesBeneficiaires()).toEqual([0, 0, 0])
    })
  })

  describe('après la restauration de l’activité supprimée', () => {
    beforeAll(async () => {
      await preparer()
      await marquerLaSuppression(new Date())
      await marquerLaSuppression(null)
    })

    afterAll(nettoyer)

    it('compte de nouveau l’accompagnement de l’activité restaurée', async () => {
      expect(await accompagnementsDesBeneficiaires()).toEqual([1, 1, 1])
    })
  })
})
