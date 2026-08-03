import { getSessionUser } from '@app/web/auth/getSessionUser'
import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { prismaClient } from '@app/web/prismaClient'
import { testSessionUser } from '@app/web/test/testSessionUser'
import { v4 } from 'uuid'
import { renseignerStructureEmployeuseAction } from './renseigner-structure-employeuse.action'

// L'étape d'inscription délègue le rattachement à la feature employeuse (couverte par son BDD) et
// n'ajoute que l'horodatage de l'étape. Ce test verrouille la composition des deux : l'utilisateur
// vient de la session, et l'étape n'est horodatée que si le rattachement a abouti.
// La structure main est pré-créée pour que la garantie la retrouve par sa clé métier — test
// déterministe et hors-ligne (searchAdresse -> null neutralise le géocodage BAN).
jest.mock('@app/web/external-apis/apiAdresse', () => ({
  searchAdresse: jest.fn(),
}))
const mockedSearchAdresse = searchAdresse as jest.MockedFunction<
  typeof searchAdresse
>

jest.mock('@app/web/auth/getSessionUser', () => ({
  getSessionUser: jest.fn(),
}))
const mockedGetSessionUser = getSessionUser as jest.MockedFunction<
  typeof getSessionUser
>

describe('renseignerStructureEmployeuseAction', () => {
  const userId = v4()
  const siret = '93429789600011'
  const nom = 'Employeuse main'
  const state = { mainStructureId: 0 }

  const structure = {
    nom,
    siret,
    adresse: '10 rue de la Bascule',
    commune: 'Nantes',
    codePostal: '44000',
    codeInsee: '44109',
    source: 'api' as const,
  }

  beforeAll(async () => {
    mockedSearchAdresse.mockResolvedValue(null)
    mockedGetSessionUser.mockResolvedValue({
      ...testSessionUser,
      id: userId,
    })

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

  it('rattache l’utilisateur de la session et horodate l’étape', async () => {
    const result = await renseignerStructureEmployeuseAction({ structure })

    expect(result).toMatchObject({ success: true, data: { rattachee: true } })

    const { structureEmployeuseRenseignee } =
      await prismaClient.user.findUniqueOrThrow({
        where: { id: userId },
        select: { structureEmployeuseRenseignee: true },
      })
    expect(structureEmployeuseRenseignee).not.toBeNull()

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
