'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import {
  getNextInscriptionStep,
  getStepPath,
} from '@app/web/features/inscription/inscriptionFlow'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SessionUser } from '@app/web/auth/sessionUser'
import InscriptionCard from './InscriptionCard'
import { allProfileInscriptionLabels } from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'
import IconInSquare from '@app/web/components/IconInSquare'
import InfoLabelValue from '@app/web/components/InfoLabelValue'
import StructureCard from '@app/web/components/structure/StructureCard'

const VerifierInformationsPage = ({ user }: { user: SessionUser }) => {
  const router = useRouter()

  const handleContinue = () => {
    const nextStep = getNextInscriptionStep({
      currentStep: 'verifier-informations',
      flowType: 'withoutDataspace',
      profilInscription: user.profilInscription,
      hasLieuxActivite: false,
    })

    if (nextStep) {
      router.push(getStepPath(nextStep))
    }
  }

  const profilLabel = user.profilInscription
    ? allProfileInscriptionLabels[user.profilInscription]
    : 'Non renseigné'

  const structureEmployeuse = user.emplois.at(0)?.structure

  return (
    <InscriptionCard
      title="Vérifiez vos informations"
      backHref="/inscription/choisir-role"
      stepNumber={1}
      totalSteps={3}
      nextStepTitle="Renseignez vos lieux d'activité"
    >
      <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-mt-12v">
        <IconInSquare iconId="fr-icon-account-circle-line" size="small" />
        <h2 className="fr-h6 fr-mb-0 fr-text-title--blue-france">
          Mes informations
        </h2>
      </div>
      <div className="fr-width-full fr-border-radius--8 fr-p-6v fr-p-md-8v fr-border fr-mt-6v">
        <InfoLabelValue label="Profession" value={profilLabel} />
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
      {!!structureEmployeuse && (
        <>
          <hr className="fr-separator-12v" />

          <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-mt-12v">
            <IconInSquare iconId="fr-icon-account-circle-line" size="small" />
            <h2 className="fr-h6 fr-mb-0 fr-text-title--blue-france">
              Ma structure employeuse
            </h2>
          </div>
          <StructureCard structure={structureEmployeuse} className="fr-mt-4v" />
        </>
      )}
      <hr className="fr-separator-12v" />
      <div className="fr-btns-group">
        <Button type="button" priority="primary" onClick={handleContinue}>
          Continuer
        </Button>
        <Button
          linkProps={{ href: '/inscription/choisir-role' }}
          priority="secondary"
          className="fr-mb-0"
        >
          Annuler
        </Button>
      </div>
    </InscriptionCard>
  )
}

export default withTrpc(VerifierInformationsPage)
