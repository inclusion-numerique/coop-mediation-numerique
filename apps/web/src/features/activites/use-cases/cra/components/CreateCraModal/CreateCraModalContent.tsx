'use client'

import { CalendarIcon } from '@app/web/features/pictograms/digital/CalendarIcon'
import { EcosystemIcon } from '@app/web/features/pictograms/digital/EcosystemIcon'
import { HumanCooperationIcon } from '@app/web/features/pictograms/environment/HumanCooperationIcon'
import { SittingAtATableIcon } from '@app/web/features/pictograms/user/SittingAtATableIcon'
import { TeacherIcon } from '@app/web/features/pictograms/user/TeacherIcon'

import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import type { DefaultValues } from 'react-hook-form'
import { CraCollectifData } from '../../collectif/validation/CraCollectifValidation'
import { CraIndividuelData } from '../../individuel/validation/CraIndividuelValidation'

const ModalNavigationButton = ({
  children,
  pictogram,
  onClick,
  className,
}: {
  children: ReactNode
  pictogram: ReactNode
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
    <div
      className="fr-background-alt--blue-france fr-flex fr-align-items-center fr-p-4v fr-border-radius-left--8"
      aria-hidden
    >
      {pictogram}
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
  isMediateur,
  isCoordinateur,
}: {
  craDefaultValues?:
    | DefaultValues<CraIndividuelData>
    | DefaultValues<CraCollectifData>
  onClose: () => void
  retour?: string
  isMediateur: boolean
  isCoordinateur: boolean
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
      <p>Quel type d’activité avez-vous réalisé&nbsp;?</p>
      {isMediateur && isCoordinateur && (
        <div className="fr-mt-8v fr-text-mention--grey fr-flex fr-flex-gap-2v fr-align-items-center">
          <span className="ri-xl ri-service-line" aria-hidden="true" />
          <span className="fr-text--xs fr-text--uppercase fr-text--bold fr-mb-0">
            Activités de médiation numérique
          </span>
        </div>
      )}
      {isMediateur && (
        <>
          <ModalNavigationButton
            pictogram={<SittingAtATableIcon width={56} height={56} />}
            onClick={() => navigateTo('/coop/mes-activites/cra/individuel')}
          >
            Accompagnement individuel
          </ModalNavigationButton>
          <ModalNavigationButton
            pictogram={<TeacherIcon width={56} height={56} />}
            onClick={() => navigateTo('/coop/mes-activites/cra/collectif')}
          >
            Atelier collectif
          </ModalNavigationButton>
        </>
      )}
      {isMediateur && isCoordinateur && (
        <div className="fr-mt-8v fr-text-mention--grey fr-flex fr-flex-gap-2v fr-align-items-center">
          <span className="ri-xl ri-group-2-line" aria-hidden="true" />
          <span className="fr-text--xs fr-text--uppercase fr-text--bold fr-mb-0">
            Activités de coordination
          </span>
        </div>
      )}
      {isCoordinateur && (
        <>
          <ModalNavigationButton
            pictogram={<EcosystemIcon width={56} height={56} />}
            onClick={() => navigateTo('/coop/mes-activites/cra/animation')}
          >
            <div className="fr-text--left">
              Animation (aide, réunion, moment d’échanges...)
              <p className="fr-text--sm fr-text--regular fr-text-mention--grey fr-mb-0">
                Soutenir au quotidien les professionnels de la médiation
                numérique et leurs structures en leur apportant des informations
                clés.
              </p>
            </div>
          </ModalNavigationButton>
          <ModalNavigationButton
            pictogram={<CalendarIcon width={56} height={56} />}
            onClick={() => navigateTo('/coop/mes-activites/cra/evenement')}
          >
            <div className="fr-text--left">
              Évènement
              <p className="fr-text--sm fr-text--regular fr-text-mention--grey fr-mb-0">
                Événements que vous avez organisé ou auxquels vous avez
                participé autour de l'inclusion numérique.
              </p>
            </div>
          </ModalNavigationButton>
          <ModalNavigationButton
            pictogram={<HumanCooperationIcon width={56} height={56} />}
            onClick={() => navigateTo('/coop/mes-activites/cra/partenariat')}
          >
            <div className="fr-text--left">
              Partenariat
              <p className="fr-text--sm fr-text--regular fr-text-mention--grey fr-mb-0">
                Partenariats mis en place avec les acteurs du territoire pour
                développer des collaborations et renforcer le maillage et les
                synergies locales.
              </p>
            </div>
          </ModalNavigationButton>
        </>
      )}
    </>
  )
}

export default CreateCraModalContent
