import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import {
  findAdresseMainId,
  insertAdresseMain,
  type ResolvedAdresseMain,
  resolveAdresseMain,
} from './adresseMain'

// Géocodage neutralisé : `searchAdresse -> null` force la branche « api-entreprise » et rend le
// test déterministe et hors-ligne.
jest.mock('@app/web/external-apis/apiAdresse', () => ({
  searchAdresse: jest.fn(),
}))
const mockedSearchAdresse = searchAdresse as jest.MockedFunction<
  typeof searchAdresse
>

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

// Cas de production : pour un établissement non diffusible, l'API Recherche d'entreprises rend
// littéralement `[NON-DIFFUSIBLE]` dans `code_postal` et `libelle_voie`. Sans neutralisation, la
// chaîne de 16 caractères atteignait `main.adresse.code_postal varchar(5)` et faisait échouer
// l'INSERT en `22001` — le job `completer-structures-main` s'arrêtait à la première rencontre.
describe('resolveAdresseMain — codes non conformes des sources amont', () => {
  const state = { adresseId: 0 }

  beforeAll(() => {
    mockedSearchAdresse.mockResolvedValue(null)
  })

  afterAll(async () => {
    if (state.adresseId) {
      await prismaClient.adresseMain.delete({ where: { id: state.adresseId } })
    }
  })

  it('vide le code postal `[NON-DIFFUSIBLE]` en conservant commune et code INSEE', async () => {
    const resolved = await resolveAdresseMain({
      adresse: '[NON-DIFFUSIBLE]',
      codePostal: '[NON-DIFFUSIBLE]',
      codeInsee: '31024',
      commune: 'AURAGNE',
    })

    expect(resolved.codePostal).toBe('')
    expect(resolved.codeInsee).toBe('31024')
    expect(resolved.nomCommune).toBe('AURAGNE')

    state.adresseId = await insertAdresseMain(resolved)
    expect(state.adresseId).toEqual(expect.any(Number))
  })

  it('normalise un code postal espacé et un code INSEE corse en minuscules', async () => {
    const resolved = await resolveAdresseMain({
      adresse: '1 rue du Test',
      codePostal: '20 000',
      codeInsee: '2a004',
      commune: 'AJACCIO',
    })

    expect(resolved.codePostal).toBe('20000')
    expect(resolved.codeInsee).toBe('2A004')
  })
})
