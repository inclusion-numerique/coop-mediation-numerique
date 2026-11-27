import {
  type CompteRdv,
  estUtilisable,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import {
  CompteNonLie,
  RdvIntrouvable,
  RdvNonAutorise,
} from '@/features/rdvsp/domain/errors'
import type { MediateurId } from '@/features/rdvsp/domain/identifiants/mediateur-id'
import type { RdvId } from '@/features/rdvsp/domain/identifiants/rdv-id'
import type { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import type { UsagerExterne } from '@/features/rdvsp/domain/ports'
import type { StatutPresence } from '@/features/rdvsp/domain/rdv/statut-presence'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDeCreerActiviteDepuisRdv } from './errors'
import type { CreerActiviteDepuisRdvPorts } from './ports'
import type {
  ParticipationDuRdv,
  RdvPourActivite,
  UsagerDuRdv,
} from './rdv-pour-activite'

export type CraPrepare = {
  readonly usagers: readonly UsagerDuRdv[]
  readonly urlCreationCra: string
}

const verifierRdv = ({
  rdv,
  compte,
  rdvId,
}: {
  rdv: RdvPourActivite | null
  compte: CompteRdv | null
  rdvId: RdvId
}): Result<RdvPourActivite, EchecDeCreerActiviteDepuisRdv> => {
  if (compte === null) {
    return failure(CompteNonLie(null))
  }

  if (!estUtilisable(compte)) {
    return failure(CompteNonLie(compte.agentId))
  }

  if (rdv === null) {
    return failure(RdvIntrouvable(rdvId))
  }

  return rdv.agentId === compte.agentId
    ? success(rdv)
    : failure(RdvNonAutorise(rdvId))
}

const presenceEffective = (
  participation: ParticipationDuRdv,
  rdv: RdvPourActivite,
): StatutPresence =>
  participation.statutPresence === 'unknown'
    ? rdv.statutPresence
    : participation.statutPresence

const usagersPourActivite = (rdv: RdvPourActivite): readonly UsagerDuRdv[] =>
  rdv.participations
    .filter((participation: ParticipationDuRdv) => {
      const presence = presenceEffective(participation, rdv)

      return presence === 'seen' || presence === 'unknown'
    })
    .map((participation) => participation.usager)

const enUsagerExterne = (usager: UsagerDuRdv): UsagerExterne => ({
  rdvUserId: usager.id,
  prenom: usager.prenom,
  nom: usager.nom,
  email: usager.email,
  telephone: usager.telephone,
  adresse: usager.adresse,
  birthDate: usager.dateNaissance,
})

export const creerActiviteDepuisRdv =
  ({
    lireRdv,
    compteDuRedacteur,
    creerOuFusionnerBeneficiaires,
    preparerUrlCreationCra,
  }: CreerActiviteDepuisRdvPorts) =>
  async ({
    utilisateurId,
    mediateurId,
    rdvId,
    maintenant,
  }: {
    readonly utilisateurId: UtilisateurCoopId
    readonly mediateurId: MediateurId
    readonly rdvId: RdvId
    readonly maintenant: Date
  }): Promise<Result<CraPrepare, EchecDeCreerActiviteDepuisRdv>> => {
    const [rdv, compte] = await Promise.all([
      lireRdv(rdvId),
      compteDuRedacteur(utilisateurId),
    ])

    const verifie = verifierRdv({ rdv, compte, rdvId })

    if (!verifie.success) {
      return verifie
    }

    const usagers = usagersPourActivite(verifie.data)

    const fusion = await creerOuFusionnerBeneficiaires({
      usagers: usagers.map(enUsagerExterne),
      mediateurId,
      maintenant,
    })

    return success({
      usagers,
      urlCreationCra: await preparerUrlCreationCra({
        rendezVous: {
          id: verifie.data.id,
          debut: verifie.data.debut,
          dureeEnMinutes: verifie.data.dureeEnMinutes,
          titre: verifie.data.titre,
          collectif: verifie.data.collectif,
        },
        mediateurId,
        beneficiaires: fusion.data.merges,
      }),
    })
  }
