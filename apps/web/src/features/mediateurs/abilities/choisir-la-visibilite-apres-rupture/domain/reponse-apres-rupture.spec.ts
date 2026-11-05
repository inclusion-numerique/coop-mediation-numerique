import { ReponseApresRupture, visibiliteApres } from './reponse-apres-rupture'

describe('visibilité après la réponse à la rupture', () => {
  it('rend visible quand la personne souhaite apparaître', () => {
    expect(visibiliteApres(ReponseApresRupture('SouhaiteApparaitre'))).toBe(
      true,
    )
  })

  it('masque quand la personne préfère rester masquée', () => {
    expect(visibiliteApres(ReponseApresRupture('PrefereResterMasque'))).toBe(
      false,
    )
  })
})
