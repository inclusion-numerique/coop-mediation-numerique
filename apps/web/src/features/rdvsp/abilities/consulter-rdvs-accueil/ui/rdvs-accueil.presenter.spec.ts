import { RdvId } from '../../../domain/rdv-id'
import { StatutPresence } from '../../../domain/statut-presence'
import type { RdvEnUneLigne } from '../domain/donnees-accueil-rdv'
import { phraseRdv } from './rdvs-accueil.presenter'

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

const creneau = 'mardi 18 août de 11h00 à 12h00'

describe('phraseRdv', () => {
  it('compose le créneau et nomme le bénéficiaire d’un rendez-vous individuel', () => {
    expect(phraseRdv('Prochain', rdv(), 'Europe/Paris')).toBe(
      `Prochain le ${creneau} avec Jean Dupont`,
    )
  })

  it('dit « anonyme » quand l’identité n’est pas connue', () => {
    expect(
      phraseRdv('Prochain', rdv({ premierParticipant: null }), 'Europe/Paris'),
    ).toBe(`Prochain le ${creneau} avec anonyme`)
  })

  it('compte les participants d’un atelier collectif', () => {
    expect(
      phraseRdv(
        'Prochain',
        rdv({ collectif: true, nombreParticipants: 4 }),
        'Europe/Paris',
      ),
    ).toBe(`Prochain le ${creneau} avec 4 participants`)
  })

  it('accorde au singulier pour un seul participant', () => {
    expect(
      phraseRdv(
        'Prochain',
        rdv({ collectif: true, nombreParticipants: 1 }),
        'Europe/Paris',
      ),
    ).toBe(`Prochain le ${creneau} avec 1 participant`)
  })

  it('accorde au singulier pour zéro participant, comme le veut le français', () => {
    expect(
      phraseRdv(
        'Prochain',
        rdv({ collectif: true, nombreParticipants: 0 }),
        'Europe/Paris',
      ),
    ).toBe(`Prochain le ${creneau} avec 0 participant`)
  })
})
