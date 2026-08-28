import { Role } from '@app/web/features/inscription/domain'
import { rolesACreerPourRole } from './roles-a-creer'

describe('rolesACreerPourRole', () => {
  it('un médiateur garantit un compte médiateur seul', () => {
    expect(rolesACreerPourRole(Role('Mediateur'))).toEqual({
      mediateur: true,
      coordinateur: false,
    })
  })

  it('un coordinateur garantit un compte coordinateur seul', () => {
    expect(rolesACreerPourRole(Role('Coordinateur'))).toEqual({
      mediateur: false,
      coordinateur: true,
    })
  })
})
