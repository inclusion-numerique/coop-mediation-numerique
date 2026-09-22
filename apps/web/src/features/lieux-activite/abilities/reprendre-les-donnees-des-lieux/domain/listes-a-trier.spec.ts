import { lieuAReprendre } from './lieu-a-reprendre.fixture'
import { colonnesATrier } from './listes-a-trier'

describe('les colonnes à trier', () => {
  it('n’en retient aucune quand tout est déjà en ordre', () => {
    expect(colonnesATrier(lieuAReprendre())).toEqual([])
  })

  it('retient la colonne désordonnée et elle seule', () => {
    expect(
      colonnesATrier(
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
      colonnesATrier(
        lieuAReprendre({ itinerance: ['Itinérant', 'Itinérant'] }),
      ),
    ).toEqual(['itinerance'])
  })

  it('retient chaque colonne désordonnée d’un même lieu', () => {
    expect(
      colonnesATrier(
        lieuAReprendre({
          services: [
            'Utilisation sécurisée du numérique',
            'Aide aux démarches administratives',
          ],
          autresFormationsLabels: ['Zèbre', 'Abeille'],
        }),
      ),
    ).toEqual(['services', 'autresFormationsLabels'])
  })

  it('ordonne selon la collation française et non selon les points de code', () => {
    expect(
      colonnesATrier(
        lieuAReprendre({
          publicsSpecifiquementAdresses: ['Étudiants', 'Femmes'],
        }),
      ),
    ).toEqual([])
  })
})
