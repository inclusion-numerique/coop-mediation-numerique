import { describe, expect, it } from 'vitest'
import { critereDuStatut, FiltreStatut, type Intervalle } from './filtre-statut'

const MAINTENANT = new Date('2026-10-21T12:00:00.000Z')

const ilYA = (jours: number): Date =>
  new Date(MAINTENANT.getTime() - jours * 24 * 60 * 60 * 1000)

describe('critère d’un filtre de statut', () => {
  it.each<[FiltreStatut, Intervalle]>([
    [FiltreStatut('inscription0'), { apres: ilYA(7), auPlusTard: null }],
    [FiltreStatut('inscription7'), { apres: ilYA(30), auPlusTard: ilYA(7) }],
    [FiltreStatut('inscription90'), { apres: null, auPlusTard: ilYA(90) }],
  ])('%s borne la date de création', (filtre, creation) => {
    expect(critereDuStatut(filtre, MAINTENANT)).toEqual({
      _tag: 'InscriptionEnCours',
      creation,
    })
  })

  it.each<[FiltreStatut, Intervalle]>([
    [FiltreStatut('nouveau0'), { apres: ilYA(7), auPlusTard: null }],
    [FiltreStatut('nouveau60'), { apres: ilYA(90), auPlusTard: ilYA(60) }],
  ])('%s borne la date d’inscription', (filtre, inscription) => {
    expect(critereDuStatut(filtre, MAINTENANT)).toEqual({
      _tag: 'Nouveau',
      inscription,
    })
  })

  it('actif retient une activité des 30 derniers jours', () => {
    expect(critereDuStatut(FiltreStatut('actif'), MAINTENANT)).toEqual({
      _tag: 'Actif',
      activiteApres: ilYA(30),
    })
  })

  it.each<[FiltreStatut, Intervalle]>([
    [FiltreStatut('inactif30'), { apres: ilYA(90), auPlusTard: ilYA(30) }],
    [FiltreStatut('inactif90'), { apres: ilYA(180), auPlusTard: ilYA(90) }],
    [FiltreStatut('inactif180'), { apres: null, auPlusTard: ilYA(180) }],
  ])('%s borne la dernière activité', (filtre, activite) => {
    expect(critereDuStatut(filtre, MAINTENANT)).toEqual({
      _tag: 'Inactif',
      activite,
    })
  })

  it('deleted vise les comptes supprimés', () => {
    expect(critereDuStatut(FiltreStatut('deleted'), MAINTENANT)).toEqual({
      _tag: 'Supprime',
    })
  })
})
