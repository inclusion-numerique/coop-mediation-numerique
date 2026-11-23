'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import {
  type RdvASaisir,
  useOuvrirLaSaisieDuStatut,
} from './SaisieDuStatutDuRdv.slot'

export const RenseignerLeStatut = ({ rdv }: { rdv: RdvASaisir }) => {
  const ouvrirLaSaisieDuStatut = useOuvrirLaSaisieDuStatut()

  return (
    <Button
      priority="tertiary no outline"
      size="small"
      className="fr-flex-shrink-0"
      title="Renseigner le statut du RDV"
      onClick={() => ouvrirLaSaisieDuStatut(rdv)}
    >
      À renseigner
    </Button>
  )
}
