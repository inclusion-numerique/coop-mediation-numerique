import { describe, expect, it } from 'vitest'
import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import {
  CRITERES_VIDES,
  type CriteresDesActivites,
  EmployeuseId,
  FiltreDeDispositif,
  FiltreDOrigine,
  LieuActiviteId,
  SourceDeLActivite,
  TagId,
  ThematiqueRecherchee,
  TypeDActivite,
} from '../../domain'
import { filtreDesActivites } from './criteres-des-activites.sql'

const filtre = (criteres: Partial<CriteresDesActivites>) =>
  filtreDesActivites({ ...CRITERES_VIDES, ...criteres })

describe('filtre SQL des activités', () => {
  it('ne restreint rien sans critère', () => {
    expect(filtre({}).sql).toBe('TRUE')
  })

  it('passe toutes les valeurs en paramètres, jamais dans le texte', () => {
    const sql = filtre({
      periode: { du: new Date('2026-01-01'), au: new Date('2026-03-31') },
      types: [TypeDActivite('Individuel')],
      lieux: [LieuActiviteId('a0000000-0000-4000-8000-000000000001')],
      communes: [CodeInsee('69123')],
      departements: [CodeDepartement('2A')],
      thematiques: [ThematiqueRecherchee('Email')],
      tags: [TagId('d0000000-0000-4000-8000-000000000001')],
      employeuses: [EmployeuseId(42)],
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

  it.each([
    [{ origine: FiltreDOrigine('RendezVous') }, 'act.rdv_id IS NOT NULL'],
    [{ origine: FiltreDOrigine('HorsRendezVous') }, 'act.rdv_id IS NULL'],
    [{ source: SourceDeLActivite('ImportV1') }, 'act.v1_cra_id IS NOT NULL'],
    [{ source: SourceDeLActivite('Coop') }, 'act.v1_cra_id IS NULL'],
  ])('traduit %o', (criteres, attendu) => {
    expect(filtre(criteres).sql).toBe(attendu)
  })

  it('lit le dispositif dans la vue des conseillers numériques en poste de main', () => {
    const sql = filtre({ dispositif: FiltreDeDispositif('HorsDispositif') })
    expect([sql.sql, sql.values]).toEqual([
      'NOT EXISTS (SELECT 1 FROM main.conseiller_numerique_en_poste cn JOIN main.personne p ON p.id = cn.personne_id WHERE p.coop_id = u.id)',
      [],
    ])
  })
})
