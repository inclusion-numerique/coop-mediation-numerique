import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { InternetIcon } from '@app/web/features/pictograms/digital/InternetIcon'
import { SittingAtATableIcon } from '@app/web/features/pictograms/user/SittingAtATableIcon'
import { TeacherIcon } from '@app/web/features/pictograms/user/TeacherIcon'
import { PairIcon } from '@app/web/features/pictograms/work/PairIcon'
import {
  Frais,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { ComponentType } from 'react'
import { FormationLabelPropose } from '../domain/nomenclatures'
import { typologieLibelles } from './libelles-typologie'

/**
 * Les options des formulaires.
 *
 * Les valeurs du schéma national sont déjà des libellés lisibles — « Aide aux
 * démarches administratives » — et ce sont elles que la saisie transporte :
 * une option va donc de la valeur vers elle-même. La typologie fait exception,
 * avec ses sigles et ses libellés propres.
 */
const optionsDe = <Valeur extends string>(
  nomenclature: Record<string, Valeur>,
  hints: Partial<Record<Valeur, string>> = {},
): SelectOption<Valeur>[] =>
  Object.values(nomenclature).map((valeur) => ({
    label: valeur,
    value: valeur,
    hint: hints[valeur],
  }))

export const serviceOptions = optionsDe(Service)

export const formationLabelOptions = optionsDe(FormationLabelPropose)

export const typologieStructureOptions = labelsToOptions(typologieLibelles)

export const publicSpecifiquementAdresseOptions = optionsDe(
  PublicSpecifiquementAdresse,
)

export const priseEnChargeSpecifiqueOptions = optionsDe(PriseEnChargeSpecifique)

export const fraisAChargeOptions = optionsDe(Frais, {
  [Frais.Gratuit]: 'Accès gratuit au lieu et à ses services',
  [Frais.GratuitSousCondition]:
    'La gratuité est conditionnée à des critères (adhésion, situation familiale, convention avec un organisme social, pass numériques…)',
  [Frais.Payant]: 'L’accès au lieu et/ou à ses services est payant',
})

export const modaliteAccompagnementOptions = optionsDe(ModaliteAccompagnement, {
  [ModaliteAccompagnement.ADistance]: 'par téléphone ou en visioconférence',
})

export const modaliteAccompagnementIcons: Record<
  ModaliteAccompagnement,
  ComponentType<{ width?: number; height?: number }>
> = {
  [ModaliteAccompagnement.EnAutonomie]: PairIcon,
  [ModaliteAccompagnement.AccompagnementIndividuel]: SittingAtATableIcon,
  [ModaliteAccompagnement.DansUnAtelier]: TeacherIcon,
  [ModaliteAccompagnement.ADistance]: InternetIcon,
}
