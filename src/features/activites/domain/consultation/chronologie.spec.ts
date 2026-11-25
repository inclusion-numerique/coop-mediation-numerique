import { describe, expect, it } from 'vitest'
import { TypeDActivite } from '../mediation/type-d-activite'
import { StatutDeRendezVous } from '../rendez-vous/statut-de-rendez-vous'
import { contenuDeLaChronologie } from './chronologie'
import type { CriteresDesActivites } from './criteres-des-activites'
import { CRITERES_VIDES } from './criteres-vides'

const connecte = { _tag: 'Connecte', affichesDansLaListe: true } as const
const masques = { _tag: 'Connecte', affichesDansLaListe: false } as const
const nonConnecte = { _tag: 'NonConnecte' } as const

const statutPasse: Partial<CriteresDesActivites> = {
  statutsDeRendezVous: [StatutDeRendezVous('Passe')],
}
const typeIndividuel: Partial<CriteresDesActivites> = {
  types: [TypeDActivite('Individuel')],
}

describe('contenu de la chronologie', () => {
  it.each([
    ['sans filtre, compte connecté', {}, connecte, 'ActivitesEtRendezVous'],
    ['sans filtre, rendez-vous masqués', {}, masques, 'ActivitesSeules'],
    ['sans filtre, compte non connecté', {}, nonConnecte, 'ActivitesSeules'],
    [
      'statut filtré, rendez-vous masqués',
      statutPasse,
      masques,
      'RendezVousSeuls',
    ],
    ['statut filtré, compte non connecté', statutPasse, nonConnecte, 'Rien'],
    ['type filtré', typeIndividuel, connecte, 'ActivitesSeules'],
    [
      'type et statut filtrés',
      { ...typeIndividuel, ...statutPasse },
      connecte,
      'ActivitesSeules',
    ],
  ] as const)('%s', (_, criteres, compte, attendu) => {
    expect(
      contenuDeLaChronologie({ ...CRITERES_VIDES, ...criteres }, compte),
    ).toBe(attendu)
  })
})
