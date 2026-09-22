import { lieuAReprendre } from './lieu-a-reprendre.fixture'
import { colonnesARanger } from './listes-mesurees'

describe('les colonnes à ranger', () => {
  it('ne retient aucune colonne quand tout est déjà rangé', () => {
    expect(colonnesARanger(lieuAReprendre())).toEqual([])
  })

  it('retient la colonne désordonnée et elle seule', () => {
    expect(
      colonnesARanger(
        lieuAReprendre({
          services: [
            'Utilisation sécurisée du numérique',
            'Aide aux démarches administratives',
          ],
        }),
      ),
    ).toEqual(['services'])
  })

  it('retient une colonne qui répète une valeur', () => {
    expect(
      colonnesARanger(
        lieuAReprendre({ itinerance: ['Itinérant', 'Itinérant'] }),
      ),
    ).toEqual(['itinerance'])
  })

  it('range selon la collation française et non selon les points de code', () => {
    expect(
      colonnesARanger(
        lieuAReprendre({
          publicsSpecifiquementAdresses: ['Étudiants', 'Femmes'],
        }),
      ),
    ).toEqual([])
  })
})
