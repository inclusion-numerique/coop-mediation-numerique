import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prismaClient } from '@/prismaClient'

const ids = {
  user: '00000000-0000-4000-8000-00000000c001',
  autreUser: '00000000-0000-4000-8000-00000000c002',
  coordinateurUser: '00000000-0000-4000-8000-00000000c003',
  mediateur: '00000000-0000-4000-8000-00000000c011',
  autreMediateur: '00000000-0000-4000-8000-00000000c012',
  coordinateur: '00000000-0000-4000-8000-00000000c013',
  lieu: '00000000-0000-4000-8000-00000000c021',
  tag: '00000000-0000-4000-8000-00000000c031',
}

const mediateurs = [ids.mediateur, ids.autreMediateur]

const nettoyer = async () => {
  await prismaClient.activitesTags.deleteMany({ where: { tagId: ids.tag } })
  await prismaClient.activitesCoordinationTags.deleteMany({
    where: { tagId: ids.tag },
  })
  await prismaClient.accompagnement.deleteMany({
    where: { activite: { mediateurId: { in: mediateurs } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurs } },
  })
  await prismaClient.activiteCoordination.deleteMany({
    where: { coordinateurId: ids.coordinateur },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: { in: mediateurs } },
  })
  await prismaClient.tag.deleteMany({ where: { id: ids.tag } })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: ids.lieu } })
  await prismaClient.coordinateur.deleteMany({
    where: { id: ids.coordinateur },
  })
  await prismaClient.mediateur.deleteMany({ where: { id: { in: mediateurs } } })
  await prismaClient.user.deleteMany({
    where: { id: { in: [ids.user, ids.autreUser, ids.coordinateurUser] } },
  })
}

const semerDesBeneficiaires = (mediateurId: string, nombre: number) =>
  Promise.all(
    Array.from({ length: nombre }, () =>
      prismaClient.beneficiaire
        .create({
          data: { mediateurId, prenom: 'Camille' },
          select: { id: true },
        })
        .then(({ id }) => id),
    ),
  )

const semerUneActivite = ({
  mediateurId = ids.mediateur,
  beneficiaires,
}: {
  readonly mediateurId?: string
  readonly beneficiaires: readonly string[]
}) =>
  prismaClient.activite
    .create({
      data: {
        mediateurId,
        type: 'Collectif',
        typeLieu: 'LieuActivite',
        structureId: ids.lieu,
        date: new Date('2026-11-02'),
        duree: 60,
        tags: { create: { tagId: ids.tag } },
        accompagnements: {
          create: beneficiaires.map((beneficiaireId) => ({ beneficiaireId })),
        },
      },
      select: { id: true },
    })
    .then(({ id }) => id)

const compteurs = async () => {
  const [mediateur, autreMediateur, lieu, tag] = await Promise.all([
    prismaClient.mediateur.findUniqueOrThrow({
      where: { id: ids.mediateur },
      select: {
        activitesCount: true,
        accompagnementsCount: true,
        beneficiairesCount: true,
      },
    }),
    prismaClient.mediateur.findUniqueOrThrow({
      where: { id: ids.autreMediateur },
      select: {
        activitesCount: true,
        accompagnementsCount: true,
        beneficiairesCount: true,
      },
    }),
    prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: ids.lieu },
      select: { activitesCount: true },
    }),
    prismaClient.tag.findUniqueOrThrow({
      where: { id: ids.tag },
      select: { accompagnementsCount: true },
    }),
  ])
  return { mediateur, autreMediateur, lieu, tag }
}

const accompagnementsDe = async (beneficiaireId: string) =>
  (
    await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: beneficiaireId },
      select: { accompagnementsCount: true },
    })
  ).accompagnementsCount

describe('compteurs tenus par la base', () => {
  beforeEach(async () => {
    await nettoyer()
    await prismaClient.user.createMany({
      data: [
        { id: ids.user, email: 'compteurs-1@example.com' },
        { id: ids.autreUser, email: 'compteurs-2@example.com' },
        { id: ids.coordinateurUser, email: 'compteurs-3@example.com' },
      ],
    })
    await prismaClient.mediateur.createMany({
      data: [
        { id: ids.mediateur, userId: ids.user },
        { id: ids.autreMediateur, userId: ids.autreUser },
      ],
    })
    await prismaClient.coordinateur.create({
      data: { id: ids.coordinateur, userId: ids.coordinateurUser },
    })
    await prismaClient.lieuInclusion.create({
      data: {
        id: ids.lieu,
        nom: 'Médiathèque des compteurs',
        adresse: '1 rue du Test',
        commune: 'Lyon',
        codePostal: '69001',
      },
    })
    await prismaClient.tag.create({ data: { id: ids.tag, nom: 'Compteurs' } })
  })

  afterEach(nettoyer)

  it('compte les activités, les accompagnements et les bénéficiaires saisis', async () => {
    const beneficiaires = await semerDesBeneficiaires(ids.mediateur, 3)
    const activiteId = await semerUneActivite({ beneficiaires })

    const activite = await prismaClient.activite.findUniqueOrThrow({
      where: { id: activiteId },
      select: { accompagnementsCount: true },
    })
    expect(activite.accompagnementsCount).toBe(3)
    expect(await accompagnementsDe(beneficiaires[0] ?? '')).toBe(1)
    expect((await compteurs()).mediateur).toEqual({
      activitesCount: 1,
      accompagnementsCount: 3,
      beneficiairesCount: 3,
    })
    expect((await compteurs()).lieu.activitesCount).toBe(1)
    expect((await compteurs()).tag.accompagnementsCount).toBe(3)
  })

  it('retire une activité supprimée de tous les compteurs, puis la rend à sa restauration', async () => {
    const beneficiaires = await semerDesBeneficiaires(ids.mediateur, 2)
    const activiteId = await semerUneActivite({ beneficiaires })

    await prismaClient.activite.update({
      where: { id: activiteId },
      data: { suppression: new Date() },
    })
    expect(await compteurs()).toMatchObject({
      mediateur: { activitesCount: 0, accompagnementsCount: 0 },
      lieu: { activitesCount: 0 },
      tag: { accompagnementsCount: 0 },
    })
    expect(await accompagnementsDe(beneficiaires[0] ?? '')).toBe(0)

    await prismaClient.activite.update({
      where: { id: activiteId },
      data: { suppression: null },
    })
    expect(await compteurs()).toMatchObject({
      mediateur: { activitesCount: 1, accompagnementsCount: 2 },
      lieu: { activitesCount: 1 },
      tag: { accompagnementsCount: 2 },
    })
    expect(await accompagnementsDe(beneficiaires[0] ?? '')).toBe(1)
  })

  it('ne compte plus un accompagnement retiré par la fusion de bénéficiaires en double', async () => {
    const [source, destination] = await semerDesBeneficiaires(ids.mediateur, 2)
    const activiteId = await semerUneActivite({
      beneficiaires: [source ?? '', destination ?? ''],
    })

    await prismaClient.accompagnement.deleteMany({
      where: { activiteId, beneficiaireId: source },
    })
    await prismaClient.beneficiaire.update({
      where: { id: source },
      data: { suppression: new Date() },
    })

    const activite = await prismaClient.activite.findUniqueOrThrow({
      where: { id: activiteId },
      select: { accompagnementsCount: true },
    })
    expect(activite.accompagnementsCount).toBe(1)
    expect(await compteurs()).toMatchObject({
      mediateur: { accompagnementsCount: 1, beneficiairesCount: 1 },
      tag: { accompagnementsCount: 1 },
    })
  })

  it("transfère les compteurs d'un médiateur à l'autre quand ses activités et ses bénéficiaires changent de compte", async () => {
    const beneficiaires = await semerDesBeneficiaires(ids.autreMediateur, 2)
    await semerUneActivite({
      mediateurId: ids.autreMediateur,
      beneficiaires,
    })

    await prismaClient.activite.updateMany({
      where: { mediateurId: ids.autreMediateur },
      data: { mediateurId: ids.mediateur },
    })
    await prismaClient.beneficiaire.updateMany({
      where: { mediateurId: ids.autreMediateur },
      data: { mediateurId: ids.mediateur },
    })

    const { mediateur, autreMediateur } = await compteurs()
    expect(mediateur).toEqual({
      activitesCount: 1,
      accompagnementsCount: 2,
      beneficiairesCount: 2,
    })
    expect(autreMediateur).toEqual({
      activitesCount: 0,
      accompagnementsCount: 0,
      beneficiairesCount: 0,
    })
  })

  it('compte les activités de coordination non supprimées dans les accompagnements du tag', async () => {
    const { id } = await prismaClient.activiteCoordination.create({
      data: {
        coordinateurId: ids.coordinateur,
        type: 'Animation',
        date: new Date('2026-11-02'),
        tags: { create: { tagId: ids.tag } },
      },
      select: { id: true },
    })
    expect((await compteurs()).tag.accompagnementsCount).toBe(1)

    await prismaClient.activiteCoordination.update({
      where: { id },
      data: { suppression: new Date() },
    })
    expect((await compteurs()).tag.accompagnementsCount).toBe(0)
  })

  it("ignore toute écriture d'un compteur qui ne vient pas de la base", async () => {
    const beneficiaires = await semerDesBeneficiaires(ids.mediateur, 1)
    const activiteId = await semerUneActivite({ beneficiaires })

    await prismaClient.mediateur.update({
      where: { id: ids.mediateur },
      data: {
        activitesCount: { increment: 10 },
        accompagnementsCount: 0,
        beneficiairesCount: 42,
      },
    })
    await prismaClient.activite.update({
      where: { id: activiteId },
      data: { accompagnementsCount: 99 },
    })
    await prismaClient.lieuInclusion.update({
      where: { id: ids.lieu },
      data: { activitesCount: 7 },
    })
    await prismaClient.tag.update({
      where: { id: ids.tag },
      data: { accompagnementsCount: 5 },
    })

    expect(await compteurs()).toMatchObject({
      mediateur: {
        activitesCount: 1,
        accompagnementsCount: 1,
        beneficiairesCount: 1,
      },
      lieu: { activitesCount: 1 },
      tag: { accompagnementsCount: 1 },
    })
  })
})
