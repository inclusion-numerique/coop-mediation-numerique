import { outilsAccompagnementsVisibles } from './outilsAccompagnements'

const titresVisibles = (profil: {
  coordinateur: boolean
  conseillerNumerique: boolean
}) => outilsAccompagnementsVisibles(profil).map(({ title }) => title)

describe('outilsAccompagnementsVisibles', () => {
  it('montre au médiateur hors dispositif les outils communs à tous', () => {
    expect(
      titresVisibles({ coordinateur: false, conseillerNumerique: false }),
    ).toEqual([
      'Aidants Connect',
      'La Cartographie Nationale des lieux d’inclusion numérique',
      'Les Bases du numérique d’intérêt général',
      'Mattermost de la médiation numérique',
    ])
  })

  it('ajoute au conseiller numérique la base des contributions et le centre d’aide du dispositif', () => {
    expect(
      titresVisibles({ coordinateur: false, conseillerNumerique: true }),
    ).toEqual([
      'Aidants Connect',
      'La Cartographie Nationale des lieux d’inclusion numérique',
      'Les Bases du numérique d’intérêt général',
      'La Base “Conseiller numérique - contributions”',
      'Mattermost de la médiation numérique',
      'Centre d’aide du dispositif Conseiller Numérique',
    ])
  })

  it('ajoute au coordinateur hors dispositif Mon Inclusion Numérique, avant les Bases', () => {
    expect(
      titresVisibles({ coordinateur: true, conseillerNumerique: false }),
    ).toEqual([
      'Aidants Connect',
      'La Cartographie Nationale des lieux d’inclusion numérique',
      'Mon Inclusion Numérique',
      'Les Bases du numérique d’intérêt général',
      'Mattermost de la médiation numérique',
    ])
  })

  it('montre au coordinateur du dispositif tous les outils, base des coordinateurs comprise', () => {
    expect(
      titresVisibles({ coordinateur: true, conseillerNumerique: true }),
    ).toEqual([
      'Aidants Connect',
      'La Cartographie Nationale des lieux d’inclusion numérique',
      'Mon Inclusion Numérique',
      'Les Bases du numérique d’intérêt général',
      'La Base “Conseiller numérique - contributions”',
      'La Base “Conseillers numériques coordinateurs”',
      'Mattermost de la médiation numérique',
      'Centre d’aide du dispositif Conseiller Numérique',
    ])
  })

  it('ne propose « En savoir plus » que pour les outils qui ont une page dédiée', () => {
    expect(
      outilsAccompagnementsVisibles({
        coordinateur: true,
        conseillerNumerique: true,
      })
        .filter(({ slug }) => slug === undefined)
        .map(({ title }) => title),
    ).toEqual([
      'La Base “Conseiller numérique - contributions”',
      'La Base “Conseillers numériques coordinateurs”',
      'Mattermost de la médiation numérique',
      'Centre d’aide du dispositif Conseiller Numérique',
    ])
  })
})
