import {
  type FormationLabelPropose,
  formationsLabelsProposees,
} from '@app/web/features/lieux-activite/domain/nomenclatures'
import type { Fiche } from '../../../../domain/fiche'
import { aucuneValeur } from './section-vide'

export type DescriptionAffichee = {
  readonly presentationResume: string | null
  readonly presentationDetail: string | null
  readonly formationsLabels: readonly FormationLabelPropose[]
  readonly estVide: boolean
}

export const description = (fiche: Fiche): DescriptionAffichee => ({
  presentationResume: fiche.presentation?.resume ?? null,
  presentationDetail: fiche.presentation?.detail ?? null,
  formationsLabels: formationsLabelsProposees(fiche.formationsLabels),
  estVide: aucuneValeur([
    fiche.presentation?.resume,
    fiche.presentation?.detail,
  ]),
})
