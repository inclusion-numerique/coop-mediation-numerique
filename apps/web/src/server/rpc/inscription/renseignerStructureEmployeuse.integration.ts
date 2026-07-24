import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { prismaClient } from '@app/web/prismaClient'
import { inscriptionRouter } from '@app/web/server/rpc/inscription/inscriptionRouter'
import { createTestContext } from '@app/web/test/createTestContext'
import { testSessionUser } from '@app/web/test/testSessionUser'
import { v4 } from 'uuid'

// Le chemin de création passe la structure par son id (coopId) : findOrCreate la retrouve sans
// géocoder. On neutralise quand même l'appel réseau BAN par sécurité.
jest.mock('@app/web/external-apis/apiAdresse', () => ({
  searchAdresse: jest.fn(),
}))
const mockedSearchAdresse = searchAdresse as jest.MockedFunction<
  typeof searchAdresse
>

describe('inscriptionRouter.renseignerStructureEmployeuse — dual-write main', () => {
  const userId = v4()
  const coopStructureId = v4()
  const siret = '93429789600011'
  const state = { mainStructureId: 0 }

  const structureEmployeuse = {
    id: coopStructureId,
    nom: 'Employeuse dual-write',
    siret,
    adresseBan: {
      id: 'ban-test',
      nom: '10 rue de la Bascule',
      commune: 'Nantes',
      codePostal: '44000',
      codeInsee: '44109',
      contexte: '44, Loire-Atlantique',
      latitude: 47.2,
      longitude: -1.55,
    },
  }

  beforeAll(async () => {
    mockedSearchAdresse.mockResolvedValue(null)

    await prismaClient.user.create({
      data: {
        id: userId,
        email: `dualwrite+${userId}@test.gouv.fr`,
        profilInscription: 'Mediateur',
        acceptationCgu: new Date(),
      },
    })

    await prismaClient.structureAdministrative.create({
      data: {
        id: coopStructureId,
        siret,
        nom: structureEmployeuse.nom,
        adresse: structureEmployeuse.adresseBan.nom,
        commune: 'Nantes',
        codePostal: '44000',
        codeInsee: '44109',
        source: 'coop',
      },
    })

    // Main SA pré-liée par structure_coop_id : ensureStructureAdministrativeMain la retrouve sans API.
    const mainStructure = await prismaClient.structureAdministrativeMain.create(
      {
        data: {
          siret,
          denominationSirene: structureEmployeuse.nom,
          structureCoopId: coopStructureId,
        },
        select: { id: true },
      },
    )
    state.mainStructureId = mainStructure.id
  })

  afterAll(async () => {
    await prismaClient.employeStructure.deleteMany({ where: { userId } })
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: { structureAdministrativeId: state.mainStructureId },
    })
    await prismaClient.personneMain.deleteMany({ where: { coopId: userId } })
    await prismaClient.structureAdministrativeMain.delete({
      where: { id: state.mainStructureId },
    })
    await prismaClient.structureAdministrative.delete({
      where: { id: coopStructureId },
    })
    await prismaClient.mutation.deleteMany({ where: { userId } })
    await prismaClient.user.delete({ where: { id: userId } })
  })

  it('écrit personne + affectation main (est_active) en même temps que employes_structures', async () => {
    await inscriptionRouter
      .createCaller(
        createTestContext({
          user: {
            ...testSessionUser,
            id: userId,
            emailVerified: new Date().toISOString(),
          },
        }),
      )
      .renseignerStructureEmployeuse({ userId, structureEmployeuse })

    // Côté coop : l'emploi porte l'uuid coop ET l'id main (dual-write existant).
    const emploi = await prismaClient.employeStructure.findFirstOrThrow({
      where: { userId, suppression: null },
      select: { structureId: true, structureMainId: true },
    })
    expect(emploi.structureId).toBe(coopStructureId)
    expect(emploi.structureMainId).toBe(state.mainStructureId)

    // Côté main : personne reliée par coop_id + affectation active.
    const personne = await prismaClient.personneMain.findUniqueOrThrow({
      where: { coopId: userId },
      select: { id: true },
    })
    const affectation =
      await prismaClient.personneAffectationEmploiMain.findFirstOrThrow({
        where: {
          personneId: personne.id,
          structureAdministrativeId: state.mainStructureId,
        },
        select: { source: true, estActive: true },
      })
    expect(affectation.source).toBe('coop')
    expect(affectation.estActive).toBe(true)
  })
})
