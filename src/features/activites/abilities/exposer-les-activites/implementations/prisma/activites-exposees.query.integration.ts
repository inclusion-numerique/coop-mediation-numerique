import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { Horodatage } from '../../domain'
import { activitesExposees } from './activites-exposees.query'

const ids = {
  utilisateur: 'a1f1c4e3-0000-4000-8000-000000000001',
  mediateur: 'a1f1c4e3-0000-4000-8000-000000000011',
  beneficiaires: [
    'a1f1c4e3-0000-4000-8000-000000000021',
    'a1f1c4e3-0000-4000-8000-000000000022',
    'a1f1c4e3-0000-4000-8000-000000000023',
  ],
  activite: 'a1f1c4e3-0000-4000-8000-000000000031',
} as const

const [source, destination] = ids.beneficiaires

const CREATION = new Date('2103-05-07T00:00:00.000Z')

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

const preparer = async (beneficiaires: readonly string[]) => {
  await nettoyer()
  await prismaClient.user.create({
    data: { id: ids.utilisateur, email: 'compteurs-activites@example.com' },
  })
  await prismaClient.mediateur.create({
    data: { id: ids.mediateur, userId: ids.utilisateur },
  })
  await prismaClient.beneficiaire.createMany({
    data: beneficiaires.map((id) => ({
      id,
      mediateurId: ids.mediateur,
      prenom: 'Camille',
      nom: 'Exposee',
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
      creation: CREATION,
      accompagnements: {
        create: beneficiaires.map((beneficiaireId) => ({ beneficiaireId })),
      },
    },
  })
}

const accompagnementsDeLActivite = async () =>
  (
    await activitesExposees({
      criteres: { creeesDepuis: Horodatage(CREATION), modifieesDepuis: null },
      take: 10,
      curseur: null,
    })
  ).activites
    .filter(({ id }) => id === ids.activite)
    .map(({ accompagnementsCount }) => accompagnementsCount)

describe('accompagnements de l’activité exposée', () => {
  describe('après la saisie', () => {
    beforeAll(() => preparer(ids.beneficiaires))

    afterAll(nettoyer)

    it('compte les accompagnements saisis', async () => {
      expect(await accompagnementsDeLActivite()).toEqual([3])
    })
  })

  describe('après la fusion de bénéficiaires en double', () => {
    beforeAll(async () => {
      await preparer([source, destination])
      await prismaClient.accompagnement.deleteMany({
        where: { activiteId: ids.activite, beneficiaireId: source },
      })
      await prismaClient.beneficiaire.update({
        where: { id: source },
        data: { suppression: new Date() },
      })
    })

    afterAll(nettoyer)

    it('ne compte plus l’accompagnement retiré par la fusion', async () => {
      expect(await accompagnementsDeLActivite()).toEqual([1])
    })
  })

  describe('après une écriture du compteur qui ne vient pas de la base', () => {
    beforeAll(async () => {
      await preparer([source])
      await prismaClient.activite.update({
        where: { id: ids.activite },
        data: { accompagnementsCount: 99 },
      })
    })

    afterAll(nettoyer)

    it('garde le compte d’accompagnements tenu par la base', async () => {
      expect(await accompagnementsDeLActivite()).toEqual([1])
    })
  })
})
