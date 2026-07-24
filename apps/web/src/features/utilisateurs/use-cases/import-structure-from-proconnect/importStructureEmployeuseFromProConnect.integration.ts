import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import { conseillerNumerique } from '@app/fixtures/users/conseillerNumerique'
import { mediateurSansActivites } from '@app/fixtures/users/mediateurSansActivites'
import { importStructureEmployeuseFromSiret } from '@app/web/features/structures/importStructureEmployeuseFromSiret'
import { ensureAffectationEmploiMain } from '@app/web/features/structures/main/ensureAffectationEmploiMain'
import { ensurePersonneMain } from '@app/web/features/structures/main/ensurePersonneMain'
import { prismaClient } from '@app/web/prismaClient'
import { importStructureEmployeuseFromProConnect } from './importStructureEmployeuseFromProConnect'

// ADR-002 échange final : ProConnect n'écrit plus d'emploi `coop.employes_structures`. Il garantit
// l'employeuse dans `main` (via `importStructureEmployeuseFromSiret`, mocké ici) puis DÉSACTIVE toute
// autre affectation coop de la personne — un seul employeur actif, celui affirmé par ProConnect.
jest.mock(
  '@app/web/features/structures/importStructureEmployeuseFromSiret',
  () => ({
    importStructureEmployeuseFromSiret: jest.fn(),
  }),
)

const mockedImportStructureEmployeuseFromSiret =
  importStructureEmployeuseFromSiret as jest.MockedFunction<
    typeof importStructureEmployeuseFromSiret
  >

const PROCONNECT_SIRET = '11111111111111'
const OTHER_SIRET = '22222222222222'

describe('importStructureEmployeuseFromProConnect', () => {
  const state = { proconnectMainId: 0, otherMainId: 0 }

  beforeAll(async () => {
    await seedStructures(prismaClient)

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

  afterAll(async () => {
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: {
        structureAdministrativeId: {
          in: [state.proconnectMainId, state.otherMainId],
        },
      },
    })
    await prismaClient.personneMain.deleteMany({
      where: {
        coopId: { in: [mediateurSansActivites.id, conseillerNumerique.id] },
      },
    })
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { id: { in: [state.proconnectMainId, state.otherMainId] } },
    })
  })

  beforeEach(async () => {
    mockedImportStructureEmployeuseFromSiret.mockReset()
    mockedImportStructureEmployeuseFromSiret.mockResolvedValue({
      structureMainId: state.proconnectMainId,
    })

    await resetFixtureUser(mediateurSansActivites, false)
    // Personne + affectations réinitialisées entre chaque test (FK : affectations avant personne).
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: {
        structureAdministrativeId: {
          in: [state.proconnectMainId, state.otherMainId],
        },
      },
    })
    await prismaClient.personneMain.deleteMany({
      where: { coopId: mediateurSansActivites.id },
    })
  })

  test('non-CN + SIRET : importe l’employeuse et désactive les autres affectations', async () => {
    // Affectation active pré-existante sur une AUTRE structure.
    const personne = await ensurePersonneMain({
      coopUserId: mediateurSansActivites.id,
      email: mediateurSansActivites.email,
    })
    await ensureAffectationEmploiMain({
      personneId: personne.id,
      structureAdministrativeId: state.otherMainId,
    })

    const result = await importStructureEmployeuseFromProConnect({
      userId: mediateurSansActivites.id,
      siret: PROCONNECT_SIRET,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(false)
    expect(mockedImportStructureEmployeuseFromSiret).toHaveBeenCalledTimes(1)

    // L'autre affectation est désactivée (ProConnect = employeur courant unique).
    const other =
      await prismaClient.personneAffectationEmploiMain.findFirstOrThrow({
        where: {
          personneId: personne.id,
          structureAdministrativeId: state.otherMainId,
        },
        select: { estActive: true },
      })
    expect(other.estActive).toBe(false)
  })

  test('conseiller numerique : no-op, import non appelé', async () => {
    await resetFixtureUser(conseillerNumerique, false)

    const result = await importStructureEmployeuseFromProConnect({
      userId: conseillerNumerique.id,
      siret: PROCONNECT_SIRET,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(true)
    expect(mockedImportStructureEmployeuseFromSiret).not.toHaveBeenCalled()
  })

  test('aucun SIRET fourni : no-op', async () => {
    const result = await importStructureEmployeuseFromProConnect({
      userId: mediateurSansActivites.id,
      siret: null,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(true)
    expect(mockedImportStructureEmployeuseFromSiret).not.toHaveBeenCalled()
  })
})
