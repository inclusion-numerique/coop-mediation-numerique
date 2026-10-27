'use client'

import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { SUPPRIMER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY } from '@app/web/features/activites/abilities/supprimer-une-activite-de-coordination/action/supprimer-une-activite-de-coordination.key'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type ReactNode, useState } from 'react'
import type { DetailDeCoordination } from '../liste-des-coordinations.presenter'

export const DetailDeCoordinationDynamicModal = createDynamicModal<
  DetailDeCoordination | undefined
>({
  id: 'activite-coordination-modal',
  isOpenedByDefault: false,
  initialState: undefined,
})

const ConfirmationDeSuppression = () => (
  <div className="fr-mb-8v">
    <p className="fr-text--bold fr-mb-4v">
      Êtes-vous sûr·e de vouloir supprimer cette activité&nbsp;?
    </p>
    <ul className="fr-text--sm">
      <li>Elle sera supprimée de votre historique.</li>
      <li>La suppression d’une activité est irréversible.</li>
    </ul>
  </div>
)

const Separees = ({
  elements,
  prefixe,
}: {
  elements: readonly string[]
  prefixe: ReactNode
}) =>
  elements.map((element) => (
    <span key={element}>
      {prefixe}
      {element}
    </span>
  ))

export const DetailDeCoordinationModale = () => {
  const detail = DetailDeCoordinationDynamicModal.useState()
  const router = useRouter()
  const cheminCourant = usePathname()
  const recherche = useSearchParams().toString()
  const [confirmation, setConfirmation] = useState(false)
  const [enCours, setEnCours] = useState(false)

  if (detail == null) return null

  const retour = `?retour=${cheminCourant}${recherche ? `?${recherche}` : ''}`
  const lienDuCra = `/coop/mes-activites/cra/${detail.segmentDeType}/${detail.id}`

  const supprimer = async () => {
    setEnCours(true)
    const resultat = await inject(
      SUPPRIMER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY,
    )({ activiteId: detail.id })
    setEnCours(false)
    setConfirmation(false)

    if (!resultat.success) {
      createToast({ priority: 'error', message: resultat.error })
      return
    }

    DetailDeCoordinationDynamicModal.close()
    router.refresh()
    createToast({
      priority: 'success',
      message: 'L’activité a bien été supprimée',
    })
  }

  return (
    <DetailDeCoordinationDynamicModal.Component
      title={
        <div className="fr-flex fr-align-items-center">
          <p className="fr-text--xs fr-text-default--grey fr-text--regular fr-mb-0 fr-py-2v">
            Enregistrée le {detail.enregistreeLe}
            {detail.modifieeLe !== null && (
              <>&nbsp;&nbsp;|&nbsp; Modifiée le {detail.modifieeLe}</>
            )}
          </p>
        </div>
      }
      className="modale-de-detail"
      buttons={
        confirmation
          ? [
              {
                title: 'Annuler',
                priority: 'secondary',
                doClosesModal: false,
                children: 'Annuler',
                type: 'button',
                disabled: enCours,
                onClick: () => setConfirmation(false),
              },
              {
                title: 'Supprimer',
                doClosesModal: false,
                children: 'Supprimer',
                type: 'button',
                onClick: supprimer,
                nativeButtonProps: {
                  className: buttonLoadingClassname(enCours, 'fr-btn--danger')
                    .className,
                },
              },
            ]
          : undefined
      }
    >
      <hr />
      {confirmation ? (
        <ConfirmationDeSuppression />
      ) : (
        <>
          <div className="fr-flex fr-direction-column fr-flex-gap-1v">
            <p className="fr-width-full fr-text--lg fr-text--bold fr-mb-0">
              {detail.titre}
            </p>
            <p className="fr-text--sm fr-m-0 fr-text-mention--grey">
              <span className="fr-text--capitalize">
                <span className="ri-calendar-event-line" aria-hidden />
                &ensp;{detail.jour}
              </span>
              {detail.duree !== null && (
                <>
                  &ensp;·&ensp;
                  <span className="ri-time-line" aria-hidden />
                  &ensp;Durée&nbsp;:&nbsp;{detail.duree}
                </>
              )}
              <Separees
                elements={detail.infos}
                prefixe={
                  <>
                    &ensp;·&ensp;
                    <span className="ri-team-line" aria-hidden />
                    &ensp;
                  </>
                }
              />
            </p>
            <p className="fr-m-0 fr-text-mention--grey fr-text--sm">
              {detail.objets.join(' · ')}
            </p>
          </div>
          <hr className="fr-separator-6v" />
          <div className="fr-flex fr-flex-gap-2v">
            <Button
              iconId="fr-icon-edit-line"
              linkProps={{ href: `${lienDuCra}${retour}` }}
              size="small"
            >
              Modifier
            </Button>
            <Button
              linkProps={{ href: `${lienDuCra}/dupliquer${retour}` }}
              priority="secondary"
              size="small"
            >
              <span className="ri-file-copy-line fr-mr-2v" aria-hidden />
              Dupliquer
            </Button>
            <Button
              type="button"
              iconId="fr-icon-delete-bin-line"
              priority="secondary"
              size="small"
              onClick={() => setConfirmation(true)}
            >
              Supprimer
            </Button>
          </div>
          <hr className="fr-separator-6v" />
          <div className="fr-flex fr-direction-column fr-flex-gap-3v">
            {detail.rubriques.map(({ titre, elements }) => (
              <div key={titre}>
                <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
                  {titre}
                </p>
                <ul className="fr-text--sm fr-mb-0">
                  {elements.map((element) => (
                    <li key={element}>{element}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {detail.notes !== null && (
            <>
              <hr className="fr-separator-6v" />
              <p className="fr-text-mention--grey fr-text--xs fr-mb-4v fr-text--bold fr-text--uppercase">
                <span className="fr-icon-file-text-line fr-icon--sm fr-mr-1w" />
                {detail.notes.titre}
              </p>
              <div
                className="fr-text--sm"
                dangerouslySetInnerHTML={{ __html: detail.notes.html }}
              />
            </>
          )}
        </>
      )}
    </DetailDeCoordinationDynamicModal.Component>
  )
}
