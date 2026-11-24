'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen'
import classNames from 'classnames'
import { type ReactNode, useId, useMemo, useState } from 'react'
import type { FiltreQuelconque } from '../definition/filtre'
import { ChampsDeFiltres, useRegistreDeFiltres } from './conteneur-de-filtres'
import { useEtiquettesActives } from './use-etiquettes-actives'

export const FiltresEnModale = ({
  titre,
  filtres,
  children,
}: {
  titre: string
  filtres: readonly FiltreQuelconque[]
  children: ReactNode
}) => {
  const id = useId()
  const modale = useMemo(
    () => createModal({ id: `filtres-${id}`, isOpenedByDefault: false }),
    [id],
  )
  const registre = useRegistreDeFiltres()
  const [ouverture, setOuverture] = useState(0)
  const actives = useEtiquettesActives(filtres)

  useIsModalOpen(modale, { onDisclose: () => setOuverture(ouverture + 1) })

  const fermerApres = (action: () => void) => () => {
    action()
    modale.close()
  }

  return (
    <>
      <modale.Component
        title={titre}
        size="large"
        buttons={[
          {
            children: 'Effacer tout',
            priority: 'secondary',
            doClosesModal: false,
            type: 'button',
            onClick: fermerApres(registre.effacer),
          },
          {
            children: 'Valider',
            priority: 'primary',
            doClosesModal: false,
            type: 'button',
            onClick: fermerApres(registre.valider),
          },
        ]}
      >
        <ChampsDeFiltres registre={registre}>
          <div key={ouverture}>{children}</div>
        </ChampsDeFiltres>
      </modale.Component>
      <Button
        type="button"
        className={classNames(
          'fr-border-radius--4',
          actives.length > 0 && 'fr-background-alt--blue-france',
        )}
        priority={actives.length === 0 ? 'tertiary' : 'secondary'}
        iconId="fr-icon-equalizer-line"
        iconPosition="right"
        {...modale.buttonProps}
      >
        {titre}
        {actives.length > 0 && ` · ${actives.length}`}
      </Button>
    </>
  )
}
