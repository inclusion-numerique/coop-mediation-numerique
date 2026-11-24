import { describe, expect, it } from 'vitest'
import { criteresDesActivitesDepuisLURL } from '@/features/activites/fixtures/criteres-depuis-l-url'
import {
  basculeDesRendezVous,
  compteConnecte,
  contenuDeLaListe,
  lectureDeLaListe,
  sousTitreDeMesActivites,
} from './lecture-de-la-liste.presenter'

const compte = {
  hasOauthTokens: true,
  includeRdvsInActivitesList: false,
  invalidWebhookOrganisationIds: [],
}

const sansCritere = criteresDesActivitesDepuisLURL({})

describe('lecture de la liste', () => {
  it('affiche les rendez-vous demandés', () => {
    expect(
      lectureDeLaListe({ 'voir-rdvs': '1' }, criteresDesActivitesDepuisLURL({}))
        .voirLesRdvs,
    ).toBe(true)
  })

  it("n'affiche pas les rendez-vous sans demande", () => {
    expect(
      lectureDeLaListe({}, criteresDesActivitesDepuisLURL({})).voirLesRdvs,
    ).toBe(false)
  })

  it('reconnaît une liste filtrée', () => {
    expect(
      lectureDeLaListe(
        { types: 'individuel' },
        criteresDesActivitesDepuisLURL({ types: 'individuel' }),
      ).filtree,
    ).toBe(true)
  })
})

describe('compte connecté', () => {
  it('écarte un compte sans jetons', () => {
    expect(compteConnecte({ ...compte, hasOauthTokens: false })).toBeNull()
  })

  it('garde un compte avec jetons', () => {
    expect(compteConnecte(compte)).toBe(compte)
  })

  it("n'a rien à garder sans compte", () => {
    expect(compteConnecte(null)).toBeNull()
  })
})

describe('contenu de la liste', () => {
  it('ne liste que les activités sans compte connecté', () => {
    expect(
      contenuDeLaListe({
        criteres: sansCritere,
        compte: null,
        voirLesRdvs: true,
      }),
    ).toBe('ActivitesSeules')
  })

  it('ajoute les rendez-vous que le compte inclut dans la liste', () => {
    expect(
      contenuDeLaListe({
        criteres: sansCritere,
        compte: { ...compte, includeRdvsInActivitesList: true },
        voirLesRdvs: false,
      }),
    ).toBe('ActivitesEtRendezVous')
  })

  it('ajoute les rendez-vous demandés', () => {
    expect(
      contenuDeLaListe({
        criteres: sansCritere,
        compte,
        voirLesRdvs: true,
      }),
    ).toBe('ActivitesEtRendezVous')
  })

  it("ne liste que les activités quand le compte n'inclut pas les rendez-vous", () => {
    expect(
      contenuDeLaListe({
        criteres: sansCritere,
        compte,
        voirLesRdvs: false,
      }),
    ).toBe('ActivitesSeules')
  })
})

describe('bascule des rendez-vous', () => {
  it("n'existe pas sans compte connecté", () => {
    expect(basculeDesRendezVous(null)).toBeNull()
  })

  it('synchronise au chargement quand un webhook a échoué', () => {
    expect(
      basculeDesRendezVous({
        ...compte,
        includeRdvsInActivitesList: true,
        invalidWebhookOrganisationIds: [12],
      }),
    ).toStrictEqual({ includeRdvsInActivitesList: true, syncDataOnLoad: true })
  })
})

describe('sous-titre de mes activités', () => {
  it('précise la médiation numérique à qui coordonne aussi', () => {
    expect(sousTitreDeMesActivites(true)).toBe('Médiation numérique')
  })

  it("n'a pas de sous-titre pour un médiateur seul", () => {
    expect(sousTitreDeMesActivites(false)).toBeUndefined()
  })
})
