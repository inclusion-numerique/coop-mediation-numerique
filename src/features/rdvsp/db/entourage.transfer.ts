import type { Lieu } from '../domain/lieu'
import type { Motif } from '../domain/motif'
import type { Usager } from '../domain/usager'

/**
 * Écriture des modèles qui entourent un rendez-vous. Ils n'ont pas de lecture
 * réciproque ici : la synchronisation les reçoit de RDV Service Public et les
 * recopie, elle ne les relit que par le rendez-vous qui les désigne.
 */

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

/**
 * `responsibleId` n'est délibérément pas enregistré : la relation est
 * auto-référente et l'usager responsable n'est pas toujours présent dans La Coop,
 * ce qui violerait la clé étrangère. La donnée reste disponible dans le domaine
 * pour qui saurait la traiter.
 */
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
