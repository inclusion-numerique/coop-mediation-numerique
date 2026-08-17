import { etatDerniereSynchro, type TraceSynchro } from './bilan-synchro'

const debut = new Date('2026-08-17T10:00:00.000Z')

const trace = (surcharge: Partial<TraceSynchro> = {}): TraceSynchro => ({
  debut,
  fin: new Date('2026-08-17T10:00:45.000Z'),
  erreur: null,
  derive: 0,
  ...surcharge,
})

describe('etatDerniereSynchro', () => {
  it('reconnaît un compte jamais synchronisé', () => {
    expect(etatDerniereSynchro(null)._tag).toBe('jamaisLancee')
  })

  it('reconnaît une synchronisation en cours, et non échouée', () => {
    // Le journal est écrit au démarrage et complété à l'arrivée : une trace sans
    // fin décrit un passage en cours.
    expect(etatDerniereSynchro(trace({ fin: null }))).toEqual({
      _tag: 'enCours',
      depuis: debut,
    })
  })

  it('reconnaît une synchronisation en cours même si une dérive est notée', () => {
    expect(etatDerniereSynchro(trace({ fin: null, derive: 12 }))._tag).toBe(
      'enCours',
    )
  })

  it('remonte l’erreur d’une synchronisation échouée', () => {
    expect(etatDerniereSynchro(trace({ erreur: 'timeout' }))).toEqual({
      _tag: 'echouee',
      message: 'timeout',
    })
  })

  it('fait primer l’erreur sur la dérive', () => {
    expect(
      etatDerniereSynchro(trace({ erreur: 'timeout', derive: 12 }))._tag,
    ).toBe('echouee')
  })

  it('signale une dérive avec sa durée', () => {
    expect(etatDerniereSynchro(trace({ derive: 12 }))).toEqual({
      _tag: 'avecDerive',
      derive: 12,
      dureeEnSecondes: 45,
    })
  })

  it('tient pour saine une synchronisation sans erreur ni dérive', () => {
    expect(etatDerniereSynchro(trace())).toEqual({
      _tag: 'saine',
      dureeEnSecondes: 45,
    })
  })
})
