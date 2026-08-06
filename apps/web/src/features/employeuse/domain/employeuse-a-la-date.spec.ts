import { affectation, contrat } from './employeuse.fixture'
import { employeuseALaDate } from './employeuse-a-la-date'

const juin2026 = new Date('2026-06-01')

describe('employeuseALaDate', () => {
  it('retient l’employeuse du contrat qui couvre la date', () => {
    const employeuse = employeuseALaDate(
      [affectation('idposte', 1)],
      [
        contrat(10, {
          debut: new Date('2025-01-01'),
          fin: new Date('2025-12-31'),
        }),
        contrat(11, { debut: new Date('2026-01-01') }),
      ],
      new Date('2025-06-01'),
    )

    // La date de 2025 tombe sur le contrat de 2025, pas sur l'affectation active.
    expect(employeuse?.id).toBe(10)
  })

  it('retient le contrat toujours ouvert pour une date postérieure à son début', () => {
    const employeuse = employeuseALaDate(
      [affectation('idposte', 1)],
      [contrat(11, { debut: new Date('2026-01-01') })],
      juin2026,
    )
    expect(employeuse?.id).toBe(11)
  })

  it('retombe sur l’employeuse courante quand aucun contrat ne couvre la date', () => {
    const employeuse = employeuseALaDate([affectation('coop', 1)], [], juin2026)
    expect(employeuse?.id).toBe(1)
  })

  it('retombe sur l’employeuse courante pour une date antérieure à tout contrat', () => {
    const employeuse = employeuseALaDate(
      [affectation('coop', 1)],
      [contrat(11, { debut: new Date('2026-01-01') })],
      new Date('2020-06-01'),
    )
    expect(employeuse?.id).toBe(1)
  })

  it('applique la priorité de source au repli sur l’employeuse courante', () => {
    const employeuse = employeuseALaDate(
      [affectation('coop', 1), affectation('idposte', 2)],
      [],
      juin2026,
    )
    expect(employeuse?.id).toBe(2)
  })

  it('n’a pas d’employeuse sans affectation ni contrat', () => {
    expect(employeuseALaDate([], [], juin2026)).toBeNull()
  })
})
