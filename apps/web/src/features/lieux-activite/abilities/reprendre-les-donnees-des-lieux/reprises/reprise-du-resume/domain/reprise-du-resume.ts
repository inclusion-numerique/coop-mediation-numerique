import { RESUME_LONGUEUR_MAXIMALE } from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  descriptionAvecLaNote,
  type LieuAReprendre,
  nonVide,
  type Reprise,
  reprise,
} from '../../../domain'

const COLONNE = 'presentationResume'

const A_DEPLACER = 'À déplacer dans le champ description'

export type DescendreLeResume = (
  lieuId: string,
  description: string,
) => Promise<void>

export const resumeADescendre = (lieu: LieuAReprendre): string | null => {
  const resume = nonVide(lieu.presentationResume)

  if (resume == null || resume.length <= RESUME_LONGUEUR_MAXIMALE) return null

  return descriptionAvecLaNote(lieu.presentationDetail, resume)
}

export const repriseDuResume = (
  descendreLeResume: DescendreLeResume,
): Reprise =>
  reprise<string>({
    colonnes: [COLONNE],
    constater: resumeADescendre,
    mentions: () => [
      {
        colonne: COLONNE,
        cellule: A_DEPLACER,
        motif: `${COLONNE} : vers la description`,
      },
    ],
    appliquer: descendreLeResume,
  })
