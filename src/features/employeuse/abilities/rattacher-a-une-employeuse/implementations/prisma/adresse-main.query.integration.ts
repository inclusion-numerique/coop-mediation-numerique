import { v4 } from 'uuid'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import {
  adresseMainDepuis,
  idDeLAdresseMain,
  insertAdresseMain,
  type ResolvedAdresseMain,
} from './adresse-main.query'

describe('idDeLAdresseMain — dédup par clé composant', () => {
  const codeBanExistant = v4()
  const base = {
    nomVoie: 'Rue du Test Dédup',
    codePostal: '75099',
    codeInsee: '75199',
    nomCommune: 'ParisTestDedup',
  }
  const state = { adresseId: 0 }

  const resolved = (codeBan: string | null): ResolvedAdresseMain => ({
    ...base,
    codeBan,
    longitude: null,
    latitude: null,
    banScore: null,
    source: 'ban',
  })

  beforeAll(async () => {
    const adresse = await prismaClient.adresseMain.create({
      data: { ...base, codeBan: codeBanExistant },
      select: { id: true },
    })
    state.adresseId = adresse.id
  })

  afterAll(async () => {
    await prismaClient.adresseMain.delete({ where: { id: state.adresseId } })
  })

  it('retrouve l’adresse par la clé composant même avec un code_ban différent', async () => {
    const found = await idDeLAdresseMain(resolved(v4()))
    expect(found?.id).toBe(state.adresseId)
  })

  it('retrouve l’adresse par la clé composant sans code_ban', async () => {
    const found = await idDeLAdresseMain(resolved(null))
    expect(found?.id).toBe(state.adresseId)
  })

  it('retrouve l’adresse par code_ban (clé alternative)', async () => {
    const found = await idDeLAdresseMain({
      ...resolved(codeBanExistant),
      nomVoie: 'Autre libellé de voie',
    })
    expect(found?.id).toBe(state.adresseId)
  })
})

describe('insertAdresseMain — codes non conformes des sources amont', () => {
  const COMMUNE_DE_TEST = 'AURAGNE-TEST-NON-DIFFUSIBLE'
  const state = { adresseId: 0 }

  beforeAll(async () => {
    await prismaClient.adresseMain.deleteMany({
      where: { nomCommune: COMMUNE_DE_TEST },
    })
  })

  afterAll(async () => {
    if (state.adresseId) {
      await prismaClient.adresseMain.delete({ where: { id: state.adresseId } })
    }
  })

  it('enregistre l’adresse d’un établissement `[NON-DIFFUSIBLE]`', async () => {
    state.adresseId = await insertAdresseMain(
      adresseMainDepuis(
        {
          adresse: '[NON-DIFFUSIBLE]',
          codePostal: '[NON-DIFFUSIBLE]',
          codeInsee: '31024',
          commune: COMMUNE_DE_TEST,
        },
        null,
      ),
    )

    expect(state.adresseId).toEqual(expect.any(Number))
  })
})
