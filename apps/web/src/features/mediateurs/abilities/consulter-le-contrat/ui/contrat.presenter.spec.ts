import { type Contrat, EcheanceDuContrat, TypeDeContrat } from '../domain'
import { contratAffiche } from './contrat.presenter'

const contrat = (surcharge: Partial<Contrat>): Contrat => ({
  type: TypeDeContrat('CDD'),
  debut: new Date('2026-01-01T12:00:00Z'),
  fin: new Date('2027-12-31T12:00:00Z'),
  echeance: EcheanceDuContrat('EnCours'),
  ...surcharge,
})

describe('présentation du contrat', () => {
  it('donne le type et la durée du contrat', () => {
    expect(contratAffiche(contrat({})).type).toBe('CDD - Durée 23 mois')
  })

  it('écrit le contrat de projet en toutes lettres', () => {
    expect(
      contratAffiche(contrat({ type: TypeDeContrat('CDP'), fin: null })).type,
    ).toBe('Contrat de projet')
  })

  it('donne la durée seule quand le type est inconnu', () => {
    expect(contratAffiche(contrat({ type: null })).type).toBe('Durée 23 mois')
  })

  it('écrit les dates au format jour/mois/année', () => {
    expect(contratAffiche(contrat({}))).toMatchObject({
      debut: '01/01/2026',
      fin: '31/12/2027',
    })
  })

  it.each([
    ['EnCours', null],
    ['FinProchaine', 'Fin de contrat prochaine'],
    ['Termine', 'Contrat terminé'],
  ] as const)('annonce l’échéance %s', (echeance, libelle) => {
    expect(
      contratAffiche(contrat({ echeance: EcheanceDuContrat(echeance) })).badge
        ?.libelle ?? null,
    ).toBe(libelle)
  })
})
