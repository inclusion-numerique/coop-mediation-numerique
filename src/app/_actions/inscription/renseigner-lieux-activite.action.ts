'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { lieuxSoumis } from '@/features/inscription/abilities/renseigner-lieux-activite/action/lieux-soumis.transfer'
import { RENSEIGNER_LIEUX_ACTIVITE_ERRORS } from '@/features/inscription/abilities/renseigner-lieux-activite/action/renseigner-lieux-activite.errors'
import { RenseignerLieuxActiviteValidation } from '@/features/inscription/abilities/renseigner-lieux-activite/action/renseigner-lieux-activite.validation'
import type { EchecDeRenseignerLieuxActivite } from '@/features/inscription/abilities/renseigner-lieux-activite/domain'
import { renseignerLieuxActivite } from '@/features/inscription/abilities/renseigner-lieux-activite/domain/renseigner-lieux-activite'
import { enregistrerReconciliation } from '@/features/inscription/abilities/renseigner-lieux-activite/implementations/prisma/enregistrer-reconciliation.mutation'
import { UtilisateurId } from '@/features/inscription/domain'
import { getInscriptionEtat } from '@/features/inscription/implementations/prisma/get-inscription-etat.query'
import { lieuDemande } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/lieu-desire.transfer'
import { adresseValidee } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/panier.transfer'
import type {
  AdresseValidee,
  CreationDemandee,
  DestinationDuLieu,
  LieuCarto,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/domain'
import { structuresCartoParIds } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/entrepot/structures-carto.query'
import { activitesEnCoursDeLUtilisateur } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/activites-en-cours.query'
import { appliquerLesDestinations } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/ajouter-des-lieux-activite.mutation'
import {
  etatDuLieu,
  lieuPorteurDeLaCarto,
  nouvelIdentifiantDeLieu,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/situation-du-lieu.query'
import { planifierLesRattachements } from '@/features/lieux-activite/domain/rattachement/planifier-les-rattachements'
import { lieuDisparu } from '@/features/lieux-activite/implementations/prisma/destination-du-lieu.mutation'
import { lieuxAuMemeEndroit } from '@/features/lieux-activite/implementations/prisma/lieux-au-meme-endroit.query'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'
import { type Result, success } from '@/libraries/result'

const planifier = planifierLesRattachements({
  etatDuLieu,
  lieuPorteurDeLaCarto,
  lieuxAuMemeEndroit,
  nouvelIdentifiantDeLieu,
})

export const renseignerLieuxActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(RenseignerLieuxActiviteValidation))
  .execute(
    fromResult(
      async ({
        user,
        input,
      }): Promise<Result<undefined, EchecDeRenseignerLieuxActivite>> => {
        const resultat = await renseignerLieuxActivite<
          AdresseValidee,
          ReadonlyMap<string, LieuCarto>,
          DestinationDuLieu<CreationDemandee>
        >({
          lireLEtat: getInscriptionEtat,
          lireLieuxActiviteExistants: activitesEnCoursDeLUtilisateur,
          trouverStructuresCarto: structuresCartoParIds,
          planifierLesRattachements: ({ lieux, ...reste }) =>
            planifier({ ...reste, lieux: lieux.map(lieuDemande) }),
          enregistrerReconciliation: enregistrerReconciliation({
            lieuDisparu,
            appliquerLesDestinations,
          }),
        })({
          command: {
            userId: UtilisateurId(user.id),
            lieuxActivite: lieuxSoumis(adresseValidee)(input.lieux),
          },
          maintenant: new Date(),
        })

        return resultat.success ? success(undefined) : resultat
      },
      { onError: RENSEIGNER_LIEUX_ACTIVITE_ERRORS },
    ),
  )
