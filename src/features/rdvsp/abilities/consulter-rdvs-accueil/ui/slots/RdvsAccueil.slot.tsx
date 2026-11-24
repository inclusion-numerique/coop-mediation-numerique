'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { type ReactNode, useEffect, useState } from 'react'
import { inject } from '@/libraries/nextjs/injection/client'
import { numberToString } from '@/libraries/nombre/format-number'
import { RAFRAICHIR_ACCUEIL_RDV_ACTION_KEY } from '../../action/rafraichir-accueil-rdv.key'
import type {
  DonneesAccueilRdv,
  RdvEnUneLigne,
} from '../../domain/donnees-accueil-rdv'
import { rdvsPassesTotal } from '../../domain/donnees-accueil-rdv'
import type { WidgetRdvAccueil } from '../../domain/widget-rdv'
import {
  BadgeDuCompteur,
  type StatutDuCompteur,
} from '../components/BadgeDuCompteur'
import RdvsAccueilHeader from '../components/RdvsAccueilHeader'
import { phraseRdv } from '../presenters/rdvs-accueil.presenter'

const Compteur = ({
  nombre,
  badgeStatus,
  href,
  phrase,
}: {
  nombre: number
  badgeStatus: StatutDuCompteur
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
          <BadgeDuCompteur
            className={classNames(
              vide && 'fr-text-disabled-grey',
              vide && 'fr-background-disabled-grey',
            )}
            statut={badgeStatus}
            nombre={nombre}
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

type LiensVersLesRendezVous = {
  readonly tous: string
  readonly aVenir: string
  readonly passes: string
}

const Compteurs = ({
  donnees,
  timezone,
  synchronisationEnCours,
  liens,
}: {
  donnees: DonneesAccueilRdv
  timezone: string
  synchronisationEnCours: boolean
  liens: LiensVersLesRendezVous
}) => {
  const phrase = (
    prefixe: string,
    rdv: RdvEnUneLigne | null,
    defaut: string,
  ): string => (rdv === null ? defaut : phraseRdv(prefixe, rdv, timezone))

  return (
    <>
      <RdvsAccueilHeader isLoading={synchronisationEnCours} href={liens.tous} />
      <div className="fr-grid-row fr-grid-row--gutters">
        <Compteur
          nombre={donnees.aVenir}
          badgeStatus="unknown"
          href={liens.aVenir}
          phrase={phrase(
            'Prochain',
            donnees.prochain,
            'Vous n’avez pas de rendez-vous à venir',
          )}
        />
        <Compteur
          nombre={rdvsPassesTotal(donnees)}
          badgeStatus="past"
          href={liens.passes}
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

/**
 * Bloc RDV de l'accueil, dans ses trois états.
 *
 * Le composant tient l'union entière et non la seule branche `donnees` : le
 * rattrapage au chargement peut faire basculer le compte en alerte — des jetons
 * révoqués pendant la passe — et l'écran doit alors montrer la reconnexion, non
 * garder des compteurs périmés.
 *
 * L'alerte arrive en slot depuis le serveur : elle construit l'URL du parcours
 * OAuth avec `BASE_URL`, qui n'existe pas dans le bundle du navigateur.
 */
const RdvsAccueil = ({
  widget: widgetInitial,
  user: { timezone },
  synchroniserAuChargement,
  alerte,
  liens,
}: {
  widget: WidgetRdvAccueil
  user: { readonly timezone: string }
  synchroniserAuChargement: boolean
  alerte: ReactNode
  liens: LiensVersLesRendezVous
}) => {
  const [widget, setWidget] = useState<WidgetRdvAccueil>(widgetInitial)
  const [synchronisationEnCours, setSynchronisationEnCours] = useState(false)

  useEffect(() => {
    // Un compte masqué ou déjà en alerte n'a rien à rattraper : la reconnexion
    // passe par le bouton de l'alerte, pas par une passe de plus.
    if (!synchroniserAuChargement || widgetInitial._tag !== 'donnees') {
      return
    }

    setSynchronisationEnCours(true)

    inject(RAFRAICHIR_ACCUEIL_RDV_ACTION_KEY)().then((resultat) => {
      setSynchronisationEnCours(false)

      if (resultat.success && resultat.data._tag === 'rafraichi') {
        setWidget(resultat.data.widget)
      }
    })
  }, [synchroniserAuChargement, widgetInitial])

  if (widget._tag === 'masque') {
    return null
  }

  return (
    <section className="fr-my-6w">
      {widget._tag === 'alerte' ? (
        alerte
      ) : (
        <Compteurs
          donnees={widget.donnees}
          timezone={timezone}
          synchronisationEnCours={synchronisationEnCours}
          liens={liens}
        />
      )}
    </section>
  )
}

export default RdvsAccueil
