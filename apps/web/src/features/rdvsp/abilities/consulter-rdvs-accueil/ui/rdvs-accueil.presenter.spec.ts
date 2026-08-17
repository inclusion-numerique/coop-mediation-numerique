import { RdvId } from '../../../domain/rdv-id'
import { StatutPresence } from '../../../domain/statut-presence'
import type { RdvEnUneLigne } from '../domain/donnees-accueil-rdv'
import { libelleParticipants, phraseRdv } from './rdvs-accueil.presenter'

const rdv = (surcharge: Partial<RdvEnUneLigne> = {}): RdvEnUneLigne => ({
  id: RdvId(1),
  debut: new Date('2026-08-18T09:00:00.000Z'),
  fin: new Date('2026-08-18T10:00:00.000Z'),
  collectif: false,
  nombreParticipants: 1,
  premierParticipant: { prenom: 'Jean', nom: 'Dupont' },
  statutPresence: StatutPresence('unknown'),
  ...surcharge,
})

describe('libelleParticipants', () => {
  it('nomme le bénéficiaire d’un rendez-vous individuel', () => {
    expect(libelleParticipants(rdv())).toBe('Jean Dupont')
  })

  it('dit « anonyme » quand l’identité n’est pas connue', () => {
    expect(libelleParticipants(rdv({ premierParticipant: null }))).toBe(
      'anonyme',
    )
  })

  it('compte les participants d’un atelier collectif', () => {
    expect(
      libelleParticipants(rdv({ collectif: true, nombreParticipants: 4 })),
    ).toBe('4 participants')
  })

  it('accorde au singulier pour un seul participant', () => {
    expect(
      libelleParticipants(rdv({ collectif: true, nombreParticipants: 1 })),
    ).toBe('1 participant')
  })

  it('accorde au singulier pour zéro participant, comme le veut le français', () => {
    expect(
      libelleParticipants(rdv({ collectif: true, nombreParticipants: 0 })),
    ).toBe('0 participant')
  })
})

describe('phraseRdv', () => {
  it('compose le créneau et la personne', () => {
    const phrase = phraseRdv('Prochain', rdv(), 'Europe/Paris')

    expect(phrase).toContain('Prochain le')
    expect(phrase).toContain('avec Jean Dupont')
  })
})
