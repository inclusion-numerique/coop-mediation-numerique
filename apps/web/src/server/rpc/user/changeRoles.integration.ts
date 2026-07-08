import { prismaClient } from '@app/web/prismaClient'
import { userRouter } from '@app/web/server/rpc/user/userRouter'
import { createTestContext } from '@app/web/test/createTestContext'
import { testSessionUser } from '@app/web/test/testSessionUser'
import { v4 } from 'uuid'

describe('userRouter.changeRoles', () => {
  const utilisateurMediateurId = v4()
  const adminId = v4()

  beforeAll(async () => {
    await prismaClient.user.createMany({
      data: [
        {
          id: utilisateurMediateurId,
          email: `test+${utilisateurMediateurId}@inclusion-numerique.anct.gouv.fr`,
          inscriptionValidee: new Date(),
        },
        {
          id: adminId,
          email: `test+${adminId}@inclusion-numerique.anct.gouv.fr`,
          role: 'Admin',
        },
      ],
    })
    await prismaClient.mediateur.create({
      data: { id: v4(), userId: utilisateurMediateurId },
    })
  })

  afterAll(async () => {
    await prismaClient.mediateur.deleteMany({
      where: { userId: utilisateurMediateurId },
    })
    await prismaClient.mutation.deleteMany({
      where: { userId: { in: [utilisateurMediateurId, adminId] } },
    })
    await prismaClient.user.deleteMany({
      where: { id: { in: [utilisateurMediateurId, adminId] } },
    })
  })

  it('refuse de retirer le dernier profil de rôle d’un compte inscrit', async () => {
    await expect(
      userRouter
        .createCaller(
          createTestContext({
            user: {
              ...testSessionUser,
              id: adminId,
              role: 'Admin',
              emailVerified: new Date().toISOString(),
            },
          }),
        )
        .changeRoles({
          userId: utilisateurMediateurId,
          isMediateur: false,
          isCoordinateur: false,
        }),
    ).rejects.toThrow('Au moins un rôle est requis')

    const mediateur = await prismaClient.mediateur.findUnique({
      where: { userId: utilisateurMediateurId },
    })
    expect(mediateur).not.toBeNull()
  })
})
