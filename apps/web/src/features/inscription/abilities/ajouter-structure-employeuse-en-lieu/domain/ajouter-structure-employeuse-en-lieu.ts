import type { UserId } from '@app/web/features/inscription/domain'

/**
 * Le « Oui/Non » porte sur l'employeuse de l'utilisateur : sans employeuse, la
 * question n'a pas d'objet. L'écran ne s'affiche qu'une fois l'employeuse
 * renseignée ; l'ability ne s'en remet pas à lui.
 */
export type EmployeuseIntrouvable = {
  readonly _tag: 'EmployeuseIntrouvable'
  readonly userId: UserId
}

export const EmployeuseIntrouvable = (
  userId: UserId,
): EmployeuseIntrouvable => ({
  _tag: 'EmployeuseIntrouvable',
  userId,
})

export type AjouterStructureEmployeuseEnLieuError = EmployeuseIntrouvable
