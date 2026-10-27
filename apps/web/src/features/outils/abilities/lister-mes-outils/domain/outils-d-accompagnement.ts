import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const outilsDAccompagnement = [
  'AidantsConnect',
  'CartographieNationale',
  'MonInclusionNumerique',
  'LesBases',
  'BaseConseillerNumeriqueContributions',
  'BaseConseillersNumeriquesCoordinateurs',
  'Mattermost',
  'CentreDAideConseillerNumerique',
] as const

export type ValeurDOutilDAccompagnement = (typeof outilsDAccompagnement)[number]

export const OutilDAccompagnement = defineModel(
  z.enum(outilsDAccompagnement).brand('OutilDAccompagnement'),
)

export type OutilDAccompagnement = Model.TypeOf<typeof OutilDAccompagnement>

export type ProfilOutils = {
  readonly coordinateur: boolean
  readonly conseillerNumerique: boolean
}

const pourTous = () => true

const pourLesCoordinateurs = ({ coordinateur }: ProfilOutils) => coordinateur

const pourLeDispositifConseillerNumerique = ({
  conseillerNumerique,
}: ProfilOutils) => conseillerNumerique

const pourLesCoordinateursDuDispositifConseillerNumerique = (
  profil: ProfilOutils,
) => pourLesCoordinateurs(profil) && pourLeDispositifConseillerNumerique(profil)

const visibilites: readonly (readonly [
  ValeurDOutilDAccompagnement,
  (profil: ProfilOutils) => boolean,
])[] = [
  ['AidantsConnect', pourTous],
  ['CartographieNationale', pourTous],
  ['MonInclusionNumerique', pourLesCoordinateurs],
  ['LesBases', pourTous],
  ['BaseConseillerNumeriqueContributions', pourLeDispositifConseillerNumerique],
  [
    'BaseConseillersNumeriquesCoordinateurs',
    pourLesCoordinateursDuDispositifConseillerNumerique,
  ],
  ['Mattermost', pourTous],
  ['CentreDAideConseillerNumerique', pourLeDispositifConseillerNumerique],
]

export const outilsDAccompagnementVisibles = (
  profil: ProfilOutils,
): readonly OutilDAccompagnement[] =>
  visibilites
    .filter(([, visiblePour]) => visiblePour(profil))
    .map(([outil]) => OutilDAccompagnement(outil))
