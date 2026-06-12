import { canMutateDuringMaintenance } from '@app/web/features/maintenance-mode/domain/canMutateDuringMaintenance'

describe('canMutateDuringMaintenance', () => {
  it('autorise toutes les écritures hors maintenance', () => {
    expect(canMutateDuringMaintenance({ role: 'User', active: false })).toBe(
      true,
    )
    expect(canMutateDuringMaintenance({ role: 'Admin', active: false })).toBe(
      true,
    )
    expect(canMutateDuringMaintenance({ role: 'Support', active: false })).toBe(
      true,
    )
  })

  it('bloque les médiateurs/coordinateurs (role User) pendant la maintenance', () => {
    expect(canMutateDuringMaintenance({ role: 'User', active: true })).toBe(
      false,
    )
  })

  it('laisse passer les admins et le support pendant la maintenance', () => {
    expect(canMutateDuringMaintenance({ role: 'Admin', active: true })).toBe(
      true,
    )
    expect(canMutateDuringMaintenance({ role: 'Support', active: true })).toBe(
      true,
    )
  })
})
