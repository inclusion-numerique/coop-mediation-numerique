export const SUPPRIMER_COMPTE_ERRORS = {
  CompteIntrouvable: 'Ce compte est introuvable',
  CompteDejaSupprime: 'Ce compte est déjà supprimé',
  RoleProtege:
    'Un compte administrateur ou support ne peut pas être supprimé. Retirez-lui d’abord ce rôle.',
  AccesNonCoupe:
    'La suppression n’a pas pu aboutir, aucune donnée n’a été modifiée. Réessayez dans un instant.',
} as const

export type SupprimerCompteErrorKey =
  (typeof SUPPRIMER_COMPTE_ERRORS)[keyof typeof SUPPRIMER_COMPTE_ERRORS]
