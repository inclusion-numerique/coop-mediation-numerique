import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../../../domain/identite'
import type { UsagerId } from '../../../domain/usager-id'

/**
 * Le bénéficiaire vu depuis RDV Service Public.
 *
 * Type local et non import du domaine bénéficiaire : une feature ne dépend pas
 * du domaine d'une autre (IS-2). L'ability ne connaît du bénéficiaire que ce
 * qu'une demande de rendez-vous exige — son propriétaire, l'usager RDV déjà lié,
 * et de quoi pré-remplir un formulaire. Un port va le chercher, un adaptateur le
 * traduit.
 */
export const BeneficiaireCibleId = defineModel(
  z.string().uuid().brand('BeneficiaireCibleId'),
)
export type BeneficiaireCibleId = Model.TypeOf<typeof BeneficiaireCibleId>

export const MediateurProprietaireId = defineModel(
  z.string().uuid().brand('MediateurProprietaireId'),
)
export type MediateurProprietaireId = Model.TypeOf<
  typeof MediateurProprietaireId
>

export type BeneficiaireCible = {
  readonly id: BeneficiaireCibleId
  readonly mediateurId: MediateurProprietaireId
  /** Usager RDV Service Public déjà rattaché, s'il y en a un. */
  readonly usagerId: UsagerId | null
  readonly prenom: PrenomExterne | null
  readonly nom: NomExterne | null
  readonly email: EmailExterne | null
  readonly telephone: TelephoneExterne | null
  readonly adresse: string | null
}
