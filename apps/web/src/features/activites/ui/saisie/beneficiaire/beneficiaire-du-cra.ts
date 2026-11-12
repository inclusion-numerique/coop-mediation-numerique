import {
  type CommuneConnue,
  type CommuneDuCra,
  communeDuCra,
} from '../commune/commune-du-cra'

export type BeneficiaireTrouveParLeCra = {
  readonly id: string
  readonly prenom: string
  readonly nom: string
  readonly communeResidence: CommuneConnue | null
}

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
