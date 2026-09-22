import {
  Adresse,
  CodeInsee,
  CodePostal,
  Commune,
  Localisation,
  Voie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { type Anomalie, anomalie } from './anomalie'
import { type LieuAReprendre, nonVide } from './lieu-a-reprendre'

type ChampDAdresse = {
  readonly champ: string
  readonly portee: (lieu: LieuAReprendre) => string | null
  readonly absent: string
  readonly refuse: string
  readonly reconnue: (valeur: string) => boolean
  readonly facultatif?: true
}

const CHAMPS_D_ADRESSE: readonly ChampDAdresse[] = [
  {
    champ: 'adresse',
    portee: (lieu) => nonVide(lieu.adresse),
    absent: 'voie-absente',
    refuse: 'voie-non-reconnue',
    reconnue: (valeur) => Voie.safe(valeur) != null,
  },
  {
    champ: 'codePostal',
    portee: (lieu) => nonVide(lieu.codePostal),
    absent: 'code-postal-absent',
    refuse: 'code-postal-invalide',
    reconnue: (valeur) => CodePostal.safe(valeur) != null,
  },
  {
    champ: 'commune',
    portee: (lieu) => nonVide(lieu.commune),
    absent: 'commune-absente',
    refuse: 'commune-non-reconnue',
    reconnue: (valeur) => Commune.safe(valeur) != null,
  },
  {
    champ: 'codeInsee',
    portee: (lieu) => nonVide(lieu.codeInsee),
    absent: 'code-insee-absent',
    refuse: 'code-insee-invalide',
    reconnue: (valeur) => CodeInsee.safe(valeur) != null,
    facultatif: true,
  },
]

const champFautif = (
  lieu: LieuAReprendre,
  { champ, portee, absent, refuse, reconnue, facultatif }: ChampDAdresse,
): readonly Anomalie[] => {
  const valeur = portee(lieu)

  if (valeur == null)
    return facultatif === true
      ? []
      : [anomalie(absent, 'lieu-ecarte', champ, '')]

  return reconnue(valeur)
    ? []
    : [anomalie(refuse, 'lieu-ecarte', champ, valeur)]
}

const adresseCandidate = (lieu: LieuAReprendre) => ({
  voie: lieu.adresse,
  commune: lieu.commune,
  code_postal: lieu.codePostal,
  ...(nonVide(lieu.codeInsee) == null
    ? {}
    : { code_insee: nonVide(lieu.codeInsee) ?? '' }),
})

export const adresseMesuree = (lieu: LieuAReprendre): readonly Anomalie[] =>
  Adresse.safe(adresseCandidate(lieu)) != null
    ? []
    : CHAMPS_D_ADRESSE.flatMap((champ) => champFautif(lieu, champ))

const localisationRenseignee = (
  lieu: LieuAReprendre,
): { readonly latitude: number; readonly longitude: number } | null =>
  lieu.latitude == null || lieu.longitude == null
    ? null
    : { latitude: lieu.latitude, longitude: lieu.longitude }

export const localisationMesuree = (
  lieu: LieuAReprendre,
): readonly Anomalie[] => {
  const localisation = localisationRenseignee(lieu)

  if (localisation == null || Localisation.safe(localisation) != null) return []

  return [
    anomalie(
      'localisation-hors-emprise',
      'valeur-perdue',
      'localisation',
      `${localisation.latitude}, ${localisation.longitude}`,
    ),
  ]
}
