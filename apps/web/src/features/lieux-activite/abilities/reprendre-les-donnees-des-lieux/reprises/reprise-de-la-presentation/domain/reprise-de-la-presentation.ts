import { nettoyerPresentation } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuAReprendre, Reprise } from '../../../domain'
import { reprise } from '../../../domain'

const COLONNE = 'presentation'

const A_CORRIGER = 'à corriger'

export type PresentationAReprendre = {
  readonly resume: boolean
  readonly detail: boolean
}

export type NettoyerLaPresentation = (lieuId: string) => Promise<void>

export const presentationNettoyee = (texte: string | null): string | null => {
  if (texte == null) return null

  const nettoye = nettoyerPresentation(texte)

  return nettoye === '' ? null : nettoye
}

const aNettoyer = (texte: string | null): boolean =>
  texte != null && presentationNettoyee(texte) !== texte

export const presentationAReprendre = (
  lieu: LieuAReprendre,
): PresentationAReprendre | null => {
  const resume = aNettoyer(lieu.presentationResume)
  const detail = aNettoyer(lieu.presentationDetail)

  return resume || detail ? { resume, detail } : null
}

const CELLULES: ReadonlyMap<string, string> = new Map([
  ['resume', `résumé ${A_CORRIGER}`],
  ['detail', `détail ${A_CORRIGER}`],
  ['resume+detail', `résumé et détail ${A_CORRIGER}`],
])

const cellule = ({ resume, detail }: PresentationAReprendre): string =>
  CELLULES.get(
    [resume ? 'resume' : null, detail ? 'detail' : null]
      .filter((champ) => champ != null)
      .join('+'),
  ) ?? A_CORRIGER

export const repriseDeLaPresentation = (
  nettoyerLaPresentation: NettoyerLaPresentation,
): Reprise =>
  reprise<PresentationAReprendre>({
    colonnes: [COLONNE],
    constater: presentationAReprendre,
    mentions: (aReprendre) => [
      {
        colonne: COLONNE,
        cellule: cellule(aReprendre),
        motif: `${COLONNE} : ${A_CORRIGER}`,
      },
    ],
    appliquer: (lieuId) => nettoyerLaPresentation(lieuId),
  })
