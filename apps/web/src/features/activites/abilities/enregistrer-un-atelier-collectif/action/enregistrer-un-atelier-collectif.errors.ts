export const ENREGISTRER_UN_ATELIER_COLLECTIF_ERRORS = {
  ActionNonAutorisee: 'Vous ne pouvez pas enregistrer cet atelier',
  ActiviteIntrouvable: 'Cette activité n’existe plus',
  TypeDActiviteIncompatible: 'Cette activité est un accompagnement individuel',
  BeneficiaireIntrouvable: 'Un des bénéficiaires n’est plus disponible',
  BeneficiaireEnDouble: 'Un bénéficiaire est cité deux fois',
  AtelierSansParticipant:
    'Veuillez renseigner au moins un bénéficiaire suivi ou anonyme',
  LieuInutilisable: 'Ce lieu d’activité n’est plus disponible',
  TagInutilisable: 'Un des tags choisis n’est plus disponible',
  RendezVousIndisponible: 'Ce rendez-vous a déjà un compte rendu d’activité',
  DateTropLointaine:
    'La date de l’activité ne peut pas dépasser deux ans à partir d’aujourd’hui',
} as const
