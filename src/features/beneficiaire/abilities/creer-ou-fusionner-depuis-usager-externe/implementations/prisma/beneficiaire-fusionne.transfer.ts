import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { Email } from '@/features/beneficiaire/domain/email'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import type { Prisma } from '@/generated/prisma/client'
import { Telephone } from '@/libraries/telephone'
import type { MergedBeneficiaire } from '../../domain/usager-externe'
import type { beneficiaireFusionneSelect } from './beneficiaire-fusionne.select'

type BeneficiaireFusionneEnBase = Prisma.BeneficiaireGetPayload<{
  select: typeof beneficiaireFusionneSelect
}>

export type BeneficiaireFusionneLu = {
  readonly beneficiaire: MergedBeneficiaire
  readonly invalides: readonly string[]
}

const decode = <Brut, Decode>(
  brut: Brut | null,
  safe: (valeur: Brut) => Decode | null,
): Decode | null => (brut === null ? null : safe(brut))

const invalide = (brut: unknown, decode: unknown): boolean =>
  brut !== null && decode === null

export const versBeneficiaireFusionne = (
  ligne: BeneficiaireFusionneEnBase,
  maintenant: Date,
): BeneficiaireFusionneLu => {
  const beneficiaire: MergedBeneficiaire = {
    id: BeneficiaireId(ligne.id),
    nom: decode(ligne.nom, Nom.safe),
    prenom: decode(ligne.prenom, Prenom.safe),
    email: decode(ligne.email, Email.safe),
    telephone: decode(ligne.telephone, Telephone.safe),
    mediateurId: MediateurId(ligne.mediateurId),
    adresse: ligne.adresse,
    anneeNaissance: decode(
      ligne.anneeNaissance,
      AnneeNaissance(maintenant).safe,
    ),
    commune: ligne.commune,
  }
  return {
    beneficiaire,
    invalides: (
      ['nom', 'prenom', 'email', 'telephone', 'anneeNaissance'] as const
    ).filter((champ) => invalide(ligne[champ], beneficiaire[champ])),
  }
}
