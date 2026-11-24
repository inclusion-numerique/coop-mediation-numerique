'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { type ReactNode, useState } from 'react'
import InscriptionCard from '@/features/inscription/ui/components/InscriptionCard'
import { useHydrated } from '@/libraries/formulaire/use-hydrated'
import { inject } from '@/libraries/nextjs/injection/client'
import { createToast } from '@/libraries/ui/toast/create-toast'
import { buttonLoadingClassname } from '@/libraries/ui/utils/button-loading-classname'
import { AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ACTION_KEY } from '../../action/ajouter-structure-employeuse-en-lieu.key'

const erreurEnregistrement = () =>
  createToast({
    priority: 'error',
    message:
      "Une erreur est survenue lors de l'enregistrement, veuillez réessayer ultérieurement.",
  })

const StructureEmployeuseLieuActivitePage = ({
  carteEmployeuse,
}: {
  carteEmployeuse: ReactNode
}) => {
  const router = useRouter()

  const [submittedEstLieuActivite, setSubmittedEstLieuActivite] = useState<
    boolean | null
  >(null)

  const onSubmit = async (estLieuActivite: boolean) => {
    try {
      setSubmittedEstLieuActivite(estLieuActivite)
      const result = await inject(
        AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ACTION_KEY,
      )({
        estLieuActivite,
      })

      if (!result.success) {
        setSubmittedEstLieuActivite(null)
        erreurEnregistrement()
        return
      }

      router.push('/inscription/lieux-activite')
      router.refresh()
    } catch {
      setSubmittedEstLieuActivite(null)
      erreurEnregistrement()
    }
  }

  // La navigation suit un succès : l'état de soumission reste posé (spinner
  // maintenu) jusqu'au changement de page, et n'est remis à zéro qu'en cas d'erreur.
  const isNonLoading = submittedEstLieuActivite === false
  const isOuiLoading = submittedEstLieuActivite === true
  const isHydrated = useHydrated()

  return (
    <InscriptionCard
      title="Renseignez vos lieux d'activité"
      backHref="/inscription/verifier-informations"
      nextStepTitle="Récapitulatif de vos informations"
      stepNumber={2}
      totalSteps={3}
    >
      <div
        className="fr-mb-12v fr-px-6v fr-py-4v fr-width-full fr-border-radius--8"
        style={{ backgroundColor: 'var(--background-contrast-info)' }}
      >
        <p className="fr-text--bold fr-mb-1v">
          Est-ce que votre structure employeuse est également un de vos lieux
          d'activité&nbsp;?
        </p>
        <p className="fr-text--sm fr-mb-0">
          Vos lieux d'activité sont les lieux où vous accueillez et accompagnez
          vos bénéficiaires (ex&nbsp;: lieu de permanence...)
        </p>
      </div>
      <div className="fr-mb-12v">{carteEmployeuse}</div>
      <div className="fr-btns-group fr-btns-group--inline fr-width-full fr-flex fr-direction-row">
        <Button
          type="button"
          priority="secondary"
          {...buttonLoadingClassname(isNonLoading, 'fr-mb-0 fr-flex-grow-1')}
          disabled={!isHydrated || isOuiLoading}
          onClick={() => onSubmit(false)}
        >
          Non
        </Button>
        <Button
          type="button"
          priority="primary"
          {...buttonLoadingClassname(isOuiLoading, 'fr-mb-0 fr-flex-grow-1')}
          disabled={!isHydrated || isNonLoading}
          onClick={() => onSubmit(true)}
        >
          Oui
        </Button>
      </div>
    </InscriptionCard>
  )
}

export default StructureEmployeuseLieuActivitePage
