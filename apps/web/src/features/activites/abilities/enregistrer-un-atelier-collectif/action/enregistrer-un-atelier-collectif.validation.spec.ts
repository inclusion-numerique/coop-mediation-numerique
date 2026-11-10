import { EnregistrerUnAtelierCollectifValidation } from './enregistrer-un-atelier-collectif.validation'

const zeros = <K extends string>(cles: readonly K[]) =>
  Object.fromEntries(cles.map((cle) => [cle, 0]))

const saisie = {
  date: '2026-11-03',
  duree: 90,
  typeLieu: 'ADistance',
  thematiques: ['Email'],
  participants: ['e0000000-0000-4000-8000-000000000001'],
  participantsAnonymes: {
    total: 3,
    dejaAccompagnes: 1,
    genres: { masculin: 0, feminin: 2 },
    tranchesDAge: zeros([
      'moinsDeDouze',
      'douzeDixHuit',
      'dixHuitVingtQuatre',
      'vingtCinqTrenteNeuf',
      'quaranteCinquanteNeuf',
      'soixanteSoixanteNeuf',
      'soixanteDixPlus',
    ]),
    statutsSociaux: zeros(['scolarise', 'sansEmploi', 'enEmploi', 'retraite']),
  },
}

const champsEnErreur = (entree: unknown) => {
  const resultat = EnregistrerUnAtelierCollectifValidation.safeParse(entree)
  return resultat.success
    ? []
    : resultat.error.issues.map(({ path }) => path.join('.'))
}

describe('validation d’un atelier collectif', () => {
  it('range le reliquat des anonymes en non communiqué', () => {
    const { anonymes } = EnregistrerUnAtelierCollectifValidation.parse(saisie)
    expect(anonymes.genres).toEqual({
      masculin: 0,
      feminin: 2,
      nonCommunique: 1,
    })
  })

  it('signale une répartition qui dépasse le total', () => {
    expect(
      champsEnErreur({
        ...saisie,
        participantsAnonymes: {
          ...saisie.participantsAnonymes,
          genres: { masculin: 2, feminin: 2 },
        },
      }),
    ).toEqual(['participantsAnonymes.total'])
  })

  it('signale un atelier sans participant', () => {
    expect(
      champsEnErreur({
        ...saisie,
        participants: [],
        participantsAnonymes: {
          ...saisie.participantsAnonymes,
          total: 0,
          dejaAccompagnes: 0,
          genres: { masculin: 0, feminin: 0 },
        },
      }),
    ).toEqual(['participants'])
  })
})
