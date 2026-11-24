import {
  Frais,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { ComponentType } from 'react'
import { InternetIcon } from '@/libraries/pictograms/digital/InternetIcon'
import { SittingAtATableIcon } from '@/libraries/pictograms/user/SittingAtATableIcon'
import { TeacherIcon } from '@/libraries/pictograms/user/TeacherIcon'
import { PairIcon } from '@/libraries/pictograms/work/PairIcon'
import type { SelectOption } from '@/libraries/ui/components/form/utils/options'
import { labelsToOptions } from '@/libraries/ui/components/form/utils/options'
import { FormationLabelPropose } from '../../domain/nomenclatures'
import { typologieLibelles } from './typologie.labels'

const optionsDe = <Valeur extends string>(
  nomenclature: Record<string, Valeur>,
  hints: Partial<Record<Valeur, string>> = {},
): SelectOption<Valeur>[] =>
  Object.values(nomenclature).map((valeur) => {
    const hint = hints[valeur]

    return {
      label: valeur,
      value: valeur,
      ...(hint === undefined ? {} : { hint }),
    }
  })

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
