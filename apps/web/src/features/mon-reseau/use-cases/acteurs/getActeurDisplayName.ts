import { ActeurForList } from '@app/web/features/mon-reseau/use-cases/acteurs/db/searchActeurs'

export const getActeurDisplayName = (
  acteur: Pick<ActeurForList, 'firstName' | 'lastName' | 'name' | 'email'>,
): string => {
  if (acteur.firstName && acteur.lastName) {
    return `${acteur.firstName} ${acteur.lastName}`
  }
  return acteur.name ?? acteur.email ?? 'Acteur inconnu'
}
