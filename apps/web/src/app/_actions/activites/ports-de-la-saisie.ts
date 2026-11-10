import 'server-only'

import type { SessionUser } from '@app/web/auth/sessionUser'
import {
  Commune,
  type EmployeuseDeLaDate,
  EmployeuseId,
  type LieuUtilisable,
  type MarquerLeRendezVousHonore,
  NomDeTag,
  TagId,
  type TagsUtilisables,
} from '@app/web/features/activites/domain'
import { consulterEmployeuseAUneDate } from '@app/web/features/employeuse/server'
import { LieuId, MediateurId } from '@app/web/features/lieux-activite'
import { verifierUnLieuDActivite } from '@app/web/features/lieux-activite/abilities/verifier-un-lieu-d-activite'
import { mettreAJourStatutRdvBinding } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementation/mettre-a-jour-statut-rdv.binding'
import { RdvId } from '@app/web/features/rdvsp/domain/rdv-id'
import { StatutPresenceModifiable } from '@app/web/features/rdvsp/domain/statut-presence'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { lireLesTagsVisibles } from '@app/web/features/tags/abilities/lire-les-tags-visibles'
import { TagId as IdentifiantDeTag } from '@app/web/features/tags/domain'
import { acteurDe } from '@app/web/features/tags/implementation/session'
import * as Sentry from '@sentry/nextjs'

export const tagsUtilisablesPar =
  (user: SessionUser): TagsUtilisables =>
  async (tagIds) =>
    (
      await lireLesTagsVisibles({
        acteur: acteurDe(user),
        tagIds: tagIds.map(IdentifiantDeTag),
      })
    ).map(({ id, nom }) => ({ id: TagId(id), nom: NomDeTag(nom) }))

export const employeuseDeLaDatePour =
  (user: SessionUser): EmployeuseDeLaDate =>
  async (date) => {
    const employeuse = await consulterEmployeuseAUneDate({
      userId: user.id,
      date: new Date(`${date}T00:00:00.000Z`),
    })
    if (employeuse === null) return null
    const { adresse } = employeuse
    return {
      id: EmployeuseId(employeuse.id),
      commune:
        adresse === null
          ? null
          : Commune.safe({
              nom: adresse.commune,
              codePostal: adresse.codePostal,
              codeInsee: adresse.codeInsee,
            }),
    }
  }

export const lieuUtilisablePar =
  (user: SessionUser): LieuUtilisable =>
  async (lieu, lieuActuel) =>
    user.mediateur != null &&
    verifierUnLieuDActivite({
      lieuId: LieuId(lieu),
      mediateurId: MediateurId(user.mediateur.id),
      lieuActuel: lieuActuel === null ? null : LieuId(lieuActuel),
    })

export const marquerLeRendezVousHonorePar =
  (user: SessionUser): MarquerLeRendezVousHonore =>
  async (rdvId) => {
    const resultat = await mettreAJourStatutRdvBinding({
      utilisateurId: UtilisateurCoopId(user.id),
      rdvId: RdvId(rdvId),
      statut: StatutPresenceModifiable('seen'),
    }).catch((erreur: unknown) => {
      Sentry.captureException?.(erreur)
      return null
    })
    if (resultat !== null && !resultat.success) {
      Sentry.captureException?.(
        new Error(
          `Statut du rendez-vous ${rdvId} non mis à jour (${resultat.error._tag})`,
        ),
      )
    }
  }
