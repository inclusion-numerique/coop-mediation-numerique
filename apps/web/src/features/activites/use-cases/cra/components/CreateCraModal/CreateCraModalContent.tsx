'use client'

import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import type { DefaultValues } from 'react-hook-form'
import { CraCollectifData } from '../../collectif/validation/CraCollectifValidation'
import { CraIndividuelData } from '../../individuel/validation/CraIndividuelValidation'

const ModalNavigationButton = ({
  children,
  illustration,
  onClick,
  className,
}: {
  children: ReactNode
  illustration: string
  className?: string
  onClick?: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      'fr-p-0 fr-mt-4v fr-width-full fr-border-radius--8 fr-border fr-flex fr-link--no-underline',
      className,
    )}
  >
    <div className="fr-background-alt--blue-france fr-p-4v fr-border-radius-left--8">
      <img className="fr-display-block" alt="" src={illustration} />
    </div>
    <div className="fr-p-5v fr-flex fr-align-items-center fr-align-self-center fr-text--medium fr-height-full">
      {children}
    </div>
  </button>
)

const CreateCraModalContent = ({
  craDefaultValues,
  onClose,
  retour,
}: {
  craDefaultValues?:
    | DefaultValues<CraIndividuelData>
    | DefaultValues<CraCollectifData>
  onClose: () => void
  retour?: string
}) => {
  const { push, prefetch } = useRouter()
  const navigateTo = (path: string) => {
    if (craDefaultValues) {
      push(
        `${path}?v=${encodeSerializableState(craDefaultValues)}${
          retour ? `&retour=${retour}` : ''
        }`,
      )
    } else {
      push(retour ? `${path}?retour=${retour}` : path)
    }
    onClose()
  }

  useEffect(() => {
    prefetch('/coop/mes-activites/cra/individuel')
    prefetch('/coop/mes-activites/cra/collectif')
  }, [prefetch])

  return (
    <>
      <p className="fr-text--xl">
        Quel type d’accompagnement avez-vous réalisé&nbsp;?
      </p>
      <ModalNavigationButton
        illustration="/images/iconographie/accompagnement-individuel.svg"
        onClick={() => navigateTo('/coop/mes-activites/cra/individuel')}
      >
        Accompagnement individuel
      </ModalNavigationButton>

      <ModalNavigationButton
        illustration="/images/iconographie/accompagnement-collectif.svg"
        onClick={() => navigateTo('/coop/mes-activites/cra/collectif')}
      >
        Atelier collectif
      </ModalNavigationButton>
    </>
  )
}

export default CreateCraModalContent
