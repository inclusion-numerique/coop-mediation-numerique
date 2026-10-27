import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { ProfilOutils } from './profil-outils'

export const OutilDAccompagnement = defineModel(
  z
    .enum([
      'AidantsConnect',
      'CartographieNationale',
      'MonInclusionNumerique',
      'LesBases',
      'BaseConseillerNumeriqueContributions',
      'BaseConseillersNumeriquesCoordinateurs',
      'Mattermost',
      'CentreDAideConseillerNumerique',
    ])
    .brand('OutilDAccompagnement'),
)

export type OutilDAccompagnement = Model.TypeOf<typeof OutilDAccompagnement>

const pourTous = () => true

const pourLesCoordinateurs = ({ coordination }: ProfilOutils) =>
  coordination === 'Coordinateur'

const pourLeDispositifConseillerNumerique = ({ dispositif }: ProfilOutils) =>
  dispositif === 'ConseillerNumerique'

const pourLesCoordinateursDuDispositifConseillerNumerique = (
  profil: ProfilOutils,
) => pourLesCoordinateurs(profil) && pourLeDispositifConseillerNumerique(profil)

const visibilites: readonly (readonly [
  OutilDAccompagnement,
  (profil: ProfilOutils) => boolean,
])[] = [
  [OutilDAccompagnement('AidantsConnect'), pourTous],
  [OutilDAccompagnement('CartographieNationale'), pourTous],
  [OutilDAccompagnement('MonInclusionNumerique'), pourLesCoordinateurs],
  [OutilDAccompagnement('LesBases'), pourTous],
  [
    OutilDAccompagnement('BaseConseillerNumeriqueContributions'),
    pourLeDispositifConseillerNumerique,
  ],
  [
    OutilDAccompagnement('BaseConseillersNumeriquesCoordinateurs'),
    pourLesCoordinateursDuDispositifConseillerNumerique,
  ],
  [OutilDAccompagnement('Mattermost'), pourTous],
  [
    OutilDAccompagnement('CentreDAideConseillerNumerique'),
    pourLeDispositifConseillerNumerique,
  ],
]

export const outilsDAccompagnementVisibles = (
  profil: ProfilOutils,
): readonly OutilDAccompagnement[] =>
  visibilites
    .filter(([, visiblePour]) => visiblePour(profil))
    .map(([outil]) => outil)
