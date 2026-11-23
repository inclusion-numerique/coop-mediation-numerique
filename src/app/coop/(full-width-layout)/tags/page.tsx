import { creerUnTagAction } from '@/app/_actions/tags/creer-un-tag.action'
import { fusionnerUnTagAction } from '@/app/_actions/tags/fusionner-un-tag.action'
import { modifierUnTagAction } from '@/app/_actions/tags/modifier-un-tag.action'
import { rechercherDesDestinationsAction } from '@/app/_actions/tags/rechercher-des-destinations.action'
import { supprimerUnTagAction } from '@/app/_actions/tags/supprimer-un-tag.action'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user'
import { CREER_UN_TAG_ACTION_KEY } from '@/features/tags/abilities/creer-un-tag/action/creer-un-tag.key'
import { BoutonCreerUnTag } from '@/features/tags/abilities/creer-un-tag/ui/BoutonCreerUnTag'
import { ModaleDeCreation } from '@/features/tags/abilities/creer-un-tag/ui/ModaleDeCreation'
import { visibilitesProposees } from '@/features/tags/abilities/creer-un-tag/ui/visibilites.presenter'
import { FUSIONNER_UN_TAG_ACTION_KEY } from '@/features/tags/abilities/fusionner-un-tag/action/fusionner-un-tag.key'
import { RECHERCHER_DES_DESTINATIONS_ACTION_KEY } from '@/features/tags/abilities/fusionner-un-tag/action/rechercher-des-destinations.key'
import { BoutonFusionner } from '@/features/tags/abilities/fusionner-un-tag/ui/BoutonFusionner'
import { ModaleDeFusion } from '@/features/tags/abilities/fusionner-un-tag/ui/ModaleDeFusion'
import { listerLesTags } from '@/features/tags/abilities/lister-les-tags/implementations/prisma/lister-les-tags.query'
import { lignesDeLaListe } from '@/features/tags/abilities/lister-les-tags/ui/liste-des-tags.presenter'
import {
  ListeDesTagsPage,
  type ParametresDeLaListe,
} from '@/features/tags/abilities/lister-les-tags/ui/pages/ListeDesTagsPage'
import { requeteDeLaListe } from '@/features/tags/abilities/lister-les-tags/ui/requete-de-la-liste'
import { MODIFIER_UN_TAG_ACTION_KEY } from '@/features/tags/abilities/modifier-un-tag/action/modifier-un-tag.key'
import { BoutonModifier } from '@/features/tags/abilities/modifier-un-tag/ui/BoutonModifier'
import { ModaleDeModification } from '@/features/tags/abilities/modifier-un-tag/ui/ModaleDeModification'
import { SUPPRIMER_UN_TAG_ACTION_KEY } from '@/features/tags/abilities/supprimer-un-tag/action/supprimer-un-tag.key'
import { BoutonSupprimer } from '@/features/tags/abilities/supprimer-un-tag/ui/BoutonSupprimer'
import { ModaleDeSuppression } from '@/features/tags/abilities/supprimer-un-tag/ui/ModaleDeSuppression'
import { acteurDe } from '@/features/tags/domain'
import { MenuDActionsDuTag } from '@/features/tags/ui/MenuDActionsDuTag'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

const Page = async (props: { searchParams: Promise<ParametresDeLaListe> }) => {
  const searchParams = await props.searchParams
  const user = await authenticateUser()
  const acteur = acteurDe(profilDeLaSession(user))
  const requete = requeteDeLaListe(searchParams)
  const liste = await listerLesTags({ acteur, ...requete })

  return (
    <ClientBinder bind={CREER_UN_TAG_ACTION_KEY} to={creerUnTagAction}>
      <ClientBinder bind={MODIFIER_UN_TAG_ACTION_KEY} to={modifierUnTagAction}>
        <ClientBinder
          bind={FUSIONNER_UN_TAG_ACTION_KEY}
          to={fusionnerUnTagAction}
        >
          <ClientBinder
            bind={RECHERCHER_DES_DESTINATIONS_ACTION_KEY}
            to={rechercherDesDestinationsAction}
          >
            <ClientBinder
              bind={SUPPRIMER_UN_TAG_ACTION_KEY}
              to={supprimerUnTagAction}
            >
              <ListeDesTagsPage
                lignes={lignesDeLaListe(acteur, liste)}
                total={liste.total}
                lignesParPage={requete.lignesParPage}
                estCoordinateur={user.coordinateur != null}
                baseHref="/coop/tags"
                searchParams={searchParams}
                creer={<BoutonCreerUnTag />}
                modales={
                  <>
                    <ModaleDeCreation
                      visibilites={visibilitesProposees(acteur)}
                    />
                    <ModaleDeModification />
                    <ModaleDeFusion />
                    <ModaleDeSuppression />
                  </>
                }
                actions={({ tag, accompagnements }) => (
                  <MenuDActionsDuTag tagId={tag.id}>
                    <BoutonFusionner
                      tag={tag}
                      accompagnements={accompagnements}
                    />
                    <BoutonModifier tag={tag} />
                    <BoutonSupprimer tag={tag} />
                  </MenuDActionsDuTag>
                )}
              />
            </ClientBinder>
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
