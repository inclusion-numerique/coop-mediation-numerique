import { describe, expect, it } from 'vitest'
import { failure, type Result, success } from '@/libraries/result'
import {
  ActiviteId,
  ActiviteIntrouvable,
  BeneficiaireId,
  MediateurId,
  TypeDActivite,
} from '../../../domain'
import type { EchecDeSupprimerUneActiviteDeMediation } from './errors'
import type {
  ActiviteDeMediationASupprimer,
  ActiviteDeMediationDuMediateur,
  SuppressionDeLActiviteDeMediation,
} from './ports'
import { supprimerUneActiviteDeMediation } from './supprimer-une-activite-de-mediation'

type Cas = {
  readonly cas: string
  readonly activiteDuMediateur: ActiviteDeMediationDuMediateur
  readonly mediateurId: MediateurId | null
  readonly attendu: Result<
    SuppressionDeLActiviteDeMediation,
    EchecDeSupprimerUneActiviteDeMediation
  >
}

const maintenant = new Date('2026-11-10T08:00:00Z')

const activiteId = ActiviteId('a0000000-0000-4000-8000-000000000001')

const mediateurId = MediateurId('c0000000-0000-4000-8000-000000000001')

const activite: ActiviteDeMediationASupprimer = {
  id: activiteId,
  type: TypeDActivite('Individuel'),
  suivis: [BeneficiaireId('5b2d0c4e-8f1a-4c3b-9d7e-2a6f1b3c4d5e')],
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
      cas: 'supprime l’activité du médiateur à l’instant de la demande',
      activiteDuMediateur: async () => activite,
      mediateurId,
      attendu: success({ activite, suppression: maintenant }),
    },
  ])('$cas', async ({ activiteDuMediateur, mediateurId, attendu }) => {
    expect(
      await supprimerUneActiviteDeMediation({
        activiteDuMediateur,
        supprimer: async () => undefined,
      })({ activiteId, mediateurId, maintenant }),
    ).toEqual(attendu)
  })
})
