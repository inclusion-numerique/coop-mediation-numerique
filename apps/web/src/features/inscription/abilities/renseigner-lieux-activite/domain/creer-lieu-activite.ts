import type { UserId } from '@app/web/features/inscription/domain'

/**
 * Un lieu d'activité se rattache à un médiateur : sans profil médiateur, il n'y
 * a personne à qui l'attacher. L'écran l'exige déjà en amont ; l'ability ne s'en
 * remet pas à lui.
 */
export type MediateurIntrouvable = {
  readonly _tag: 'MediateurIntrouvable'
  readonly userId: UserId
}

export const MediateurIntrouvable = (userId: UserId): MediateurIntrouvable => ({
  _tag: 'MediateurIntrouvable',
  userId,
})

export type CreerLieuActiviteError = MediateurIntrouvable
