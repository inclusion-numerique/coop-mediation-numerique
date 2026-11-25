import Button from '@codegouvfr/react-dsfr/Button'
import Link from 'next/link'
import type { ComponentProps } from 'react'
import GererRdvServicePublicButton from '@/features/rdvsp/ui/components/GererRdvServicePublicButton'
import {
  lienDeMonAgendaRdv,
  rdvIntegrationEnSavoirPlusLink,
} from '@/features/rdvsp/ui/presenters/liens.presenter'
import { RDVServicePublicCoopConnexion } from '@/libraries/pictograms/services'
import { statutDuCompteDeLaSession } from '../../domain/compte/sante-compte'
import GererRdvServicePublicModal from '../components/GererRdvServicePublicModal'
import RdvServicePublicStatusTag from '../components/RdvServicePublicStatusTag'

const RdvServicePublicAccess = ({
  user,
  lienDeConnexion,
}: {
  user: ComponentProps<typeof GererRdvServicePublicModal>['user']
  lienDeConnexion: string
}) => {
  const status = statutDuCompteDeLaSession(user.rdvAccount)

  return (
    <>
      <RDVServicePublicCoopConnexion
        className="fr-flex fr-width-full fr-align-items-center fr-justify-content-center"
        aria-hidden
      />
      <div className="fr-text--center">
        <p className="fr-text--bold fr-mt-8v fr-mb-2v">
          Connectez RDV Service Public à La Coop de la médiation numérique
        </p>
      </div>
      {status === 'jamaisConnecte' && (
        <>
          <div className="fr-text--center">
            <p className="fr-text--sm fr-mb-2v">
              Programmez des rendez-vous avec vos bénéficiaires suivis et
              retrouvez-les dans leurs historiques d’accompagnements.
            </p>
            <Link
              href={rdvIntegrationEnSavoirPlusLink}
              target="_blank"
              className="fr-link"
              rel="noreferrer"
            >
              En savoir plus
            </Link>
          </div>
          <div className="fr-btns-group fr-btns-group--icon-right fr-mt-8v">
            <Button
              linkProps={{
                href: '/coop/mes-outils/rdv-service-public/se-connecter',
              }}
              priority="primary"
              className="fr-mb-0 fr-flex-gap-2v"
            >
              Connecter à La Coop{' '}
              <span className="ri-exchange-line" aria-hidden />
            </Button>
          </div>
        </>
      )}
      {status === 'connecte' && (
        <>
          <div className="fr-text--center fr-mt-4v">
            <p className="fr-text-mention--grey fr-mb-2v">
              Statut de la connexion
            </p>
            <RdvServicePublicStatusTag status={status} />
          </div>
          <div className="fr-btns-group fr-btns-group--icon-left fr-mt-8v">
            <Button
              linkProps={{
                href: lienDeMonAgendaRdv,
                target: '_blank',
              }}
              priority="primary"
            >
              Accéder à l’outil
            </Button>
            <GererRdvServicePublicButton />
          </div>
          <GererRdvServicePublicModal user={user} />
        </>
      )}
      {(status === 'deconnecte' || status === 'enPanne') && (
        <>
          <div className="fr-text--center fr-mt-4v">
            <p className="fr-text-mention--grey fr-mb-2v">
              Statut de la connexion
            </p>
            <RdvServicePublicStatusTag status={status} />
          </div>
          <div className="fr-btns-group fr-btns-group--icon-right fr-mt-8v">
            <Button
              linkProps={{
                href: lienDeConnexion,
              }}
              priority="primary"
              className="fr-mb-0"
            >
              Reconnecter les outils
            </Button>
          </div>
        </>
      )}
    </>
  )
}

export default RdvServicePublicAccess
