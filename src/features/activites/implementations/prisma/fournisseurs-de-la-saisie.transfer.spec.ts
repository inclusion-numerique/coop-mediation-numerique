import { describe, expect, it } from 'vitest'
import {
  Commune,
  DateDActivite,
  EmployeuseId,
  NomDeTag,
  TagId,
} from '../../domain'
import {
  employeuseDeLaDateDepuis,
  instantDuJour,
  tagsUtilisablesDepuis,
} from './fournisseurs-de-la-saisie.transfer'

describe('fournisseurs de la saisie', () => {
  it("situe le jour de l'activité à minuit UTC", () => {
    expect(instantDuJour(DateDActivite('2026-03-05'))).toEqual(
      new Date(Date.UTC(2026, 2, 5)),
    )
  })

  it("traduit l'employeuse fournie et sa commune", async () => {
    const employeuse = await employeuseDeLaDateDepuis(async () => ({
      id: 42,
      adresse: { commune: 'Lyon', codePostal: '69007', codeInsee: '69387' },
    }))(DateDActivite('2026-03-05'))
    expect(employeuse).toEqual({
      id: EmployeuseId(42),
      commune: Commune({
        nom: 'Lyon',
        codePostal: '69007',
        codeInsee: '69387',
      }),
    })
  })

  it('garde une employeuse sans adresse, sans commune', async () => {
    const employeuse = await employeuseDeLaDateDepuis(async () => ({
      id: 42,
      adresse: null,
    }))(DateDActivite('2026-03-05'))
    expect(employeuse).toEqual({ id: EmployeuseId(42), commune: null })
  })

  it('ne rend aucune employeuse quand aucune n’est fournie à la date', async () => {
    const employeuse = await employeuseDeLaDateDepuis(async () => null)(
      DateDActivite('2026-03-05'),
    )
    expect(employeuse).toBeNull()
  })

  it('rend les tags visibles fournis', async () => {
    const id = TagId('8f6b2c1e-0d3a-4c5e-9b7f-1a2b3c4d5e6f')
    const tags = await tagsUtilisablesDepuis(async () => [
      { id, nom: 'Numérique' },
    ])([id])
    expect(tags).toEqual([{ id, nom: NomDeTag('Numérique') }])
  })
})
