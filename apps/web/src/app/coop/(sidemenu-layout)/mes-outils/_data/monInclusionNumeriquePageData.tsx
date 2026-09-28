import { OutilPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-outils/outilPageData'
import { MonInclusionNumeriqueLogo } from '@app/web/features/pictograms/services/MonInclusionNumeriqueLogo'

export default {
  title: 'Mon Inclusion Numérique',
  description:
    'Une suite d’outils pensée par et pour les gestionnaires de la politique d’inclusion numérique qui propose une mise en cohérence des différents dispositifs.',
  website: 'https://mon.inclusion-numerique.anct.gouv.fr',
  pictogram: MonInclusionNumeriqueLogo,
  illustration:
    '/images/illustrations/mes-outils/france-numerique-ensemble.svg',
  features: [
    {
      title: 'Explorer des statistiques territoriales',
      description:
        'Visualisez des données selon votre échelle d’action (régional, groupement, départemental, structure), votre appartenance à une gouvernance FNE et votre rôle dans les dispositifs.',
      icon: 'ri-refresh-line',
    },
    {
      title: 'Gérer votre structure',
      description:
        'Visualisez et gérez les infos essentielles de votre structure, les personnes de votre équipe, les aidants et médiateurs rattachés à votre structure ainsi que les lieux de médiation.',
      icon: 'ri-notification-3-line',
    },
    {
      title: 'Piloter des dispositifs d’inclusion numérique',
      description:
        'Si vous faites partie d’une gouvernance, accédez aux informations associées (feuille de route, comitologie, membres).',
      icon: 'ri-calendar-event-line',
    },
  ],
  access: {
    how: 'Votre structure doit disposer d’un accès à Mon Inclusion Numérique.',
    icon: 'ri-home-smile-2-line',
    title: 'Ma structure a déjà accès à Mon Inclusion Numérique',
    description:
      'Si votre structure a déjà un accès, vous pouvez vous connecter via ProConnect :',
    callToAction: {
      label: 'Se connecter',
      link: 'https://mon.inclusion-numerique.anct.gouv.fr/connexion',
    },
  },
} satisfies OutilPageData
