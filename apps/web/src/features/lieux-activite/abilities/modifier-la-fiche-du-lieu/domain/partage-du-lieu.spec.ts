import { NombreDActivites, NombreDeMediateurs } from '../../../domain/nombres'
import { estPartage } from './partage-du-lieu'

describe('un lieu est partagé', () => {
  it('quand un autre médiateur y exerce', () => {
    expect(
      estPartage({
        autresMediateurs: NombreDeMediateurs(1),
        activites: NombreDActivites(0),
      }),
    ).toBe(true)
  })

  it('pas quand personne d’autre n’y exerce, même s’il porte des activités', () => {
    expect(
      estPartage({
        autresMediateurs: NombreDeMediateurs(0),
        activites: NombreDActivites(120),
      }),
    ).toBe(false)
  })
})
