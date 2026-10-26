import { inviterDesMembresAction } from '@app/web/app/_actions/equipe/inviter-des-membres.action'
import { retirerUnMembreAction } from '@app/web/app/_actions/equipe/retirer-un-membre.action'
import { supprimerUnAncienMembreAction } from '@app/web/app/_actions/equipe/supprimer-un-ancien-membre.action'
import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import {
  consulterEmployeuseAUneDate,
  emploiEmployeuseAffichage,
} from '@app/web/features/employeuse/server'
import ActeurStructureEmployeuse from '@app/web/features/employeuse/ui/ActeurStructureEmployeuse'
import { INVITER_DES_MEMBRES_ACTION_KEY } from '@app/web/features/equipe/abilities/inviter-des-membres/action/inviter-des-membres.key'
import { RETIRER_UN_MEMBRE_ACTION_KEY } from '@app/web/features/equipe/abilities/retirer-un-membre/action/retirer-un-membre.key'
import { SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY } from '@app/web/features/equipe/abilities/supprimer-un-ancien-membre/action/supprimer-un-ancien-membre.key'
import { BoutonSupprimerUnAncienMembre } from '@app/web/features/equipe/abilities/supprimer-un-ancien-membre/ui'
import { lieuxEnListeDuMediateur } from '@app/web/features/lieux-activite'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { consulterLeContrat } from '@app/web/features/mediateurs/abilities/consulter-le-contrat'
import { CarteContrat } from '@app/web/features/mediateurs/abilities/consulter-le-contrat/ui'
import { UtilisateurId } from '@app/web/features/mediateurs/domain'
import {
  consulterUnActeur,
  nomDeLActeur,
} from '@app/web/features/mon-reseau/abilities/consulter-un-acteur'
import {
  ancienMembreDe,
  contratVisible,
  encartDeLEmployeuse,
  FicheActeurPage,
  LieuxDeLActeur,
  TitreDeSection,
} from '@app/web/features/mon-reseau/abilities/consulter-un-acteur/ui'
import { derniereActiviteDeLUtilisateur } from '@app/web/features/utilisateurs'
import { departementDuCode } from '@app/web/libraries/departement'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Parametres = { params: Promise<{ userId: string; departement: string }> }

export const generateMetadata = async ({
  params,
}: Parametres): Promise<Metadata> => {
  const nom = await nomDeLActeur((await params).userId)

  return nom === null
    ? notFound()
    : { title: metadataTitle(`${nom} | Mon réseau`) }
}

const Page = async ({ params }: Parametres) => {
  const quiConsulte = await authenticateMediateurOrCoordinateur()
  const { userId, departement: code } = await params
  const departement = departementDuCode(code)
  const maintenant = new Date()
  const consultation = await consulterUnActeur({
    quiConsulte,
    acteurId: userId,
    lireLaDerniereActivite: derniereActiviteDeLUtilisateur,
    maintenant,
  })

  if (!departement.success || !consultation.success) return notFound()

  const fiche = consultation.data
  const { acteur, regard } = fiche
  const mediation = acteur.profil.mediation
  const [employeuse, lieux, contrat] = await Promise.all([
    consulterEmployeuseAUneDate({ userId: acteur.acteurId, date: maintenant }),
    mediation === null
      ? null
      : lieuxEnListeDuMediateur({ mediateurId: mediation.mediateurId }),
    contratVisible(acteur, regard)
      ? consulterLeContrat({
          utilisateurId: UtilisateurId(acteur.acteurId),
          maintenant,
        })
      : null,
  ])
  const ancienMembre = ancienMembreDe(regard)
  const encart = encartDeLEmployeuse(acteur, regard)

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <ClientBinder
        bind={RETIRER_UN_MEMBRE_ACTION_KEY}
        to={retirerUnMembreAction}
      >
        <ClientBinder
          bind={INVITER_DES_MEMBRES_ACTION_KEY}
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
                lieux === null ? undefined : <LieuxDeLActeur lieux={lieux} />
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
