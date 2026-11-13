import { DateDActivite, TagId } from '../domain'
import {
  employeuseDeLaDateDepuis,
  tagsUtilisablesDepuis,
} from './fournisseurs-de-la-saisie'

describe('fournisseurs de la saisie', () => {
  it("consulte l'employeuse au jour de l'activité, à minuit UTC", async () => {
    const consulter = jest.fn(async (_date: Date) => null)
    await employeuseDeLaDateDepuis(consulter)(DateDActivite('2026-03-05'))
    expect(consulter).toHaveBeenCalledWith(new Date('2026-03-05T00:00:00.000Z'))
  })

  it("traduit l'employeuse fournie et sa commune", async () => {
    const employeuse = await employeuseDeLaDateDepuis(async () => ({
      id: 42,
      adresse: { commune: 'Lyon', codePostal: '69007', codeInsee: '69387' },
    }))(DateDActivite('2026-03-05'))
    expect(employeuse).toEqual({
      id: 42,
      commune: { nom: 'Lyon', codePostal: '69007', codeInsee: '69387' },
    })
  })

  it('garde une employeuse sans adresse, sans commune', async () => {
    const employeuse = await employeuseDeLaDateDepuis(async () => ({
      id: 42,
      adresse: null,
    }))(DateDActivite('2026-03-05'))
    expect(employeuse).toEqual({ id: 42, commune: null })
  })

  it('rend les tags visibles fournis', async () => {
    const id = TagId('8f6b2c1e-0d3a-4c5e-9b7f-1a2b3c4d5e6f')
    const tags = await tagsUtilisablesDepuis(async () => [
      { id, nom: 'Numérique' },
    ])([id])
    expect(tags).toEqual([{ id, nom: 'Numérique' }])
  })
})
