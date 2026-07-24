import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { prismaClient } from '@app/web/prismaClient'
import { inscriptionRouter } from '@app/web/server/rpc/inscription/inscriptionRouter'
import { createTestContext } from '@app/web/test/createTestContext'
import { testSessionUser } from '@app/web/test/testSessionUser'
import { v4 } from 'uuid'

// ADR-002 échange final : renseigner l'employeuse n'écrit QUE main (personne + affectation active),
// plus aucun `coop.employes_structures`. `findOrCreateStructureAdministrative` déduplique la structure
// main par la clé métier (siret, denomination_antenne) -> on pré-crée la ligne main pour un test
// déterministe et hors-ligne (searchAdresse -> null neutralise le géocodage BAN).
jest.mock('@app/web/external-apis/apiAdresse', () => ({
  searchAdresse: jest.fn(),
}))
const mockedSearchAdresse = searchAdresse as jest.MockedFunction<
  typeof searchAdresse
>

describe('inscriptionRouter.renseignerStructureEmployeuse — écriture main', () => {
  const userId = v4()
  const siret = '93429789600011'
  const nom = 'Employeuse main'
  const state = { mainStructureId: 0 }

  const structureEmployeuse = {
    nom,
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
        email: `mainwrite+${userId}@test.gouv.fr`,
        profilInscription: 'Mediateur',
        acceptationCgu: new Date(),
      },
    })

    // Ligne main pré-existante, retrouvée par la clé métier (siret, denomination_antenne).
    const mainStructure = await prismaClient.structureAdministrativeMain.create(
      {
        data: {
          siret,
          denominationSirene: nom,
          denominationAntenne: nom,
        },
        select: { id: true },
      },
    )
    state.mainStructureId = mainStructure.id
  })

  afterAll(async () => {
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: { structureAdministrativeId: state.mainStructureId },
    })
    await prismaClient.personneMain.deleteMany({ where: { coopId: userId } })
    await prismaClient.structureAdministrativeMain.delete({
      where: { id: state.mainStructureId },
    })
    await prismaClient.mutation.deleteMany({ where: { userId } })
    await prismaClient.user.delete({ where: { id: userId } })
  })

  it('écrit personne + affectation main (est_active) et aucun emploi coop', async () => {
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

    // Aucun emploi coop n'est créé (échange final : plus de `coop.employes_structures`).
    const emploisCount = await prismaClient.employeStructure.count({
      where: { userId },
    })
    expect(emploisCount).toBe(0)

    // Côté main : personne reliée par coop_id + affectation active sur la structure attendue.
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
