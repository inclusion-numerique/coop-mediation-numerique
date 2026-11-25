import { v4 } from 'uuid'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { AdresseIndisponible } from '@/libraries/ban'
import {
  ensureStructureAdministrativeMain,
  type IdentiteStructureMain,
} from './garantir-la-structure-administrative.mutation'

const sansGeocodage = ensureStructureAdministrativeMain({
  geocoder: async () => null,
  signaler: () => undefined,
})

const identite = (nom: string): IdentiteStructureMain => ({
  nom,
  adresse: '1 rue du Doublon',
  codePostal: '75001',
  commune: 'Paris',
  codeInsee: '75101',
})

describe('ensureStructureAdministrativeMain — dédup par identité', () => {
  const siret = '99999999999999'
  const denominationAntenne = 'Employeuse déjà dans main'
  const state = { existingMainId: 0 }

  beforeAll(async () => {
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
    const result = await sansGeocodage({
      coopId: v4(),
      siret,
      identite: identite(denominationAntenne),
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
    const result = await sansGeocodage({
      coopId: v4(),
      siret,
      identite: identite(denomination),
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
    const result = await sansGeocodage({
      coopId: v4(),
      siret,
      identite: identite('Antenne de Nantes'),
    })

    expect(result?.id).not.toBe(state.autreAntenneId)

    const count = await prismaClient.structureAdministrativeMain.count({
      where: { siret },
    })
    expect(count).toBe(2)
  })
})

describe('ensureStructureAdministrativeMain — service d’adresse indisponible', () => {
  const siret = '99999999999996'
  afterAll(async () => {
    const creee = await prismaClient.structureAdministrativeMain.findFirst({
      where: { siret },
      select: { adresseId: true },
    })
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { siret },
    })
    if (creee?.adresseId) {
      await prismaClient.adresseMain.deleteMany({
        where: { id: creee.adresseId },
      })
    }
  })

  it('crée l’employeuse à l’adresse de la source', async () => {
    const result = await ensureStructureAdministrativeMain({
      geocoder: async () => {
        throw new AdresseIndisponible('HTTP 503')
      },
      signaler: () => undefined,
    })({
      coopId: null,
      siret,
      identite: {
        nom: 'Employeuse sans géocodage',
        adresse: '3 rue du Repli',
        codePostal: '75001',
        commune: 'COMMUNE-TEST-REPLI',
        codeInsee: '75101',
      },
    })

    const creee = await prismaClient.structureAdministrativeMain.findUnique({
      where: { id: result?.id ?? -1 },
      select: { adresse: { select: { nomVoie: true, codeBan: true } } },
    })

    expect(creee?.adresse).toEqual({ nomVoie: '3 rue du Repli', codeBan: null })
  })
})

describe('ensureStructureAdministrativeMain — SIRET non diffusible', () => {
  const testSiret = '93429789600011'

  beforeAll(async () => {
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: {
        siret: testSiret,
      },
    })

    // Verify the cleanup was successful
    const result = await prismaClient.structureAdministrativeMain.findFirst({
      where: {
        siret: testSiret,
      },
    })
    if (result) {
      throw new Error(
        'Structure main should have been deleted in beforeAll hook',
      )
    }
  })

  it('crée une employeuse pour un SIRET [Non-Diffusible], et reste idempotente', async () => {
    const input = {
      coopId: null,
      siret: testSiret,
      identite: {
        nom: '[Non-Diffusible]',
        adresse: '[Non-Diffusible]',
        commune: 'Villeurbanne',
        codeInsee: '69266',
        codePostal: '',
      },
    }
    const result = await sansGeocodage(input)

    expect(result?.id).toEqual(expect.any(Number))

    const result2 = await sansGeocodage(input)

    expect(result2?.id).toEqual(result?.id)

    const count = await prismaClient.structureAdministrativeMain.count({
      where: {
        siret: testSiret,
      },
    })

    expect(count).toEqual(1)
  })
})
