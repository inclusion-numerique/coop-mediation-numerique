import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { Rna } from './rna'

const AssociationQuiComposeLeRna = z.object({ rna: Rna.schema })

describe('Rna', () => {
  it('accepte un numéro RNA, W suivi de 9 chiffres', () => {
    expect(Rna('W123456789')).toBe('W123456789')
  })

  it('normalise la casse et les espaces de bord', () => {
    expect(Rna(' w123456789 ')).toBe('W123456789')
  })

  it.each<{ cas: string; saisie: string }>([
    { cas: 'neuf chiffres sans W', saisie: '123456789' },
    { cas: 'W suivi de huit chiffres', saisie: 'W12345678' },
    { cas: 'W suivi de dix chiffres', saisie: 'W1234567890' },
    { cas: 'une chaîne vide', saisie: '' },
  ])('écarte $cas, qui n’est pas un RNA', ({ saisie }) => {
    expect(Rna.safe(saisie)).toBeNull()
  })

  it('normalise aussi imbriqué dans le schéma d’un autre modèle, sans dépendre d’un préprocesseur contourné à la composition', () => {
    expect(AssociationQuiComposeLeRna.parse({ rna: ' w123456789 ' })).toEqual({
      rna: 'W123456789',
    })
  })
})
