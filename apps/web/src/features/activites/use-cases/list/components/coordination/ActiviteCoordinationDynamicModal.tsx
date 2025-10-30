'use client'

import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { createToast } from '@app/ui/toast/createToast'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import { formatActiviteDayDate } from '@app/web/utils/activiteDayDateFormat'
import {
  dateAsDayInTimeZone,
  dateAsTimeInTimeZone,
} from '@app/web/utils/dateAsDayAndTime'
import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { INITIATIVE_OPTIONS } from '../../../cra/animation/labels'
import { ECHELON_TERRITORIAL_OPTIONS } from '../../../cra/evenement/labels'
import { TYPE_DE_STRUCTURE_PARTENAIRE_OPTIONS } from '../../../cra/partenariat/labels'
import { ActivitesByDate } from '../../db/getCoordinationsListPageData'
import styles from './ActiviteCoordinationDynamicModal.module.css'
import { ActiviteInfo } from './ActiviteInfo'
import { ActivitePurpose } from './ActivitePurpose'
import { ActiviteTitle } from './ActiviteTitle'
import { Duration } from './Duration'
import { displayTypeActivite } from './displayTypeActivite'
import { OrganisateursLabel } from './labels/OrganisateursLabel'
import { ThematiqueAnimationLabel } from './labels/ThematiqueAnimationLabel'

const DeleteConfirmation = () => (
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

type ActiviteCoordinationDynamicModalInitialState =
  | {
      activite: ActivitesByDate['activites'][number]
      date: string
    }
  | undefined

export const ActiviteCoordinationDynamicModal =
  createDynamicModal<ActiviteCoordinationDynamicModalInitialState>({
    id: 'activite-coordination-modal',
    isOpenedByDefault: false,
    initialState: undefined,
  })

const ActiviteCoordinationModal = ({ timezone }: { timezone: string }) => {
  const modalState = ActiviteCoordinationDynamicModal.useState()

  const router = useRouter()
  const mutation = trpc.cra.deleteActiviteCoordination.useMutation()

  const currentPath = usePathname()
  const searchParamsString = useSearchParams().toString()
  const actionsRetourPath = `${currentPath}${searchParamsString ? `?${searchParamsString}` : ''}`

  const [deletionConfirmation, setDeletionConfirmation] = useState(false)

  if (modalState == null) return null

  const { activite, date } = modalState
  const { id, type, creation, modification, notes } = activite

  const onDelete = async () => {
    try {
      await mutation.mutateAsync({
        activiteId: id,
      })
      ActiviteCoordinationDynamicModal.close()
      router.refresh()
      createToast({
        priority: 'success',
        message: <>L’activité a bien été supprimée</>,
      })
    } catch {
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors de la suppression de l’activité',
      })
      mutation.reset()
    } finally {
      setDeletionConfirmation(false)
    }
  }

  const creationString = `${dateAsDayInTimeZone(new Date(creation), timezone)} à ${dateAsTimeInTimeZone(new Date(creation), timezone)}`
  const updatedAtString = `${dateAsDayInTimeZone(new Date(modification), timezone)} à ${dateAsTimeInTimeZone(new Date(modification), timezone)}`
  const showUpdatedAt = creationString !== updatedAtString

  return (
    <ActiviteCoordinationDynamicModal.Component
      title={
        <div className="fr-flex fr-align-items-center">
          <p className="fr-text--xs fr-text-default--grey fr-text--regular fr-mb-0 fr-py-2v">
            Enregistrée le {creationString}
            {showUpdatedAt && (
              <>&nbsp;&nbsp;|&nbsp; Modifiée le {updatedAtString}</>
            )}
          </p>
        </div>
      }
      className={styles.modal}
      buttons={
        deletionConfirmation
          ? [
              {
                title: 'Annuler',
                priority: 'secondary',
                doClosesModal: false,
                children: 'Annuler',
                type: 'button',
                disabled: mutation.isPending,
                onClick: () => setDeletionConfirmation(false),
              },
              {
                title: 'Supprimer',
                doClosesModal: false,
                children: 'Supprimer',
                type: 'button',
                onClick: onDelete,
                nativeButtonProps: {
                  className: classNames(
                    'fr-btn--danger',
                    mutation.isPending && 'fr-btn--loading',
                  ),
                },
              },
            ]
          : undefined
      }
    >
      <hr />
      {deletionConfirmation ? (
        <DeleteConfirmation />
      ) : (
        <>
          <div className="fr-flex fr-direction-column fr-flex-gap-1v">
            <p className="fr-width-full fr-text--lg fr-text--bold fr-mb-0">
              <ActiviteTitle activite={activite} />
            </p>
            <p className="fr-text--sm fr-m-0 fr-text-mention--grey fr-text--sm">
              <span className="fr-text--capitalize">
                <span className="ri-calendar-event-line" aria-hidden />
                &ensp;
                {formatActiviteDayDate(date)}
              </span>
              {activite.duree ? (
                <>
                  &ensp;·&ensp;
                  <span className="ri-time-line" aria-hidden />
                  &ensp;Durée&nbsp;:&nbsp;
                  <Duration duration={activite.duree} />
                </>
              ) : null}
              <ActiviteInfo
                prefix={
                  <>
                    &ensp;·&ensp;
                    <span className="ri-team-line" aria-hidden />
                    &ensp;
                  </>
                }
                activite={activite}
              />
            </p>
            <p className="fr-m-0 fr-text-mention--grey fr-text--sm">
              <ActivitePurpose activite={activite} />
            </p>
          </div>
          <hr className="fr-separator-6v" />
          <div className="fr-flex fr-flex-gap-2v">
            <Button
              iconId="fr-icon-edit-line"
              linkProps={{
                href: `/coop/mes-activites/cra/${activite.type.toLowerCase()}/${id}${actionsRetourPath ? `?retour=${actionsRetourPath}` : ''}`,
              }}
              size="small"
            >
              Modifier
            </Button>
            <Button
              type="button"
              iconId="fr-icon-delete-bin-line"
              priority="secondary"
              size="small"
              onClick={() => {
                setDeletionConfirmation(true)
              }}
            >
              Supprimer
            </Button>
          </div>
          <hr className="fr-separator-6v" />
          <div className="fr-flex fr-direction-column fr-flex-gap-3v">
            {((activite?.mediateurs ?? 0) > 0 ||
              (activite?.structures ?? 0) > 0 ||
              (activite?.autresActeurs ?? 0) > 0) && (
              <div>
                <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
                  Participants à l’intervention
                </p>
                <ul className="fr-text--sm fr-mb-0">
                  {(activite?.mediateurs ?? 0) > 0 && (
                    <li>
                      Médiateur·ice·s numérique·s&nbsp;·&nbsp;
                      {activite.mediateurs}
                    </li>
                  )}
                  {(activite?.structures ?? 0) > 0 && (
                    <li>Structure·s&nbsp;·&nbsp;{activite.structures}</li>
                  )}
                  {(activite?.autresActeurs ?? 0) > 0 && (
                    <li>
                      Autres acteurs (Réseau d’inclusion numérique)&nbsp;·&nbsp;
                      {activite.autresActeurs}
                    </li>
                  )}
                </ul>
              </div>
            )}
            {activite.initiative != null && (
              <div>
                <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
                  Qui est à l’initiative de cette intervention ?
                </p>
                <ul className="fr-text--sm fr-mb-0">
                  <li>
                    {
                      INITIATIVE_OPTIONS.find(
                        ({ value }: { value: string }) =>
                          activite.initiative === value,
                      )?.label
                    }
                  </li>
                </ul>
              </div>
            )}
            {(activite.thematiquesAnimation?.length ?? 0) > 0 && (
              <div>
                <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
                  Thématiques d’animation
                </p>
                <ul className="fr-text--sm fr-mb-0">
                  {activite.thematiquesAnimation?.map((thematique) => (
                    <li key={thematique}>
                      <ThematiqueAnimationLabel
                        thematiqueAnimation={thematique}
                        thematiqueAnimationAutre={
                          activite.thematiqueAnimationAutre
                        }
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(activite.organisateurs?.length ?? 0) > 0 && (
              <div>
                <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
                  Organisé par
                </p>
                <ul className="fr-text--sm fr-mb-0">
                  {activite.organisateurs?.map((organisateur) => (
                    <li key={organisateur}>
                      <OrganisateursLabel
                        organisateur={organisateur}
                        organisateurAutre={activite.organisateurAutre}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activite.echelonTerritorial != null && (
              <div>
                <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
                  Échelon territorial de l’évènement
                </p>
                <ul className="fr-text--sm fr-mb-0">
                  <li>
                    {
                      ECHELON_TERRITORIAL_OPTIONS.find(
                        ({ value }: { value: string }) =>
                          activite.echelonTerritorial === value,
                      )?.label
                    }
                  </li>
                </ul>
              </div>
            )}
            {activite.structuresPartenaires != null && (
              <div>
                <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
                  Partenaires
                </p>
                <ul className="fr-text--sm fr-mb-0">
                  {activite.structuresPartenaires.map(({ nom, type }) => (
                    <li key={`${nom}-${type}`}>
                      {nom}&nbsp;·&nbsp;
                      {
                        TYPE_DE_STRUCTURE_PARTENAIRE_OPTIONS.find(
                          ({ value }) => type === value,
                        )?.extra?.short
                      }
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activite.tags?.length > 0 && (
              <div>
                <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
                  Tags spécifiques
                </p>
                <ul className="fr-text--sm fr-mb-0">
                  {activite.tags.map(({ id, nom }) => (
                    <li key={id}>{nom}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {notes && (
            <>
              <hr className="fr-separator-6v" />
              <p className="fr-text-mention--grey fr-text--xs fr-mb-4v fr-text--bold fr-text--uppercase">
                <span className="fr-icon-file-text-line fr-icon--sm fr-mr-1w" />
                Notes sur {displayTypeActivite[type].fullText}
              </p>
              <div
                className={styles.notes}
                dangerouslySetInnerHTML={{ __html: notes }}
              />
            </>
          )}
        </>
      )}
    </ActiviteCoordinationDynamicModal.Component>
  )
}

export default withTrpc(ActiviteCoordinationModal)
