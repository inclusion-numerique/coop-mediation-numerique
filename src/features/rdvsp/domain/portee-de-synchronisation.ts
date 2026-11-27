import type { OrganisationId } from './identifiants/organisation-id'

export type ToutesOrganisations = { readonly _tag: 'toutesOrganisations' }

export type OrganisationsCiblees = {
  readonly _tag: 'organisations'
  readonly organisationIds: readonly OrganisationId[]
}

export type PorteeDeSynchronisation = ToutesOrganisations | OrganisationsCiblees

export const toutesOrganisations: ToutesOrganisations = {
  _tag: 'toutesOrganisations',
}

export const organisationsCiblees = (
  organisationIds: readonly OrganisationId[],
): OrganisationsCiblees => ({ _tag: 'organisations', organisationIds })

export const porteeAccessible = (
  portee: PorteeDeSynchronisation,
  inaccessibles: readonly OrganisationId[],
): PorteeDeSynchronisation =>
  portee._tag === 'toutesOrganisations'
    ? portee
    : organisationsCiblees(
        portee.organisationIds.filter(
          (organisationId) => !inaccessibles.includes(organisationId),
        ),
      )
