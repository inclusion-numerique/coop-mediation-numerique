'use client'

import { type ReactNode, useState } from 'react'
import { Popover } from '@/libraries/ui/components/Primitives/Popover'
import type { FiltreQuelconque } from '../definition/filtre'
import { ChampsDeFiltres, useRegistreDeFiltres } from './conteneur-de-filtres'
import { FilterFooter } from './FilterFooter'
import TriggerButton from './TriggerButton'
import { useEtiquettesActives } from './use-etiquettes-actives'

export const FiltresEnPopover = ({
  titre,
  filtres,
  resume,
  largeur,
  children,
}: {
  titre: string
  filtres: readonly FiltreQuelconque[]
  resume?: (libelles: readonly string[]) => string
  largeur?: number
  children: ReactNode
}) => {
  const registre = useRegistreDeFiltres()
  const [ouvert, setOuvert] = useState(false)
  const actives = useEtiquettesActives(filtres)

  const fermerApres = (action: () => void) => () => {
    action()
    setOuvert(false)
  }

  return (
    <Popover
      open={ouvert}
      onOpenChange={setOuvert}
      onInteractOutside={fermerApres(registre.valider)}
      onEscapeKeyDown={fermerApres(registre.valider)}
      trigger={
        <TriggerButton isOpen={ouvert} isFilled={actives.length > 0}>
          {actives.length === 0
            ? titre
            : (resume?.(actives) ?? `${titre} · ${actives.length}`)}
        </TriggerButton>
      }
    >
      <ChampsDeFiltres registre={registre}>
        <form
          style={largeur === undefined ? undefined : { width: largeur }}
          action={fermerApres(registre.valider)}
        >
          {children}
          <FilterFooter onClearFilters={fermerApres(registre.effacer)} />
        </form>
      </ChampsDeFiltres>
    </Popover>
  )
}
