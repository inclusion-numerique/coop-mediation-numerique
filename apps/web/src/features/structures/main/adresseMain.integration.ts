import {
  findAdresseMainId,
  type ResolvedAdresseMain,
} from '@app/web/features/structures/main/adresseMain'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'

describe('findAdresseMainId — dédup par clé composant', () => {
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
    const found = await findAdresseMainId(resolved(v4()))
    expect(found?.id).toBe(state.adresseId)
  })

  it('retrouve l’adresse par la clé composant sans code_ban', async () => {
    const found = await findAdresseMainId(resolved(null))
    expect(found?.id).toBe(state.adresseId)
  })

  it('retrouve l’adresse par code_ban (clé alternative)', async () => {
    const found = await findAdresseMainId({
      ...resolved(codeBanExistant),
      nomVoie: 'Autre libellé de voie',
    })
    expect(found?.id).toBe(state.adresseId)
  })
})
