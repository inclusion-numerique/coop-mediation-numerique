'use client'

import {
  filtreDuRoleDuMembre,
  filtreDuStatutDuMembre,
} from '@/features/equipe/ui/filtres/equipe.filtre'
import { BoutonDeChoix } from '@/libraries/etat-d-url/BoutonDeChoix'
import { ChoixEnPopover } from '@/libraries/etat-d-url/ChoixEnPopover'

export const FiltresDeLEquipe = ({
  actifs,
  inactifs,
  invitations,
  archives,
}: {
  actifs: number
  inactifs: number
  invitations: number
  archives: number
}) => (
  <>
    <BoutonDeChoix filtre={filtreDuStatutDuMembre} valeur="actifs">
      Actifs · {actifs}
    </BoutonDeChoix>
    <BoutonDeChoix filtre={filtreDuStatutDuMembre} valeur="inactifs">
      Inactifs · {inactifs}
    </BoutonDeChoix>
    <BoutonDeChoix filtre={filtreDuStatutDuMembre} valeur="invitations">
      Invitations envoyées · {invitations}
    </BoutonDeChoix>
    <BoutonDeChoix filtre={filtreDuStatutDuMembre} valeur="archives">
      Archivés · {archives}
    </BoutonDeChoix>
    <ChoixEnPopover
      titre="Rôle"
      sections={[
        { filtre: filtreDuRoleDuMembre, legende: 'Filtrer par rôle :' },
      ]}
    />
  </>
)
