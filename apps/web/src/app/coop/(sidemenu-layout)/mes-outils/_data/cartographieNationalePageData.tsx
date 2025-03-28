import CartographieNationaleOutilAccess from '@app/web/app/coop/(sidemenu-layout)/mes-outils/_components/CartographieNationaleOutilAccess'
import { OutilPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-outils/outilPageData'

export default {
  title: 'La Cartographie Nationale des lieux d’inclusion numérique',
  description:
    'Rendre visible vos lieux et services d’inclusion numérique pour faciliter l’orientation des bénéficiaires.',
  website: 'https://cartographie.societenumerique.gouv.fr',
  logo: '/images/services/cartographie-icon.svg',
  illustration: '/images/illustrations/mes-outils/cartographie-nationale.svg',
  features: [
    {
      title: 'Gagnez en visibilité dans votre territoire',
      description:
        "Cette cartographie nationale est également locale : de la plus petite collectivité à un hub, chacun peut l'implémenter sur son site et afficher l'offre de médiation numérique de son territoire.",
      icon: 'ri-star-line',
    },
    {
      title: 'Des informations standardisées',
      description:
        "Les lieux sont référencés au format du standard de données des lieux d'inclusion numérique établi par la Mednum, Datactivist et l'ANCT.",
      link: 'https://schema.data.gouv.fr/LaMednum/standard-mediation-num/1.0.1/documentation.html',
      icon: 'ri-lightbulb-line',
    },
    {
      title: 'Orientez les bénéficiaires',
      description:
        "En quelques secondes, renseignez les besoins d'un bénéficiaire, son adresse et ses disponibilités afin d'afficher uniquement les lieux qui pourront l'aider.",
      icon: 'ri-line-chart-line',
    },
  ],
  accessComponent: <CartographieNationaleOutilAccess />,
} satisfies OutilPageData
