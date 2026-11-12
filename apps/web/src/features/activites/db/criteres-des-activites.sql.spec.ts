import { Prisma } from '@app/web/generated/prisma/client'
import { criteresDesActivites } from '../domain'
import { filtreDesActivites } from './criteres-des-activites.sql'

const conseillersNumeriques = (colonne: string, attendu: boolean) =>
  Prisma.sql`conseiller(${Prisma.raw(colonne)}) = ${attendu}`

const filtre = (parametres: Parameters<typeof criteresDesActivites>[0]) =>
  filtreDesActivites(criteresDesActivites(parametres), {
    conseillersNumeriques,
  })

describe('filtre SQL des activités', () => {
  it('ne restreint rien sans critère', () => {
    expect(filtre({}).sql).toBe('TRUE')
  })

  it('passe toutes les valeurs en paramètres, jamais dans le texte', () => {
    const sql = filtre({
      du: '2026-01-01',
      au: '2026-03-31',
      types: 'individuel',
      lieux: 'a0000000-0000-4000-8000-000000000001',
      communes: '69123',
      departements: '2A',
      thematiqueNonAdministratives: 'Email',
      tags: 'd0000000-0000-4000-8000-000000000001',
      structuresEmployeuses: '42',
    })
    expect(sql.sql).not.toMatch(/69123|2A|email|individuel|a0000000|42/)
    expect(sql.values).toEqual([
      new Date('2026-01-01'),
      new Date('2026-03-31'),
      ['individuel'],
      ['a0000000-0000-4000-8000-000000000001'],
      ['69123'],
      ['2A%'],
      ['email'],
      ['d0000000-0000-4000-8000-000000000001'],
      [42],
    ])
  })

  it('n’ajoute aucune condition pour une valeur injectée', () => {
    expect(filtre({ lieux: "x') OR 1=1 --" }).sql).toBe('TRUE')
  })

  it.each([
    ['rdv', '1', 'act.rdv_id IS NOT NULL'],
    ['rdv', '0', 'act.rdv_id IS NULL'],
    ['source', 'v1', 'act.v1_cra_id IS NOT NULL'],
    ['source', 'v2', 'act.v1_cra_id IS NULL'],
  ])('traduit %s=%s', (cle, valeur, attendu) => {
    expect(filtre({ [cle]: valeur }).sql).toBe(attendu)
  })

  it('délègue le dispositif au filtre reçu', () => {
    const sql = filtre({ conseiller_numerique: '0' })
    expect([sql.sql, sql.values]).toEqual(['conseiller(u.id) = ?', [false]])
  })
})
