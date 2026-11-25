import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { rechercherDesLieuxAChoisir } from './lieux-a-choisir.query'

const ids = {
  utilisateur: 'a1f1c4e5-0000-4000-8000-000000000001',
  mediateur: 'a1f1c4e5-0000-4000-8000-000000000011',
  lieuAuNord: 'a1f1c4e5-0000-4000-8000-000000000021',
  lieuAuSud: 'a1f1c4e5-0000-4000-8000-000000000022',
  activite: 'a1f1c4e5-0000-4000-8000-000000000031',
} as const

const RECHERCHE = 'Compteurdeslieuxachoisir'

const nettoyer = async () => {
  await prismaClient.activite.deleteMany({
    where: { mediateurId: ids.mediateur },
  })
  await prismaClient.lieuInclusion.deleteMany({
    where: { id: { in: [ids.lieuAuNord, ids.lieuAuSud] } },
  })
  await prismaClient.mediateur.deleteMany({ where: { id: ids.mediateur } })
  await prismaClient.user.deleteMany({ where: { id: ids.utilisateur } })
}

const preparer = async () => {
  await nettoyer()
  await prismaClient.user.create({
    data: { id: ids.utilisateur, email: 'compteurs-lieux@example.com' },
  })
  await prismaClient.mediateur.create({
    data: { id: ids.mediateur, userId: ids.utilisateur },
  })
  await prismaClient.lieuInclusion.createMany({
    data: [
      { id: ids.lieuAuNord, nom: `${RECHERCHE} Nord` },
      { id: ids.lieuAuSud, nom: `${RECHERCHE} Sud` },
    ].map((lieu) => ({
      ...lieu,
      adresse: '1 rue du Test',
      commune: 'Lyon',
      codePostal: '69001',
      banId: '69381_0001_00001',
    })),
  })
  await prismaClient.activite.create({
    data: {
      id: ids.activite,
      mediateurId: ids.mediateur,
      type: 'Individuel',
      typeLieu: 'LieuActivite',
      structureId: ids.lieuAuSud,
      date: new Date('2026-11-02'),
      duree: 60,
    },
  })
}

const marquerLaSuppression = (suppression: Date | null) =>
  prismaClient.activite.update({
    where: { id: ids.activite },
    data: { suppression },
  })

const lieuxTrouves = async () =>
  (await rechercherDesLieuxAChoisir({ recherche: RECHERCHE, limite: 10 })).map(
    ({ value }) => value,
  )

describe('lieux à choisir, du plus au moins utilisé', () => {
  describe('après la saisie d’une activité dans un lieu', () => {
    beforeAll(preparer)

    afterAll(nettoyer)

    it('place en tête le lieu de l’activité', async () => {
      expect(await lieuxTrouves()).toEqual([ids.lieuAuSud, ids.lieuAuNord])
    })
  })

  describe('après la suppression de l’activité', () => {
    beforeAll(async () => {
      await preparer()
      await marquerLaSuppression(new Date())
    })

    afterAll(nettoyer)

    it('ne compte plus l’activité supprimée et revient à l’ordre des noms', async () => {
      expect(await lieuxTrouves()).toEqual([ids.lieuAuNord, ids.lieuAuSud])
    })
  })

  describe('après la restauration de l’activité supprimée', () => {
    beforeAll(async () => {
      await preparer()
      await marquerLaSuppression(new Date())
      await marquerLaSuppression(null)
    })

    afterAll(nettoyer)

    it('replace en tête le lieu de l’activité restaurée', async () => {
      expect(await lieuxTrouves()).toEqual([ids.lieuAuSud, ids.lieuAuNord])
    })
  })

  describe('après une écriture des compteurs qui ne vient pas de la base', () => {
    beforeAll(async () => {
      await preparer()
      await prismaClient.lieuInclusion.update({
        where: { id: ids.lieuAuNord },
        data: { activitesCount: 7 },
      })
      await prismaClient.lieuInclusion.update({
        where: { id: ids.lieuAuSud },
        data: { activitesCount: 0 },
      })
    })

    afterAll(nettoyer)

    it('garde l’ordre des compteurs tenus par la base', async () => {
      expect(await lieuxTrouves()).toEqual([ids.lieuAuSud, ids.lieuAuNord])
    })
  })
})
