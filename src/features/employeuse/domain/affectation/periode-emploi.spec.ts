import { describe, expect, it } from 'vitest'
import {
  couvre,
  debutEmploi,
  estTerminee,
  finEmploi,
  PeriodeEmploi,
} from './periode-emploi'

const avantLeDebut = new Date('2026-02-01')
const debut = new Date('2026-03-01')
const avantLeTerme = new Date('2026-06-01')
const rupture = new Date('2026-07-01')
const fin = new Date('2026-09-01')
const apresLeTerme = new Date('2026-10-01')
const apresTousLesTermes = new Date('2026-12-01')

const inconnue = PeriodeEmploi({
  debut: null,
  fin: null,
  rupture: null,
  maintenant: avantLeTerme,
})

const sansTerme = PeriodeEmploi({
  debut,
  fin: null,
  rupture: null,
  maintenant: avantLeTerme,
})

const enCoursAvecTerme = PeriodeEmploi({
  debut,
  fin,
  rupture: null,
  maintenant: avantLeTerme,
})

const terminee = PeriodeEmploi({
  debut,
  fin,
  rupture: null,
  maintenant: apresTousLesTermes,
})

const termineeSansDebut = PeriodeEmploi({
  debut: null,
  fin,
  rupture: null,
  maintenant: apresTousLesTermes,
})

describe('PeriodeEmploi', () => {
  it('est inconnue sans aucune date, car le contrat peut ne pas exister', () => {
    expect(inconnue).toEqual({ _tag: 'inconnue' })
  })

  it('est en cours avec un début et aucun terme', () => {
    expect(sansTerme).toEqual({ _tag: 'enCours', debut, finPrevue: null })
  })

  it('reste en cours quand le terme est encore devant, et le conserve, au lieu d’être terminée dès la signature', () => {
    expect(enCoursAvecTerme).toEqual({
      _tag: 'enCours',
      debut,
      finPrevue: fin,
    })
  })

  it('est terminée une fois le terme passé', () => {
    expect(terminee).toEqual({ _tag: 'terminee', debut, fin })
  })

  it('retient la rupture comme terme à défaut de date de fin', () => {
    expect(
      PeriodeEmploi({
        debut,
        fin: null,
        rupture,
        maintenant: apresTousLesTermes,
      }),
    ).toEqual({ _tag: 'terminee', debut, fin: rupture })
  })

  it('accepte une fin passée sans début, comme la base l’autorise', () => {
    expect(termineeSansDebut).toEqual({ _tag: 'terminee', debut: null, fin })
  })

  it('est inconnue quand un terme à venir n’a pas de début, plutôt que d’inventer une période', () => {
    expect(
      PeriodeEmploi({
        debut: null,
        fin,
        rupture: null,
        maintenant: avantLeTerme,
      }),
    ).toEqual({ _tag: 'inconnue' })
  })
})

describe('dates plates pour les affichages', () => {
  it('rend le début d’un emploi en cours', () => {
    expect(debutEmploi(enCoursAvecTerme)).toEqual(debut)
  })

  it('rend le terme prévu d’un emploi en cours, sans prétendre qu’il est échu', () => {
    expect(finEmploi(enCoursAvecTerme)).toEqual(fin)
  })

  it('ne dit pas révolu un emploi en cours', () => {
    expect(estTerminee(enCoursAvecTerme)).toBe(false)
  })

  it('rend le terme d’un emploi révolu', () => {
    expect(finEmploi(terminee)).toEqual(fin)
  })

  it('dit révolu un emploi terminé', () => {
    expect(estTerminee(terminee)).toBe(true)
  })

  it('ne rend aucun début d’une période inconnue', () => {
    expect(debutEmploi(inconnue)).toBeNull()
  })

  it('ne rend aucun terme d’une période inconnue', () => {
    expect(finEmploi(inconnue)).toBeNull()
  })

  it('ne dit pas révolue une période inconnue', () => {
    expect(estTerminee(inconnue)).toBe(false)
  })
})

describe('couvre', () => {
  it.each<{ cas: string; date: Date; couverte: boolean }>([
    {
      cas: 'couvre une date après son début',
      date: avantLeTerme,
      couverte: true,
    },
    { cas: 'couvre son début', date: debut, couverte: true },
    {
      cas: 'ne couvre pas une date avant son début',
      date: avantLeDebut,
      couverte: false,
    },
  ])('une période sans terme $cas', ({ date, couverte }) => {
    expect(couvre(sansTerme, date)).toBe(couverte)
  })

  it.each<{ cas: string; date: Date; couverte: boolean }>([
    {
      cas: 'couvre une date avant son terme',
      date: avantLeTerme,
      couverte: true,
    },
    { cas: 'couvre son terme', date: fin, couverte: true },
    {
      cas: 'ne couvre pas une date après son terme, même consultée avant',
      date: apresLeTerme,
      couverte: false,
    },
  ])(
    'une période en cours bornée par son terme prévu $cas',
    ({ date, couverte }) => {
      expect(couvre(enCoursAvecTerme, date)).toBe(couverte)
    },
  )

  it.each<{ cas: string; date: Date; couverte: boolean }>([
    {
      cas: 'couvre une date de son intervalle',
      date: avantLeTerme,
      couverte: true,
    },
    { cas: 'couvre son début', date: debut, couverte: true },
    { cas: 'couvre sa fin', date: fin, couverte: true },
    {
      cas: 'ne couvre pas une date après sa fin',
      date: apresLeTerme,
      couverte: false,
    },
  ])('une période terminée $cas', ({ date, couverte }) => {
    expect(couvre(terminee, date)).toBe(couverte)
  })

  it('une période inconnue ne couvre rien', () => {
    expect(couvre(inconnue, avantLeTerme)).toBe(false)
  })

  it('une période terminée sans début connu ne couvre pas même sa fin', () => {
    expect(couvre(termineeSansDebut, fin)).toBe(false)
  })
})
