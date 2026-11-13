import { reponseRecue, saisieEnCours } from './suggestions'

const depart = { saisie: '', items: [], payload: {} }

describe('suggestions d’un combo', () => {
  it('affiche la réponse à la saisie en cours', () => {
    const etat = reponseRecue('Gourin', {
      items: ['Gourin'],
      payload: {},
    })(saisieEnCours<string, object>('Gourin')(depart))

    expect(etat.items).toEqual(['Gourin'])
  })

  it('ignore la réponse arrivée après une saisie plus récente', () => {
    const apresGourin = reponseRecue('Gourin', {
      items: ['Gourin'],
      payload: {},
    })(
      saisieEnCours<string, object>('Gourin')(
        saisieEnCours<string, object>('Gour')(depart),
      ),
    )

    const etat = reponseRecue('Gour', {
      items: ['Gournay-sur-Marne', 'Gourbeyre', 'Gourin'],
      payload: {},
    })(apresGourin)

    expect(etat.items).toEqual(['Gourin'])
  })

  it('complète la charge utile au début de la saisie', () => {
    const etat = saisieEnCours<string, { chargement: boolean }>('Gou', {
      chargement: true,
    })({ saisie: '', items: [], payload: { chargement: false } })

    expect(etat.payload).toEqual({ chargement: true })
  })
})
