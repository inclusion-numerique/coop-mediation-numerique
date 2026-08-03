import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { ensureStructureAdministrativeMain } from './ensureStructureAdministrativeMain'
import { resolveIdentiteFromSiret } from './resolveIdentiteSirene'

// On neutralise l'API Recherche d'entreprises (identité) et le throttle : le test cible la dédup par
// clé métier `(siret, denomination_antenne)`, pas l'appel réseau.
jest.mock('./resolveIdentiteSirene', () => ({
  resolveIdentiteFromSiret: jest.fn(),
}))
jest.mock('@app/web/features/structures/siret/siretIdentity', () => ({
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
