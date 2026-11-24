import { describe, expect, it } from 'vitest'
import { criteresDesActivitesDepuisLURL } from '@/features/activites/fixtures/criteres-depuis-l-url'
import { filtreDesActivites } from './criteres-des-activites.sql'

const filtre = (
  parametres: Parameters<typeof criteresDesActivitesDepuisLURL>[0],
) => filtreDesActivites(criteresDesActivitesDepuisLURL(parametres))

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

  it('lit le dispositif dans la vue des conseillers numériques en poste de main', () => {
    const sql = filtre({ conseiller_numerique: '0' })
    expect([sql.sql, sql.values]).toEqual([
      'NOT EXISTS (SELECT 1 FROM main.conseiller_numerique_en_poste cn JOIN main.personne p ON p.id = cn.personne_id WHERE p.coop_id = u.id)',
      [],
    ])
  })
})
