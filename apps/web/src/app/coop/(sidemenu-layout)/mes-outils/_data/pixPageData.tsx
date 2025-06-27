import { OutilPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-outils/outilPageData'

export default {
  title: 'Pix Orga',
  description:
    'Proposez des parcours de montée en compétences et des tests Pix adaptés à vos bénéficiaires et suivez leur progression.',
  website: 'https://pix.fr/mediation-numerique',
  websiteLinkLabel: 'Voir la page Pix dédiée à la médiation numérique',
  logo: '/images/services/pix-orga.svg',
  illustration: '/images/illustrations/mes-outils/pix.webp',
  illustrationWidth: 100,
  features: [
    {
      title:
        'Pour tous les niveaux, sur tous les sujets de la médiation numérique',
      description:
        'Des parcours qui s’adaptent au niveau de chacun, réponse après réponse, grâce à un algorithme adaptatif.',
      icon: 'ri-star-line',
    },
    {
      title: 'Ludique et motivant',
      description:
        'Avec des mises en situations inspirées du réel dans un environnement bienveillant qui valorise chaque pas.',
      icon: 'ri-lightbulb-line',
    },
    {
      title: 'Jouables en 5 à 30 minutes',
      description:
        'Des parcours thématiques à intégrer dans un accompagnement ou une animation, ou à jouer en autonomie.',
      icon: 'ri-timer-line',
    },
    {
      title: 'Accessibles à tous',
      description:
        'Avec des tests accessibles sans compte et sur smartphone, et des énoncés en FALC.',
      icon: 'ri-line-chart-line',
    },
  ],
  access: {
    how: 'Votre structure doit déposer une demande d’accès à Pix Orga. ',
    icon: 'ri-home-smile-2-line',
    info: {
      label: 'Demander l’accès',
      link: 'https://www.demarches-simplifiees.fr/commencer/demande-d-acces-a-pix-orga-pour-le-suivi-des-usagers',
    },
    title: 'Ma structure a déjà accès à Pix',
    description:
      'Si votre structure a déjà un accès, vous pouvez vous connecter avec votre identifiant Pix :',
    callToAction: {
      label: 'Se connecter',
      link: 'https://orga.pix.fr/connexion',
    },
  },
} satisfies OutilPageData
