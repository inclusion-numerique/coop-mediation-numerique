export const ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ERRORS = {
  ActionNonAutorisee: 'Vous ne pouvez pas enregistrer cet accompagnement',
  ActiviteIntrouvable: 'Cette activité n’existe plus',
  TypeDActiviteIncompatible: 'Cette activité est un atelier collectif',
  BeneficiaireIntrouvable: 'Ce bénéficiaire n’est plus disponible',
  LieuInutilisable: 'Ce lieu d’activité n’est plus disponible',
  TagInutilisable: 'Un des tags choisis n’est plus disponible',
  RendezVousIndisponible: 'Ce rendez-vous a déjà un compte rendu d’activité',
  DateTropLointaine:
    'La date de l’activité ne peut pas dépasser deux ans à partir d’aujourd’hui',
} as const
