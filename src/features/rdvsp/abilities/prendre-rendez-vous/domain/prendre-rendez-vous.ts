import type {
  BeneficiaireCible,
  BeneficiaireCibleId,
  MediateurProprietaireId,
} from '@/features/rdvsp/abilities/prendre-rendez-vous/domain/beneficiaire-cible'
import { BeneficiaireIntrouvable } from '@/features/rdvsp/abilities/prendre-rendez-vous/domain/errors'
import type {
  CompteRdv,
  CompteRdvUtilisable,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import { estUtilisable } from '@/features/rdvsp/domain/compte/compte-rdv'
import { CompteNonLie, type ErreurRdvApi } from '@/features/rdvsp/domain/errors'
import type { UsagerId } from '@/features/rdvsp/domain/identifiants/usager-id'
import type { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import type { RdvServicePublicApi } from '@/features/rdvsp/domain/ports'
import type {
  DemandeRdv,
  DemandeRdvCreee,
  UsagerDeLaDemande,
} from '@/features/rdvsp/domain/rdv/demande-rdv'
import { UrlRetour } from '@/features/rdvsp/domain/rdv/demande-rdv'
import { failure, type Result, success } from '@/libraries/result'

export type ErreurPriseRendezVous = BeneficiaireIntrouvable | ErreurRdvApi

export type PrendreRendezVous = (input: {
  readonly utilisateurId: UtilisateurCoopId
  readonly mediateurId: MediateurProprietaireId
  readonly beneficiaireId: BeneficiaireCibleId
}) => Promise<Result<DemandeRdvCreee, ErreurPriseRendezVous>>

export type BeneficiaireADemander = (
  id: BeneficiaireCibleId,
) => Promise<BeneficiaireCible | null>

export type CompteDuMediateur = (
  utilisateurId: UtilisateurCoopId,
) => Promise<CompteRdv | null>

/** Rattache l'usager rendu par RDV Service Public au bénéficiaire de La Coop. */
export type LierUsagerAuBeneficiaire = (input: {
  readonly beneficiaire: BeneficiaireCible
  readonly usagerId: UsagerId
}) => Promise<void>

export const verifierBeneficiaire = ({
  beneficiaire,
  mediateurId,
  beneficiaireId,
}: {
  beneficiaire: BeneficiaireCible | null
  mediateurId: MediateurProprietaireId
  beneficiaireId: BeneficiaireCibleId
}): Result<BeneficiaireCible, ErreurPriseRendezVous> =>
  beneficiaire === null || beneficiaire.mediateurId !== mediateurId
    ? failure(BeneficiaireIntrouvable(beneficiaireId))
    : success(beneficiaire)

export const verifierCompte = (
  compte: CompteRdv | null,
): Result<CompteRdvUtilisable, ErreurPriseRendezVous> => {
  if (compte === null) {
    return failure(CompteNonLie(null))
  }

  return estUtilisable(compte)
    ? success(compte)
    : failure(CompteNonLie(compte.agentId))
}

/**
 * Choisit ce que La Coop transmet à RDV Service Public à propos de l'usager.
 *
 * Un bénéficiaire déjà rattaché à un usager est désigné par son identifiant, et
 * rien d'autre : lui renvoyer aussi une identité laisserait RDV Service Public
 * arbitrer entre les deux. Sans rattachement, on ne transmet que le
 * pré-remplissage, sans identifiant à inventer. L'exclusivité est ce qui protège
 * de la création d'usagers en double à chaque nouvelle demande.
 */
const usagerDeLaDemande = (
  beneficiaire: BeneficiaireCible,
): UsagerDeLaDemande =>
  beneficiaire.usagerId === null
    ? {
        _tag: 'aCreer',
        prenom: beneficiaire.prenom,
        nom: beneficiaire.nom,
        email: beneficiaire.email,
        telephone: beneficiaire.telephone,
        adresse: beneficiaire.adresse,
        dateNaissance: null,
      }
    : { _tag: 'existant', id: beneficiaire.usagerId }

/**
 * Les deux liens pointent vers la même page — le dossier d'accompagnement du
 * bénéficiaire dans La Coop — mais ils s'adressent à des personnes différentes :
 * `urlRetour` ramène l'usager après sa prise de rendez-vous, `urlDossier` donne à
 * l'agent un accès au dossier depuis l'interface de RDV Service Public.
 */
export const demandePourBeneficiaire = (
  beneficiaire: BeneficiaireCible,
  urlDossierBeneficiaire: UrlRetour,
): DemandeRdv => ({
  usager: usagerDeLaDemande(beneficiaire),
  urlRetour: urlDossierBeneficiaire,
  urlDossier: urlDossierBeneficiaire,
})

export type DependancesPrendreRendezVous = {
  readonly beneficiaireADemander: BeneficiaireADemander
  readonly compteDuMediateur: CompteDuMediateur
  readonly creerDemandeRdv: RdvServicePublicApi['creerDemandeRdv']
  readonly lierUsager: LierUsagerAuBeneficiaire
  /** Construit l'URL du dossier d'accompagnement, qui dépend de l'hôte. */
  readonly urlDossierBeneficiaire: (id: BeneficiaireCibleId) => string
}

/**
 * Le rattachement de l'usager suit immédiatement la création de la demande : le
 * bénéficiaire porte dès lors l'identifiant RDV Service Public, et la demande
 * suivante désignera cet usager au lieu d'en réclamer un nouveau.
 */
export const prendreRendezVous =
  ({
    beneficiaireADemander,
    compteDuMediateur,
    creerDemandeRdv,
    lierUsager,
    urlDossierBeneficiaire,
  }: DependancesPrendreRendezVous): PrendreRendezVous =>
  async ({ utilisateurId, mediateurId, beneficiaireId }) => {
    const verifie = verifierBeneficiaire({
      beneficiaire: await beneficiaireADemander(beneficiaireId),
      mediateurId,
      beneficiaireId,
    })

    if (!verifie.success) {
      return verifie
    }

    const compte = verifierCompte(await compteDuMediateur(utilisateurId))

    if (!compte.success) {
      return compte
    }

    const demande = await creerDemandeRdv(
      compte.data,
      demandePourBeneficiaire(
        verifie.data,
        UrlRetour(urlDossierBeneficiaire(beneficiaireId)),
      ),
    )

    if (!demande.success) {
      return demande
    }

    await lierUsager({
      beneficiaire: verifie.data,
      usagerId: demande.data.usagerId,
    })

    return success(demande.data)
  }
