'use client'

import { createToast } from '@app/ui/toast/createToast'
import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import {
  genreValues,
  sexLabels,
  statutSocialLabels,
  statutSocialValues,
  trancheAgeLabels,
  trancheAgeValues,
} from '@app/web/beneficiaire/beneficiaire'
import { createParticipantsAnonymesForBeneficiaires } from '@app/web/beneficiaire/createParticipantsAnonymesForBeneficiaires'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { isBeneficiaireAnonymous } from '@app/web/beneficiaire/isBeneficiaireAnonymous'
import Stars from '@app/web/components/Stars'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import { formatActiviteDayDate } from '@app/web/utils/activiteDayDateFormat'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import {
  dateAsDayInTimeZone,
  dateAsTimeInTimeZone,
} from '@app/web/utils/dateAsDayAndTime'
import { dureeAsString } from '@app/web/utils/dureeAsString'
import { isDefinedAndNotNull } from '@app/web/utils/isDefinedAndNotNull'
import Accordion from '@codegouvfr/react-dsfr/Accordion'
import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import classNames from 'classnames'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { ReactNode, useEffect, useState } from 'react'
import { niveauAtelierStars } from '../../../cra/collectif/fields/niveau-atelier'
import { materielLabels } from '../../../cra/fields/materiel'
import {
  thematiqueLabels,
  thematiquesAdministrativesLabels,
  thematiquesNonAdministrativesLabels,
} from '../../../cra/fields/thematique'
import {
  typeActiviteIllustrations,
  typeActiviteLabels,
} from '../../../cra/fields/type-activite'
import { autonomieStars } from '../../../cra/individuel/fields/autonomie'
import { structuresRedirectionLabels } from '../../../cra/individuel/fields/structures-redirection'
import { ActiviteListItem } from '../../db/activitesQueries'
import RdvStatusBadge from '../RdvStatusBadge'
import {
  ActiviteDetailsDynamicModal,
  ActiviteDetailsDynamicModalState,
} from './ActiviteDetailsDynamicModal'
import styles from './ActiviteDetailsModal.module.css'
import { createDupliquerActiviteLink } from './createDupliquerActiviteLink'
import { createModifierActiviteLink } from './createModifierActiviteLink'

const ListItem = ({
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

const filterItemsNodes = <T extends { items: ReactNode[] | ReactNode }>({
  items,
}: T) => (Array.isArray(items) ? items.length > 0 : !!items)

const getActiviteLocationString = (activite: ActiviteListItem) => {
  const { structure, lieuCodePostal, lieuCommune, typeLieu } = activite

  if (structure) {
    return `${structure.nom} · ${structure.codePostal} ${structure.commune}`
  }

  return lieuCommune
    ? `${lieuCodePostal} ${lieuCommune}`
    : typeLieu === 'ADistance'
      ? 'À distance'
      : 'Non renseigné'
}

const premierAccompagnement = (
  nouveauxParticipants: number,
  participantsDejaAccompagnes: number,
) => [
  `${nouveauxParticipants} ${
    nouveauxParticipants > 1 ? 'nouveaux bénéficiaires' : 'nouveau bénéficiaire'
  }`,
  `${participantsDejaAccompagnes} ${
    participantsDejaAccompagnes > 1
      ? 'bénéficiaires déjà accompagnés'
      : 'bénéficiaire déjà accompagné'
  }`,
]

const ActiviteDetailsModal = ({
  initialState,
}: {
  initialState?: ActiviteDetailsDynamicModalState
}) => {
  const state = ActiviteDetailsDynamicModal.useState() ?? initialState

  const router = useRouter()
  const mutation = trpc.cra.deleteActivite.useMutation()

  // Get full path with query params for actionsRetourPath
  const currentPath = usePathname()
  const searchParamsString = useSearchParams().toString()
  const actionsRetourPath = `${currentPath}${
    searchParamsString ? `?${searchParamsString}` : ''
  }`

  const [deletionConfirmation, setDeletionConfirmation] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to close the modal when activity changes
  useEffect(() => {
    // Cancel deletion state on state change
    setDeletionConfirmation(false)
  }, [state?.activite.id])

  const onDeleteButtonClick = () => {
    setDeletionConfirmation(true)
  }
  if (!state) {
    return null
  }

  const { activite } = state

  const {
    type,
    id,
    timezone,
    duree,
    autonomie,
    date,
    structureDeRedirection,
    orienteVersStructure,
    niveau,
    notes,
    titreAtelier,
    materiel,
    precisionsDemarche,
    accompagnements,
    thematiques,
    creation,
    modification,
    rdv,
  } = activite

  const onDelete = async () => {
    try {
      await mutation.mutateAsync({
        activiteId: id,
      })
      ActiviteDetailsDynamicModal.close()
      router.refresh()
      createToast({
        priority: 'success',
        message: <>L’activité a bien été supprimée</>,
      })

      // Reset mutation after modal close so loading states are reset
      setTimeout(() => {
        mutation.reset()
      }, 200)
    } catch {
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors de la suppression de l’activité',
      })
      mutation.reset()
    }
  }

  const isLoading = mutation.isPending || mutation.isSuccess

  const dureeString = dureeAsString(duree)
  const locationString = getActiviteLocationString(activite)

  const thematiquesNonAdministratives = thematiques
    .map((thematique) =>
      thematique in thematiquesNonAdministrativesLabels
        ? thematiqueLabels[thematique]
        : null,
    )
    .filter(isDefinedAndNotNull)

  const thematiquesAdministratives = thematiques
    .map((thematique) =>
      thematique in thematiquesAdministrativesLabels
        ? thematiqueLabels[thematique]
        : null,
    )
    .filter(isDefinedAndNotNull)

  const donneesItems: { title: string; items: ReactNode[] | ReactNode }[] = [
    {
      title: 'Matériel utilisé',
      items: materiel.map((materielValue) => materielLabels[materielValue]),
    },
    {
      title: `Thématique${sPluriel(thematiquesNonAdministratives.length)} d’accompagnement`,
      items: thematiquesNonAdministratives,
    },
    {
      title: 'Niveau d’autonomie du bénéficiaire',
      items: autonomie ? (
        <Stars count={autonomieStars[autonomie]} max={3} />
      ) : null,
    },
    {
      title: 'Niveau de l’atelier',
      items: niveau ? (
        <Stars count={niveauAtelierStars[niveau]} max={3} />
      ) : null,
    },
    {
      title: 'Orientation du bénéficiaire',
      items:
        !!orienteVersStructure && !!structureDeRedirection ? (
          <p className="fr-text--sm fr-mb-0 fr-text--medium">
            {structuresRedirectionLabels[structureDeRedirection]}
          </p>
        ) : null,
    },
  ].filter(filterItemsNodes)

  const demarcheItems:
    | null
    | { title: string; items: ReactNode[] | ReactNode | null }[] =
    thematiques.includes('AideAuxDemarchesAdministratives')
      ? [
          {
            title: `Thématique${sPluriel(thematiquesAdministratives.length)} d’accompagnement`,
            items: thematiquesAdministratives,
          },
          {
            title: 'Nom de la démarche',
            items: precisionsDemarche ? (
              <p className="fr-text--sm fr-mb-0 fr-text--medium">
                {precisionsDemarche}
              </p>
            ) : null,
          },
        ].filter(filterItemsNodes)
      : null

  const beneficiaires = accompagnements.map((accompagnement) => ({
    ...accompagnement.beneficiaire,
    premierAccompagnement: accompagnement.premierAccompagnement,
  }))

  const beneficiaireUnique = type === 'Collectif' ? null : beneficiaires[0]

  const beneficiairesCollectif = type === 'Collectif' ? beneficiaires : null

  // Informations si le beneficiaire est anonyme et à des informations supplémentaires
  const infosBeneficiaireAnonyme =
    !!beneficiaireUnique && beneficiaireUnique.anonyme
      ? [
          beneficiaireUnique.premierAccompagnement
            ? 'Nouveau bénéficiaire'
            : 'Bénéficiaire déjà accompagné',
          [
            beneficiaireUnique.genre &&
              beneficiaireUnique.genre !== 'NonCommunique' &&
              sexLabels[beneficiaireUnique.genre],
            beneficiaireUnique.trancheAge &&
              beneficiaireUnique.trancheAge !== 'NonCommunique' &&
              trancheAgeLabels[beneficiaireUnique.trancheAge],
            beneficiaireUnique.statutSocial &&
              beneficiaireUnique.statutSocial !== 'NonCommunique' &&
              statutSocialLabels[beneficiaireUnique.statutSocial],
          ]
            .filter(Boolean)
            .join(', '),
          !!beneficiaireUnique.commune &&
            `${beneficiaireUnique.communeCodePostal} ${beneficiaireUnique.commune}`.trim(),
        ].filter(Boolean)
      : null

  const participants = beneficiairesCollectif
    ? createParticipantsAnonymesForBeneficiaires(beneficiairesCollectif)
    : null

  const participantsCountTitle = participants
    ? participants.beneficiairesSuivis.length > 0 &&
      participants.participantsAnonymes.total > 0
      ? // Both participants suivis and anonymes
        `${(beneficiairesCollectif ?? []).length} participant${sPluriel(
          (beneficiairesCollectif ?? []).length,
        )} dont ${
          participants.beneficiairesSuivis.length
        } bénéficiaire${sPluriel(
          participants.beneficiairesSuivis.length,
        )} suivi${sPluriel(participants.beneficiairesSuivis.length)} et ${
          participants.participantsAnonymes.total
        } anonyme${sPluriel(participants.participantsAnonymes.total)}`
      : participants.beneficiairesSuivis.length > 0
        ? // Only participants suivis
          `${participants.beneficiairesSuivis.length} bénéficiaire${sPluriel(
            participants.beneficiairesSuivis.length,
          )} suivi${sPluriel(participants.beneficiairesSuivis.length)}`
        : // Only participants anonymes
          `${participants.participantsAnonymes.total} participant${sPluriel(
            participants.participantsAnonymes.total,
          )} anonyme${sPluriel(participants.participantsAnonymes.total)}`
    : null

  const participantsAnonymesInfos =
    participants && participants.participantsAnonymes.total > 0
      ? [
          premierAccompagnement(
            participants.participantsAnonymes.total -
              participants.participantsAnonymes.dejaAccompagne,
            participants.participantsAnonymes.dejaAccompagne,
          ).join(', '),
          genreValues
            .map((enumValue) => ({
              enumValue,
              count:
                participants.participantsAnonymes[`genre${enumValue}`] || 0,
              label: sexLabels[enumValue].toLocaleLowerCase(),
              prefix: enumValue === 'NonCommunique' ? ' de genre' : '',
              pluralize: enumValue !== 'NonCommunique',
            }))
            .filter(({ count }) => count > 0)
            .map(
              ({ label, count, prefix, pluralize }) =>
                `${count}${prefix} ${label}${sPluriel(pluralize ? count : 1)}`,
            )
            .join(', '),
          trancheAgeValues
            .map((enumValue) => ({
              enumValue,
              count:
                participants.participantsAnonymes[`trancheAge${enumValue}`] ||
                0,
              label: trancheAgeLabels[enumValue].toLocaleLowerCase(),
              prefix: enumValue === 'NonCommunique' ? ' de tranche d’âge' : '',
              pluralize: enumValue !== 'NonCommunique',
            }))
            .filter(({ count }) => count > 0)
            .map(({ label, count, prefix }) => `${count} ×${prefix} ${label}`)
            .join(', '),
          statutSocialValues
            .map((enumValue) => ({
              enumValue,
              count:
                participants.participantsAnonymes[`statutSocial${enumValue}`] ||
                0,
              label: statutSocialLabels[enumValue].toLocaleLowerCase(),
              prefix: enumValue === 'NonCommunique' ? ' de statut social' : '',
              pluralize: enumValue !== 'NonCommunique',
            }))
            .filter(({ count }) => count > 0)
            .map(
              ({ label, count, prefix, pluralize }) =>
                `${count}${prefix} ${label}${sPluriel(pluralize ? count : 1)}`,
            )
            .join(', '),
        ]
      : null

  const creationString = `${dateAsDayInTimeZone(creation, timezone)} à ${dateAsTimeInTimeZone(creation, timezone)}`
  const updatedAtString = `${dateAsDayInTimeZone(modification, timezone)} à ${dateAsTimeInTimeZone(modification, timezone)}`
  const showUpdatedAt = creationString !== updatedAtString

  return (
    <ActiviteDetailsDynamicModal.Component
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
                disabled: isLoading,
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
                    isLoading && 'fr-btn--loading',
                  ),
                },
              },
            ]
          : undefined
      }
    >
      <hr className="fr-separator fr-separator-6v" />
      <div className="fr-flex fr-flex-gap-2v fr-justify-content-space-between fr-align-items-center">
        <div>
          <p className="fr-text--lg fr-text--medium fr-mb-0">
            {typeActiviteLabels[type]}
            {!!titreAtelier && <>&nbsp;·&nbsp;{titreAtelier}</>}
          </p>
        </div>
      </div>

      <p className="fr-mt-2v fr-text--sm fr-text--medium fr-mb-0 fr-text-mention--grey">
        <span className="fr-icon-calendar-line fr-icon--sm fr-mr-1-5v" />
        {formatActiviteDayDate(date)}
        &nbsp;·&nbsp;
        <span className="fr-icon-time-line fr-icon--sm fr-mr-1-5v" />
        Durée&nbsp;:&nbsp;{dureeString}
      </p>
      <p className="fr-mt-2v fr-text--sm fr-text--medium fr-mb-0 fr-text-mention--grey">
        <span className="fr-icon-map-pin-2-line fr-icon--sm" /> {locationString}
      </p>

      {!deletionConfirmation && (
        <>
          <hr className="fr-separator-6v" />
          <div className="fr-flex fr-flex-gap-2v">
            <Button
              iconId="fr-icon-edit-line"
              linkProps={{
                href: createModifierActiviteLink(activite, {
                  retour: actionsRetourPath,
                }),
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
                href: createDupliquerActiviteLink(activite, {
                  retour: actionsRetourPath,
                }),
              }}
            >
              <span
                style={{
                  marginLeft: 7,
                  fontFamily: '"Marianne", arial, sans-serif', // There is a dsfr bug with buttons with remixicons having default font family :(
                }}
              >
                Dupliquer
              </span>
            </Button>
            <Button
              type="button"
              iconId="fr-icon-delete-bin-line"
              priority="secondary"
              title="Supprimer"
              size="small"
              onClick={onDeleteButtonClick}
            >
              Supprimer
            </Button>
          </div>
          {!!rdv && (
            <>
              <hr className="fr-separator-6v" />
              <div className="fr-flex fr-flex-gap-2v fr-align-items-center">
                <div className="fr-background-alt--blue-france fr-p-1-5v fr-border-radius--8 fr-flex">
                  <img
                    className="fr-display-block"
                    alt=""
                    src="/images/services/rdv-service-public.svg"
                    style={{ width: 20, height: 20 }}
                  />
                </div>
                <p className="fr-text--sm fr-text--medium fr-mb-0 fr-flex-grow-1">
                  RDV pris via RDV&nbsp;Service&nbsp;Public
                </p>
                <RdvStatusBadge rdv={rdv} />
                <Button
                  priority="tertiary no outline"
                  size="small"
                  title="Voir et modifier le RDV sur Rendez-vous Service Public"
                  linkProps={{
                    href: rdv.url,
                    target: '_blank',
                  }}
                >
                  Voir
                </Button>
              </div>
            </>
          )}
          <hr className="fr-separator-6v" />

          {donneesItems.map(({ title, items }, index) => (
            <>
              <p className="fr-text--sm fr-text-mention-grey fr-mb-1v fr-mt-4v">
                {title}
              </p>
              {Array.isArray(items) ? (
                <ul className="fr-my-0">
                  {items.map((item) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </ul>
              ) : (
                items
              )}
            </>
          ))}

          {!!demarcheItems && demarcheItems.length > 0 && (
            <>
              <hr className="fr-separator-6v" />
              <p className="fr-text-mention--grey fr-text--xs fr-mb-4v fr-text--bold fr-text--uppercase">
                <span className="fr-icon-draft-line fr-icon--sm fr-mr-1w" />
                Informations sur la démarche administrative
              </p>
              {demarcheItems.map(({ title, items }, index) => (
                <>
                  <p className="fr-text--sm fr-text-mention-grey fr-mb-1v fr-mt-4v">
                    {title}
                  </p>
                  {Array.isArray(items) ? (
                    <ul className="fr-my-0">
                      {items.map((item) => (
                        <ListItem key={index}>{item}</ListItem>
                      ))}
                    </ul>
                  ) : (
                    items
                  )}
                </>
              ))}
            </>
          )}

          {!!beneficiaireUnique && !beneficiaireUnique.anonyme && (
            <>
              <hr className="fr-separator-6v" />
              <div className="fr-flex fr-align-items-center">
                <span className="fr-icon-user-heart-line fr-icon--sm fr-mr-3v fr-text-mention--grey" />
                <Link
                  href={`/coop/mes-beneficiaires/${beneficiaireUnique.id}`}
                  className="fr-link fr-text--sm fr-mb-0 fr-text--medium fr-link--underline-on-hover"
                >
                  {getBeneficiaireDisplayName(beneficiaireUnique)}&nbsp;·&nbsp;
                  {beneficiaireUnique._count.accompagnements} accompagnement
                  {sPluriel(beneficiaireUnique._count.accompagnements)}
                </Link>
              </div>
            </>
          )}
          {!!beneficiaireUnique &&
            !infosBeneficiaireAnonyme &&
            beneficiaireUnique.anonyme && (
              <>
                <hr className="fr-separator-6v" />
                <div className="fr-flex fr-justify-content-space-between fr-flex-gap-4v fr-text-mention--grey">
                  <p className="fr-text--xs fr-mb-0 fr-text--bold fr-text--uppercase">
                    <span className="fr-icon-user-heart-line fr-icon--sm fr-mr-1w" />
                    Infos bénéficiaire
                  </p>
                  <p className="fr-text--xs fr-mb-0 fr-text--medium">
                    <i>Non renseignées</i>
                  </p>
                </div>
              </>
            )}
          {!!infosBeneficiaireAnonyme && (
            <>
              <hr className="fr-separator-6v" />
              <div className="fr-flex fr-justify-content-space-between fr-flex-gap-4v fr-text-mention--grey">
                <p className="fr-text-mention--grey fr-text--xs fr-mb-4v fr-text--bold fr-text--uppercase">
                  <span className="fr-icon-user-heart-line fr-icon--sm fr-mr-1w" />
                  Infos bénéficiaire anonyme
                </p>
                {infosBeneficiaireAnonyme.length === 0 ? (
                  <p className="fr-text--xs fr-mb-0 fr-text--medium">
                    <i>Non renseignées</i>
                  </p>
                ) : null}
              </div>
              <ul className="fr-my-0">
                {infosBeneficiaireAnonyme.map((item, index) => (
                  <ListItem key={index}>{item}</ListItem>
                ))}
              </ul>
            </>
          )}

          {!!participants && (
            <>
              <hr className="fr-separator-6v" />
              <Accordion
                className={styles.accordion}
                label={
                  <div className="fr-flex fr-direction-column">
                    <p className="fr-text-mention--grey fr-text--xs fr-mb-2v fr-text--bold fr-text--uppercase">
                      <span className="fr-icon-user-heart-line fr-icon--sm fr-mr-1w" />
                      Infos participants
                    </p>
                    <p className="fr-text--sm fr-text--medium fr-mb-0 fr-text-default--grey">
                      {participantsCountTitle}
                    </p>
                  </div>
                }
              >
                {participants.beneficiairesSuivis.length > 0 && (
                  <>
                    {/* Only add title if both type of participants are present */}
                    {participants.participantsAnonymes.total > 0 && (
                      <p className="fr-text--sm fr-text--bold fr-mb-1v">
                        {participants.beneficiairesSuivis.length} Participant
                        {sPluriel(participants.beneficiairesSuivis.length)}{' '}
                        suivi
                        {sPluriel(participants.beneficiairesSuivis.length)}
                        &nbsp;:
                      </p>
                    )}
                    <ul className="fr-my-0">
                      {participants.beneficiairesSuivis.map((beneficiaire) => (
                        <ListItem key={beneficiaire.id} className="fr-mb-0">
                          <Link
                            className="fr-link fr-link--underline-on-hover fr-text--sm fr-mb-0"
                            href={`/coop/mes-beneficiaires/${beneficiaire.id}`}
                          >
                            {getBeneficiaireDisplayName(beneficiaire)}
                          </Link>
                        </ListItem>
                      ))}
                    </ul>
                  </>
                )}
                {participants.participantsAnonymes.total > 0 &&
                  participantsAnonymesInfos && (
                    <>
                      {/* Only add title if both type of participants are present */}
                      {participants.beneficiairesSuivis.length > 0 && (
                        <p className="fr-text--sm fr-mt-4v fr-text--bold fr-mb-1v">
                          {participants.participantsAnonymes.total} Participant
                          {sPluriel(participants.participantsAnonymes.total)}{' '}
                          anonyme
                          {sPluriel(participants.participantsAnonymes.total)}
                          &nbsp;:
                        </p>
                      )}
                      <ul className="fr-my-0">
                        {participantsAnonymesInfos.map((info) => (
                          <ListItem className="fr-mb-0" key={info}>
                            {info}
                          </ListItem>
                        ))}
                      </ul>
                    </>
                  )}
              </Accordion>
            </>
          )}
          {!!notes && (
            <>
              <hr className="fr-separator-6v" />
              <p className="fr-text-mention--grey fr-text--xs fr-mb-4v fr-text--bold fr-text--uppercase">
                <span className="fr-icon-file-text-line fr-icon--sm fr-mr-1w" />
                Notes sur l’
                {type === 'Collectif' ? 'atelier' : 'accompagnement'}
              </p>
              <div
                className={styles.notes}
                dangerouslySetInnerHTML={{
                  __html: notes,
                }}
              />
            </>
          )}
        </>
      )}
      {deletionConfirmation && (
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
      )}
    </ActiviteDetailsDynamicModal.Component>
  )
}

export default withTrpc(ActiviteDetailsModal)
