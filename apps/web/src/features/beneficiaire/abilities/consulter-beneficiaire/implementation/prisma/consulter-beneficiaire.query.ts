import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import type { ConsulterBeneficiaire } from '../../domain/consulter-beneficiaire'

const beneficiaireInformationsSelect = {
  id: true,
  mediateurId: true,
  rdvUserId: true,
  rdvServicePublicId: true,
  prenom: true,
  nom: true,
  email: true,
  anneeNaissance: true,
  notes: true,
  genre: true,
  trancheAge: true,
  creation: true,
  adresse: true,
  telephone: true,
  pasDeTelephone: true,
  statutSocial: true,
  commune: true,
  communeCodePostal: true,
  communeCodeInsee: true,
  accompagnementsCount: true,
} satisfies Prisma.BeneficiaireSelect

export const consulterBeneficiaire: ConsulterBeneficiaire = ({
  beneficiaireId,
  mediateurId,
}) =>
  prismaClient.beneficiaire.findUnique({
    where: {
      id: beneficiaireId,
      // Seul le médiateur propriétaire peut consulter la fiche.
      mediateurId,
      suppression: null,
    },
    select: beneficiaireInformationsSelect,
  })
