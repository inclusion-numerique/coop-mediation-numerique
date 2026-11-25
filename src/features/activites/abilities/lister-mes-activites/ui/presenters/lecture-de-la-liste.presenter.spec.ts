import { describe, expect, it } from 'vitest'
import { CRITERES_VIDES, TypeDActivite } from '../../../../domain'
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

const sansCritere = CRITERES_VIDES

describe('lecture de la liste', () => {
  it('affiche les rendez-vous demandés', () => {
    expect(
      lectureDeLaListe({ 'voir-rdvs': '1' }, CRITERES_VIDES).voirLesRdvs,
    ).toBe(true)
  })

  it("n'affiche pas les rendez-vous sans demande", () => {
    expect(lectureDeLaListe({}, CRITERES_VIDES).voirLesRdvs).toBe(false)
  })

  it('reconnaît une liste filtrée', () => {
    expect(
      lectureDeLaListe(
        { types: 'individuel' },
        { ...CRITERES_VIDES, types: [TypeDActivite('Individuel')] },
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
    expect(
      basculeDesRendezVous(null, {
        chemin: '/coop/mes-activites',
        parametres: {},
      }),
    ).toBeNull()
  })

  it('synchronise au chargement quand un webhook a échoué', () => {
    expect(
      basculeDesRendezVous(
        {
          ...compte,
          includeRdvsInActivitesList: true,
          invalidWebhookOrganisationIds: [12],
        },
        { chemin: '/coop/mes-activites', parametres: {} },
      )?.syncDataOnLoad,
    ).toBe(true)
  })

  it('coche la bascule quand l’URL demande des rendez-vous', () => {
    expect(
      basculeDesRendezVous(compte, {
        chemin: '/coop/mes-activites',
        parametres: { rdvs: 'past' },
      })?.affiches,
    ).toBe(true)
  })

  it('décoche la bascule sans réglage ni demande', () => {
    expect(
      basculeDesRendezVous(compte, {
        chemin: '/coop/mes-activites',
        parametres: { types: 'collectif' },
      })?.affiches,
    ).toBe(false)
  })

  it('retire les filtres de rendez-vous en gardant les autres', () => {
    expect(
      basculeDesRendezVous(compte, {
        chemin: '/coop/mes-activites',
        parametres: { rdvs: 'past', 'voir-rdvs': '1', types: 'collectif' },
      })?.sansLesFiltresDesRendezVous,
    ).toBe('/coop/mes-activites?types=collectif')
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
