import { describe, expect, it } from 'vitest'
import { NomAffiche } from '@/libraries/nom-affiche'
import {
  Effectif,
  LienAgent,
  NomDuMotif,
  RdvId,
  StatutDeRendezVous,
  TitreDuRendezVous,
} from '../../domain'
import {
  type RendezVousFourni,
  rendezVousAffiche,
  rendezVousDeLaChronologie,
} from './rendez-vous-fournis.transfer'

const LIEN = 'https://rdv.anct.gouv.fr/admin/organisations/1/rdvs/42'

const FOURNI: RendezVousFourni = {
  id: 42,
  statut: 'seen',
  lienAgent: LIEN,
  debut: new Date('2026-11-02T09:00:00.000Z'),
  fin: new Date('2026-11-02T09:30:00.000Z'),
  motif: { nom: 'Atelier tablette', collectif: true },
  titre: 'Prise en main',
  places: 8,
  participants: [
    { prenom: 'Jeanne', nom: 'Dupont' },
    { prenom: 'Paul', nom: null },
  ],
}

const STATUTS = [
  { fourni: 'unknown', domaine: 'AVenir' },
  { fourni: 'passe', domaine: 'Passe' },
  { fourni: 'seen', domaine: 'Honore' },
  { fourni: 'revoked', domaine: 'Annule' },
  { fourni: 'excused', domaine: 'AnnuleParLeBeneficiaire' },
  { fourni: 'noshow', domaine: 'Absent' },
] as const

describe('rendezVousAffiche', () => {
  it.each(STATUTS)(
    'traduit le statut $fourni en $domaine',
    ({ fourni, domaine }) => {
      expect(
        rendezVousAffiche({ id: 1, statut: fourni, lienAgent: LIEN }).statut,
      ).toBe(StatutDeRendezVous(domaine))
    },
  )

  it('traduit le lien vers l’espace agent', () => {
    expect(
      rendezVousAffiche({ id: 1, statut: 'seen', lienAgent: LIEN }).lienAgent,
    ).toBe(LienAgent(LIEN))
  })

  it('refuse un lien vers l’espace agent qui n’est pas une adresse', () => {
    expect(() =>
      rendezVousAffiche({ id: 1, statut: 'seen', lienAgent: 'pas un lien' }),
    ).toThrow()
  })
})

describe('rendezVousDeLaChronologie', () => {
  it('traduit un rendez-vous fourni en rendez-vous de la chronologie', () => {
    expect(rendezVousDeLaChronologie(FOURNI)).toEqual({
      id: RdvId(42),
      debut: new Date('2026-11-02T09:00:00.000Z'),
      fin: new Date('2026-11-02T09:30:00.000Z'),
      statut: StatutDeRendezVous('Honore'),
      motif: { nom: NomDuMotif('Atelier tablette'), collectif: true },
      titre: TitreDuRendezVous('Prise en main'),
      places: Effectif(8),
      participants: [NomAffiche('Jeanne Dupont'), NomAffiche('Paul')],
      lienAgent: LienAgent(LIEN),
    })
  })

  it('garde un motif absent absent', () => {
    expect(
      rendezVousDeLaChronologie({ ...FOURNI, motif: null }).motif,
    ).toBeNull()
  })

  it('garde un titre absent absent', () => {
    expect(
      rendezVousDeLaChronologie({ ...FOURNI, titre: null }).titre,
    ).toBeNull()
  })

  it('ramène un titre vide à un titre absent', () => {
    expect(
      rendezVousDeLaChronologie({ ...FOURNI, titre: '   ' }).titre,
    ).toBeNull()
  })

  it('garde un nombre de places absent absent', () => {
    expect(
      rendezVousDeLaChronologie({ ...FOURNI, places: null }).places,
    ).toBeNull()
  })

  it('accepte un rendez-vous sans place', () => {
    expect(rendezVousDeLaChronologie({ ...FOURNI, places: 0 }).places).toBe(
      Effectif(0),
    )
  })

  it('nomme un participant par son seul nom quand le prénom manque', () => {
    expect(
      rendezVousDeLaChronologie({
        ...FOURNI,
        participants: [{ prenom: '', nom: 'Martin' }],
      }).participants,
    ).toEqual([NomAffiche('Martin')])
  })

  it('écarte un participant sans prénom ni nom', () => {
    expect(
      rendezVousDeLaChronologie({
        ...FOURNI,
        participants: [
          { prenom: null, nom: null },
          { prenom: ' ', nom: ' ' },
        ],
      }).participants,
    ).toEqual([])
  })

  it('refuse un identifiant de rendez-vous qui n’est pas positif', () => {
    expect(() => rendezVousDeLaChronologie({ ...FOURNI, id: 0 })).toThrow()
  })
})
