import { couvre } from './client-api'
import { estValideLe, finApresDebut } from './periode-de-validite'

const maintenant = new Date('2026-10-26T12:00:00Z')

describe('client API', () => {
  it('couvre les portées qu’il détient', () => {
    expect(
      couvre({ portees: ['Activites', 'Structures'] }, ['Activites']),
    ).toBe(true)
  })

  it('ne couvre pas une portée qu’il ne détient pas', () => {
    expect(
      couvre({ portees: ['Activites'] }, ['Activites', 'Statistiques']),
    ).toBe(false)
  })

  it.each([
    ['commencée et sans fin', '2026-01-01', null, true],
    ['commencée et pas encore finie', '2026-01-01', '2026-12-31', true],
    ['pas encore commencée', '2026-11-01', null, false],
    ['finie', '2026-01-01', '2026-06-30', false],
  ])('juge valide une période %s : %s', (_, debut, fin, attendu) => {
    expect(
      estValideLe(
        { debut: new Date(debut), fin: fin == null ? null : new Date(fin) },
        maintenant,
      ),
    ).toBe(attendu)
  })

  it('refuse une fin qui précède le début', () => {
    expect(
      finApresDebut({
        debut: new Date('2026-06-01'),
        fin: new Date('2026-05-31'),
      }),
    ).toBe(false)
  })

  it('accepte une fin le jour du début', () => {
    expect(
      finApresDebut({
        debut: new Date('2026-06-01'),
        fin: new Date('2026-06-01'),
      }),
    ).toBe(true)
  })
})
