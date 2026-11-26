import {
  debutEmploi,
  finEmploi,
} from '../../../../domain/affectation/periode-emploi'
import type { EmployeuseActuelle } from '../../../../domain/consultation/employeuse-actuelle'
import {
  type EmployeuseAffichage,
  employeuseAffichage,
} from '../../../../ui/presenters/employeuse.presenter'

export type EmployeuseActuelleAffichage = EmployeuseAffichage & {
  debut: Date | null
  fin: Date | null
  source: string
}

export const employeuseActuelleAffichage = ({
  employeuse,
  source,
  periode,
}: EmployeuseActuelle): EmployeuseActuelleAffichage => ({
  ...employeuseAffichage(employeuse),
  debut: debutEmploi(periode),
  fin: finEmploi(periode),
  source,
})
