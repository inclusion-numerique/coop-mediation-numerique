import { describe, expect, it } from 'vitest'
import { failure, type Result, success } from '@/libraries/result'
import {
  ActiviteDeCoordinationId,
  ActiviteIntrouvable,
  CoordinateurId,
  DateDActivite,
  DateTropLointaine,
  Effectif,
  NomDeTag,
  Organisateur,
  TagId,
  TagInutilisable,
  TypeDActiviteDeCoordination,
  TypeDActiviteIncompatible,
  TypeDEvenement,
} from '../../../domain'
import {
  type DependancesDeLaSaisieDeCoordination,
  type EchecDEnregistrement,
  enregistrerUneActiviteDeCoordination,
} from './enregistrer-une-activite-de-coordination'
import { ActionNonAutorisee } from './errors'
import type {
  ActiviteEnregistree,
  SaisieDeCoordination,
} from './saisie-de-coordination'

type Cas = {
  readonly cas: string
  readonly dependances: DependancesDeLaSaisieDeCoordination
  readonly entree: {
    readonly saisie: SaisieDeCoordination
    readonly coordinateurId: CoordinateurId | null
  }
  readonly attendu: Result<ActiviteEnregistree, EchecDEnregistrement>
}

const nouvelId = ActiviteDeCoordinationId(
  'b0000000-0000-4000-8000-000000000001',
)

const activiteModifiee = ActiviteDeCoordinationId(
  'b0000000-0000-4000-8000-000000000002',
)

const coordinateurId = CoordinateurId('c0000000-0000-4000-8000-000000000001')

const reseau = {
  id: TagId('f0000000-0000-4000-8000-000000000001'),
  nom: NomDeTag('Réseau'),
}

const dependances: DependancesDeLaSaisieDeCoordination = {
  activiteDuCoordinateur: async () => ({
    type: TypeDActiviteDeCoordination('Evenement'),
    creation: new Date('2026-11-01T08:00:00Z'),
  }),
  nouvelIdentifiant: () => nouvelId,
  tagsUtilisables: async () => [reseau],
  creer: async () => undefined,
  modifier: async () => undefined,
  maintenant: () => new Date('2026-11-10T08:00:00Z'),
}

const saisie: SaisieDeCoordination = {
  _tag: 'Evenement',
  id: null,
  date: DateDActivite('2026-11-05'),
  tags: [reseau.id],
  notes: null,
  nom: null,
  typeDEvenement: { _tag: 'Liste', valeur: TypeDEvenement('NecLocal') },
  organisateurs: { valeurs: [Organisateur('Commune')], autre: null },
  echelon: null,
  participants: Effectif(40),
}

const enModification: SaisieDeCoordination = {
  ...saisie,
  id: activiteModifiee,
}

describe('enregistrer une activité de coordination', () => {
  it.each<Cas>([
    {
      cas: 'refuse un utilisateur qui n’est pas coordinateur',
      dependances,
      entree: { saisie, coordinateurId: null },
      attendu: failure(ActionNonAutorisee()),
    },
    {
      cas: 'refuse de modifier une activité introuvable chez le coordinateur',
      dependances: { ...dependances, activiteDuCoordinateur: async () => null },
      entree: { saisie: enModification, coordinateurId },
      attendu: failure(ActiviteIntrouvable()),
    },
    {
      cas: 'refuse de modifier une animation en événement',
      dependances: {
        ...dependances,
        activiteDuCoordinateur: async () => ({
          type: TypeDActiviteDeCoordination('Animation'),
          creation: new Date('2026-11-01T08:00:00Z'),
        }),
      },
      entree: { saisie: enModification, coordinateurId },
      attendu: failure(TypeDActiviteIncompatible()),
    },
    {
      cas: 'refuse un tag que le coordinateur ne peut pas utiliser',
      dependances: { ...dependances, tagsUtilisables: async () => [] },
      entree: { saisie, coordinateurId },
      attendu: failure(TagInutilisable()),
    },
    {
      cas: 'refuse une date au-delà de deux ans',
      dependances,
      entree: {
        saisie: { ...saisie, date: DateDActivite('2029-01-01') },
        coordinateurId,
      },
      attendu: failure(DateTropLointaine(DateDActivite('2028-11-10'))),
    },
    {
      cas: 'crée l’activité sous un nouvel identifiant',
      dependances,
      entree: { saisie, coordinateurId },
      attendu: success({ id: nouvelId, type: 'Evenement' }),
    },
    {
      cas: 'modifie l’activité sous son identifiant',
      dependances,
      entree: { saisie: enModification, coordinateurId },
      attendu: success({ id: activiteModifiee, type: 'Evenement' }),
    },
  ])('$cas', async ({ dependances, entree, attendu }) => {
    expect(
      await enregistrerUneActiviteDeCoordination(dependances)(entree),
    ).toEqual(attendu)
  })
})
