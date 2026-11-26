'use server'

import { environnementServeur } from '@/configuration/environnement/serveur'
import { actionBuilder } from '@/configuration/nextjs'
import { adresseDeRetourApresConnexion } from '@/features/authentification/domain/page-d-accueil'
import { getAuthenticatedSessionToken } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { USURPER_UN_UTILISATEUR_ERRORS } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/action/usurper-un-utilisateur.errors'
import { UsurperUnUtilisateurValidation } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/action/usurper-un-utilisateur.validation'
import { PorteeUsurpation } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/domain/index'
import { usurperUnUtilisateur as usurper } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/domain/usurper-un-utilisateur'
import { cibleUsurpation } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/implementations/prisma/cible-usurpation.query'
import { ouvrirLUsurpation } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/implementations/prisma/ouvrir-l-usurpation.mutation'
import { identifiantsDe, UtilisateurId } from '@/features/utilisateurs/domain'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const usurperUnUtilisateur = usurper({
  lireLaCible: cibleUsurpation,
  ouvrirLUsurpation,
})

export const usurperUnUtilisateurAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(UsurperUnUtilisateurValidation))
  .execute(
    fromResult(
      async ({ input, user }) => {
        const resultat = await usurperUnUtilisateur({
          utilisateurId: UtilisateurId.safe(input.utilisateurId),
          usurpateurId: UtilisateurId(user.id),
          jetonDeSession: await getAuthenticatedSessionToken(),
          portee: PorteeUsurpation(
            environnementServeur().SUDO_USURPATION
              ? 'TousLesComptes'
              : 'FixturesSeulement',
          ),
        })

        if (!resultat.success) return resultat

        const { cible } = resultat.data
        const { mediateurId, coordinateurId } = identifiantsDe(
          cible.rattachements,
        )
        return success({
          nom: cible.nom,
          redirection: adresseDeRetourApresConnexion({
            role: cible.role,
            inscriptionValidee:
              cible.inscription._tag === 'Le' ? cible.inscription.date : null,
            mediateur: mediateurId === null ? null : { id: mediateurId },
            coordinateur:
              coordinateurId === null ? null : { id: coordinateurId },
          }),
        })
      },
      { onError: USURPER_UN_UTILISATEUR_ERRORS },
    ),
  )
