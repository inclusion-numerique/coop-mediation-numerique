import { z } from 'zod'
import type { Genre } from './genre'
import type { StatutSocial } from './statut-social'
import type { TrancheAge } from './tranche-age'

export const BeneficiaireId = z.string().uuid().brand('BeneficiaireId')
export type BeneficiaireId = z.infer<typeof BeneficiaireId>

export type Beneficiaire = {
  id: BeneficiaireId
  mediateurId: string
  prenom: string | null
  nom: string | null
  telephone: string | null
  pasDeTelephone: boolean
  email: string | null
  anneeNaissance: number | null
  adresse: string | null
  commune: string | null
  communeCodePostal: string | null
  communeCodeInsee: string | null
  genre: Genre | null
  trancheAge: TrancheAge | null
  statutSocial: StatutSocial | null
  notes: string | null
  anonyme: boolean
  creation: Date
  modification: Date
  suppression: Date | null
}

export const isBeneficiaireAnonymous = ({
  prenom,
  nom,
}: Pick<Beneficiaire, 'prenom' | 'nom'>) => !prenom && !nom

export const getBeneficiaireDisplayName = ({
  prenom,
  nom,
}: Pick<Beneficiaire, 'prenom' | 'nom'>) => {
  if (!prenom && !nom) return 'Bénéficiaire anonyme'

  return `${prenom ?? ''} ${nom ?? ''}`.trim()
}

export const getBeneficiaireAdresseString = ({
  adresse,
  commune,
  communeCodePostal,
}: Pick<Beneficiaire, 'adresse' | 'commune' | 'communeCodePostal'>):
  | string
  | undefined => {
  if (!commune) return adresse ?? undefined

  let result = ''
  if (adresse) result += `${adresse}, `
  if (communeCodePostal) result += `${communeCodePostal} `
  if (commune) result += commune

  return result
}
