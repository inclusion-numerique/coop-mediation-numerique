import { prismaClient } from '@/configuration/prisma'
import { UsagerId } from '../../../../domain/identifiants/usager-id'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../../../../domain/identite'
import {
  type BeneficiaireCible,
  BeneficiaireCibleId,
  MediateurProprietaireId,
} from '../../domain/beneficiaire-cible'
import type { BeneficiaireADemander } from '../../domain/ports'

export const beneficiaireADemander: BeneficiaireADemander = async (id) => {
  const row = await prismaClient.beneficiaire.findUnique({
    where: { id },
    select: {
      id: true,
      mediateurId: true,
      prenom: true,
      nom: true,
      email: true,
      telephone: true,
      adresse: true,
      rdvUser: { select: { id: true } },
    },
  })

  if (row === null) {
    return null
  }

  const beneficiaire: BeneficiaireCible = {
    id: BeneficiaireCibleId(row.id),
    mediateurId: MediateurProprietaireId(row.mediateurId),
    usagerId: row.rdvUser === null ? null : UsagerId(row.rdvUser.id),
    prenom: row.prenom === null ? null : PrenomExterne.safe(row.prenom),
    nom: row.nom === null ? null : NomExterne.safe(row.nom),
    email: row.email === null ? null : EmailExterne.safe(row.email),
    telephone:
      row.telephone === null ? null : TelephoneExterne.safe(row.telephone),
    adresse: row.adresse,
  }

  return beneficiaire
}
