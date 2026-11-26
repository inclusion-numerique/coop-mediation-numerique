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

/**
 * Présence effective d'un participant : son propre statut dès qu'il a été saisi,
 * celui du rendez-vous sinon.
 *
 * La distinction compte parce que les deux ne se renseignent pas au même
 * endroit. La Coop n'écrit que le statut du rendez-vous ; le statut d'une
 * participation ne bouge que si quelqu'un le saisit dans RDV Service Public. Lire
 * la participation seule revenait donc à ignorer la seule absence que le
 * médiateur pouvait déclarer.
 */
const presenceEffective = (
  participation: ParticipationDuRdv,
  rdv: RdvPourActivite,
): StatutPresence =>
  participation.statutPresence === 'unknown'
    ? rdv.statutPresence
    : participation.statutPresence

/**
 * Usagers pour lesquels une fiche bénéficiaire doit exister.
 *
 * Seuls comptent ceux qui étaient là — `seen` — et ceux dont la présence n'a pas
 * encore été saisie nulle part, un CRA rédigé après coup valant justement
 * constat de présence. Les absences et annulations sont écartées : leur créer une
 * fiche bénéficiaire au passage reviendrait à peupler le carnet du médiateur de
 * personnes qu'il n'a jamais rencontrées.
 */
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

/**
 * Aucune activité n'est créée ici — le médiateur reste maître de son CRA. Ce que
 * l'ability produit, c'est le lien vers un formulaire déjà rempli, et l'effet de
 * bord qui le rend possible : les bénéficiaires des participants existent
 * désormais dans La Coop.
 */
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
