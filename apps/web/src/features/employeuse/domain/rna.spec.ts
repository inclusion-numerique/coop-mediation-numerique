import { z } from 'zod'
import { Rna } from './rna'

describe('Rna', () => {
  it('accepte un numéro RNA — W suivi de 9 chiffres', () => {
    expect(Rna('W123456789')).toBe('W123456789')
  })

  it('normalise la casse et les espaces de bord', () => {
    expect(Rna(' w123456789 ')).toBe('W123456789')
  })

  it('écarte ce qui n’est pas un RNA', () => {
    expect(Rna.safe('123456789')).toBeNull()
    expect(Rna.safe('W12345678')).toBeNull()
    expect(Rna.safe('W1234567890')).toBeNull()
    expect(Rna.safe('')).toBeNull()
  })

  // Rna n'est aujourd'hui consommé que par son constructeur (`Rna.safe` dans le
  // transfer), mais sa normalisation vivait dans un préprocesseur qui aurait été
  // contourné à la première composition. Ce test fixe le comportement composé.
  it('normalise aussi imbriqué dans le schéma d’un autre modèle', () => {
    const Association = z.object({ rna: Rna.schema })

    expect(Association.parse({ rna: ' w123456789 ' })).toEqual({
      rna: 'W123456789',
    })
  })
})
