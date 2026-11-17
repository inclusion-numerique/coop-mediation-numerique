import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { AdresseRdv } from './adresse-rdv'
import type { TelephoneExterne } from './identite'
import type { OrganisationId } from './organisation-id'

export const LieuId = defineModel(z.number().int().positive().brand('LieuId'))
export type LieuId = Model.TypeOf<typeof LieuId>

export const NomLieu = defineModel(z.string().trim().min(1).brand('NomLieu'))
export type NomLieu = Model.TypeOf<typeof NomLieu>

/**
 * Lieu physique d'un rendez-vous, tel que RDV Service Public le paramètre.
 *
 * `usageUnique` distingue les lieux du référentiel de ceux créés pour un seul
 * rendez-vous — c'est une propriété de leur paramétrage, que La Coop recopie
 * sans l'interpréter.
 */
export type Lieu = {
  readonly id: LieuId
  readonly nom: NomLieu
  readonly adresse: AdresseRdv | null
  readonly organisationId: OrganisationId
  readonly telephone: TelephoneExterne | null
  readonly usageUnique: boolean
}
