import { redirect } from 'next/navigation'
import { ajouterDesLieuxActiviteAction } from '@/app/_actions/lieux-activite/ajouter-des-lieux-activite.action'
import { creerUnLieuActiviteAction } from '@/app/_actions/lieux-activite/creer-lieu-activite.action'
import { rechercherDesLieuxAAjouterAction } from '@/app/_actions/lieux-activite/rechercher-des-lieux-a-ajouter.action'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticateUser'
import { AJOUTER_DES_LIEUX_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/ajouter-des-lieux-activite.key'
import { CREER_UN_LIEU_KEY } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/creer-un-lieu.key'
import { AjouterDesLieuxPage } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/pages/AjouterDesLieuxPage'
import { RECHERCHER_DES_LIEUX_KEY } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/rechercher-des-lieux.key'
import { LIEN_DE_PRISE_DE_RENDEZ_VOUS_KEY } from '@/features/lieux-activite/ui'
import { rdvWebsiteLink } from '@/features/rdvsp/urls'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'
import BackButton from '@/libraries/ui/components/BackButton'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'

const AjouterLieuPage = async () => {
  const user = await authenticateUser()

  if (!user.mediateur) {
    return redirect('/')
  }

  return (
    <ClientBinder
      bind={AJOUTER_DES_LIEUX_ACTIVITE_ACTION_KEY}
      to={ajouterDesLieuxActiviteAction}
    >
      <ClientBinder bind={CREER_UN_LIEU_KEY} to={creerUnLieuActiviteAction}>
        <ClientBinder
          bind={RECHERCHER_DES_LIEUX_KEY}
          to={rechercherDesLieuxAAjouterAction}
        >
          <ClientBinder
            bind={LIEN_DE_PRISE_DE_RENDEZ_VOUS_KEY}
            to={rdvWebsiteLink}
          >
            <>
              <SkipLinksPortal />
              <div id={contentId}>
                <AjouterDesLieuxPage
                  retourHref="/coop/lieux-activite"
                  entete={
                    <>
                      <CoopBreadcrumbs
                        parents={[
                          {
                            label: `Mes lieux d'activités`,
                            linkProps: { href: '/coop/lieux-activite/' },
                          },
                        ]}
                        currentPage={"Ajouter un lieu d'activité"}
                      />
                      <BackButton />
                    </>
                  }
                />
              </div>
            </>
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default AjouterLieuPage
