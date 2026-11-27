import { describe, expect, it } from 'vitest'
import { SourceAffectation } from './source-affectation'

describe('source d’une affectation', () => {
  it.each<{ cas: string; saisie: string | null; source: string }>([
    { cas: 'le dispositif', saisie: 'idposte', source: 'idposte' },
    {
      cas: 'le déclaratif, quelle que soit sa casse',
      saisie: ' Coop ',
      source: 'coop',
    },
    {
      cas: 'un producteur inconnu comme autre',
      saisie: 'rdvsp',
      source: 'autre',
    },
    { cas: 'une source absente comme autre', saisie: null, source: 'autre' },
  ])('reconnaît $cas', ({ saisie, source }) => {
    expect(SourceAffectation(saisie)).toBe(source)
  })
})
