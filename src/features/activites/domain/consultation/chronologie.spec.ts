import { describe, expect, it } from 'vitest'
import { TypeDActivite } from '../mediation/type-d-activite'
import { StatutDeRendezVous } from '../rendez-vous/statut-de-rendez-vous'
import {
  type ContenuDeLaChronologie,
  contenuDeLaChronologie,
  type RendezVousDuCompte,
} from './chronologie'
import type { CriteresDesActivites } from './criteres-des-activites'
import { CRITERES_VIDES } from './criteres-vides'

const connecte: RendezVousDuCompte = {
  _tag: 'Connecte',
  affichesDansLaListe: true,
}

const masques: RendezVousDuCompte = {
  _tag: 'Connecte',
  affichesDansLaListe: false,
}

const nonConnecte: RendezVousDuCompte = { _tag: 'NonConnecte' }

const statutPasse: CriteresDesActivites = {
  ...CRITERES_VIDES,
  statutsDeRendezVous: [StatutDeRendezVous('Passe')],
}

const typeIndividuel: CriteresDesActivites = {
  ...CRITERES_VIDES,
  types: [TypeDActivite('Individuel')],
}

describe('contenu de la chronologie', () => {
  it.each<{
    readonly cas: string
    readonly criteres: CriteresDesActivites
    readonly compte: RendezVousDuCompte
    readonly attendu: ContenuDeLaChronologie
  }>([
    {
      cas: 'sans filtre, compte connecté',
      criteres: CRITERES_VIDES,
      compte: connecte,
      attendu: 'ActivitesEtRendezVous',
    },
    {
      cas: 'sans filtre, rendez-vous masqués',
      criteres: CRITERES_VIDES,
      compte: masques,
      attendu: 'ActivitesSeules',
    },
    {
      cas: 'sans filtre, compte non connecté',
      criteres: CRITERES_VIDES,
      compte: nonConnecte,
      attendu: 'ActivitesSeules',
    },
    {
      cas: 'statut filtré, rendez-vous masqués',
      criteres: statutPasse,
      compte: masques,
      attendu: 'RendezVousSeuls',
    },
    {
      cas: 'statut filtré, compte non connecté',
      criteres: statutPasse,
      compte: nonConnecte,
      attendu: 'Rien',
    },
    {
      cas: 'type filtré',
      criteres: typeIndividuel,
      compte: connecte,
      attendu: 'ActivitesSeules',
    },
    {
      cas: 'type et statut filtrés',
      criteres: {
        ...typeIndividuel,
        ...statutPasse,
        types: typeIndividuel.types,
      },
      compte: connecte,
      attendu: 'ActivitesSeules',
    },
  ])('$cas', ({ criteres, compte, attendu }) => {
    expect(contenuDeLaChronologie(criteres, compte)).toBe(attendu)
  })
})
