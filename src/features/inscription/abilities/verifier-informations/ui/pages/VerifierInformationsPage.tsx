import Button from '@codegouvfr/react-dsfr/Button'
import type { ReactNode } from 'react'
import InscriptionCard from '@/features/inscription/ui/components/InscriptionCard'
import { IconInSquare, InfoLabelValue } from '@/libraries/ui/components'
import type { VerifierInformationsPageData } from '../presenters/verifier-informations.presenter'

const VerifierInformationsPage = ({
  data: { profilLabel, name, email, backHref, nextStepPath },
  carteEmployeuse,
}: {
  data: VerifierInformationsPageData
  carteEmployeuse: ReactNode
}) => (
  <InscriptionCard
    title="Vérifiez vos informations"
    backHref={backHref}
    stepNumber={1}
    totalSteps={3}
    nextStepTitle="Renseignez vos lieux d'activité"
  >
    <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-mt-12v">
      <IconInSquare iconId="fr-icon-account-circle-line" size="small" />
      <h2 className="fr-h6 fr-mb-0 fr-text-title--blue-france">
        Mes informations professionnelles
      </h2>
    </div>
    <div className="fr-width-full fr-border-radius--8 fr-p-6v fr-p-md-8v fr-border fr-mt-6v">
      <InfoLabelValue label="Profession" value={profilLabel} />
      {!!name && (
        <InfoLabelValue
          labelClassName="fr-mt-4v"
          label="Nom Prénom"
          value={name}
        />
      )}
      <InfoLabelValue
        labelClassName="fr-mt-4v"
        label="Adresse e-mail"
        value={email}
      />
    </div>
    {!!carteEmployeuse && (
      <>
        <hr className="fr-separator-12v" />

        <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-mt-12v">
          <IconInSquare iconId="ri-home-smile-2-line" size="small" />
          <h2 className="fr-h6 fr-mb-0 fr-text-title--blue-france">
            Ma structure employeuse
          </h2>
        </div>
        <div className="fr-mt-4v">{carteEmployeuse}</div>
      </>
    )}
    <hr className="fr-separator-12v" />
    <div className="fr-btns-group fr-btns-group--lg">
      <Button priority="primary" linkProps={{ href: nextStepPath }}>
        Continuer
      </Button>
      <Button
        linkProps={{ href: '/' }}
        priority="secondary"
        className="fr-mb-0"
      >
        Annuler
      </Button>
    </div>
  </InscriptionCard>
)

export default VerifierInformationsPage
