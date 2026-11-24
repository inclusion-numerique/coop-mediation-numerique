import { describe, expect, it } from 'vitest'
import { liensVersMesRendezVous } from './liens-vers-mes-rendez-vous.presenter'

describe('liens vers mes rendez-vous', () => {
  it('affiche tous les statuts de rendez-vous', () => {
    expect(liensVersMesRendezVous().tous).toBe(
      '/coop/mes-activites?rdvs=unknown,past,seen,revoked,excused,noshow&voir-rdvs=1',
    )
  })

  it('affiche les rendez-vous à venir', () => {
    expect(liensVersMesRendezVous().aVenir).toBe(
      '/coop/mes-activites?rdvs=unknown&voir-rdvs=1',
    )
  })

  it('filtre les rendez-vous passés et honorés', () => {
    expect(liensVersMesRendezVous().passes).toBe(
      '/coop/mes-activites?rdvs=past,seen',
    )
  })
})
