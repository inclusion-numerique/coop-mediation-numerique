import Breadcrumbs from '@app/web/components/Breadcrumbs'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId, defaultSkipLinks } from '@app/web/utils/skipLinks'
import React from 'react'
import { Accompagnements } from './components/page-sections/Accompagnements'
import { Beneficiaires } from './components/page-sections/Beneficiaires'
import { ChiffresCles } from './components/page-sections/ChiffresCles'
import { Impact } from './components/page-sections/Impact'
import { UtilisateursActifs } from './components/page-sections/UtilisateursActifs'
import { getMesStatistiquesPageData } from './getMesStatistiquesPageData'

export const StatistiquesPage = async () => {
  const {
    chiffresCles,
    accompagnements,
    beneficiaires,
    suiviBeneficiaires,
    utilisateursActifs,
  } = await getMesStatistiquesPageData()

  return (
    <div className="fr-container">
      <SkipLinksPortal links={defaultSkipLinks} />
      <Breadcrumbs currentPage="Statistiques" />
      <main id={contentId} className="fr-mt-12v fr-mb-30v">
        <h1 className="fr-text-title--blue-france">Statistiques</h1>
        <section className="fr-my-12v">
          <ChiffresCles {...chiffresCles} />
          <Accompagnements accompagnements={accompagnements} />
        </section>
        <hr className="fr-separator-12v" />
        <section>
          <Impact />
        </section>
        <hr className="fr-separator-12v" />
        <section>
          <Beneficiaires
            beneficiaires={beneficiaires}
            {...suiviBeneficiaires}
          />
        </section>
        <hr className="fr-separator-12v" />
        <section>
          <UtilisateursActifs utilisateursActifs={utilisateursActifs} />
        </section>
      </main>
    </div>
  )
}
