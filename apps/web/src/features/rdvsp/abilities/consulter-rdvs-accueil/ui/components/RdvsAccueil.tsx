'use client'

import { withTrpc } from '@app/web/components/trpc/withTrpc'
import RdvStatusBadge from '@app/web/features/activites/use-cases/list/components/RdvStatusBadge'
import { trpc } from '@app/web/trpc'
import { numberToString } from '@app/web/utils/formatNumber'
import type { UserId, UserTimezone } from '@app/web/utils/user'
import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import type {
  DonneesAccueilRdv,
  RdvEnUneLigne,
} from '../../domain/donnees-accueil-rdv'
import { rdvsPassesTotal } from '../../domain/donnees-accueil-rdv'
import { phraseRdv } from '../rdvs-accueil.presenter'
import RdvsAccueilHeader from './RdvsAccueilHeader'

const Compteur = ({
  nombre,
  badgeStatus,
  href,
  phrase,
}: {
  nombre: number
  badgeStatus: 'unknown' | 'past'
  href: string
  phrase: string
}) => {
  const vide = nombre === 0

  return (
    <div className="fr-col-6">
      <div className="fr-border-radius--16 fr-border fr-p-6v fr-height-full">
        <div className="fr-flex fr-align-items-center fr-flex-gap-4v">
          <p
            className={classNames(
              'fr-h3 fr-text fr-mb-0 fr-text-title--blue-france',
              vide && 'fr-text-disabled-grey',
            )}
          >
            {numberToString(nombre)}
          </p>
          <RdvStatusBadge
            className={classNames(
              vide && 'fr-text-disabled-grey',
              vide && 'fr-background-disabled-grey',
            )}
            rdv={{ badgeStatus }}
            pluralize={nombre}
          />
          {nombre > 0 && (
            <>
              <span className="fr-flex-grow-1" />
              <Button
                iconId="fr-icon-arrow-right-line"
                iconPosition="right"
                priority="tertiary no outline"
                size="small"
                linkProps={{ href }}
              >
                Voir
              </Button>
            </>
          )}
        </div>
        <p
          className={classNames(
            'fr-text--sm fr-mt-4v fr-mb-0 fr-text--medium',
            vide && 'fr-text-disabled-grey',
          )}
        >
          {phrase}
        </p>
      </div>
    </div>
  )
}

/**
 * Widget de l'accueil. La synchronisation au chargement passe encore par tRPC :
 * elle appelle l'orchestrateur de synchronisation, qui n'est pas migré.
 */
const RdvsAccueil = ({
  donnees: donneesInitiales,
  user: { timezone, id: userId },
  synchroniserAuChargement,
}: {
  donnees: DonneesAccueilRdv
  user: UserId & UserTimezone
  synchroniserAuChargement: boolean
}) => {
  const [donnees, setDonnees] = useState<DonneesAccueilRdv>(donneesInitiales)

  const mutation = trpc.rdvServicePublic.refreshDashboardRdvData.useMutation()

  // biome-ignore lint/correctness/useExhaustiveDependencies: la mutation ne doit pas relancer l'effet
  useEffect(() => {
    if (synchroniserAuChargement) {
      mutation
        .mutateAsync({ userId })
        .then(({ donnees: rafraichies, hasDiff }) =>
          hasDiff && rafraichies ? setDonnees(rafraichies) : null,
        )
    }
  }, [synchroniserAuChargement])

  const phrase = (
    prefixe: string,
    rdv: RdvEnUneLigne | null,
    defaut: string,
  ): string => (rdv === null ? defaut : phraseRdv(prefixe, rdv, timezone))

  return (
    <>
      <RdvsAccueilHeader isLoading={mutation.isPending} />
      <div className="fr-grid-row fr-grid-row--gutters">
        <Compteur
          nombre={donnees.aVenir}
          badgeStatus="unknown"
          href="/coop/mes-activites?rdvs=unknown&voir-rdvs=1"
          phrase={phrase(
            'Prochain',
            donnees.prochain,
            'Vous n’avez pas de rendez-vous à venir',
          )}
        />
        <Compteur
          nombre={rdvsPassesTotal(donnees)}
          badgeStatus="past"
          href="/coop/mes-activites?rdvs=past%2Cseen&voir-rdvs=0"
          phrase={phrase(
            'Dernier',
            donnees.dernier,
            'Vous n’avez pas de rendez-vous passés',
          )}
        />
      </div>
    </>
  )
}

export default withTrpc(RdvsAccueil)
