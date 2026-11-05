import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { alignerUnCompte } from './executeAlignerLeRegistreDesPersonnes'

describe('aligner un compte sur le registre', () => {
  const comptes: string[] = []
  const maintenant = new Date('2026-11-05T12:00:00.000Z')

  const creerUnMediateur = async () => {
    const id = v4()
    comptes.push(id)
    const mediateur = await prismaClient.mediateur.create({
      data: {
        isVisible: true,
        user: {
          create: {
            id,
            email: `aligner+${id}@test.gouv.fr`,
            firstName: 'camille',
            lastName: 'Martin',
            isFixture: true,
          },
        },
      },
      select: { id: true },
    })

    return {
      id,
      deleted: null,
      lastLogin: null,
      mediateur: { id: mediateur.id, isVisible: true, aUnLieuActif: true },
    }
  }

  const lire = (coopId: string) =>
    prismaClient.personneMain.findUniqueOrThrow({ where: { coopId } })

  afterAll(async () => {
    await prismaClient.personneMain.deleteMany({
      where: { coopId: { in: comptes } },
    })
    await prismaClient.mediateur.deleteMany({
      where: { userId: { in: comptes } },
    })
    await prismaClient.user.deleteMany({ where: { id: { in: comptes } } })
  })

  it('crée la ligne alignée sur le compte', async () => {
    const compte = await creerUnMediateur()

    await alignerUnCompte({ compte, masquer: false, maintenant })

    expect(await lire(compte.id)).toMatchObject({
      nom: 'MARTIN',
      prenom: 'Camille',
      isMediateur: true,
      isVisible: true,
      editedBy: 'coop',
      updatedAtCoop: maintenant,
    })
  })

  it('masque le médiateur et reporte ce masquage sur la ligne', async () => {
    const compte = await creerUnMediateur()

    await alignerUnCompte({ compte, masquer: true, maintenant })

    expect(await lire(compte.id)).toMatchObject({ isVisible: false })
    expect(
      await prismaClient.mediateur.findUniqueOrThrow({
        where: { id: compte.mediateur.id },
        select: { isVisible: true, visibiliteChoisieLe: true },
      }),
    ).toEqual({ isVisible: false, visibiliteChoisieLe: null })
  })
})
