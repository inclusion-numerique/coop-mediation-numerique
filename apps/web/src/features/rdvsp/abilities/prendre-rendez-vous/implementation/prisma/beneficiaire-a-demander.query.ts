import { prismaClient } from '@app/web/prismaClient'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../../../../domain/identite'
import { UsagerId } from '../../../../domain/usager-id'
import {
  type BeneficiaireCible,
  BeneficiaireCibleId,
  MediateurProprietaireId,
} from '../../domain/beneficiaire-cible'
import type { BeneficiaireADemander } from '../../domain/prendre-rendez-vous'

/**
 * Adaptateur vers la table des bénéficiaires. Les identités passent par
 * `Model.safe` : un téléphone ou un e-mail hérité mal formé ne doit pas empêcher
 * de prendre un rendez-vous, il vaut mieux transmettre un pré-remplissage
 * incomplet que rien du tout.
 */
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
