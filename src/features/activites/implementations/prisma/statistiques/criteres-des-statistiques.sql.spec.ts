import { describe, expect, it } from 'vitest'
import { Prisma } from '@/generated/prisma/client'
import {
  CRITERES_VIDES,
  type CriteresDesStatistiques,
  FiltreDOrigine,
  Jour,
  StatutDeRendezVous,
} from '../../../domain'
import { filtreDesStatistiques } from './criteres-des-statistiques.sql'

const rendezVousAuxStatuts = (statuts: readonly string[]) =>
  Prisma.sql`SELECT id FROM rendez_vous WHERE statut = ANY(${statuts})`

const sansCritere: CriteresDesStatistiques = {
  ...CRITERES_VIDES,
  periode: { du: null, au: null },
}

const filtre = (criteres: Partial<CriteresDesStatistiques>) =>
  filtreDesStatistiques(
    { ...sansCritere, ...criteres },
    { rendezVousAuxStatuts },
  )

describe('filtre SQL des statistiques', () => {
  it('ne restreint rien sans critère', () => {
    expect(filtre({}).sql).toBe('TRUE')
  })

  it('accepte une période ouverte d’un seul côté', () => {
    const sql = filtre({ periode: { du: Jour('2026-01-01'), au: null } })
    expect(sql.sql).toBe('act.date::date >= ?::date')
    expect(sql.values).toEqual(['2026-01-01'])
  })

  it('borne la période des deux côtés, même inversée', () => {
    const sql = filtre({
      periode: { du: Jour('2026-03-31'), au: Jour('2026-01-01') },
    })
    expect(sql.sql).toBe(
      'act.date::date >= ?::date AND act.date::date <= ?::date',
    )
  })

  it('reconnaît l’origine rendez-vous comme la liste des activités', () => {
    expect(filtre({ origine: FiltreDOrigine('RendezVous') }).sql).toBe(
      'act.rdv_id IS NOT NULL',
    )
  })

  it('ne compte que les activités dont le rendez-vous a l’un des statuts choisis', () => {
    const sql = filtre({
      statutsDeRendezVous: [
        StatutDeRendezVous('Honore'),
        StatutDeRendezVous('Passe'),
      ],
    })
    expect(sql.sql).toBe(
      'act.rdv_id IN (SELECT id FROM rendez_vous WHERE statut = ANY(?))',
    )
    expect(sql.values).toEqual([['seen', 'passe']])
  })
})
