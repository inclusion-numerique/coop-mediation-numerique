export const ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ERRORS = {
  ActionNonAutorisee: 'Vous ne pouvez pas enregistrer cette activité',
  ActiviteIntrouvable: 'Cette activité n’existe plus',
  TypeDActiviteIncompatible: 'Cette activité est d’un autre type',
  TagInutilisable: 'Un des tags choisis n’est plus disponible',
  DateTropLointaine:
    'La date de l’activité ne peut pas dépasser deux ans à partir d’aujourd’hui',
} as const
