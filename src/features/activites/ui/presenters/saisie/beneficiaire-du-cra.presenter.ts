import type { BeneficiaireTrouveParLeCra } from '../../../action/rechercher-des-beneficiaires.key'
import { type CommuneDuCra } from '../../forms/commune-du-cra.validation'
import { communeDuCra } from './commune-du-cra.presenter'

export type BeneficiaireDuCra = {
  readonly id: string
  readonly prenom: string
  readonly nom: string
  readonly communeResidence: CommuneDuCra | null
}

export const beneficiaireDuCra = ({
  id,
  prenom,
  nom,
  communeResidence,
}: BeneficiaireTrouveParLeCra): BeneficiaireDuCra => ({
  id,
  prenom,
  nom,
  communeResidence:
    communeResidence == null ? null : communeDuCra(communeResidence),
})
