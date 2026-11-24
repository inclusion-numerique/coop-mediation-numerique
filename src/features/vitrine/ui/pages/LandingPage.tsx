import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'
import { Contexte } from '../components/Contexte'
import { Faq } from '../components/Faq'
import { Fonctionnalites } from '../components/Fonctionnalites'
import { Hero } from '../components/Hero'
import { Impact } from '../components/Impact'
import { Outils } from '../components/Outils'
import { QuiSommesNous } from '../components/QuiSommesNous'
import { Solution } from '../components/Solution'
import Webinaire from '../components/Webinaire'

export const LandingPage = ({
  lienRdvServicePublic,
}: {
  lienRdvServicePublic: string
}) => (
  <>
    <SkipLinksPortal />
    <main id={contentId} className="fr-container--fluid">
      <section className="fr-background-alt--brown-caramel-950 fr-py-md-12w fr-py-6w">
        <Hero />
      </section>
      <section className="fr-pt-md-11w fr-pb-md-15w fr-py-8w">
        <Fonctionnalites />
      </section>
      <section className="fr-background-alt--blue-france fr-py-md-15w fr-py-8w">
        <Solution />
      </section>
      <section className="fr-pt-md-11w fr-pb-md-15w fr-py-8w">
        <Contexte />
      </section>
      <section className="fr-background-alt--brown-caramel-950 fr-pt-md-11w fr-pb-md-15w fr-py-8w">
        <Outils lienRdvServicePublic={lienRdvServicePublic} />
      </section>
      <section className="fr-pt-md-15w fr-pt-8w">
        <Impact />
      </section>
      <section className="fr-py-md-15w fr-py-8w">
        <Faq />
      </section>
      <section className="fr-background-alt--blue-france fr-pt-md-11w fr-pb-md-15w fr-py-8w">
        <QuiSommesNous />
      </section>
      <section>
        <Webinaire />
      </section>
    </main>
  </>
)
