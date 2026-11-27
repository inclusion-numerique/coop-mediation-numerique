import { describe, expect, it } from 'vitest'
import { RoleMembre, roleMembre } from './role-membre'

describe('rôle d’un membre', () => {
  it.each<{ cas: string; conseillerNumerique: boolean; role: RoleMembre }>([
    {
      cas: 'conseiller numérique dans le dispositif',
      conseillerNumerique: true,
      role: RoleMembre('ConseillerNumerique'),
    },
    {
      cas: 'médiateur numérique hors du dispositif',
      conseillerNumerique: false,
      role: RoleMembre('MediateurNumerique'),
    },
  ])('est $cas', ({ conseillerNumerique, role }) => {
    expect(roleMembre(conseillerNumerique)).toBe(role)
  })
})
