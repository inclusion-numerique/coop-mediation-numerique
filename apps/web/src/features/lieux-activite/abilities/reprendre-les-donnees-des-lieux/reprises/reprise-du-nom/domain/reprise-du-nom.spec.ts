import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import { nomAReprendre } from './reprise-du-nom'

const verdict = (nom: string) => nomAReprendre(lieuAReprendre({ nom }))

describe('le nom, nettoyé selon le standard', () => {
  it('laisse en place un nom propre', () => {
    expect(verdict('Espace numérique de Reims')).toBeNull()
  })

  it('ne touche pas à la casse', () => {
    expect(verdict('LA POSTE')).toBeNull()
  })

  it('réunit les espaces multiples', () => {
    expect(verdict('COMMUNAUTE DE COMMUNES  MASSIF DU SANCY')).toEqual({
      corrige: 'COMMUNAUTE DE COMMUNES MASSIF DU SANCY',
    })
  })

  it('retire les espaces en bord', () => {
    expect(verdict('MDF Itinérante, sud - GENILAC ')).toEqual({
      corrige: 'MDF Itinérante, sud - GENILAC',
    })
  })

  it('retire les guillemets droits', () => {
    expect(verdict('COMMUNAUTE D\'AGGLOMERATION "VITRE COMMUNAUTE"')).toEqual({
      corrige: "COMMUNAUTE D'AGGLOMERATION VITRE COMMUNAUTE",
    })
  })

  it('met sur une ligne un nom qui en porte plusieurs', () => {
    expect(verdict('Maison France\nServices')).toEqual({
      corrige: 'Maison France Services',
    })
  })
})
