import IconInSquare from '@app/web/components/IconInSquare'
import InfoLabelValue from '@app/web/components/InfoLabelValue'
import StructureCard from '@app/web/components/structure/StructureCard'
import InscriptionCard from '@app/web/features/inscription/components/InscriptionCard'
import Button from '@codegouvfr/react-dsfr/Button'
import type { VerifierInformationsPageData } from '../../queries/getVerifierInformationsPageData'

/**
 * Écran de vérification des informations : purement présentationnel. La route
 * ne fait qu'appeler `getVerifierInformationsPageData` et passer le résultat —
 * le composant ne connaît ni le flow ni le `SessionUser`, seulement ce qu'il affiche.
 */
const VerifierInformationsPage = ({
  data: {
    profilLabel,
    name,
    email,
    structureEmployeuse,
    backHref,
    nextStepPath,
  },
}: {
  data: VerifierInformationsPageData
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
    {!!structureEmployeuse && (
      <>
        <hr className="fr-separator-12v" />

        <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-mt-12v">
          <IconInSquare iconId="ri-home-smile-2-line" size="small" />
          <h2 className="fr-h6 fr-mb-0 fr-text-title--blue-france">
            Ma structure employeuse
          </h2>
        </div>
        <StructureCard structure={structureEmployeuse} className="fr-mt-4v" />
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
