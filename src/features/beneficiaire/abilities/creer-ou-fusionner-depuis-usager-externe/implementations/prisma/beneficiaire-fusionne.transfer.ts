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

export const versBeneficiaireFusionne = (
  ligne: BeneficiaireFusionneEnBase,
  maintenant: Date,
): MergedBeneficiaire => ({
  id: BeneficiaireId(ligne.id),
  nom: ligne.nom === null ? null : Nom.safe(ligne.nom),
  prenom: ligne.prenom === null ? null : Prenom.safe(ligne.prenom),
  email: ligne.email === null ? null : Email.safe(ligne.email),
  telephone: ligne.telephone === null ? null : Telephone.safe(ligne.telephone),
  mediateurId: MediateurId(ligne.mediateurId),
  adresse: ligne.adresse,
  anneeNaissance:
    ligne.anneeNaissance === null
      ? null
      : AnneeNaissance(maintenant).safe(ligne.anneeNaissance),
  commune: ligne.commune,
})
