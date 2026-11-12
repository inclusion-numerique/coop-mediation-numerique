'use client'

import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { createToast } from '@app/ui/toast/createToast'
import Stars from '@app/web/components/Stars'
import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import { inject } from '@app/web/libs/injection/client'
import Accordion from '@codegouvfr/react-dsfr/Accordion'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Fragment, type ReactNode, useEffect, useState } from 'react'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY } from '../../abilities/supprimer-une-activite-de-mediation/action/supprimer-une-activite-de-mediation.key'
import type {
  DetailDActivite,
  Rubrique,
} from './detail-de-l-activite.presenter'

export const DetailDeLActiviteDynamicModal = createDynamicModal<
  DetailDActivite | undefined
>({
  id: 'activite-details',
  isOpenedByDefault: false,
  initialState: undefined,
})

const Element = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <li
    className={classNames(
      'fr-mb-0 fr-ml-1v fr-text--sm fr-text--medium',
      className,
    )}
  >
    <div className="fr-flex fr-flex-gap-1v">{children}</div>
  </li>
)

const Rubriques = ({ rubriques }: { rubriques: readonly Rubrique[] }) =>
  rubriques.map((rubrique) => (
    <Fragment key={rubrique.titre}>
      <p className="fr-text--sm fr-text-mention-grey fr-mb-1v fr-mt-4v">
        {rubrique.titre}
      </p>
      {rubrique._tag === 'Liste' && (
        <ul className="fr-my-0">
          {rubrique.elements.map((element) => (
            <Element key={element}>{element}</Element>
          ))}
        </ul>
      )}
      {rubrique._tag === 'Etoiles' && (
        <Stars count={rubrique.etoiles} max={3} />
      )}
      {rubrique._tag === 'Texte' && (
        <p className="fr-text--sm fr-mb-0 fr-text--medium">{rubrique.texte}</p>
      )}
    </Fragment>
  ))

const ConfirmationDeSuppression = () => (
  <>
    <hr className="fr-separator-6v" />
    <div className="fr-mb-8v">
      <p className="fr-text--bold fr-mb-4v">
        Êtes-vous sûr·e de vouloir supprimer cette activité&nbsp;?
      </p>
      <ul className="fr-text--sm">
        <li>Elle sera supprimée de votre historique.</li>
        <li>Elle ne sera plus comptabilisée dans vos statistiques.</li>
        <li>La suppression d’une activité est irréversible.</li>
      </ul>
    </div>
  </>
)

const Beneficiaire = ({
  detail,
  retour,
}: {
  detail: DetailDActivite
  retour: string
}) => {
  const { beneficiaire } = detail
  if (beneficiaire === null) return null
  if (beneficiaire._tag === 'Suivi')
    return (
      <>
        <hr className="fr-separator-6v" />
        <div className="fr-flex fr-align-items-center">
          <span className="fr-icon-user-heart-line fr-icon--sm fr-mr-3v fr-text-mention--grey" />
          <Link
            href={`/coop/mes-beneficiaires/${beneficiaire.id}?retour=${encodeURIComponent(retour)}`}
            className="fr-link fr-text--sm fr-mb-0 fr-text--medium fr-link--underline-on-hover"
          >
            {beneficiaire.nom}&nbsp;·&nbsp;{beneficiaire.activites}
          </Link>
        </div>
      </>
    )
  return (
    <>
      <hr className="fr-separator-6v" />
      <div className="fr-flex fr-justify-content-space-between fr-flex-gap-4v fr-text-mention--grey">
        <p className="fr-text-mention--grey fr-text--xs fr-mb-4v fr-text--bold fr-text--uppercase">
          <span className="fr-icon-user-heart-line fr-icon--sm fr-mr-1w" />
          Infos bénéficiaire anonyme
        </p>
      </div>
      <ul className="fr-my-0">
        {beneficiaire.infos.map((info) => (
          <Element key={info}>{info}</Element>
        ))}
      </ul>
    </>
  )
}

const Participants = ({
  detail,
  retour,
}: {
  detail: DetailDActivite
  retour: string
}) => {
  const { participants } = detail
  if (participants === null) return null
  return (
    <>
      <hr className="fr-separator-6v" />
      <Accordion
        className="accordeon-des-participants"
        label={
          <div className="fr-flex fr-direction-column">
            <p className="fr-text-mention--grey fr-text--xs fr-mb-2v fr-text--bold fr-text--uppercase">
              <span className="fr-icon-user-heart-line fr-icon--sm fr-mr-1w" />
              Infos participants
            </p>
            <p className="fr-text--sm fr-text--medium fr-mb-0 fr-text-default--grey">
              {participants.titre}
            </p>
          </div>
        }
      >
        {participants.suivis.length > 0 && (
          <>
            {participants.titreDesSuivis !== null && (
              <p className="fr-text--sm fr-text--bold fr-mb-1v">
                {participants.titreDesSuivis}
              </p>
            )}
            <ul className="fr-my-0">
              {participants.suivis.map((suivi) => (
                <Element key={suivi.id} className="fr-mb-0">
                  <Link
                    className="fr-link fr-link--underline-on-hover fr-text--sm fr-mb-0"
                    href={`/coop/mes-beneficiaires/${suivi.id}?retour=${encodeURIComponent(retour)}`}
                  >
                    {suivi.nom}
                  </Link>
                </Element>
              ))}
            </ul>
          </>
        )}
        {participants.anonymes.length > 0 && (
          <>
            {participants.titreDesAnonymes !== null && (
              <p className="fr-text--sm fr-mt-4v fr-text--bold fr-mb-1v">
                {participants.titreDesAnonymes}
              </p>
            )}
            <ul className="fr-my-0">
              {participants.anonymes.map((info) => (
                <Element className="fr-mb-0" key={info}>
                  {info}
                </Element>
              ))}
            </ul>
          </>
        )}
      </Accordion>
    </>
  )
}

const RendezVous = ({ detail }: { detail: DetailDActivite }) =>
  detail.rendezVous === null ? null : (
    <>
      <hr className="fr-separator-6v" />
      <div className="fr-flex fr-flex-gap-2v fr-align-items-center">
        <div
          className="fr-background-alt--blue-france fr-p-1-5v fr-border-radius--8 fr-flex"
          aria-hidden
        >
          <RDVServicePublicLogo
            className="fr-display-block"
            width={20}
            height={20}
          />
        </div>
        <p className="fr-text--sm fr-text--medium fr-mb-0 fr-flex-grow-1">
          RDV pris via RDV&nbsp;Service&nbsp;Public
        </p>
        <Badge small severity={detail.rendezVous.severite}>
          {detail.rendezVous.libelle}
        </Badge>
        <Button
          priority="tertiary no outline"
          size="small"
          title="Voir et modifier le RDV sur Rendez-vous Service Public"
          linkProps={{ href: detail.rendezVous.lien, target: '_blank' }}
        >
          Voir
        </Button>
      </div>
    </>
  )

export const DetailDeLActiviteModale = () => {
  const detail = DetailDeLActiviteDynamicModal.useState()
  const router = useRouter()
  const cheminCourant = usePathname()
  const recherche = useSearchParams().toString()
  const [confirmation, setConfirmation] = useState(false)
  const [enCours, setEnCours] = useState(false)

  const identifiant = detail?.id
  useEffect(() => {
    setConfirmation(identifiant === undefined)
  }, [identifiant])

  if (detail === undefined) return null

  const retour = `${cheminCourant}${recherche ? `?${recherche}` : ''}`
  const lienDuCra = `/coop/mes-activites/cra/${detail.segmentDeType}/${detail.id}`

  const supprimer = async () => {
    setEnCours(true)
    const resultat = await inject(
      SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY,
    )({ activiteId: detail.id })
    setEnCours(false)
    if (!resultat.success) {
      createToast({ priority: 'error', message: resultat.error })
      return
    }
    DetailDeLActiviteDynamicModal.close()
    router.refresh()
    createToast({
      priority: 'success',
      message: <>L’activité a bien été supprimée</>,
    })
  }

  return (
    <DetailDeLActiviteDynamicModal.Component
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
                  className: classNames(
                    'fr-btn--danger',
                    enCours && 'fr-btn--loading',
                  ),
                },
              },
            ]
          : undefined
      }
    >
      <hr className="fr-separator fr-separator-6v" />
      <p className="fr-width-full fr-text--lg fr-text--medium fr-mb-0">
        {detail.titre}
      </p>
      <p className="fr-mt-2v fr-text--sm fr-text--medium fr-mb-0 fr-text-mention--grey">
        <span className="fr-icon-calendar-event-line fr-icon--sm fr-mr-1-5v" />
        {detail.jour}
        &nbsp;·&nbsp;
        <span className="fr-icon-time-line fr-icon--sm fr-mr-1-5v" />
        Durée&nbsp;:&nbsp;{detail.duree}
      </p>
      <p className="fr-mt-2v fr-text--sm fr-text--medium fr-mb-0 fr-text-mention--grey">
        <span className="fr-icon-map-pin-2-line fr-icon--sm" /> {detail.lieu}
      </p>
      {confirmation ? (
        <ConfirmationDeSuppression />
      ) : (
        <>
          <hr className="fr-separator-6v" />
          <div className="fr-flex fr-flex-gap-2v">
            <Button
              iconId="fr-icon-edit-line"
              linkProps={{
                href: `${lienDuCra}?retour=${encodeURIComponent(retour)}`,
              }}
              size="small"
            >
              Modifier
            </Button>
            <Button
              iconId="ri-file-copy-line"
              className="fr-px-2v"
              priority="secondary"
              size="small"
              linkProps={{
                href: `${lienDuCra}/dupliquer?retour=${encodeURIComponent(retour)}`,
              }}
            >
              <span className="bouton-dupliquer__libelle">Dupliquer</span>
            </Button>
            <Button
              type="button"
              iconId="fr-icon-delete-bin-line"
              priority="secondary"
              title="Supprimer"
              size="small"
              onClick={() => setConfirmation(true)}
            >
              Supprimer
            </Button>
          </div>
          <Beneficiaire detail={detail} retour={retour} />
          <Participants detail={detail} retour={retour} />
          <RendezVous detail={detail} />
          <hr className="fr-separator-6v" />
          <Rubriques rubriques={detail.rubriques} />
          {detail.demarche !== null && detail.demarche.length > 0 && (
            <>
              <hr className="fr-separator-6v" />
              <p className="fr-text-mention--grey fr-text--xs fr-mb-4v fr-text--bold fr-text--uppercase">
                <span className="fr-icon-draft-line fr-icon--sm fr-mr-1w" />
                Informations sur la démarche administrative
              </p>
              <Rubriques rubriques={detail.demarche} />
            </>
          )}
          {detail.notes !== null && (
            <>
              <hr className="fr-separator-6v" />
              <p className="fr-text-mention--grey fr-text--xs fr-mb-4v fr-text--bold fr-text--uppercase">
                <span className="fr-icon-file-text-line fr-icon--sm fr-mr-1w" />
                {detail.notes.titre}
              </p>
              <div
                className="notes-de-l-activite"
                dangerouslySetInnerHTML={{ __html: detail.notes.html }}
              />
            </>
          )}
        </>
      )}
    </DetailDeLActiviteDynamicModal.Component>
  )
}
