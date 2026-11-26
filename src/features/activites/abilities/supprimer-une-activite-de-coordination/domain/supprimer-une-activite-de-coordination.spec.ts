import { describe, expect, it } from 'vitest'
import { failure, type Result, success } from '@/libraries/result'
import {
  ActiviteDeCoordinationId,
  CoordinateurId,
  TypeDActiviteDeCoordination,
} from '../../../domain'
import {
  ActionNonAutorisee,
  ActiviteIntrouvable,
  type EchecDeSuppression,
} from './errors'
import {
  type ActiviteDeCoordinationASupprimer,
  type ActiviteDeCoordinationEnregistree,
  supprimerUneActiviteDeCoordination,
} from './supprimer-une-activite-de-coordination'

type Cas = {
  readonly cas: string
  readonly activiteEnregistree: ActiviteDeCoordinationEnregistree
  readonly coordinateurId: CoordinateurId | null
  readonly attendu: Result<void, EchecDeSuppression>
}

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
      cas: 'supprime l’activité de son auteur',
      activiteEnregistree: async () => activite,
      coordinateurId: auteur,
      attendu: success(undefined),
    },
  ])('$cas', async ({ activiteEnregistree, coordinateurId, attendu }) => {
    expect(
      await supprimerUneActiviteDeCoordination({
        activiteEnregistree,
        supprimer: async () => undefined,
      })({ activiteId, coordinateurId }),
    ).toEqual(attendu)
  })
})
