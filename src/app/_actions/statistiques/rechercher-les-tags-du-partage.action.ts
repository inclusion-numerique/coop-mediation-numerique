'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { utilisateurDeLaSessionParId } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { resoudreUnLienDePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage/domain'
import { lireLePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage/implementations/prisma/partage.query'
import { LienDePartageId } from '@/features/mediateurs/domain'
import { utilisateurDuPartage } from '@/features/statistiques/implementations/session/utilisateur-du-partage.transfer'
import { RechercherDesTagsDuPartageValidation } from '@/features/tags/abilities/rechercher-des-tags/action/rechercher-des-tags.validation'
import { rechercherDesTags } from '@/features/tags/abilities/rechercher-des-tags/implementations/prisma/rechercher-des-tags.query'
import { TagId } from '@/features/tags/domain'
import { acteurDe } from '@/features/tags/implementations/session/acteur.transfer'
import { tagAffiche } from '@/features/tags/ui/presenters/tag-affiche.presenter'
import { withInput } from '@/libraries/nextjs'

const rechercherDansLePartage = actionBuilder()
  .use(withInput(RechercherDesTagsDuPartageValidation))
  .execute(async ({ input: { partage, recherche, exclus } }) => {
    const lien = await resoudreUnLienDePartage({ lirePartage: lireLePartage })({
      lien: LienDePartageId.safe(partage),
    })
    if (!lien.success) return []
    const acteur = acteurDe(
      profilDeLaSession(
        utilisateurDuPartage(
          lien.data.proprietaire,
          await utilisateurDeLaSessionParId(lien.data.utilisateurId),
        ),
      ),
    )
    return (
      await rechercherDesTags({
        acteur,
        recherche,
        exclus: exclus.map(TagId),
        limite: 10,
      })
    ).map(tagAffiche(acteur))
  })

export const rechercherLesTagsDuPartageAction = async (
  partage: string,
  input: { recherche: string },
) => rechercherDansLePartage({ ...input, partage })
