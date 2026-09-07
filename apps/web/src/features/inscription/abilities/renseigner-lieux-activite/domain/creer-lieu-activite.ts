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

/**
 * Un lieu à créer dont l'adresse n'a pas été reconnue par la Base Adresse
 * Nationale. Le nom accompagne l'erreur : dans une liste de plusieurs lieux,
 * savoir lequel est refusé est tout ce dont l'utilisateur a besoin.
 */
export type AdresseNonValidee = {
  readonly _tag: 'AdresseNonValidee'
  readonly nom: string
}

export const AdresseNonValidee = (nom: string): AdresseNonValidee => ({
  _tag: 'AdresseNonValidee',
  nom,
})

export type CreerLieuActiviteError = MediateurIntrouvable
