import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { ensureStructureAdministrativeMain } from './ensureStructureAdministrativeMain'
import { resolveIdentiteFromSiret } from './resolveIdentiteSirene'

// On neutralise l'API Recherche d'entreprises (identité) et le throttle : le test cible la dédup par
// clé métier `(siret, denomination_antenne)`, pas l'appel réseau.
jest.mock('./resolveIdentiteSirene', () => ({
  resolveIdentiteFromSiret: jest.fn(),
}))
jest.mock('@app/web/libraries/siret', () => ({
  ...jest.requireActual('@app/web/libraries/siret'),
  throttleApiEntreprise: jest.fn().mockResolvedValue(undefined),
}))

const mockedResolve = resolveIdentiteFromSiret as jest.MockedFunction<
  typeof resolveIdentiteFromSiret
>

describe('ensureStructureAdministrativeMain — dédup par identité', () => {
  const siret = '99999999999999'
  const denominationAntenne = 'Employeuse déjà dans main'
  const state = { existingMainId: 0 }

  beforeAll(async () => {
    mockedResolve.mockResolvedValue({
      identite: {
        nom: denominationAntenne,
        adresse: '1 rue du Doublon',
        codePostal: '75001',
        commune: 'Paris',
        codeInsee: '75101',
        etatAdministratif: 'A',
      },
    })

    // Une SA main existe déjà pour cette identité, liée à un AUTRE coop (ou aucun).
    const existing = await prismaClient.structureAdministrativeMain.create({
      data: { siret, denominationAntenne },
      select: { id: true },
    })
    state.existingMainId = existing.id
  })

  afterAll(async () => {
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { siret },
    })
  })

  it('réutilise la SA main existante au lieu de créer un doublon (pas de null)', async () => {
    const result = await ensureStructureAdministrativeMain({
      coopId: v4(), // nouveau coop uuid, jamais vu dans main
      siret,
    })

    expect(result).not.toBeNull()
    expect(result?.id).toBe(state.existingMainId)

    // Aucun doublon créé sur la clé métier.
    const count = await prismaClient.structureAdministrativeMain.count({
      where: { siret, denominationAntenne },
    })
    expect(count).toBe(1)
  })
})

// Cas de production : les producteurs de l'Entrepôt écrivent la raison sociale dans
// `denomination_sirene` et laissent `denomination_antenne` à NULL. 7 163 SIRET sont dans ce cas.
// Ces lignes échappaient au lookup sur la seule clé `(siret, denomination_antenne)` : on créait un
// doublon à côté, sans violer la clé d'unicité puisqu'elle ne porte que sur l'antenne.
describe('ensureStructureAdministrativeMain — ligne existante nommée côté SIRENE', () => {
  const siret = '99999999999998'
  const denomination = 'Employeuse nommée par SIRENE'
  const state = { existingMainId: 0 }

  beforeAll(async () => {
    mockedResolve.mockResolvedValue({
      identite: {
        nom: denomination,
        adresse: '1 rue du Doublon',
        codePostal: '75001',
        commune: 'Paris',
        codeInsee: '75101',
        etatAdministratif: 'A',
      },
    })

    const existing = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret,
        denominationAntenne: null,
        denominationSirene: denomination,
      },
      select: { id: true },
    })
    state.existingMainId = existing.id
  })

  afterAll(async () => {
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { siret },
    })
  })

  it('réutilise la ligne dont seule la dénomination SIRENE porte le nom', async () => {
    const result = await ensureStructureAdministrativeMain({
      coopId: v4(),
      siret,
    })

    expect(result?.id).toBe(state.existingMainId)

    const count = await prismaClient.structureAdministrativeMain.count({
      where: { siret },
    })
    expect(count).toBe(1)
  })
})

// Deux antennes d'un même SIRET restent deux lignes distinctes : l'élargissement ne doit pas les
// confondre.
describe('ensureStructureAdministrativeMain — antennes distinctes du même SIRET', () => {
  const siret = '99999999999997'
  const state = { autreAntenneId: 0 }

  beforeAll(async () => {
    mockedResolve.mockResolvedValue({
      identite: {
        nom: 'Antenne de Nantes',
        adresse: '1 rue du Doublon',
        codePostal: '75001',
        commune: 'Paris',
        codeInsee: '75101',
        etatAdministratif: 'A',
      },
    })

    const autre = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret,
        denominationAntenne: 'Antenne de Rennes',
        denominationSirene: 'Association des tests',
      },
      select: { id: true },
    })
    state.autreAntenneId = autre.id
  })

  afterAll(async () => {
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { siret },
    })
  })

  it('crée une ligne pour une antenne que rien ne désigne', async () => {
    const result = await ensureStructureAdministrativeMain({
      coopId: v4(),
      siret,
    })

    expect(result?.id).not.toBe(state.autreAntenneId)

    const count = await prismaClient.structureAdministrativeMain.count({
      where: { siret },
    })
    expect(count).toBe(2)
  })
})
