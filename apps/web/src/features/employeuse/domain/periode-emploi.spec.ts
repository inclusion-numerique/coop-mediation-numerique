import {
  couvre,
  debutEmploi,
  estTerminee,
  finEmploi,
  PeriodeEmploi,
} from './periode-emploi'

const debut = new Date('2026-03-01')
const fin = new Date('2026-09-01')
const rupture = new Date('2026-07-01')

/** Avant le terme des contrats ci-dessus : ils sont donc en cours. */
const pendant = new Date('2026-06-01')
/** Après tous les termes ci-dessus. */
const apres = new Date('2026-12-01')

describe('PeriodeEmploi', () => {
  it('est inconnue sans aucune date — le contrat peut ne pas exister', () => {
    expect(
      PeriodeEmploi({
        debut: null,
        fin: null,
        rupture: null,
        maintenant: pendant,
      }),
    ).toEqual({ _tag: 'inconnue' })
  })

  it('est en cours avec un début et aucun terme', () => {
    expect(
      PeriodeEmploi({ debut, fin: null, rupture: null, maintenant: pendant }),
    ).toEqual({ _tag: 'enCours', debut, finPrevue: null })
  })

  // Le défaut d'origine : `terminee` disait « porte une date de fin », si bien
  // qu'un CDD était annoncé terminé dès sa signature.
  it('reste en cours quand le terme est encore devant, et le conserve', () => {
    expect(
      PeriodeEmploi({ debut, fin, rupture: null, maintenant: pendant }),
    ).toEqual({ _tag: 'enCours', debut, finPrevue: fin })
  })

  it('est terminée une fois le terme passé', () => {
    expect(
      PeriodeEmploi({ debut, fin, rupture: null, maintenant: apres }),
    ).toEqual({ _tag: 'terminee', debut, fin })
  })

  it('retient la rupture comme terme à défaut de date de fin', () => {
    expect(
      PeriodeEmploi({ debut, fin: null, rupture, maintenant: apres }),
    ).toEqual({ _tag: 'terminee', debut, fin: rupture })
  })

  it('accepte une fin passée sans début — la base l’autorise', () => {
    expect(
      PeriodeEmploi({ debut: null, fin, rupture: null, maintenant: apres }),
    ).toEqual({ _tag: 'terminee', debut: null, fin })
  })

  // Un terme à venir sans début connu ne situe l'emploi nulle part : mieux vaut
  // l'avouer qu'inventer une période.
  it('est inconnue quand un terme à venir n’a pas de début', () => {
    expect(
      PeriodeEmploi({ debut: null, fin, rupture: null, maintenant: pendant }),
    ).toEqual({ _tag: 'inconnue' })
  })
})

describe('dates plates pour les affichages', () => {
  it('rend le terme d’un emploi en cours, qui n’est pas encore échu', () => {
    const enCours = PeriodeEmploi({
      debut,
      fin,
      rupture: null,
      maintenant: pendant,
    })

    expect(debutEmploi(enCours)).toEqual(debut)
    // L'écran affiche « jusqu'au 1er septembre » sans prétendre que c'est fini.
    expect(finEmploi(enCours)).toEqual(fin)
    expect(estTerminee(enCours)).toBe(false)
  })

  it('rend le terme d’un emploi révolu, et le dit révolu', () => {
    const terminee = PeriodeEmploi({
      debut,
      fin,
      rupture: null,
      maintenant: apres,
    })

    expect(finEmploi(terminee)).toEqual(fin)
    expect(estTerminee(terminee)).toBe(true)
  })

  it('ne rend rien d’une période inconnue', () => {
    expect(debutEmploi({ _tag: 'inconnue' })).toBeNull()
    expect(finEmploi({ _tag: 'inconnue' })).toBeNull()
    expect(estTerminee({ _tag: 'inconnue' })).toBe(false)
  })
})

describe('couvre', () => {
  const sansTerme = PeriodeEmploi({
    debut,
    fin: null,
    rupture: null,
    maintenant: pendant,
  })
  const enCoursAvecTerme = PeriodeEmploi({
    debut,
    fin,
    rupture: null,
    maintenant: pendant,
  })
  const terminee = PeriodeEmploi({
    debut,
    fin,
    rupture: null,
    maintenant: apres,
  })

  it('une période sans terme couvre tout ce qui suit son début', () => {
    expect(couvre(sansTerme, pendant)).toBe(true)
    expect(couvre(sansTerme, debut)).toBe(true)
    expect(couvre(sansTerme, new Date('2026-02-01'))).toBe(false)
  })

  // Le terme borne la couverture qu'il soit échu ou non : un CDD qui court
  // jusqu'en septembre ne couvre pas octobre, même consulté en juin.
  it('une période en cours est bornée par son terme prévu', () => {
    expect(couvre(enCoursAvecTerme, pendant)).toBe(true)
    expect(couvre(enCoursAvecTerme, fin)).toBe(true)
    expect(couvre(enCoursAvecTerme, new Date('2026-10-01'))).toBe(false)
  })

  it('une période terminée couvre son intervalle, bornes comprises', () => {
    expect(couvre(terminee, pendant)).toBe(true)
    expect(couvre(terminee, debut)).toBe(true)
    expect(couvre(terminee, fin)).toBe(true)
    expect(couvre(terminee, new Date('2026-10-01'))).toBe(false)
  })

  it('une période sans début connu ne couvre rien', () => {
    expect(couvre({ _tag: 'inconnue' }, pendant)).toBe(false)
    expect(
      couvre(
        PeriodeEmploi({ debut: null, fin, rupture: null, maintenant: apres }),
        fin,
      ),
    ).toBe(false)
  })
})
