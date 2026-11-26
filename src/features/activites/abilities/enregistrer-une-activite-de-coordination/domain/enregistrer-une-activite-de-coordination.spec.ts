import { describe, expect, it } from 'vitest'
import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  type ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  ActiviteIntrouvable,
  CoordinateurId,
  DateDActivite,
  DateTropLointaine,
  Effectif,
  type Evenement,
  NomDeTag,
  Organisateur,
  TagId,
  TagInutilisable,
  TypeDActiviteDeCoordination,
  TypeDActiviteIncompatible,
  TypeDEvenement,
} from '../../../domain'
import { enregistrerUneActiviteDeCoordination } from './enregistrer-une-activite-de-coordination'
import type { EchecDEnregistrerUneActiviteDeCoordination } from './errors'
import type { EnregistrerUneActiviteDeCoordinationPorts } from './ports'
import type {
  EcritureDeCoordination,
  SaisieDeCoordination,
} from './saisie-de-coordination'

type Cas = {
  readonly cas: string
  readonly ports: EnregistrerUneActiviteDeCoordinationPorts
  readonly entree: {
    readonly saisie: SaisieDeCoordination
    readonly coordinateurId: CoordinateurId | null
  }
  readonly attendu: Result<
    EcritureDeCoordination,
    EchecDEnregistrerUneActiviteDeCoordination
  >
}

const maintenant = new Date('2026-11-10T08:00:00Z')

const creationExistante = new Date('2026-11-01T08:00:00Z')

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

const ports: EnregistrerUneActiviteDeCoordinationPorts = {
  activiteDuCoordinateur: async () => ({
    type: TypeDActiviteDeCoordination('Evenement'),
    creation: creationExistante,
  }),
  nouvelIdentifiant: () => nouvelId,
  tagsUtilisables: async () => [reseau],
  creer: async () => undefined,
  modifier: async () => undefined,
}

const typeDEvenement = {
  _tag: 'Liste',
  valeur: TypeDEvenement('NecLocal'),
} satisfies Evenement['typeDEvenement']

const organisateurs = { valeurs: [Organisateur('Commune')], autre: null }

const saisie: SaisieDeCoordination = {
  _tag: 'Evenement',
  id: null,
  date: DateDActivite('2026-11-05'),
  tags: [reseau.id],
  notes: null,
  nom: null,
  typeDEvenement,
  organisateurs,
  echelon: null,
  participants: Effectif(40),
}

const enModification: SaisieDeCoordination = {
  ...saisie,
  id: activiteModifiee,
}

const evenement: ActiviteDeCoordination = {
  _tag: 'Evenement',
  id: nouvelId,
  coordinateurId,
  date: DateDActivite('2026-11-05'),
  tags: [reseau],
  notes: null,
  nom: null,
  typeDEvenement,
  organisateurs,
  echelon: null,
  participants: Effectif(40),
  creation: maintenant,
  modification: maintenant,
}

describe('enregistrer une activité de coordination', () => {
  it.each<Cas>([
    {
      cas: 'refuse un utilisateur qui n’est pas coordinateur',
      ports,
      entree: { saisie, coordinateurId: null },
      attendu: failure(ActionNonAutorisee()),
    },
    {
      cas: 'refuse de modifier une activité introuvable chez le coordinateur',
      ports: { ...ports, activiteDuCoordinateur: async () => null },
      entree: { saisie: enModification, coordinateurId },
      attendu: failure(ActiviteIntrouvable()),
    },
    {
      cas: 'refuse de modifier une animation en événement',
      ports: {
        ...ports,
        activiteDuCoordinateur: async () => ({
          type: TypeDActiviteDeCoordination('Animation'),
          creation: creationExistante,
        }),
      },
      entree: { saisie: enModification, coordinateurId },
      attendu: failure(TypeDActiviteIncompatible()),
    },
    {
      cas: 'refuse un tag que le coordinateur ne peut pas utiliser',
      ports: { ...ports, tagsUtilisables: async () => [] },
      entree: { saisie, coordinateurId },
      attendu: failure(TagInutilisable()),
    },
    {
      cas: 'refuse une date au-delà de deux ans',
      ports,
      entree: {
        saisie: { ...saisie, date: DateDActivite('2029-01-01') },
        coordinateurId,
      },
      attendu: failure(DateTropLointaine(DateDActivite('2028-11-10'))),
    },
    {
      cas: 'crée l’activité taguée sous un nouvel identifiant',
      ports,
      entree: { saisie, coordinateurId },
      attendu: success({ _tag: 'Creation', activite: evenement }),
    },
    {
      cas: 'modifie l’activité sous son identifiant, à sa date de création',
      ports,
      entree: { saisie: enModification, coordinateurId },
      attendu: success({
        _tag: 'Modification',
        activite: {
          ...evenement,
          id: activiteModifiee,
          creation: creationExistante,
        },
      }),
    },
  ])('$cas', async ({ ports, entree, attendu }) => {
    expect(
      await enregistrerUneActiviteDeCoordination(ports)({
        ...entree,
        maintenant,
      }),
    ).toEqual(attendu)
  })
})
