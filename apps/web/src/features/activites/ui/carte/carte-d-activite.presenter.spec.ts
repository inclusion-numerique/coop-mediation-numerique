import { accompagnementSuivi, atelierMixte } from '../fixtures-de-consultation'
import { carteDActivite } from './carte-d-activite.presenter'

describe('carte d’une activité', () => {
  it('montre deux thématiques, le reste en nombre, et le bénéficiaire suivi', () => {
    const carte = carteDActivite(accompagnementSuivi(), 'Europe/Paris')
    expect({
      thematiques: carte.thematiques.length,
      autres: carte.autresThematiques,
      personnes: carte.personnes,
      rdv: carte.issueDUnRendezVous,
    }).toEqual({
      thematiques: 2,
      autres: 2,
      personnes: { _tag: 'Beneficiaire', nom: 'Camille Martin' },
      rdv: true,
    })
  })

  it('compte les participants d’un atelier, suivis et anonymes', () => {
    const carte = carteDActivite(atelierMixte(), 'Europe/Paris')
    expect([carte.titreDAtelier, carte.personnes]).toEqual([
      'Découvrir sa messagerie',
      { _tag: 'Participants', texte: '4 participants' },
    ])
  })
})
