import { adresseCompleteAffichage } from './employeuse-emploi.presenter'

describe('adresseCompleteAffichage', () => {
  it('compose voie, code postal et commune', () => {
    expect(
      adresseCompleteAffichage({
        adresse: 'Rue du Bourg',
        complementAdresse: null,
        codePostal: '26220',
        commune: 'Dieulefit',
      }),
    ).toBe('Rue du Bourg, 26220 Dieulefit')
  })

  // Cas de production : 216 employeuses n'ont pas de voie côté Entrepôt. La
  // composition à virgule fixe rendait « , 66300 Thuir ».
  it('n’ouvre pas sur une virgule quand la voie manque', () => {
    expect(
      adresseCompleteAffichage({
        adresse: null,
        complementAdresse: null,
        codePostal: '66300',
        commune: 'Thuir',
      }),
    ).toBe('66300 Thuir')
  })

  it('intercale le complément d’adresse après la voie', () => {
    expect(
      adresseCompleteAffichage({
        adresse: '12 bis rue du Général Leclerc',
        complementAdresse: '4e étage',
        codePostal: '51100',
        commune: 'Reims',
      }),
    ).toBe('12 bis rue du Général Leclerc (4e étage), 51100 Reims')
  })

  // Un complément sans voie produisait « null (4e étage) ».
  it('ne fabrique pas de voie à partir du seul complément', () => {
    expect(
      adresseCompleteAffichage({
        adresse: null,
        complementAdresse: '4e étage',
        codePostal: '51100',
        commune: 'Reims',
      }),
    ).toBe('(4e étage), 51100 Reims')
  })

  it('vaut null quand aucun morceau n’est renseigné', () => {
    expect(
      adresseCompleteAffichage({
        adresse: null,
        complementAdresse: null,
        codePostal: null,
        commune: null,
      }),
    ).toBeNull()
  })
})
