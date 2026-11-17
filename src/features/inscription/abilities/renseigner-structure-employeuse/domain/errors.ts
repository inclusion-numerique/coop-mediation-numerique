import type { UserId } from '@app/web/features/inscription/domain'

/**
 * L'employeuse choisie n'a pas pu être rattachée : identité non exploitable
 * (ni SIRET ni commune) ou écriture `main` impossible.
 *
 * Cette erreur ne vient pas du décideur — elle ne peut se constater qu'après
 * avoir tenté le rattachement — mais elle appartient au même vocabulaire, car
 * elle a la même conséquence pour l'utilisateur : l'étape n'est pas franchie.
 */
export type EmployeuseIndisponible = {
  readonly _tag: 'EmployeuseIndisponible'
  readonly userId: UserId
}

export const EmployeuseIndisponible = (
  userId: UserId,
): EmployeuseIndisponible => ({
  _tag: 'EmployeuseIndisponible',
  userId,
})
