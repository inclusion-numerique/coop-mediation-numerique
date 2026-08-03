import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import { conseillerNumerique } from '@app/fixtures/users/conseillerNumerique'
import { mediateurSansActivites } from '@app/fixtures/users/mediateurSansActivites'
import {
  ensureAffectationEmploiMain,
  ensurePersonneMain,
  rattacherAUneEmployeuseDepuisSiret,
} from '@app/web/features/employeuse'
import { prismaClient } from '@app/web/prismaClient'
import { importStructureEmployeuseFromProConnect } from './importStructureEmployeuseFromProConnect'

// Ce que ProConnect décide lui reste : à qui il délègue le rattachement, et quand il s'abstient.
// Le rattachement lui-même appartient à la feature employeuse (couvert par son BDD) — on le mocke
// pour n'observer ici que la décision.
jest.mock('@app/web/features/employeuse', () => ({
  ...jest.requireActual('@app/web/features/employeuse'),
  rattacherAUneEmployeuseDepuisSiret: jest.fn(),
}))

const mockedRattacherDepuisSiret =
  rattacherAUneEmployeuseDepuisSiret as jest.MockedFunction<
    typeof rattacherAUneEmployeuseDepuisSiret
  >

const PROCONNECT_SIRET = '11111111111111'
const OTHER_SIRET = '22222222222222'

describe('importStructureEmployeuseFromProConnect', () => {
  const state = { proconnectMainId: 0, otherMainId: 0 }

  beforeAll(async () => {
    await seedStructures(prismaClient)

    // Résidu d'un run précédent interrompu : la clé (siret, dénomination) est unique.
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { siret: { in: [PROCONNECT_SIRET, OTHER_SIRET] } },
    })

    const proconnect = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret: PROCONNECT_SIRET,
        denominationSirene: 'Structure ProConnect',
        denominationAntenne: 'Structure ProConnect',
      },
      select: { id: true },
    })
    const other = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret: OTHER_SIRET,
        denominationSirene: 'Autre structure',
        denominationAntenne: 'Autre structure',
      },
      select: { id: true },
    })
    state.proconnectMainId = proconnect.id
    state.otherMainId = other.id
  })

  // Nettoyage par appartenance à la personne de test, et non par structure : les fixtures lui
  // posent aussi des affectations vers d'autres employeuses, qui empêchaient la suppression de la
  // personne — et laissaient alors les employeuses de test derrière elles, faisant échouer le
  // `beforeAll` du run suivant sur la clé (siret, dénomination).
  const nettoyerPersonnesDeTest = async () => {
    const deNosPersonnes = {
      personne: {
        coopId: { in: [mediateurSansActivites.id, conseillerNumerique.id] },
      },
    }
    await prismaClient.contratMain.deleteMany({ where: deNosPersonnes })
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: deNosPersonnes,
    })
    await prismaClient.personneMain.deleteMany({
      where: {
        coopId: { in: [mediateurSansActivites.id, conseillerNumerique.id] },
      },
    })
  }

  afterAll(async () => {
    await nettoyerPersonnesDeTest()
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { id: { in: [state.proconnectMainId, state.otherMainId] } },
    })
  })

  beforeEach(async () => {
    mockedRattacherDepuisSiret.mockReset()
    mockedRattacherDepuisSiret.mockResolvedValue({
      _tag: 'rattachee',
      employeuseId: state.proconnectMainId as never,
    })

    await resetFixtureUser(mediateurSansActivites, false)
    // Personne + affectations réinitialisées entre chaque test (FK : affectations avant personne).
    await nettoyerPersonnesDeTest()
  })

  // La clôture des autres affectations appartient désormais au rattachement lui-même (feature
  // employeuse, ability `rattacher-a-une-employeuse`, couverte par son BDD). Il ne reste ici que
  // ce que ProConnect décide : à qui il délègue, et quand il s'abstient.
  test('non-CN + SIRET : délègue le rattachement au SIRET fourni', async () => {
    const result = await importStructureEmployeuseFromProConnect({
      userId: mediateurSansActivites.id,
      siret: PROCONNECT_SIRET,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(false)
    expect(mockedRattacherDepuisSiret).toHaveBeenCalledTimes(1)
    expect(mockedRattacherDepuisSiret).toHaveBeenCalledWith({
      userId: mediateurSansActivites.id,
      siret: PROCONNECT_SIRET,
    })
  })

  test('conseiller numerique : no-op, import non appelé', async () => {
    await resetFixtureUser(conseillerNumerique, false)

    const result = await importStructureEmployeuseFromProConnect({
      userId: conseillerNumerique.id,
      siret: PROCONNECT_SIRET,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(true)
    expect(mockedRattacherDepuisSiret).not.toHaveBeenCalled()
  })

  test('aucun SIRET fourni : no-op', async () => {
    const result = await importStructureEmployeuseFromProConnect({
      userId: mediateurSansActivites.id,
      siret: null,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(true)
    expect(mockedRattacherDepuisSiret).not.toHaveBeenCalled()
  })
})
