import type { Organisation } from '../../../domain/organisation'
import type { OrganisationId } from '../../../domain/organisation-id'

/**
 * Ce qu'une synchronisation doit accomplir, décidé avant d'écrire quoi que ce
 * soit. Séparer la décision de son application rend la règle vérifiable sans
 * base, et rend visible ce que l'ancienne boucle impérative dissimulait.
 */
export type PlanSynchronisation = {
  readonly aCreer: readonly Organisation[]
  readonly aMettreAJour: readonly Organisation[]
  readonly inchangees: readonly Organisation[]
  readonly aRattacher: readonly OrganisationId[]
  readonly aDetacher: readonly OrganisationId[]
}

/**
 * Une organisation est réputée modifiée dès qu'un des champs que La Coop recopie
 * diffère. Rien d'autre n'est comparé : le reste du paramétrage de RDV Service
 * Public ne nous est pas transmis, et n'aurait aucun sens ici.
 */
export const estModifiee = (
  connue: Organisation,
  recue: Organisation,
): boolean =>
  connue.nom !== recue.nom ||
  connue.email !== recue.email ||
  connue.telephone !== recue.telephone ||
  connue.verticale !== recue.verticale

/**
 * Confronte ce que RDV Service Public renvoie à ce que La Coop détient.
 *
 * Le détachement se décide sur **tous** les rattachements du compte, pas sur les
 * seules organisations reçues. C'est ce qui manquait : l'ancienne implémentation
 * ne cherchait les liens à retirer que parmi les organisations présentes dans la
 * réponse, ensemble dont ils faisaient partie par construction — la liste était
 * donc toujours vide, et un agent retiré d'une organisation en gardait le lien
 * indéfiniment, avec les synchronisations que cela entraîne.
 */
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
    aDetacher: rattachements.filter(
      (organisationId) => !idsRecus.has(organisationId),
    ),
  }
}
