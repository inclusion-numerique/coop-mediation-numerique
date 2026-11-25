'use client'

import Notice from '@codegouvfr/react-dsfr/Notice'
import type { ReactNode } from 'react'
import InscriptionInvalidInformationContactSupportLink from '@/features/inscription/abilities/valider/ui/components/InscriptionInvalidInformationContactSupportLink'
import ValiderInscriptionForm from '@/features/inscription/abilities/valider/ui/forms/ValiderInscriptionForm'
import {
  libelleDuProfil,
  profilDInscription,
} from '@/features/inscription/domain'
import InscriptionCard from '@/features/inscription/ui/components/InscriptionCard'
import { pluriel } from '@/libraries/pluriel'
import { IconInSquare, InfoLabelValue } from '@/libraries/ui/components'
import ConseillerNumeriqueRoleNotice from '../components/ConseillerNumeriqueRoleNotice'
import type { RecapitulatifPageData } from '../presenters/recapitulatif.presenter'

const RecapitulatifPage = ({
  data: {
    user,
    mediateursCoordonnesCount,
    backHref,
    mustAcceptCgu = false,
    conseillerNumeriqueRole,
    showConseillerNumeriqueSupportLink,
    canCancelInscription,
    showInscriptionSteps,
  },
  carteEmployeuse,
  cartesDesLieux,
}: {
  data: RecapitulatifPageData
  carteEmployeuse: ReactNode
  cartesDesLieux: readonly ReactNode[]
}) => (
  <InscriptionCard
    title="Récapitulatif de vos informations"
    backHref={backHref ?? undefined}
    stepNumber={showInscriptionSteps ?? undefined}
    totalSteps={showInscriptionSteps ?? undefined}
    subtitle="Vérifiez que les informations sont exactes avant de valider votre inscription."
  >
    {conseillerNumeriqueRole ? (
      <ConseillerNumeriqueRoleNotice
        conseillerNumeriqueRole={conseillerNumeriqueRole}
      />
    ) : null}
    <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-mt-12v">
      <IconInSquare iconId="fr-icon-account-circle-line" size="small" />
      <h2 className="fr-h6 fr-mb-0 fr-text-title--blue-france">
        Mes informations
      </h2>
    </div>
    <div className="fr-width-full fr-border-radius--8 fr-p-6v fr-p-md-8v fr-border fr-mt-6v">
      <InfoLabelValue
        label="Profession"
        value={libelleDuProfil(
          profilDInscription({
            isConseillerNumerique: user.isConseillerNumerique,
            isCoordinateur: user.coordinateur != null,
          }),
        )}
      />
      {!!user.name && (
        <InfoLabelValue
          labelClassName="fr-mt-4v"
          label="Nom"
          value={user.name}
        />
      )}
      <InfoLabelValue
        labelClassName="fr-mt-4v"
        label="Adresse e-mail"
        value={user.email}
      />
    </div>
    {!!conseillerNumeriqueRole &&
      mediateursCoordonnesCount != null &&
      user.isConseillerNumerique && (
        <>
          <hr className="fr-separator-12v" />
          <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-mt-12v fr-mb-6v">
            <IconInSquare iconId="ri-group-2-line" size="small" />
            <h2 className="fr-h6 fr-mb-0 fr-text-title--blue-france">
              Mon équipe
            </h2>
          </div>
          {mediateursCoordonnesCount > 0 ? (
            <>
              <div className="fr-width-full fr-border-radius--8 fr-p-6v fr-border fr-my-6v fr-flex fr-align-items-center fr-flex-gap-3v">
                <img
                  alt=""
                  src="/images/iconographie/profil-conseiller-numerique.svg"
                />
                <div className="fr-h2 fr-mb-0">{mediateursCoordonnesCount}</div>
                <div>
                  {pluriel(
                    mediateursCoordonnesCount,
                    'Conseiller numérique identifié',
                    'Conseillers numériques identifiés',
                  )}
                </div>
              </div>
              <Notice
                className="fr-notice--flex"
                title={
                  <span className="fr-text--regular fr-text-default--grey fr-ml-1w">
                    Retrouvez et gérez la liste des conseillers numériques que
                    vous coordonnez sur votre espace dans la section{' '}
                    <strong>Mon équipe</strong>.
                  </span>
                }
              />
            </>
          ) : (
            <>
              <div className="fr-width-full fr-border-radius--8 fr-p-6v fr-border fr-my-6v fr-flex fr-align-items-center fr-flex-gap-3v">
                <div className="fr-h2 fr-mb-0">0</div>
                <div>Membres identifiés</div>
              </div>
              <Notice
                className="fr-notice--flex"
                title={
                  <span className="fr-text--regular fr-text-default--grey fr-ml-1w">
                    Vous pourrez inviter des médiateur·rice·s numériques (dont
                    des conseillers numériques) que vous souhaitez coordonner
                    sur votre espace dans la section <strong>Mon équipe</strong>
                    .
                  </span>
                }
              />
            </>
          )}
        </>
      )}
    {!!carteEmployeuse && (
      <>
        <hr className="fr-separator-12v" />
        <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-mt-12v fr-mb-6v">
          <IconInSquare iconId="ri-home-smile-2-line" size="small" />
          <h2 className="fr-h6 fr-mb-0 fr-text-title--blue-france">
            Ma structure employeuse
          </h2>
        </div>
        <div className="fr-mt-4v">{carteEmployeuse}</div>
      </>
    )}
    {cartesDesLieux.length > 0 && (
      <>
        <hr className="fr-separator-12v" />
        <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-mt-12v fr-mb-6v">
          <IconInSquare iconId="ri-home-office-line" size="small" />
          <h2 className="fr-h6 fr-mb-0 fr-text-title--blue-france">
            {cartesDesLieux.length === 1
              ? 'Mon lieu d’activité'
              : `Mes lieux d’activité · ${cartesDesLieux.length}`}
          </h2>
        </div>
        <Notice
          className="fr-notice--flex fr-align-items-center fr-mb-6v "
          title={
            <span className="fr-text-default--grey fr-text--regular">
              Vous pourrez gérer vos lieux d’activités plus tard via votre
              espace.
            </span>
          }
        />
        {/* Les lieux sont affichés dans l'ordre inverse (le plus récent en haut) dans la formulaire lieux activité, on reproduit cela pour */}
        {/* que l'affichage soit cohérent */}
        {cartesDesLieux.toReversed()}
      </>
    )}
    <hr className="fr-separator-12v" />
    <ValiderInscriptionForm
      mustAcceptCgu={mustAcceptCgu}
      canCancel={canCancelInscription}
    />
    {showConseillerNumeriqueSupportLink && (
      <InscriptionInvalidInformationContactSupportLink />
    )}
  </InscriptionCard>
)

export default RecapitulatifPage
