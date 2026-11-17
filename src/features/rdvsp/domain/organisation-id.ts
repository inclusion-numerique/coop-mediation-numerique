import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/** Identifiant d'une organisation côté RDV Service Public. */
export const OrganisationId = defineModel(
  z.number().int().positive().brand('OrganisationId'),
)

export type OrganisationId = Model.TypeOf<typeof OrganisationId>

export const organisationsAccessibles = (
  organisationIds: readonly OrganisationId[] | undefined,
  inaccessibles: readonly OrganisationId[],
): readonly OrganisationId[] | undefined =>
  organisationIds?.filter(
    (organisationId) => !inaccessibles.includes(organisationId),
  )
