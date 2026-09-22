import {
  ComplementAdresse,
  Courriel,
  DETAIL_LONGUEUR_MAXIMALE,
  FicheAccesLibre,
  Horaires,
  RESUME_LONGUEUR_MAXIMALE,
  Siret,
  Telephone,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { type Anomalie, anomalie } from './anomalie'
import {
  type LieuAReprendre,
  renseignee,
  renseignees,
} from './lieu-a-reprendre'

type ValeurMesuree = {
  readonly code: string
  readonly champ: string
  readonly portees: (lieu: LieuAReprendre) => readonly string[]
  readonly reconnue: (valeur: string) => boolean
}

const reconnuePar =
  <T>(modele: { safe: (valeur: string) => T | null }) =>
  (valeur: string): boolean =>
    modele.safe(valeur) != null

const auPlus =
  (longueur: number) =>
  (valeur: string): boolean =>
    valeur.length <= longueur

export const VALEURS_MESUREES: readonly ValeurMesuree[] = [
  {
    code: 'complement-non-reconnu',
    champ: 'complementAdresse',
    portees: (lieu) => renseignee(lieu.complementAdresse),
    reconnue: reconnuePar(ComplementAdresse),
  },
  {
    code: 'siret-invalide',
    champ: 'siret',
    portees: (lieu) => renseignee(lieu.siret),
    reconnue: reconnuePar(Siret),
  },
  {
    code: 'telephone-non-conforme',
    champ: 'telephone',
    portees: (lieu) => renseignee(lieu.telephone),
    reconnue: reconnuePar(Telephone),
  },
  {
    code: 'courriel-non-conforme',
    champ: 'courriels',
    portees: (lieu) => renseignees(lieu.courriels),
    reconnue: reconnuePar(Courriel),
  },
  {
    code: 'site-web-non-conforme',
    champ: 'siteWeb',
    portees: (lieu) => renseignees(lieu.siteWeb),
    reconnue: reconnuePar(Url),
  },
  {
    code: 'horaires-non-osm',
    champ: 'horaires',
    portees: (lieu) => renseignee(lieu.horaires),
    reconnue: reconnuePar(Horaires),
  },
  {
    code: 'fiche-hors-acces-libre',
    champ: 'ficheAccesLibre',
    portees: (lieu) => renseignee(lieu.ficheAccesLibre),
    reconnue: reconnuePar(FicheAccesLibre),
  },
  {
    code: 'prise-rdv-non-conforme',
    champ: 'priseRdv',
    portees: (lieu) => renseignee(lieu.priseRdv),
    reconnue: reconnuePar(Url),
  },
  {
    code: 'resume-trop-long',
    champ: 'presentationResume',
    portees: (lieu) => renseignee(lieu.presentationResume),
    reconnue: auPlus(RESUME_LONGUEUR_MAXIMALE),
  },
  {
    code: 'detail-trop-long',
    champ: 'presentationDetail',
    portees: (lieu) => renseignee(lieu.presentationDetail),
    reconnue: auPlus(DETAIL_LONGUEUR_MAXIMALE),
  },
]

export const valeursRefusees = (lieu: LieuAReprendre): readonly Anomalie[] =>
  VALEURS_MESUREES.flatMap(({ code, champ, portees, reconnue }) =>
    portees(lieu)
      .filter((valeur) => !reconnue(valeur))
      .map((valeur) => anomalie(code, 'valeur-perdue', champ, valeur)),
  )
