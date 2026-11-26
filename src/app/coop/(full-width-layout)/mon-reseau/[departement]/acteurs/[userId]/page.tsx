import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { inviterDesMembresAction } from '@/app/_actions/equipe/inviter-des-membres.action'
import { retirerUnMembreAction } from '@/app/_actions/equipe/retirer-un-membre.action'
import { supprimerUnAncienMembreAction } from '@/app/_actions/equipe/supprimer-un-ancien-membre.action'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@/configuration/projet'
import { compterLesAccompagnements } from '@/features/activites/abilities/compter-les-accompagnements/implementations/prisma/totaux-des-accompagnements.query'
import {
  CoordinateurId as CoordinateurIdDesActivites,
  criteresSurLaPeriode,
  Jour,
  MediateurId as MediateurIdDesActivites,
} from '@/features/activites/domain'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/implementations/prisma/consulter-employeuse-a-une-date.query'
import { emploiEmployeuseAffichage } from '@/features/employeuse/ui/presenters/employeuse-emploi.presenter'
import ActeurStructureEmployeuse from '@/features/employeuse/ui/slots/ActeurStructureEmployeuse.slot'
import { SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY } from '@/features/equipe/abilities/supprimer-un-ancien-membre/action/supprimer-un-ancien-membre.key'
import { default as BoutonSupprimerUnAncienMembre } from '@/features/equipe/abilities/supprimer-un-ancien-membre/ui/slots/BoutonSupprimerUnAncienMembre.slot'
import { listerLesLieuxDuMediateur } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur/implementations/prisma/lister-les-lieux-du-mediateur.query'
import { triDesLieuxDuMediateur } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur/ui/filtres/lieux-du-mediateur.filtre'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { MediateurId as MediateurIdDesLieux } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { LieuxRepliables } from '@/features/lieux-activite/ui/slots/LieuxRepliables.slot'
import { consulterLeContrat } from '@/features/mediateurs/abilities/consulter-le-contrat/domain/consulter-le-contrat'
import { lireLesContrats } from '@/features/mediateurs/abilities/consulter-le-contrat/implementations/prisma/contrat.query'
import { CarteContrat } from '@/features/mediateurs/abilities/consulter-le-contrat/ui/slots/CarteContrat.slot'
import { UtilisateurId } from '@/features/mediateurs/domain'
import {
  INVITER_L_ACTEUR_DANS_L_EQUIPE_KEY,
  RETIRER_L_ACTEUR_DE_L_EQUIPE_KEY,
} from '@/features/mon-reseau/abilities/consulter-un-acteur/action/actions-sur-l-acteur.key'
import { consulterUnActeur } from '@/features/mon-reseau/abilities/consulter-un-acteur/domain'
import {
  lireLActeur,
  lireLesLiensDEquipe,
} from '@/features/mon-reseau/abilities/consulter-un-acteur/implementations/prisma'
import { nomDeLActeur } from '@/features/mon-reseau/abilities/consulter-un-acteur/implementations/prisma/nom-de-l-acteur.query'
import { FicheActeurPage } from '@/features/mon-reseau/abilities/consulter-un-acteur/ui/pages/FicheActeurPage'
import {
  ancienMembreDe,
  contratVisible,
  encartDeLEmployeuse,
} from '@/features/mon-reseau/abilities/consulter-un-acteur/ui/presenters/fiche-acteur.presenter'
import { TitreDeSection } from '@/features/mon-reseau/abilities/consulter-un-acteur/ui/slots/TitreDeSection.slot'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { derniereActiviteDeLUtilisateur } from '@/features/utilisateurs/implementations/prisma/derniere-activite.query'
import { departementDuCode } from '@/libraries/departement'
import { ClientBinder } from '@/libraries/nextjs/injection'

type Parametres = { params: Promise<{ userId: string; departement: string }> }

export const generateMetadata = async ({
  params,
}: Parametres): Promise<Metadata> => {
  await authenticateMediateurOrCoordinateur()
  const nom = await nomDeLActeur((await params).userId)

  return nom === null
    ? notFound()
    : { title: metadataTitle(`${nom} | Mon réseau`) }
}

const lireLesStatistiquesSur30Jours = async (
  coordinateurId: string,
  mediateurId: string,
  periode: { readonly du: string; readonly au: string },
) => {
  const { accompagnements, personnes } = await compterLesAccompagnements({
    perimetre: {
      type: 'Equipe',
      coordinateur: CoordinateurIdDesActivites(coordinateurId),
      membres: [MediateurIdDesActivites(mediateurId)],
    },
    criteres: criteresSurLaPeriode({
      du: Jour.safe(periode.du),
      au: Jour.safe(periode.au),
    }),
    rendezVousAuxStatuts: rendezVousAuxStatutsSql,
  })
  return {
    beneficiairesAccompagnes: personnes.total,
    accompagnements: accompagnements.total,
  }
}

const Page = async ({ params }: Parametres) => {
  const quiConsulte = await authenticateMediateurOrCoordinateur()
  const { userId, departement: code } = await params
  const departement = departementDuCode(code)
  const maintenant = new Date()
  const consultation = await consulterUnActeur({
    lireLActeur,
    lireLesLiensDEquipe,
    lireLaDerniereActivite: derniereActiviteDeLUtilisateur,
    lireLesStatistiquesSur30Jours,
  })({ quiConsulte, acteurId: userId, maintenant })

  if (!departement.success || !consultation.success) return notFound()

  const fiche = consultation.data
  const { acteur, regard } = fiche
  const mediation = acteur.profil.mediation
  const [employeuse, lieux, consultationDuContrat] = await Promise.all([
    consulterEmployeuseAUneDate({ userId: acteur.acteurId, date: maintenant }),
    mediation === null
      ? null
      : listerLesLieuxDuMediateur({
          mediateurId: MediateurIdDesLieux(mediation.mediateurId),
          tri: triDesLieuxDuMediateur,
        }),
    contratVisible(acteur, regard)
      ? consulterLeContrat({ lireLesContrats })({
          utilisateurId: UtilisateurId(acteur.acteurId),
          maintenant,
        })
      : null,
  ])
  const contrat = consultationDuContrat?.success
    ? consultationDuContrat.data
    : null
  const ancienMembre = ancienMembreDe(regard)
  const encart = encartDeLEmployeuse(acteur, regard)

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <ClientBinder
        bind={RETIRER_L_ACTEUR_DE_L_EQUIPE_KEY}
        to={retirerUnMembreAction}
      >
        <ClientBinder
          bind={INVITER_L_ACTEUR_DANS_L_EQUIPE_KEY}
          to={inviterDesMembresAction}
        >
          <ClientBinder
            bind={SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY}
            to={supprimerUnAncienMembreAction}
          >
            <FicheActeurPage
              fiche={fiche}
              departement={departement.data}
              contrat={
                contrat === null ? undefined : (
                  <CarteContrat contrat={contrat} coordinateur={false} />
                )
              }
              employeuse={
                employeuse === null ? undefined : (
                  <ActeurStructureEmployeuse
                    emploi={{
                      structure: emploiEmployeuseAffichage(employeuse),
                    }}
                    showIsLieuActiviteNotice={false}
                    showReferentStructure={encart.referentVisible}
                    showReferentStructureConseillerNumeriqueSupportNotice={
                      encart.avisAuxConseillersNumeriques
                    }
                    title={
                      <TitreDeSection icone="ri-home-smile-2-line">
                        Structure employeuse
                      </TitreDeSection>
                    }
                  />
                )
              }
              lieux={
                lieux === null ? undefined : (
                  <LieuxRepliables
                    lieux={lieux.map(({ lieuInclusion }) => lieuInclusion)}
                  />
                )
              }
              suppressionDesArchives={
                ancienMembre === null || mediation === null ? undefined : (
                  <BoutonSupprimerUnAncienMembre
                    mediateurId={mediation.mediateurId}
                    coordinateurId={ancienMembre.coordinateurId}
                    nomAffiche={acteur.nomAffiche}
                    depuis={ancienMembre.depuis}
                    jusquA={ancienMembre.fin}
                  />
                )
              }
            />
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
