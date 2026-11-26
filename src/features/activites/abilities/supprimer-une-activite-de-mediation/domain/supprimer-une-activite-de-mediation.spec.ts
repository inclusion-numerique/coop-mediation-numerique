import { describe, expect, it } from 'vitest'
import { failure, type Result, success } from '@/libraries/result'
import {
  ActiviteId,
  ActiviteIntrouvable,
  MediateurId,
  TypeDActivite,
} from '../../../domain'
import {
  type ActiviteDeMediationDuMediateur,
  supprimerUneActiviteDeMediation,
} from './supprimer-une-activite-de-mediation'

type Cas = {
  readonly cas: string
  readonly activiteDuMediateur: ActiviteDeMediationDuMediateur
  readonly mediateurId: MediateurId | null
  readonly attendu: Result<void, ActiviteIntrouvable>
}

const activiteId = ActiviteId('a0000000-0000-4000-8000-000000000001')

const mediateurId = MediateurId('c0000000-0000-4000-8000-000000000001')

const activite = {
  id: activiteId,
  type: TypeDActivite('Individuel'),
  suivis: [],
  anonymesOrphelins: [],
}

describe('supprimer une activité de médiation', () => {
  it.each<Cas>([
    {
      cas: 'ne trouve aucune activité pour un utilisateur qui n’est pas médiateur',
      activiteDuMediateur: async () => activite,
      mediateurId: null,
      attendu: failure(ActiviteIntrouvable()),
    },
    {
      cas: 'refuse une activité introuvable chez le médiateur',
      activiteDuMediateur: async () => null,
      mediateurId,
      attendu: failure(ActiviteIntrouvable()),
    },
    {
      cas: 'supprime l’activité du médiateur',
      activiteDuMediateur: async () => activite,
      mediateurId,
      attendu: success(undefined),
    },
  ])('$cas', async ({ activiteDuMediateur, mediateurId, attendu }) => {
    expect(
      await supprimerUneActiviteDeMediation({
        activiteDuMediateur,
        supprimer: async () => undefined,
      })({ activiteId, mediateurId }),
    ).toEqual(attendu)
  })
})
