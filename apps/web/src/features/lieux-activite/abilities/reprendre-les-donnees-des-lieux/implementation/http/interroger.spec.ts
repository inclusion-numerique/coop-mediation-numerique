import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { interroger } from './interroger'

const repondre = (statut: number, corps = ''): Response =>
  new Response(corps, { status: statut })

const dossierDOrigine = process.cwd()

const dossierDeTest = mkdtempSync(join(tmpdir(), 'interroger-'))

const lignesDuCache = (): readonly string[] =>
  readFileSync(
    join(dossierDeTest, 'output/cache-reprise-lieux/reponses.jsonl'),
    'utf8',
  )
    .split('\n')
    .filter((ligne) => ligne !== '')

const avecLesRelances = async <T>(promesse: Promise<T>): Promise<T> => {
  await jest.runAllTimersAsync()
  return promesse
}

describe('interroger', () => {
  beforeAll(() => {
    process.chdir(dossierDeTest)
  })

  afterAll(() => {
    process.chdir(dossierDOrigine)
    rmSync(dossierDeTest, { recursive: true, force: true })
  })

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('relance une requête à laquelle le serveur répond 504', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(repondre(504))
      .mockResolvedValueOnce(repondre(200, 'trouvée'))

    const reponse = await avecLesRelances(interroger('https://ban/504'))

    expect(await reponse.text()).toBe('trouvée')
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('relance une requête dont la connexion a été coupée', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new TypeError('terminated'))
      .mockResolvedValueOnce(repondre(200, 'trouvée'))

    const reponse = await avecLesRelances(interroger('https://ban/coupure'))

    expect(reponse.status).toBe(200)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('rend la dernière réponse passagère quand les relances sont épuisées', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async () => repondre(502))

    const reponse = await avecLesRelances(interroger('https://ban/epuisee'))

    expect(reponse.status).toBe(502)
    expect(fetch).toHaveBeenCalledTimes(4)
  })

  it('reprend du cache une réponse déjà obtenue, sans rappeler le serveur', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async () => repondre(200, 'une fois'))
    const corps = new FormData()
    corps.append('data', new Blob(['lieu_id,voie\n1,12 rue de la Paix']))

    await interroger('https://ban/csv', { method: 'POST', body: corps })
    const reprise = await interroger('https://ban/csv', {
      method: 'POST',
      body: corps,
    })

    expect(await reprise.text()).toBe('une fois')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('distingue deux requêtes au même endroit dont le corps diffère', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async () => repondre(200, 'lot'))

    await interroger('https://ban/lots', { method: 'POST', body: 'lot 1' })
    await interroger('https://ban/lots', { method: 'POST', body: 'lot 2' })

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('garde une réponse 404, qui dit durablement que rien ne correspond', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async () => repondre(404))

    await interroger('https://ban/inconnue')
    await interroger('https://ban/inconnue')

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('ne garde pas une réponse en erreur, pour la redemander au lancement suivant', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async () => repondre(500))

    await interroger('https://ban/erreur')
    await interroger('https://ban/erreur')

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('écrit chaque réponse gardée dans le fichier du cache', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockImplementation(async () => repondre(200, 'écrite'))
    const avant = lignesDuCache().length

    await interroger('https://ban/fichier')

    expect(lignesDuCache()).toHaveLength(avant + 1)
    expect(lignesDuCache().at(-1)).toContain('écrite')
  })
})
