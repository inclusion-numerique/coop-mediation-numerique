import type { Lieu } from '../../domain/rdv/lieu'
import type { Motif } from '../../domain/rdv/motif'
import type { Usager } from '../../domain/usager'

export const motifFromDomain = (motif: Motif) => ({
  id: motif.id,
  name: motif.nom,
  collectif: motif.collectif,
  organisationId: motif.organisationId,
  followUp: motif.suivi,
  instructionForRdv: motif.instruction,
  locationType: motif.typeDeLieu,
  motifCategoryId: motif.categorieId,
})

export const lieuFromDomain = (lieu: Lieu) => ({
  id: lieu.id,
  name: lieu.nom,
  address: lieu.adresse ?? '',
  organisationId: lieu.organisationId,
  phoneNumber: lieu.telephone,
  singleUse: lieu.usageUnique,
})

export const usagerFromDomain = (usager: Usager) => ({
  id: usager.id,
  firstName: usager.prenom,
  lastName: usager.nom,
  email: usager.email,
  phoneNumber: usager.telephone,
  phoneNumberFormatted: usager.telephoneFormate,
  address: usager.coordonnees.adresse,
  addressDetails: usager.coordonnees.complementAdresse,
  affiliationNumber: usager.coordonnees.numeroAllocataire,
  birthDate: usager.dateNaissance,
  birthName: usager.coordonnees.nomNaissance,
  caisseAffiliation: usager.coordonnees.caisseAffiliation,
  createdAt: usager.creation,
  invitationCreatedAt: usager.invitationCreee,
  invitationAcceptedAt: usager.invitationAcceptee,
  notifyByEmail: usager.notifierParEmail,
  notifyBySms: usager.notifierParSms,
})
