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
  ActiviteDeMediationLue,
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

const SUIVI = BeneficiaireId('5b2d0c4e-8f1a-4c3b-9d7e-2a6f1b3c4d5e')
const ORPHELIN = BeneficiaireId('6c3e1d5f-9a2b-4d4c-8e8f-3b7a2c4d5e6f')
const ACCOMPAGNE_AILLEURS = BeneficiaireId(
  '7d4f2e6a-0b3c-4e5d-9f9a-4c8b3d5e6f7a',
)

const lue: ActiviteDeMediationLue = {
  id: activiteId,
  type: TypeDActivite('Collectif'),
  participants: [
    { beneficiaireId: SUIVI, anonyme: false, autresAccompagnements: 3 },
    { beneficiaireId: ORPHELIN, anonyme: true, autresAccompagnements: 0 },
    {
      beneficiaireId: ACCOMPAGNE_AILLEURS,
      anonyme: true,
      autresAccompagnements: 1,
    },
  ],
}

const activite: ActiviteDeMediationASupprimer = {
  id: activiteId,
  type: TypeDActivite('Collectif'),
  mediateurId,
  suivis: [SUIVI],
  anonymesOrphelins: [ORPHELIN],
}

describe('supprimer une activité de médiation', () => {
  it.each<Cas>([
    {
      cas: 'ne trouve aucune activité pour un utilisateur qui n’est pas médiateur',
      activiteDuMediateur: async () => lue,
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
      cas: 'supprime l’activité, ses suivis et les seuls anonymes qu’aucune autre activité n’accompagne',
      activiteDuMediateur: async () => lue,
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
