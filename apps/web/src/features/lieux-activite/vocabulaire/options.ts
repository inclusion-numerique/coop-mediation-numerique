import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { InternetIcon } from '@app/web/features/pictograms/digital/InternetIcon'
import { SittingAtATableIcon } from '@app/web/features/pictograms/user/SittingAtATableIcon'
import { TeacherIcon } from '@app/web/features/pictograms/user/TeacherIcon'
import { PairIcon } from '@app/web/features/pictograms/work/PairIcon'
import type {
  FraisACharge as FraisAChargeCoop,
  ModaliteAccompagnement as ModaliteAccompagnementCoop,
} from '@prisma/client'
import type { ComponentType } from 'react'
import { formationLabel } from './formation-label'
import { fraisACharge } from './frais-a-charge'
import { modaliteAccompagnement } from './modalite-accompagnement'
import { priseEnChargeSpecifique } from './prise-en-charge-specifique'
import { publicSpecifiquementAdresse } from './public-specifiquement-adresse'
import { service } from './service'
import { libelles as typologieLibelles } from './typologie'

/**
 * Les options des formulaires. Séparées des tables parce qu'elles tirent le
 * design system et des pictogrammes : le vocabulaire lui-même doit rester
 * chargeable côté serveur, où il sert à la traduction et non à l'affichage.
 *
 * Les valeurs du schéma national sont déjà des libellés lisibles — « Aide aux
 * démarches administratives » — d'où l'usage direct de la table de traduction
 * comme table d'affichage. La typologie fait exception, avec ses propres
 * libellés.
 */
export const serviceOptions = labelsToOptions(service.table)

export const formationLabelOptions = labelsToOptions(formationLabel.table)

export const typologieStructureOptions = labelsToOptions(typologieLibelles)

export const publicSpecifiquementAdresseOptions = labelsToOptions(
  publicSpecifiquementAdresse.table,
)

export const priseEnChargeSpecifiqueOptions = labelsToOptions(
  priseEnChargeSpecifique.table,
)

const fraisAChargeHints: Record<FraisAChargeCoop, string> = {
  Gratuit: 'Accès gratuit au lieu et à ses services',
  GratuitSousCondition:
    'La gratuité est conditionnée à des critères (adhésion, situation familiale, convention avec un organisme social, pass numériques…)',
  Payant: 'L’accès au lieu et/ou à ses services est payant',
}

export const fraisAChargeOptions = labelsToOptions(fraisACharge.table, {
  hints: fraisAChargeHints,
})

const modalitesAccompagnementHints: Partial<
  Record<ModaliteAccompagnementCoop, string>
> = {
  ADistance: 'par téléphone ou en visioconférence',
}

export const modaliteAccompagnementOptions = labelsToOptions(
  modaliteAccompagnement.table,
  { hints: modalitesAccompagnementHints },
)

export const modaliteAccompagnementIcons: Record<
  ModaliteAccompagnementCoop,
  ComponentType<{ width?: number; height?: number }>
> = {
  EnAutonomie: PairIcon,
  AccompagnementIndividuel: SittingAtATableIcon,
  DansUnAtelierCollectif: TeacherIcon,
  ADistance: InternetIcon,
}
