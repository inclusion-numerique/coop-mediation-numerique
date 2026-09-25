import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import { telephoneAReprendre } from './telephone-a-reprendre'

const verdict = (telephone: string | null, codePostal = '51100') =>
  telephoneAReprendre(lieuAReprendre({ telephone, codePostal }))

describe('le verdict sur le téléphone d’un lieu', () => {
  it('ne reproche rien à un numéro déjà écrit en E.164', () => {
    expect(verdict('+33450314695')).toBeNull()
  })

  it('ne reproche rien à un lieu sans téléphone', () => {
    expect(verdict(null)).toBeNull()
  })

  it.each([
    ['04 50 31 46 95', '+33450314695'],
    ['0149747780', '+33149747780'],
    ['0675208146', '+33675208146'],
  ])('réécrit %s en E.164', (brut, attendu) => {
    expect(verdict(brut)).toEqual({ verdict: 'a-corriger', corrige: attendu })
  })

  it('prend l’indicatif du territoire dans le code postal', () => {
    expect(verdict('0590123456', '97110')).toEqual({
      verdict: 'a-corriger',
      corrige: '+590590123456',
    })
  })

  it('efface un numéro qu’aucun territoire français ne reconnaît', () => {
    expect(verdict('+508608839449')).toEqual({
      verdict: 'a-effacer',
      valeur: '+508608839449',
    })
  })
})
