import { Pictogram } from '@app/web/features/pictograms/pictogram'
import { AidantsConnectLogo } from '@app/web/features/pictograms/services/AidantsConnectLogo'
import { CartographieLogo } from '@app/web/features/pictograms/services/CartographieLogo'
import { CentreAideConseillerNumeriqueLogo } from '@app/web/features/pictograms/services/CentreAideConseillerNumeriqueLogo'
import { LesBasesLogo } from '@app/web/features/pictograms/services/LesBasesLogo'
import { MattermostLogo } from '@app/web/features/pictograms/services/MattermostLogo'
import { MonInclusionNumeriqueLogo } from '@app/web/features/pictograms/services/MonInclusionNumeriqueLogo'

export type ProfilOutils = {
  readonly coordinateur: boolean
  readonly conseillerNumerique: boolean
}

export type OutilAccompagnement = {
  readonly pictogram: Pictogram
  readonly title: string
  readonly slug?: string
  readonly accessUrl: string
  readonly description: string
}

type OutilAccompagnementConditionne = OutilAccompagnement & {
  readonly visiblePour: (profil: ProfilOutils) => boolean
}

const pourTous = () => true

const pourLesCoordinateurs = ({ coordinateur }: ProfilOutils) => coordinateur

const pourLeDispositifConseillerNumerique = ({
  conseillerNumerique,
}: ProfilOutils) => conseillerNumerique

const pourLesCoordinateursDuDispositifConseillerNumerique = (
  profil: ProfilOutils,
) => pourLesCoordinateurs(profil) && pourLeDispositifConseillerNumerique(profil)

const outilsAccompagnements: OutilAccompagnementConditionne[] = [
  {
    pictogram: AidantsConnectLogo,
    title: 'Aidants Connect',
    slug: 'aidants-connect',
    accessUrl: 'https://aidantsconnect.beta.gouv.fr/accounts/login/',
    description:
      'Sécuriser l’aidant et la personne accompagnée dans la réalisation de démarches administratives en ligne.',
    visiblePour: pourTous,
  },
  {
    pictogram: CartographieLogo,
    title: 'La Cartographie Nationale des lieux d’inclusion numérique',
    slug: 'cartographie-nationale-des-lieux-d-inclusion-numerique',
    accessUrl: 'https://cartographie.societenumerique.gouv.fr',
    description:
      'Rendre visible vos lieux et services d’inclusion numérique pour faciliter l’orientation des bénéficiaires.',
    visiblePour: pourTous,
  },
  {
    pictogram: MonInclusionNumeriqueLogo,
    title: 'Mon Inclusion Numérique',
    slug: 'mon-inclusion-numerique',
    accessUrl: 'https://mon.inclusion-numerique.anct.gouv.fr/connexion',
    description:
      'L’outil de pilotage par la donnée des dispositifs d’inclusion numérique.',
    visiblePour: pourLesCoordinateurs,
  },
  {
    pictogram: LesBasesLogo,
    title: 'Les Bases du numérique d’intérêt général',
    slug: 'les-bases-du-numerique-d-interet-general',
    accessUrl: 'https://lesbases.anct.gouv.fr/connexion',
    description:
      'La plateforme collaborative de partage de ressources & communs numériques à l’échelle nationale.',
    visiblePour: pourTous,
  },
  {
    pictogram: LesBasesLogo,
    title: 'La Base “Conseiller numérique - contributions”',
    accessUrl:
      'https://lesbases.anct.gouv.fr/bases/conseiller-numerique-contributions',
    description:
      'Cette base coopérative permet à chaque conseiller numérique de partager les ressources jugées utiles à la communauté.',
    visiblePour: pourLeDispositifConseillerNumerique,
  },
  {
    pictogram: LesBasesLogo,
    title: 'La Base “Conseillers numériques coordinateurs”',
    accessUrl:
      'https://lesbases.anct.gouv.fr/bases/conseillers-numeriques-coordinateurs',
    description:
      'Cette base coopérative vise à partager les outils mis à disposition des conseillers numériques coordinateurs dans le cadre de leurs missions.',
    visiblePour: pourLesCoordinateursDuDispositifConseillerNumerique,
  },
  {
    pictogram: MattermostLogo,
    title: 'Mattermost de la médiation numérique',
    accessUrl: 'https://discussion.coop-numerique.anct.gouv.fr/',
    description:
      'Service de messagerie instantanée à destination des médiateurs numériques, mis à disposition par l’ANCT et animé par la Mednum.',
    visiblePour: pourTous,
  },
  {
    pictogram: CentreAideConseillerNumeriqueLogo,
    title: 'Centre d’aide du dispositif Conseiller Numérique',
    accessUrl: 'https://aide.conseiller-numerique.gouv.fr/fr/',
    description:
      'Vous avez une question autour du dispositif ? Consultez la FAQ ou contactez les équipes afin d’obtenir de l’aide.',
    visiblePour: pourLeDispositifConseillerNumerique,
  },
]

export const outilsAccompagnementsVisibles = (
  profil: ProfilOutils,
): OutilAccompagnement[] =>
  outilsAccompagnements
    .filter(({ visiblePour }) => visiblePour(profil))
    .map(({ visiblePour: _, ...outil }) => outil)
