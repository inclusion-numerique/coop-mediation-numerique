import { debutEmploi, finEmploi, PeriodeEmploi } from './periode-emploi'

const debut = new Date('2026-03-01')
const fin = new Date('2026-09-01')
const rupture = new Date('2026-07-01')

describe('PeriodeEmploi', () => {
  it('est inconnue sans aucune date — le contrat peut ne pas exister', () => {
    expect(PeriodeEmploi({ debut: null, fin: null, rupture: null })).toEqual({
      _tag: 'inconnue',
    })
  })

  it('est en cours avec un début et aucun terme', () => {
    expect(PeriodeEmploi({ debut, fin: null, rupture: null })).toEqual({
      _tag: 'enCours',
      debut,
    })
  })

  it('est terminée dès qu’un terme est posé', () => {
    expect(PeriodeEmploi({ debut, fin, rupture: null })).toEqual({
      _tag: 'terminee',
      debut,
      fin,
    })
  })

  it('retient la rupture comme terme à défaut de date de fin', () => {
    expect(PeriodeEmploi({ debut, fin: null, rupture })).toEqual({
      _tag: 'terminee',
      debut,
      fin: rupture,
    })
  })

  it('accepte une fin sans début — la base l’autorise', () => {
    expect(PeriodeEmploi({ debut: null, fin, rupture: null })).toEqual({
      _tag: 'terminee',
      debut: null,
      fin,
    })
  })

  it('expose des dates plates pour les affichages', () => {
    const enCours = PeriodeEmploi({ debut, fin: null, rupture: null })
    expect(debutEmploi(enCours)).toEqual(debut)
    expect(finEmploi(enCours)).toBeNull()
    expect(debutEmploi({ _tag: 'inconnue' })).toBeNull()
  })
})
