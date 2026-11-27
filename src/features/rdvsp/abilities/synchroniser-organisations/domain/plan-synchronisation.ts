import type { OrganisationId } from '../../../domain/identifiants/organisation-id'
import type { Organisation } from '../../../domain/organisation'

export type PlanSynchronisation = {
  readonly aCreer: readonly Organisation[]
  readonly aMettreAJour: readonly Organisation[]
  readonly inchangees: readonly Organisation[]
  readonly aRattacher: readonly OrganisationId[]
  readonly aDetacher: readonly OrganisationId[]
}

const estModifiee = (connue: Organisation, recue: Organisation): boolean =>
  connue.nom !== recue.nom ||
  connue.email !== recue.email ||
  connue.telephone !== recue.telephone ||
  connue.verticale !== recue.verticale

export const planifierSynchronisation = ({
  recues,
  connues,
  rattachements,
}: {
  recues: readonly Organisation[]
  connues: readonly Organisation[]
  rattachements: readonly OrganisationId[]
}): PlanSynchronisation => {
  const connuesParId = new Map(
    connues.map((organisation) => [organisation.id, organisation]),
  )
  const idsRecus = new Set(recues.map((organisation) => organisation.id))

  return {
    aCreer: recues.filter((recue) => !connuesParId.has(recue.id)),
    aMettreAJour: recues.filter((recue) => {
      const connue = connuesParId.get(recue.id)
      return connue !== undefined && estModifiee(connue, recue)
    }),
    inchangees: recues.filter((recue) => {
      const connue = connuesParId.get(recue.id)
      return connue !== undefined && !estModifiee(connue, recue)
    }),
    aRattacher: recues
      .filter((recue) => !rattachements.includes(recue.id))
      .map((recue) => recue.id),
    aDetacher: detachements(rattachements, idsRecus),
  }
}

const detachements = (
  rattachements: readonly OrganisationId[],
  idsRecus: ReadonlySet<OrganisationId>,
): readonly OrganisationId[] => {
  const aDetacher = rattachements.filter(
    (organisationId) => !idsRecus.has(organisationId),
  )

  return aDetacher.length === rattachements.length && rattachements.length > 0
    ? []
    : aDetacher
}
