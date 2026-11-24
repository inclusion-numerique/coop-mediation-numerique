import { describe, expect, it } from 'vitest'
import { criteresDesActivitesDepuisLURL } from '@/features/activites/fixtures/criteres-depuis-l-url'
import { contenuDeLaChronologie } from './chronologie'

const connecte = { _tag: 'Connecte', affichesDansLaListe: true } as const
const masques = { _tag: 'Connecte', affichesDansLaListe: false } as const
const nonConnecte = { _tag: 'NonConnecte' } as const

describe('contenu de la chronologie', () => {
  it.each([
    ['sans filtre, compte connecté', {}, connecte, 'ActivitesEtRendezVous'],
    ['sans filtre, rendez-vous masqués', {}, masques, 'ActivitesSeules'],
    ['sans filtre, compte non connecté', {}, nonConnecte, 'ActivitesSeules'],
    [
      'statut filtré, rendez-vous masqués',
      { rdvs: 'past' },
      masques,
      'RendezVousSeuls',
    ],
    [
      'statut filtré, compte non connecté',
      { rdvs: 'past' },
      nonConnecte,
      'Rien',
    ],
    ['type filtré', { types: 'individuel' }, connecte, 'ActivitesSeules'],
    [
      'type et statut filtrés',
      { types: 'individuel', rdvs: 'past' },
      connecte,
      'ActivitesSeules',
    ],
  ] as const)('%s', (_, parametres, compte, attendu) => {
    expect(
      contenuDeLaChronologie(
        criteresDesActivitesDepuisLURL(parametres),
        compte,
      ),
    ).toBe(attendu)
  })
})
