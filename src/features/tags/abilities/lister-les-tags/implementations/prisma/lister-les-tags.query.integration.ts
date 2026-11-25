import { Page, PageSize, Sort } from '@arckit/resultset'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { type Acteur, MediateurId } from '../../../../domain'
import { listerLesTags } from './lister-les-tags.query'

const ids = {
  utilisateur: 'a1f1c4e4-0000-4000-8000-000000000001',
  coordinateurUtilisateur: 'a1f1c4e4-0000-4000-8000-000000000002',
  mediateur: 'a1f1c4e4-0000-4000-8000-000000000011',
  coordinateur: 'a1f1c4e4-0000-4000-8000-000000000012',
  beneficiaires: [
    'a1f1c4e4-0000-4000-8000-000000000021',
    'a1f1c4e4-0000-4000-8000-000000000022',
    'a1f1c4e4-0000-4000-8000-000000000023',
  ],
  activite: 'a1f1c4e4-0000-4000-8000-000000000031',
  activiteCoordination: 'a1f1c4e4-0000-4000-8000-000000000032',
  tag: 'a1f1c4e4-0000-4000-8000-000000000041',
} as const

const [source, destination] = ids.beneficiaires

const nettoyer = async () => {
  await prismaClient.activitesTags.deleteMany({ where: { tagId: ids.tag } })
  await prismaClient.activitesCoordinationTags.deleteMany({
    where: { tagId: ids.tag },
  })
  await prismaClient.accompagnement.deleteMany({
    where: { activite: { mediateurId: ids.mediateur } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: ids.mediateur },
  })
  await prismaClient.activiteCoordination.deleteMany({
    where: { coordinateurId: ids.coordinateur },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: ids.mediateur },
  })
  await prismaClient.tag.deleteMany({ where: { id: ids.tag } })
  await prismaClient.coordinateur.deleteMany({
    where: { id: ids.coordinateur },
  })
  await prismaClient.mediateur.deleteMany({ where: { id: ids.mediateur } })
  await prismaClient.user.deleteMany({
    where: { id: { in: [ids.utilisateur, ids.coordinateurUtilisateur] } },
  })
}

const preparer = async () => {
  await nettoyer()
  await prismaClient.user.createMany({
    data: [
      { id: ids.utilisateur, email: 'compteurs-tags-1@example.com' },
      {
        id: ids.coordinateurUtilisateur,
        email: 'compteurs-tags-2@example.com',
      },
    ],
  })
  await prismaClient.mediateur.create({
    data: { id: ids.mediateur, userId: ids.utilisateur },
  })
  await prismaClient.coordinateur.create({
    data: { id: ids.coordinateur, userId: ids.coordinateurUtilisateur },
  })
  await prismaClient.tag.create({
    data: {
      id: ids.tag,
      nom: 'Compteurs de la liste des tags',
      mediateurId: ids.mediateur,
    },
  })
}

const semerUneActivite = async (beneficiaires: readonly string[]) => {
  await prismaClient.beneficiaire.createMany({
    data: beneficiaires.map((id) => ({
      id,
      mediateurId: ids.mediateur,
      prenom: 'Camille',
      nom: 'Tags',
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
      tags: { create: { tagId: ids.tag } },
      accompagnements: {
        create: beneficiaires.map((beneficiaireId) => ({ beneficiaireId })),
      },
    },
  })
}

const marquerLaSuppression = (suppression: Date | null) =>
  prismaClient.activite.update({
    where: { id: ids.activite },
    data: { suppression },
  })

const semerUneActiviteDeCoordination = () =>
  prismaClient.activiteCoordination.create({
    data: {
      id: ids.activiteCoordination,
      coordinateurId: ids.coordinateur,
      type: 'Animation',
      date: new Date('2026-11-02'),
      tags: { create: { tagId: ids.tag } },
    },
  })

const mediateur: Acteur = {
  _tag: 'Mediateur',
  mediateurId: MediateurId(ids.mediateur),
  equipes: [],
  departement: null,
}

const accompagnementsDuTag = async () =>
  (
    await listerLesTags({
      acteur: mediateur,
      tri: Sort('visibilite', 'asc'),
      page: Page(1),
      pageSize: PageSize(10),
    })
  ).items
    .filter(({ tag }) => tag.id === ids.tag)
    .map(({ accompagnements }) => accompagnements)

describe('accompagnements du tag dans la liste des tags', () => {
  describe('après la saisie d’une activité', () => {
    beforeAll(async () => {
      await preparer()
      await semerUneActivite(ids.beneficiaires)
    })

    afterAll(nettoyer)

    it('compte les accompagnements de l’activité taguée', async () => {
      expect(await accompagnementsDuTag()).toEqual([3])
    })
  })

  describe('après la suppression de l’activité', () => {
    beforeAll(async () => {
      await preparer()
      await semerUneActivite([source, destination])
      await marquerLaSuppression(new Date())
    })

    afterAll(nettoyer)

    it('ne compte plus les accompagnements de l’activité supprimée', async () => {
      expect(await accompagnementsDuTag()).toEqual([0])
    })
  })

  describe('après la restauration de l’activité supprimée', () => {
    beforeAll(async () => {
      await preparer()
      await semerUneActivite([source, destination])
      await marquerLaSuppression(new Date())
      await marquerLaSuppression(null)
    })

    afterAll(nettoyer)

    it('compte de nouveau les accompagnements de l’activité restaurée', async () => {
      expect(await accompagnementsDuTag()).toEqual([2])
    })
  })

  describe('après la fusion de bénéficiaires en double', () => {
    beforeAll(async () => {
      await preparer()
      await semerUneActivite([source, destination])
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
      expect(await accompagnementsDuTag()).toEqual([1])
    })
  })

  describe('après la saisie d’une activité de coordination', () => {
    beforeAll(async () => {
      await preparer()
      await semerUneActiviteDeCoordination()
    })

    afterAll(nettoyer)

    it('compte l’activité de coordination taguée', async () => {
      expect(await accompagnementsDuTag()).toEqual([1])
    })
  })

  describe('après la suppression de l’activité de coordination', () => {
    beforeAll(async () => {
      await preparer()
      await semerUneActiviteDeCoordination()
      await prismaClient.activiteCoordination.update({
        where: { id: ids.activiteCoordination },
        data: { suppression: new Date() },
      })
    })

    afterAll(nettoyer)

    it('ne compte plus l’activité de coordination supprimée', async () => {
      expect(await accompagnementsDuTag()).toEqual([0])
    })
  })

  describe('après une écriture du compteur qui ne vient pas de la base', () => {
    beforeAll(async () => {
      await preparer()
      await semerUneActivite([source])
      await prismaClient.tag.update({
        where: { id: ids.tag },
        data: { accompagnementsCount: 5 },
      })
    })

    afterAll(nettoyer)

    it('garde le compte d’accompagnements tenu par la base', async () => {
      expect(await accompagnementsDuTag()).toEqual([1])
    })
  })
})
