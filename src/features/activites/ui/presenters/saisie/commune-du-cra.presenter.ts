import type { CommuneConnue } from '../../../action/rechercher-des-beneficiaires.key'
import type { CommuneDuCra } from '../../forms/commune-du-cra.validation'

export const communeDuCra = ({
  commune,
  codePostal,
  codeInsee,
}: CommuneConnue): CommuneDuCra => ({
  id: codeInsee,
  label: `${commune} · ${codePostal}`,
  commune,
  codePostal,
  codeInsee,
})
