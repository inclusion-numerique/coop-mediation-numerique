import { creerUnTagAction } from '@/app/_actions/tags/creer-un-tag.action'
import { fusionnerUnTagAction } from '@/app/_actions/tags/fusionner-un-tag.action'
import { modifierUnTagAction } from '@/app/_actions/tags/modifier-un-tag.action'
import { rechercherDesDestinationsAction } from '@/app/_actions/tags/rechercher-des-destinations.action'
import { supprimerUnTagAction } from '@/app/_actions/tags/supprimer-un-tag.action'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { CREER_UN_TAG_ACTION_KEY } from '@/features/tags/abilities/creer-un-tag/action/creer-un-tag.key'
import { visibilitesProposees } from '@/features/tags/abilities/creer-un-tag/ui/presenters/visibilites.presenter'
import { BoutonCreerUnTag } from '@/features/tags/abilities/creer-un-tag/ui/slots/BoutonCreerUnTag.slot'
import { ModaleDeCreation } from '@/features/tags/abilities/creer-un-tag/ui/slots/ModaleDeCreation.slot'
import { FUSIONNER_UN_TAG_ACTION_KEY } from '@/features/tags/abilities/fusionner-un-tag/action/fusionner-un-tag.key'
import { RECHERCHER_DES_DESTINATIONS_ACTION_KEY } from '@/features/tags/abilities/fusionner-un-tag/action/rechercher-des-destinations.key'
import { BoutonFusionner } from '@/features/tags/abilities/fusionner-un-tag/ui/slots/BoutonFusionner.slot'
import { ModaleDeFusion } from '@/features/tags/abilities/fusionner-un-tag/ui/slots/ModaleDeFusion.slot'
import { listerLesTags } from '@/features/tags/abilities/lister-les-tags/implementations/prisma/lister-les-tags.query'
import { listeDesTags } from '@/features/tags/abilities/lister-les-tags/ui/filtres/liste-des-tags.filtre'
import { ListeDesTagsPage } from '@/features/tags/abilities/lister-les-tags/ui/pages/ListeDesTagsPage'
import { lignesDeLaListe } from '@/features/tags/abilities/lister-les-tags/ui/presenters/liste-des-tags.presenter'
import { MODIFIER_UN_TAG_ACTION_KEY } from '@/features/tags/abilities/modifier-un-tag/action/modifier-un-tag.key'
import { BoutonModifier } from '@/features/tags/abilities/modifier-un-tag/ui/slots/BoutonModifier.slot'
import { ModaleDeModification } from '@/features/tags/abilities/modifier-un-tag/ui/slots/ModaleDeModification.slot'
import { SUPPRIMER_UN_TAG_ACTION_KEY } from '@/features/tags/abilities/supprimer-un-tag/action/supprimer-un-tag.key'
import { BoutonSupprimer } from '@/features/tags/abilities/supprimer-un-tag/ui/slots/BoutonSupprimer.slot'
import { ModaleDeSuppression } from '@/features/tags/abilities/supprimer-un-tag/ui/slots/ModaleDeSuppression.slot'
import { acteurDe } from '@/features/tags/domain'
import { MenuDActionsDuTag } from '@/features/tags/ui/slots/MenuDActionsDuTag.slot'
import { ClientBinder } from '@/libraries/nextjs/injection'

const CHEMIN_DES_TAGS = '/coop/tags'

const Page = async (props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  const parametres = await props.searchParams
  const user = await authenticateUser()
  const acteur = acteurDe(profilDeLaSession(user))
  const { tri, pagination } = listeDesTags.charger(parametres)
  const liste = await listerLesTags({ acteur, tri, ...pagination })

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
                total={liste.totalItems}
                pages={listeDesTags.pagination.liens(
                  { chemin: CHEMIN_DES_TAGS, parametres },
                  liste,
                )}
                estCoordinateur={user.coordinateur != null}
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
