import {
  CraDateValidation,
  debutDispositifConum,
} from '@app/web/features/activites/ui/saisie/validation/CraDateValidation'

describe('CraDateValidation', () => {
  it('accepte une date postérieure au début du dispositif', () => {
    expect(() => CraDateValidation.parse('2024-08-01')).not.toThrow()
  })

  it('accepte le jour du début du dispositif', () => {
    expect(() => CraDateValidation.parse(debutDispositifConum)).not.toThrow()
  })

  it('refuse la veille du début du dispositif', () => {
    expect(() => CraDateValidation.parse('2020-11-16')).toThrow(
      'La date ne peut pas être antérieure au 17/11/2020, début du dispositif Conseiller numérique',
    )
  })

  it('refuse une date invalide', () => {
    expect(() => CraDateValidation.parse('2024-13-01')).toThrow(
      'Veuillez renseigner une date valide',
    )
  })

  it('refuse une date au-delà de deux ans', () => {
    expect(() => CraDateValidation.parse('2525-11-14')).toThrow(
      'La date ne peut pas dépasser deux ans à partir d’aujourd’hui',
    )
  })

  it('accepte une activité planifiée l’an prochain', () => {
    const anneeProchaine = `${new Date().getFullYear() + 1}-06-15`
    expect(CraDateValidation.parse(anneeProchaine)).toBe(anneeProchaine)
  })
})
