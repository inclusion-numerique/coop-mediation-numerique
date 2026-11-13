import { Prisma } from '@app/web/generated/prisma/client'
import { criteresDesStatistiques } from '../domain'
import { filtreDesStatistiques } from './criteres-des-statistiques.sql'

const conseillersNumeriques = (colonne: string, attendu: boolean) =>
  Prisma.sql`conseiller(${Prisma.raw(colonne)}) = ${attendu}`

const rendezVousAuxStatuts = (statuts: readonly string[]) =>
  Prisma.sql`SELECT id FROM rendez_vous WHERE statut = ANY(${statuts})`

const filtre = (parametres: Parameters<typeof criteresDesStatistiques>[0]) =>
  filtreDesStatistiques(criteresDesStatistiques(parametres), {
    conseillersNumeriques,
    rendezVousAuxStatuts,
  })

describe('filtre SQL des statistiques', () => {
  it('ne restreint rien sans critère', () => {
    expect(filtre({}).sql).toBe('TRUE')
  })

  it('accepte une période ouverte d’un seul côté', () => {
    const sql = filtre({ du: '2026-01-01' })
    expect(sql.sql).toBe('act.date::date >= ?::date')
    expect(sql.values).toEqual(['2026-01-01'])
  })

  it('borne la période des deux côtés, même inversée', () => {
    const sql = filtre({ du: '2026-03-31', au: '2026-01-01' })
    expect(sql.sql).toBe(
      'act.date::date >= ?::date AND act.date::date <= ?::date',
    )
  })

  it('reconnaît l’origine rendez-vous comme la liste des activités', () => {
    expect(filtre({ rdv: '1' }).sql).toBe('act.rdv_id IS NOT NULL')
  })

  it('ne compte que les activités dont le rendez-vous a l’un des statuts choisis', () => {
    const sql = filtre({ rdvs: 'seen,past' })
    expect(sql.sql).toBe(
      'act.rdv_id IN (SELECT id FROM rendez_vous WHERE statut = ANY(?))',
    )
    expect(sql.values).toEqual([['seen', 'passe']])
  })
})
