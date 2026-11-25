import Badge from '@codegouvfr/react-dsfr/Badge'
import type { StatutCompte } from '../../domain'
import {
  libelleDuStatut,
  severiteDuStatut,
} from '../presenters/statut-compte.presenter'

export const BadgeStatutCompte = ({ statut }: { statut: StatutCompte }) => (
  <Badge small severity={severiteDuStatut(statut)}>
    {libelleDuStatut(statut)}
  </Badge>
)
