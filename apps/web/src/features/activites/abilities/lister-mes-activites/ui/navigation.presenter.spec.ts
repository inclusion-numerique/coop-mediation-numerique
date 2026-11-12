import {
  parametresDeNavigation,
  parametresDePagination,
  rendezVousFiltrablesDansLaListe,
  rendezVousFiltrablesDansLeTableau,
} from './navigation.presenter'

const compte = { includeRdvsInActivitesList: false }

describe('navigation de la liste', () => {
  it('ne conserve que les paramètres de navigation simples', () => {
    expect(
      parametresDeNavigation({
        page: '2',
        lignes: '20',
        ordre: 'asc',
        types: 'individuel',
        'voir-rdvs': ['1', '0'],
      }),
    ).toEqual({ page: '2', lignes: '20', ordre: 'asc' })
  })

  it('ne conserve que la pagination', () => {
    expect(
      parametresDePagination({ page: '3', lignes: '10', ordre: 'asc' }),
    ).toEqual({ page: '3', lignes: '10' })
  })

  it("ne propose les rendez-vous qu'avec un compte connecté", () => {
    expect(
      rendezVousFiltrablesDansLaListe({
        compte: null,
        voirLesRdvs: true,
        statutsDemandes: 2,
      }),
    ).toBe(false)
  })

  it('propose les rendez-vous de la liste dès que des statuts sont demandés', () => {
    expect(
      rendezVousFiltrablesDansLaListe({
        compte,
        voirLesRdvs: false,
        statutsDemandes: 1,
      }),
    ).toBe(true)
  })

  it('propose les rendez-vous du tableau seulement quand ils sont affichés', () => {
    expect(
      rendezVousFiltrablesDansLeTableau({ compte, voirLesRdvs: false }),
    ).toBe(false)
    expect(
      rendezVousFiltrablesDansLeTableau({ compte, voirLesRdvs: true }),
    ).toBe(true)
  })
})
