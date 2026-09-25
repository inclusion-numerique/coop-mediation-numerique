import {
  Courriel,
  nettoyerCourriel,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  type LieuAReprendre,
  type ValeursAReprendre,
  valeursAReprendre,
} from '../../../domain'

const courrielNettoye = (courriel: string): readonly string[] => {
  const propre = Courriel.safe(nettoyerCourriel(courriel))

  return propre == null ? [] : [propre]
}

export const courrielsAReprendre = (
  lieu: LieuAReprendre,
): ValeursAReprendre | null =>
  valeursAReprendre(lieu.courriels, courrielNettoye)
