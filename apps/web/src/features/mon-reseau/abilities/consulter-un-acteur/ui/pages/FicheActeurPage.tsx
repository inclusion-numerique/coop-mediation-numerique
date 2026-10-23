import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import Contract from '@app/web/components/conseiller-numerique/Contract'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import type { Departement } from '@app/web/libraries/departement'
import { contentId } from '@app/web/utils/skipLinks'
import type { ReactNode } from 'react'
import { filDArianeDuReseau } from '../../../../ui/fil-d-ariane'
import { hrefDesActeurs } from '../../../../ui/liens'
import type { FicheActeur } from '../../domain'
import { IdentiteDeLActeur } from '../components/IdentiteDeLActeur'
import { StatistiquesDeLActeur } from '../components/StatistiquesDeLActeur'
import {
  actionsDEquipe,
  contratPourLAffichage,
  membreDeLEquipe,
  statutAffiche,
} from '../fiche-acteur.presenter'

export const FicheActeurPage = ({
  fiche: { acteur, profilCreeLe, statut, regard },
  departement,
  employeuse,
  lieux,
  suppressionDesArchives,
}: {
  fiche: FicheActeur
  departement: Departement
  employeuse?: ReactNode
  lieux?: ReactNode
  suppressionDesArchives?: ReactNode
}) => {
  const membre = membreDeLEquipe(regard)
  const mediation = acteur.profil.mediation

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--medium">
        <CoopBreadcrumbs
          parents={[
            ...filDArianeDuReseau(departement.code),
            {
              label: 'Annuaire des acteurs',
              linkProps: { href: hrefDesActeurs(departement.code) },
            },
          ]}
          currentPage={acteur.nomAffiche}
        />
        <main id={contentId} className="fr-mb-16w">
          <section className="fr-mt-8v">
            <IdentiteDeLActeur
              acteur={acteur}
              profilCreeLe={profilCreeLe}
              statut={statutAffiche(statut)}
              actions={actionsDEquipe(regard)}
              coordinateurId={
                regard._tag === 'Coordinateur' ? regard.coordinateurId : null
              }
              retourHref={hrefDesActeurs(departement.code)}
              suppressionDesArchives={suppressionDesArchives}
            />
          </section>
          {membre !== null && mediation !== null && (
            <section className="fr-p-8v fr-border-radius--16 fr-background-alt--brown-caramel">
              <StatistiquesDeLActeur
                mediateurId={mediation.mediateurId}
                statistiques={membre.statistiques}
              />
            </section>
          )}
          {membre?.contrat != null && (
            <section className="fr-mt-6v">
              <Contract
                isCoordinateur={false}
                {...contratPourLAffichage(membre.contrat)}
              />
            </section>
          )}
          {employeuse !== undefined && (
            <section className="fr-mt-6v" id="structure-employeuse">
              {employeuse}
            </section>
          )}
          {lieux !== undefined && (
            <section className="fr-mt-6v" id="lieux-activite">
              {lieux}
            </section>
          )}
        </main>
      </div>
    </>
  )
}
