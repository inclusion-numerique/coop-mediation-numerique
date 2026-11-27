import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { EmployeuseId } from '../domain/employeuse-id'
import { employeuseLue } from './employeuse-lue.transfer'

const sansReferent: { readonly _tag: 'nonRenseigne' } = {
  _tag: 'nonRenseigne',
}

const consultee = (denomination: string | null) => ({
  employeuse: {
    id: EmployeuseId(42),
    denomination,
    siret: null,
    rna: null,
    adresse: null,
    contactReferent: sansReferent,
  },
})

describe('l’employeuse consultée devient une employeuse lue', () => {
  it('décode sa dénomination en nom de lieu', () => {
    expect(employeuseLue(consultee('Association du numérique'))).toEqual({
      employeuse: {
        ...consultee(null).employeuse,
        denomination: Nom('Association du numérique'),
      },
    })
  })

  it('n’a pas de dénomination quand elle n’en porte pas', () => {
    expect(employeuseLue(consultee(null))).toEqual(consultee(null))
  })

  it('n’existe pas sans employeuse consultée', () => {
    expect(employeuseLue(null)).toBeNull()
  })
})
