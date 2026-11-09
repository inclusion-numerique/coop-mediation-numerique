import {
  creerLieuActiviteDefaultValues,
  toCreerLieuData,
} from './creer-lieu-activite.form-data'

describe('saisie de création projetée vers le contrat de création', () => {
  it('un champ texte vidé devient une absence', () => {
    const data = toCreerLieuData(creerLieuActiviteDefaultValues('Tiers-lieu'))

    expect(data).toMatchObject({
      nom: 'Tiers-lieu',
      complementAdresse: null,
      presentationResume: null,
      presentationDetail: null,
      siteWeb: null,
      ficheAccesLibre: null,
      priseRdv: null,
      horairesComment: null,
      modalitesAcces: { numeroTelephone: null, adresseMail: null },
    })
  })

  it('un champ texte qui ne contient que des espaces devient une absence', () => {
    const data = toCreerLieuData({
      ...creerLieuActiviteDefaultValues(),
      siteWeb: '   ',
      modalitesAcces: {
        ...creerLieuActiviteDefaultValues().modalitesAcces,
        adresseMail: ' ',
      },
    })

    expect(data.siteWeb).toBeNull()
    expect(data.modalitesAcces.adresseMail).toBeNull()
  })

  it('un champ texte renseigné est transmis tel quel', () => {
    const data = toCreerLieuData({
      ...creerLieuActiviteDefaultValues(),
      complementAdresse: 'Bâtiment B',
      horairesComment: 'Fermé les jours fériés',
      modalitesAcces: {
        surPlace: true,
        parTelephone: true,
        numeroTelephone: '0102030405',
        parMail: null,
        adresseMail: '',
      },
    })

    expect(data.complementAdresse).toBe('Bâtiment B')
    expect(data.horairesComment).toBe('Fermé les jours fériés')
    expect(data.modalitesAcces).toEqual({
      surPlace: true,
      parTelephone: true,
      numeroTelephone: '0102030405',
      parMail: null,
      adresseMail: null,
    })
  })
})
