import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import { mediateurDe } from '@/features/utilisateurs/domain'
import { ficheUtilisateur } from './fiche-utilisateur.query'

const ids = {
  utilisateur: 'a1f1c4e0-0000-4000-8000-000000000001',
  autreUtilisateur: 'a1f1c4e0-0000-4000-8000-000000000002',
  mediateur: 'a1f1c4e0-0000-4000-8000-000000000011',
  autreMediateur: 'a1f1c4e0-0000-4000-8000-000000000012',
  beneficiaires: [
    'a1f1c4e0-0000-4000-8000-000000000021',
    'a1f1c4e0-0000-4000-8000-000000000022',
    'a1f1c4e0-0000-4000-8000-000000000023',
  ],
  activite: 'a1f1c4e0-0000-4000-8000-000000000031',
} as const

const [source, destination, troisieme] = ids.beneficiaires

const mediateurs = [ids.mediateur, ids.autreMediateur]

const nettoyer = async () => {
  await prismaClient.accompagnement.deleteMany({
    where: { activite: { mediateurId: { in: mediateurs } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurs } },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: { in: mediateurs } },
  })
  await prismaClient.mediateur.deleteMany({ where: { id: { in: mediateurs } } })
  await prismaClient.user.deleteMany({
    where: { id: { in: [ids.utilisateur, ids.autreUtilisateur] } },
  })
}

const preparer = async () => {
  await nettoyer()
  await prismaClient.user.createMany({
    data: [
      { id: ids.utilisateur, email: 'compteurs-fiche-1@example.com' },
      { id: ids.autreUtilisateur, email: 'compteurs-fiche-2@example.com' },
    ],
  })
  await prismaClient.mediateur.createMany({
    data: [
      { id: ids.mediateur, userId: ids.utilisateur },
      { id: ids.autreMediateur, userId: ids.autreUtilisateur },
    ],
  })
}

const semerDesBeneficiaires = (
  mediateurId: string,
  beneficiaires: readonly string[],
) =>
  prismaClient.beneficiaire.createMany({
    data: beneficiaires.map((id) => ({
      id,
      mediateurId,
      prenom: 'Camille',
      nom: 'Fiche',
    })),
  })

const semerUneActivite = (
  mediateurId: string,
  beneficiaires: readonly string[],
) =>
  prismaClient.activite.create({
    data: {
      id: ids.activite,
      mediateurId,
      type: 'Collectif',
      typeLieu: 'ADistance',
      date: new Date('2026-11-02'),
      duree: 60,
      accompagnements: {
        create: beneficiaires.map((beneficiaireId) => ({ beneficiaireId })),
      },
    },
  })

const marquerLaSuppression = (suppression: Date | null) =>
  prismaClient.activite.update({
    where: { id: ids.activite },
    data: { suppression },
  })

const compteursDe = async (utilisateurId: string) => {
  const fiche = await ficheUtilisateur({
    utilisateurId,
    maintenant: new Date(),
  })
  const mediateur = fiche === null ? null : mediateurDe(fiche.rattachements)
  return mediateur === null
    ? null
    : { activites: mediateur.activites, beneficiaires: mediateur.beneficiaires }
}

describe('compteurs du médiateur sur sa fiche', () => {
  describe('après la saisie d’une activité', () => {
    beforeAll(async () => {
      await preparer()
      await semerDesBeneficiaires(ids.mediateur, ids.beneficiaires)
      await semerUneActivite(ids.mediateur, ids.beneficiaires)
    })

    afterAll(nettoyer)

    it('compte l’activité et les bénéficiaires saisis', async () => {
      expect(await compteursDe(ids.utilisateur)).toEqual({
        activites: 1,
        beneficiaires: 3,
      })
    })
  })

  describe('après la suppression d’une activité', () => {
    beforeAll(async () => {
      await preparer()
      await semerDesBeneficiaires(ids.mediateur, [source, destination])
      await semerUneActivite(ids.mediateur, [source, destination])
      await marquerLaSuppression(new Date())
    })

    afterAll(nettoyer)

    it('ne compte plus l’activité supprimée', async () => {
      expect(await compteursDe(ids.utilisateur)).toEqual({
        activites: 0,
        beneficiaires: 2,
      })
    })
  })

  describe('après la restauration d’une activité supprimée', () => {
    beforeAll(async () => {
      await preparer()
      await semerDesBeneficiaires(ids.mediateur, [source, destination])
      await semerUneActivite(ids.mediateur, [source, destination])
      await marquerLaSuppression(new Date())
      await marquerLaSuppression(null)
    })

    afterAll(nettoyer)

    it('compte de nouveau l’activité restaurée', async () => {
      expect(await compteursDe(ids.utilisateur)).toEqual({
        activites: 1,
        beneficiaires: 2,
      })
    })
  })

  describe('après la fusion de bénéficiaires en double', () => {
    beforeAll(async () => {
      await preparer()
      await semerDesBeneficiaires(ids.mediateur, [source, destination])
      await semerUneActivite(ids.mediateur, [source, destination])
      await prismaClient.accompagnement.deleteMany({
        where: { activiteId: ids.activite, beneficiaireId: source },
      })
      await prismaClient.beneficiaire.update({
        where: { id: source },
        data: { suppression: new Date() },
      })
    })

    afterAll(nettoyer)

    it('ne compte plus le bénéficiaire fusionné', async () => {
      expect(await compteursDe(ids.utilisateur)).toEqual({
        activites: 1,
        beneficiaires: 1,
      })
    })
  })

  describe('après le transfert des activités et des bénéficiaires d’un médiateur à l’autre', () => {
    beforeAll(async () => {
      await preparer()
      await semerDesBeneficiaires(ids.autreMediateur, [source, destination])
      await semerUneActivite(ids.autreMediateur, [source, destination])
      await prismaClient.activite.updateMany({
        where: { mediateurId: ids.autreMediateur },
        data: { mediateurId: ids.mediateur },
      })
      await prismaClient.beneficiaire.updateMany({
        where: { mediateurId: ids.autreMediateur },
        data: { mediateurId: ids.mediateur },
      })
    })

    afterAll(nettoyer)

    it('compte les activités et les bénéficiaires reçus par le médiateur qui les reprend', async () => {
      expect(await compteursDe(ids.utilisateur)).toEqual({
        activites: 1,
        beneficiaires: 2,
      })
    })

    it('ne compte plus rien pour le médiateur qui les cède', async () => {
      expect(await compteursDe(ids.autreUtilisateur)).toEqual({
        activites: 0,
        beneficiaires: 0,
      })
    })
  })

  describe('après une écriture des compteurs qui ne vient pas de la base', () => {
    beforeAll(async () => {
      await preparer()
      await semerDesBeneficiaires(ids.mediateur, [troisieme])
      await semerUneActivite(ids.mediateur, [troisieme])
      await prismaClient.mediateur.update({
        where: { id: ids.mediateur },
        data: {
          activitesCount: { increment: 10 },
          accompagnementsCount: 0,
          beneficiairesCount: 42,
        },
      })
    })

    afterAll(nettoyer)

    it('garde les compteurs tenus par la base', async () => {
      expect(await compteursDe(ids.utilisateur)).toEqual({
        activites: 1,
        beneficiaires: 1,
      })
    })
  })
})
