import { subDays } from 'date-fns'
import { getUserPublicActivityStatus } from './getUserPublicActivityStatus'

describe('Statut public d’activité', () => {
  it('est inactif sans aucune activité', () => {
    expect(getUserPublicActivityStatus({ lastActivityDate: null })).toEqual({
      status: 'inactif',
      label: 'Inactif',
    })
  })

  it('est actif avec une activité de moins de 30 jours', () => {
    expect(
      getUserPublicActivityStatus({
        lastActivityDate: subDays(new Date(), 29),
      }).status,
    ).toBe('actif')
  })

  it('est inactif avec une dernière activité de plus de 30 jours', () => {
    expect(
      getUserPublicActivityStatus({
        lastActivityDate: subDays(new Date(), 31),
      }).status,
    ).toBe('inactif')
  })
})
