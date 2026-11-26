'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { effacerNotes } from '@/features/activites/abilities/effacer-notes/implementations/prisma/effacer-notes.mutation'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille/implementations/prisma/anonymiser-portefeuille.mutation'
import { compteADetacher } from '@/features/equipe/abilities/detacher-des-equipes/domain/detachement'
import { detacherDesEquipes as detacherDesEquipesAvec } from '@/features/equipe/abilities/detacher-des-equipes/domain/detacher-des-equipes'
import { retirerDesEquipes } from '@/features/equipe/abilities/detacher-des-equipes/implementations/prisma/retirer-des-equipes.mutation'
import { retirerDesLieux } from '@/features/lieux-activite/abilities/retirer-des-lieux/implementations/prisma/retirer-des-lieux.mutation'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques/domain/revoquer-partage-statistiques'
import { revoquerLesPartages } from '@/features/mediateurs/abilities/revoquer-partage-statistiques/implementations/prisma/revoquer-partage-statistiques.mutation'
import { bilanDeLEffacement } from '@/features/rdvsp/abilities/effacer-empreinte-rdv/domain/bilan-de-l-effacement'
import { effacerEmpreinteRdv } from '@/features/rdvsp/abilities/effacer-empreinte-rdv/domain/effacer-empreinte-rdv'
import {
  supprimerLeCompteRdv,
  supprimerLesUsagers,
} from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/prisma/effacer-empreinte-rdv.mutation'
import {
  compteAEffacer,
  rendezVousDuCompte,
  usagersOrphelinsParmi,
} from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/prisma/effacer-empreinte-rdv.query'
import { signalerLaRevocationEchouee } from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/telemetrie/revocation-echouee.mutation'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { configurationOAuthRdvsp } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { revoquerJetons } from '@/features/rdvsp/implementations/api/revoquer-jetons.mutation'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { bilanDuRetrait } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/domain'
import { retirerLesTagsDUnCompte } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/domain/retirer-les-tags-d-un-compte'
import { appliquerLeRetraitDesTags } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/implementations/prisma/retirer-les-tags-d-un-compte.mutation'
import {
  lireLesTagsDetenus,
  lireLesTagsDuCompte,
} from '@/features/tags/abilities/retirer-les-tags-d-un-compte/implementations/prisma/tags-du-compte.query'
import { role } from '@/features/tags/domain'
import { SUPPRIMER_COMPTE_ERRORS } from '@/features/utilisateurs/abilities/supprimer-compte/action/supprimer-compte.errors'
import type { EffacementsDuCompte } from '@/features/utilisateurs/abilities/supprimer-compte/domain/ports'
import { supprimerCompte } from '@/features/utilisateurs/abilities/supprimer-compte/domain/supprimer-compte'
import { retirerDesListesDeDiffusion } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/brevo/retirer-des-listes-de-diffusion.mutation'
import { hash } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/crypto/hash.adapter'
import { compteASupprimer } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/prisma/compte-a-supprimer.query'
import { couperAcces } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/prisma/couper-acces.mutation'
import { logEffacementReport } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/prisma/log-effacement-report.mutation'
import {
  type IdentifiantsRattaches,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { fromResult } from '@/libraries/nextjs'
import { attraperEnEchecTechnique } from '@/libraries/result'

const revoquerLePartage = revoquerPartageStatistiques({ revoquerLesPartages })

const retirerLesTags = retirerLesTagsDUnCompte({
  lireLesTagsDuCompte,
  lireLesTagsDetenus,
  appliquerLeRetrait: appliquerLeRetraitDesTags,
})

const portsDeSuppression = (
  effacements: EffacementsDuCompte,
  synchroniserLaPersonne: SynchroniserLaPersonne,
) => ({
  ...effacements,
  hash,
  lireLeCompteASupprimer: compteASupprimer,
  couperLAcces: couperAcces(synchroniserLaPersonne),
  journaliserLEffacement: logEffacementReport,
})

const supprimerCompteAvec = (
  effacements: EffacementsDuCompte,
  synchroniserLaPersonne: SynchroniserLaPersonne,
) => supprimerCompte(portsDeSuppression(effacements, synchroniserLaPersonne))

const effacerLEmpreinte = effacerEmpreinteRdv({
  compteAEffacer,
  revoquerJetons: revoquerJetons(configurationOAuthRdvsp()),
  signalerLaRevocationEchouee,
  rendezVousDuCompte,
  supprimerLeCompte: supprimerLeCompteRdv,
  usagersOrphelinsParmi,
  supprimerLesUsagers,
})

const effacerLEmpreinteRdv = async ({
  utilisateurId,
}: {
  readonly utilisateurId: string
}) => {
  const effacement = await effacerLEmpreinte({
    utilisateurId: UtilisateurCoopId(utilisateurId),
  })
  return bilanDeLEffacement(effacement.data)
}

const detacherDesEquipes = async (identifiants: IdentifiantsRattaches) => {
  const detachement = await detacherDesEquipesAvec({ retirerDesEquipes })({
    compte: compteADetacher(identifiants),
    maintenant: new Date(),
  })
  return detachement.data.bilan
}

const supprimerComptePorts: EffacementsDuCompte = {
  anonymiserPortefeuille: attraperEnEchecTechnique(anonymiserPortefeuille),
  effacerNotes: attraperEnEchecTechnique(effacerNotes),
  effacerEmpreinteRdv: attraperEnEchecTechnique(effacerLEmpreinteRdv),
  retirerLesTagsDUnCompte: attraperEnEchecTechnique(
    async (identifiants: IdentifiantsRattaches) => {
      const retrait = await retirerLesTags({
        compte: role(identifiants.mediateurId, identifiants.coordinateurId),
        maintenant: new Date(),
      })
      return bilanDuRetrait(retrait.data)
    },
  ),
  detacherDesEquipes: attraperEnEchecTechnique(detacherDesEquipes),
  retirerDesLieux: attraperEnEchecTechnique(retirerDesLieux),
  revoquerPartageStatistiques: attraperEnEchecTechnique(
    async (identifiants: IdentifiantsRattaches) => {
      const revocation = await revoquerLePartage({
        ...identifiants,
        maintenant: new Date(),
      })
      return { partagesRevoques: revocation.data.partagesRevoques }
    },
  ),
  retirerDesListesDeDiffusion,
}

export const supprimerMonCompteAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .execute(
    fromResult(
      ({ user }) =>
        supprimerCompteAvec(
          supprimerComptePorts,
          synchroniserPersonne,
        )({
          cible: UtilisateurId(user.id),
          auteur: { _tag: 'titulaire' },
          maintenant: new Date(),
        }),
      { onError: SUPPRIMER_COMPTE_ERRORS },
    ),
  )
