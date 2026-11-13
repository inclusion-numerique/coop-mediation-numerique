'use client'

import { CaptureButton } from '@app/web/libs/statistiques/CaptureButton'
import { type ReactNode, useRef } from 'react'

export const SectionGenerale = ({
  wording = 'personnel',
  chiffresCles,
  graphique,
}: {
  wording?: 'personnel' | 'generique'
  chiffresCles: ReactNode
  graphique: ReactNode
}) => {
  const captureRef = useRef<HTMLDivElement | null>(null)

  return (
    <div>
      <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-mb-6v fr-no-print">
        <h2 className="fr-h5 fr-text-mention--grey fr-mb-0">
          <span className="ri-line-chart-line fr-mr-1w" aria-hidden />
          Statistiques générales{' '}
          {wording === 'personnel' && 'sur vos accompagnements'}
        </h2>
        <CaptureButton
          captureRef={captureRef}
          captureName="statistiques-generales"
          title="Télécharger l’image des statistiques générales"
          iconId="fr-icon-download-line"
          size="small"
          priority="tertiary no outline"
        />
      </div>
      <div
        ref={captureRef}
        className="fr-grid-row fr-flex-gap-6v fr-background-default--grey fr-border-radius--16"
      >
        {chiffresCles}
        {graphique}
      </div>
    </div>
  )
}
