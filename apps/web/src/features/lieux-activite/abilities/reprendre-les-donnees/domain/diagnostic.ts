import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { adresseMesuree, localisationMesuree } from './adresse-mesuree'
import { type Anomalie, anomalie } from './anomalie'
import { adresseHorsBan } from './base-adresse-nationale'
import { type LieuAReprendre, nonVide } from './lieu-a-reprendre'
import { listesMesurees, listesObligatoires } from './listes-mesurees'
import { valeursRefusees } from './valeurs-mesurees'

const nomMesure = (lieu: LieuAReprendre): readonly Anomalie[] =>
  Nom.safe(lieu.nom) != null
    ? []
    : [anomalie('nom-vide', 'lieu-ecarte', 'nom', lieu.nom)]

const nAPourPivotQueSonRna = (lieu: LieuAReprendre): boolean =>
  nonVide(lieu.siret) == null && nonVide(lieu.rna) != null

const pivotMesure = (lieu: LieuAReprendre): readonly Anomalie[] =>
  nAPourPivotQueSonRna(lieu)
    ? [anomalie('pivot-etait-un-rna', 'valeur-perdue', 'rna', lieu.rna ?? '')]
    : []

const MESURES: readonly ((lieu: LieuAReprendre) => readonly Anomalie[])[] = [
  nomMesure,
  adresseMesuree,
  adresseHorsBan,
  localisationMesuree,
  pivotMesure,
  valeursRefusees,
  listesMesurees,
  listesObligatoires,
]

export const diagnostiquer = (lieu: LieuAReprendre): readonly Anomalie[] =>
  MESURES.flatMap((mesurer) => mesurer(lieu))
