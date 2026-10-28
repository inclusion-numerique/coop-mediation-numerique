import { creerUnTagAction } from '@app/web/app/_actions/tags/creer-un-tag.action'
import { fusionnerUnTagAction } from '@app/web/app/_actions/tags/fusionner-un-tag.action'
import { modifierUnTagAction } from '@app/web/app/_actions/tags/modifier-un-tag.action'
import { rechercherDesDestinationsAction } from '@app/web/app/_actions/tags/rechercher-des-destinations.action'
import { supprimerUnTagAction } from '@app/web/app/_actions/tags/supprimer-un-tag.action'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { CREER_UN_TAG_ACTION_KEY } from '@app/web/features/tags/abilities/creer-un-tag/action/creer-un-tag.key'
import {
  BoutonCreerUnTag,
  ModaleDeCreation,
  visibilitesProposees,
} from '@app/web/features/tags/abilities/creer-un-tag/ui'
import { FUSIONNER_UN_TAG_ACTION_KEY } from '@app/web/features/tags/abilities/fusionner-un-tag/action/fusionner-un-tag.key'
import { RECHERCHER_DES_DESTINATIONS_ACTION_KEY } from '@app/web/features/tags/abilities/fusionner-un-tag/action/rechercher-des-destinations.key'
import {
  BoutonFusionner,
  ModaleDeFusion,
} from '@app/web/features/tags/abilities/fusionner-un-tag/ui'
import {
  listerLesTags,
  triDemande,
} from '@app/web/features/tags/abilities/lister-les-tags'
import {
  ListeDesTagsPage,
  lignesDeLaListe,
  nombreDePages,
  type ParametresDeLaListe,
} from '@app/web/features/tags/abilities/lister-les-tags/ui'
import { MODIFIER_UN_TAG_ACTION_KEY } from '@app/web/features/tags/abilities/modifier-un-tag/action/modifier-un-tag.key'
import {
  BoutonModifier,
  ModaleDeModification,
} from '@app/web/features/tags/abilities/modifier-un-tag/ui'
import { SUPPRIMER_UN_TAG_ACTION_KEY } from '@app/web/features/tags/abilities/supprimer-un-tag/action/supprimer-un-tag.key'
import {
  BoutonSupprimer,
  ModaleDeSuppression,
} from '@app/web/features/tags/abilities/supprimer-un-tag/ui'
import { acteurDe } from '@app/web/features/tags/implementation/session'
import { MenuDActionsDuTag } from '@app/web/features/tags/ui'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { ClientBinder } from '@app/web/libs/injection/client-binder'

const Page = async (props: { searchParams: Promise<ParametresDeLaListe> }) => {
  const searchParams = await props.searchParams
  const user = await authenticateUser()
  const acteur = acteurDe(user)
  const lignesParPage = toNumberOr(searchParams.lignes)(DEFAULT_PAGE_SIZE)

  const liste = await listerLesTags({
    acteur,
    tri: triDemande(searchParams.tri),
    page: toNumberOr(searchParams.page)(DEFAULT_PAGE),
    lignesParPage,
  })

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
                totalPages={nombreDePages(liste.total, lignesParPage)}
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
