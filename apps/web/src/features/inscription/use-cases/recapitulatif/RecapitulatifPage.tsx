'use client'

import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import IconInSquare from '@app/web/components/IconInSquare'
import InfoLabelValue from '@app/web/components/InfoLabelValue'
import StructureCard from '@app/web/components/structure/StructureCard'
import InscriptionCard from '@app/web/features/inscription/components/InscriptionCard'
import InscriptionInvalidInformationContactSupportLink from '@app/web/features/inscription/components/InscriptionInvalidInformationContactSupportLink'
import { getStepPath } from '@app/web/features/inscription/inscriptionFlow'
import ValiderInscriptionForm from '@app/web/features/inscription/use-cases/recapitulatif/ValiderInscriptionForm'
import {
  allProfileInscriptionLabels,
  computeUserProfile,
  profileInscriptionConseillerNumeriqueLabels,
} from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'
import Button from '@codegouvfr/react-dsfr/Button'
import Notice from '@codegouvfr/react-dsfr/Notice'
import ConseillerNumeriqueRoleNotice from './ConseillerNumeriqueRoleNotice'
import type { InscriptionRecapitulatifPageData } from './getInscriptionRecapitulatifPageData'

const RecapitulatifPage = ({
  data: {
    user,
    structureEmployeuse,
    lieuxActivite,
    mediateursCoordonnesCount,
    backHref,
    mustAcceptCgu = false,
    conseillerNumeriqueRole,
    showConseillerNumeriqueSupportLink,
    canCancelInscription,
    showInscriptionSteps,
  },
}: {
  data: InscriptionRecapitulatifPageData
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
        conseillerNumeriqueRole={profileInscriptionConseillerNumeriqueLabels[
          conseillerNumeriqueRole
        ].toLowerCase()}
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
        value={allProfileInscriptionLabels[computeUserProfile(user)]}
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
      user.coordinateur?.conseillerNumeriqueId != null && (
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
                  Conseiller{sPluriel(mediateursCoordonnesCount)} numérique
                  {sPluriel(mediateursCoordonnesCount)} identifié
                  {sPluriel(mediateursCoordonnesCount)}
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
    {!!structureEmployeuse && (
      <>
        <hr className="fr-separator-12v" />
        <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-mt-12v fr-mb-6v">
          <IconInSquare iconId="ri-home-smile-2-line" size="small" />
          <h2 className="fr-h6 fr-mb-0 fr-text-title--blue-france">
            Ma structure employeuse
          </h2>
        </div>
        <StructureCard structure={structureEmployeuse} className="fr-mt-4v" />
      </>
    )}
    {!!lieuxActivite && lieuxActivite.length > 0 && (
      <>
        <hr className="fr-separator-12v" />
        <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-mt-12v fr-mb-6v">
          <IconInSquare iconId="ri-home-office-line" size="small" />
          <h2 className="fr-h6 fr-mb-0 fr-text-title--blue-france">
            {lieuxActivite.length === 1
              ? 'Mon lieu d’activité'
              : `Mes lieux d’activité · ${lieuxActivite.length}`}
          </h2>
          <span className="fr-flex-grow-1" />
          <Button
            priority="tertiary no outline"
            linkProps={{
              href: getStepPath('lieux-activite'),
            }}
            iconId="fr-icon-edit-line"
            iconPosition="right"
            size="small"
          >
            Modifier
          </Button>
        </div>
        {/* Les lieux sont affichés dans l'ordre inverse (le plus récent en haut) dans la formulaire lieux activité, on reproduit cela pour */}
        {/* que l'affichage soit cohérent */}
        {lieuxActivite.toReversed().map((lieu) => (
          <StructureCard key={lieu.id} structure={lieu} className="fr-mt-4v" />
        ))}
      </>
    )}
    <hr className="fr-separator-12v" />
    <ValiderInscriptionForm
      userId={user.id}
      mustAcceptCgu={mustAcceptCgu}
      canCancel={canCancelInscription}
    />
    {showConseillerNumeriqueSupportLink && (
      <InscriptionInvalidInformationContactSupportLink />
    )}
  </InscriptionCard>
)

export default RecapitulatifPage
