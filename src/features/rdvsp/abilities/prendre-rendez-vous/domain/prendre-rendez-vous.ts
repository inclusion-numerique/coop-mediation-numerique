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

const demandePourBeneficiaire = (
  beneficiaire: BeneficiaireCible,
  urlDossierBeneficiaire: UrlRetour,
): DemandeRdv => ({
  usager: usagerDeLaDemande(beneficiaire),
  urlRetour: urlDossierBeneficiaire,
  urlDossier: urlDossierBeneficiaire,
})

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
