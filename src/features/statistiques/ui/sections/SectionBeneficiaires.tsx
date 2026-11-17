'use client'

import { CaptureButton } from '@app/web/libs/statistiques/CaptureButton'
import { type ReactNode, useRef } from 'react'

export const SectionBeneficiaires = ({
  wording = 'personnel',
  profil,
  communes,
}: {
  wording?: 'personnel' | 'generique'
  profil: ReactNode
  communes?: ReactNode
}) => {
  const capture = useRef<HTMLDivElement | null>(null)

  return (
    <>
      <h2 className="fr-h5 fr-text-mention--grey">
        <span className="ri-user-heart-line fr-mr-1w" aria-hidden />
        Statistiques sur{' '}
        {wording === 'personnel' ? 'vos bénéficiaires' : 'les bénéficiaires'}
      </h2>
      <div
        ref={capture}
        className="fr-border fr-p-4w fr-background-default--grey fr-border-radius--16 fr-position-relative"
      >
        {profil}
        <hr className="fr-separator-1px fr-my-5w" />
        {communes}
        <span className="fr-no-print fr-position-absolute fr-top-0 fr-right-0 fr-p-4v">
          <CaptureButton
            captureRef={capture}
            captureName="beneficiaires"
            title="Télécharger l’image des statistiques sur les bénéficiaires"
            iconId="fr-icon-download-line"
            size="small"
            priority="tertiary no outline"
          />
        </span>
      </div>
    </>
  )
}
