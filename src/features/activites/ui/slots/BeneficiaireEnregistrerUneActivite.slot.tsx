'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import type { BeneficiaireCraData } from '@/features/activites/ui/forms/beneficiaire-du-cra.validation'
import { hrefDesAccompagnementsDuBeneficiaire } from '@/features/activites/ui/presenters/liens.presenter'
import { cheminDeLaSaisie } from '@/features/activites/ui/presenters/saisie/chemin-de-la-copie.presenter'

const BeneficiaireEnregistrerUneActivite = ({
  beneficiaire,
  label = 'Enregistrer une activité',
  size,
}: {
  beneficiaire: BeneficiaireCraData
  label?: string
  size?: 'small' | 'medium' | 'large'
}) => {
  const craDefaultValues = {
    beneficiaire,
  }
  const createCraPath = cheminDeLaSaisie(
    'individuel',
    craDefaultValues,
    beneficiaire.id == null
      ? undefined
      : hrefDesAccompagnementsDuBeneficiaire(beneficiaire.id),
  )

  return (
    <div className="fr-flex fr-direction-column fr-flex-gap-2v">
      <Button
        iconId="fr-icon-add-line"
        {...(size === undefined ? {} : { size })}
        linkProps={{
          href: createCraPath,
        }}
      >
        {label}
      </Button>
    </div>
  )
}

export default BeneficiaireEnregistrerUneActivite
