import type {
  BeneficiaireCible,
  BeneficiaireCibleId,
  MediateurProprietaireId,
} from '@/features/rdvsp/abilities/prendre-rendez-vous/domain/beneficiaire-cible'
import type {
  CompteRdv,
  CompteRdvUtilisable,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import { estUtilisable } from '@/features/rdvsp/domain/compte/compte-rdv'
import { CompteNonLie } from '@/features/rdvsp/domain/errors'
import type { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import type {
  DemandeRdv,
  UsagerDeLaDemande,
} from '@/features/rdvsp/domain/rdv/demande-rdv'
import { UrlRetour } from '@/features/rdvsp/domain/rdv/demande-rdv'
import { failure, type Result, success } from '@/libraries/result'
import {
  BeneficiaireIntrouvable,
  type EchecDePrendreRendezVous,
} from './errors'
import type { PrendreRendezVousPorts } from './ports'
import type { LiaisonUsager, RendezVousDemande } from './rendez-vous-demande'

const verifierBeneficiaire = ({
  beneficiaire,
  mediateurId,
  beneficiaireId,
}: {
  beneficiaire: BeneficiaireCible | null
  mediateurId: MediateurProprietaireId
  beneficiaireId: BeneficiaireCibleId
}): Result<BeneficiaireCible, EchecDePrendreRendezVous> =>
  beneficiaire === null || beneficiaire.mediateurId !== mediateurId
    ? failure(BeneficiaireIntrouvable(beneficiaireId))
    : success(beneficiaire)

const verifierCompte = (
  compte: CompteRdv | null,
): Result<CompteRdvUtilisable, EchecDePrendreRendezVous> => {
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
const demandePourBeneficiaire = (
  beneficiaire: BeneficiaireCible,
  urlDossierBeneficiaire: UrlRetour,
): DemandeRdv => ({
  usager: usagerDeLaDemande(beneficiaire),
  urlRetour: urlDossierBeneficiaire,
  urlDossier: urlDossierBeneficiaire,
})

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
  }: PrendreRendezVousPorts) =>
  async ({
    utilisateurId,
    mediateurId,
    beneficiaireId,
  }: {
    readonly utilisateurId: UtilisateurCoopId
    readonly mediateurId: MediateurProprietaireId
    readonly beneficiaireId: BeneficiaireCibleId
  }): Promise<Result<RendezVousDemande, EchecDePrendreRendezVous>> => {
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

    const demande = demandePourBeneficiaire(
      verifie.data,
      UrlRetour(urlDossierBeneficiaire(beneficiaireId)),
    )

    const creee = await creerDemandeRdv(compte.data, demande)

    if (!creee.success) {
      return creee
    }

    const liaison: LiaisonUsager = {
      beneficiaire: verifie.data,
      usagerId: creee.data.usagerId,
    }

    await lierUsager(liaison)

    return success({ demande, creee: creee.data, liaison })
  }
