import { describe, expect, it } from 'vitest'
import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  ActiviteDeCoordinationId,
  ActiviteIntrouvable,
  CoordinateurId,
  TypeDActiviteDeCoordination,
} from '../../../domain'
import type { EchecDeSupprimerUneActiviteDeCoordination } from './errors'
import type {
  ActiviteDeCoordinationASupprimer,
  ActiviteDeCoordinationEnregistree,
  SuppressionDeLActiviteDeCoordination,
} from './ports'
import { supprimerUneActiviteDeCoordination } from './supprimer-une-activite-de-coordination'

type Cas = {
  readonly cas: string
  readonly activiteEnregistree: ActiviteDeCoordinationEnregistree
  readonly coordinateurId: CoordinateurId | null
  readonly attendu: Result<
    SuppressionDeLActiviteDeCoordination,
    EchecDeSupprimerUneActiviteDeCoordination
  >
}

const maintenant = new Date('2026-11-10T08:00:00Z')

const activiteId = ActiviteDeCoordinationId(
  'b0000000-0000-4000-8000-000000000001',
)

const auteur = CoordinateurId('c0000000-0000-4000-8000-000000000001')

const activite: ActiviteDeCoordinationASupprimer = {
  id: activiteId,
  type: TypeDActiviteDeCoordination('Animation'),
  coordinateurId: auteur,
}

describe('supprimer une activité de coordination', () => {
  it.each<Cas>([
    {
      cas: 'refuse une activité introuvable',
      activiteEnregistree: async () => null,
      coordinateurId: auteur,
      attendu: failure(ActiviteIntrouvable()),
    },
    {
      cas: 'refuse un autre coordinateur que l’auteur',
      activiteEnregistree: async () => activite,
      coordinateurId: CoordinateurId('c0000000-0000-4000-8000-000000000002'),
      attendu: failure(ActionNonAutorisee()),
    },
    {
      cas: 'refuse un utilisateur qui n’est pas coordinateur',
      activiteEnregistree: async () => activite,
      coordinateurId: null,
      attendu: failure(ActionNonAutorisee()),
    },
    {
      cas: 'supprime l’activité de son auteur à l’instant de la demande',
      activiteEnregistree: async () => activite,
      coordinateurId: auteur,
      attendu: success({ activite, suppression: maintenant }),
    },
  ])('$cas', async ({ activiteEnregistree, coordinateurId, attendu }) => {
    expect(
      await supprimerUneActiviteDeCoordination({
        activiteEnregistree,
        supprimer: async () => undefined,
      })({ activiteId, coordinateurId, maintenant }),
    ).toEqual(attendu)
  })
})
