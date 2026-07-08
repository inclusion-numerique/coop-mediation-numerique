import { prismaClient } from '@app/web/prismaClient'
import { inscriptionRouter } from '@app/web/server/rpc/inscription/inscriptionRouter'
import { createTestContext } from '@app/web/test/createTestContext'
import { testSessionUser } from '@app/web/test/testSessionUser'
import { v4 } from 'uuid'

describe('inscriptionRouter.validerInscription', () => {
  const utilisateurSansProfilId = v4()
  const utilisateurMediateurId = v4()

  beforeAll(async () => {
    await prismaClient.user.createMany({
      data: [
        {
          id: utilisateurSansProfilId,
          email: `test+${utilisateurSansProfilId}@inclusion-numerique.anct.gouv.fr`,
          profilInscription: 'Mediateur',
          acceptationCgu: new Date(),
          structureEmployeuseRenseignee: new Date(),
        },
        {
          id: utilisateurMediateurId,
          email: `test+${utilisateurMediateurId}@inclusion-numerique.anct.gouv.fr`,
          profilInscription: 'Mediateur',
          acceptationCgu: new Date(),
          structureEmployeuseRenseignee: new Date(),
        },
      ],
    })
    await prismaClient.mediateur.create({
      data: { id: v4(), userId: utilisateurMediateurId },
    })
  })

  afterAll(async () => {
    await prismaClient.mediateur.deleteMany({
      where: {
        userId: { in: [utilisateurSansProfilId, utilisateurMediateurId] },
      },
    })
    await prismaClient.mutation.deleteMany({
      where: {
        userId: { in: [utilisateurSansProfilId, utilisateurMediateurId] },
      },
    })
    await prismaClient.user.deleteMany({
      where: { id: { in: [utilisateurSansProfilId, utilisateurMediateurId] } },
    })
  })

  const validerInscriptionPour = (userId: string) =>
    inscriptionRouter
      .createCaller(
        createTestContext({
          user: {
            ...testSessionUser,
            id: userId,
            emailVerified: new Date().toISOString(),
          },
        }),
      )
      .validerInscription({ userId, cguAcceptee: true })

  it('refuse la validation d’un compte sans aucun profil de rôle', async () => {
    await expect(
      validerInscriptionPour(utilisateurSansProfilId),
    ).rejects.toThrow(
      'Impossible de valider une inscription sans profil médiateur ou coordinateur',
    )

    const utilisateur = await prismaClient.user.findUniqueOrThrow({
      where: { id: utilisateurSansProfilId },
      select: { inscriptionValidee: true },
    })
    expect(utilisateur.inscriptionValidee).toBeNull()
  })

  it('valide l’inscription d’un compte avec un profil médiateur', async () => {
    await validerInscriptionPour(utilisateurMediateurId)

    const utilisateur = await prismaClient.user.findUniqueOrThrow({
      where: { id: utilisateurMediateurId },
      select: { inscriptionValidee: true },
    })
    expect(utilisateur.inscriptionValidee).not.toBeNull()
  })
})
