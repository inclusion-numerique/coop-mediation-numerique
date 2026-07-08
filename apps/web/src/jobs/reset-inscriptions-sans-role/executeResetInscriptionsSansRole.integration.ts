import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { executeResetInscriptionsSansRole } from './executeResetInscriptionsSansRole'

const compteSansRoleId = v4()
const compteMediateurId = v4()
const compteNonInscritId = v4()

const compteSansRole = {
  id: compteSansRoleId,
  email: `test+${compteSansRoleId}@inclusion-numerique.anct.gouv.fr`,
  profilInscription: 'Mediateur' as const,
  acceptationCgu: new Date(),
  structureEmployeuseRenseignee: new Date(),
  inscriptionValidee: new Date(),
  hasSeenOnboarding: new Date(),
  donneesConseillerNumeriqueV1Importees: new Date(),
}

describe('executeResetInscriptionsSansRole', () => {
  beforeEach(async () => {
    await prismaClient.user.createMany({
      data: [
        compteSansRole,
        {
          id: compteMediateurId,
          email: `test+${compteMediateurId}@inclusion-numerique.anct.gouv.fr`,
          profilInscription: 'Mediateur',
          acceptationCgu: new Date(),
          inscriptionValidee: new Date(),
        },
        {
          id: compteNonInscritId,
          email: `test+${compteNonInscritId}@inclusion-numerique.anct.gouv.fr`,
        },
      ],
    })
    await prismaClient.mediateur.create({
      data: { id: v4(), userId: compteMediateurId },
    })
  })

  afterEach(async () => {
    await prismaClient.mediateur.deleteMany({
      where: { userId: compteMediateurId },
    })
    await prismaClient.mutation.deleteMany({
      where: {
        userId: {
          in: [compteSansRoleId, compteMediateurId, compteNonInscritId],
        },
      },
    })
    await prismaClient.user.deleteMany({
      where: {
        id: { in: [compteSansRoleId, compteMediateurId, compteNonInscritId] },
      },
    })
  })

  test('en dry run, recense les comptes sans rien modifier', async () => {
    const result = await executeResetInscriptionsSansRole({
      name: 'reset-inscriptions-sans-role',
    })

    expect(result.total).toBeGreaterThanOrEqual(1)
    expect(result.dryRun).toBe(true)
    expect(result.reset).toBe(0)

    const compte = await prismaClient.user.findUniqueOrThrow({
      where: { id: compteSansRoleId },
      select: { inscriptionValidee: true },
    })
    expect(compte.inscriptionValidee).not.toBeNull()
  })

  test('réinitialise l’inscription des comptes validés sans profil de rôle', async () => {
    const result = await executeResetInscriptionsSansRole({
      name: 'reset-inscriptions-sans-role',
      payload: { dryRun: false },
    })

    expect(result.dryRun).toBe(false)
    expect(result.reset).toBeGreaterThanOrEqual(1)

    const compte = await prismaClient.user.findUniqueOrThrow({
      where: { id: compteSansRoleId },
      select: {
        inscriptionValidee: true,
        profilInscription: true,
        acceptationCgu: true,
        structureEmployeuseRenseignee: true,
        hasSeenOnboarding: true,
        donneesConseillerNumeriqueV1Importees: true,
      },
    })
    expect(compte).toEqual({
      inscriptionValidee: null,
      profilInscription: null,
      acceptationCgu: null,
      structureEmployeuseRenseignee: null,
      hasSeenOnboarding: null,
      donneesConseillerNumeriqueV1Importees: null,
    })

    const mutation = await prismaClient.mutation.findFirst({
      where: { userId: compteSansRoleId, nom: 'ResetInscription' },
    })
    expect(mutation).not.toBeNull()
  })

  test('ne touche pas aux comptes inscrits avec un profil de rôle', async () => {
    await executeResetInscriptionsSansRole({
      name: 'reset-inscriptions-sans-role',
      payload: { dryRun: false },
    })

    const compte = await prismaClient.user.findUniqueOrThrow({
      where: { id: compteMediateurId },
      select: { inscriptionValidee: true, profilInscription: true },
    })
    expect(compte.inscriptionValidee).not.toBeNull()
    expect(compte.profilInscription).toBe('Mediateur')
  })

  test('ne touche pas aux comptes dont l’inscription n’est pas validée', async () => {
    await executeResetInscriptionsSansRole({
      name: 'reset-inscriptions-sans-role',
      payload: { dryRun: false },
    })

    const mutation = await prismaClient.mutation.findFirst({
      where: { userId: compteNonInscritId, nom: 'ResetInscription' },
    })
    expect(mutation).toBeNull()
  })
})
