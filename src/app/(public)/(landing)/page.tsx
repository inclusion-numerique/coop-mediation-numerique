import { redirect } from 'next/navigation'
import { getHomepage } from '@/features/authentification/domain/getHomepage'
import { getSessionUser } from '@/features/authentification/implementation/session/getSessionUser'
import { isUserInscriptionEnCours } from '@/features/inscription/domain/isUserInscriptionEnCours'
import { Contexte } from '@/features/vitrine/abilities/presenter-la-coop/ui/components/Contexte'
import { Faq } from '@/features/vitrine/abilities/presenter-la-coop/ui/components/Faq'
import { Fonctionnalites } from '@/features/vitrine/abilities/presenter-la-coop/ui/components/Fonctionnalites'
import { Hero } from '@/features/vitrine/abilities/presenter-la-coop/ui/components/Hero'
import { Impact } from '@/features/vitrine/abilities/presenter-la-coop/ui/components/Impact'
import { Outils } from '@/features/vitrine/abilities/presenter-la-coop/ui/components/Outils'
import { QuiSommesNous } from '@/features/vitrine/abilities/presenter-la-coop/ui/components/QuiSommesNous'
import { Solution } from '@/features/vitrine/abilities/presenter-la-coop/ui/components/Solution'
import Webinaire from '@/features/vitrine/abilities/presenter-la-coop/ui/components/Webinaire'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'

const LandingPage = async () => {
  // Redirect to custom homepage if user is logged in
  const user = await getSessionUser()
  if (user && !isUserInscriptionEnCours(user)) {
    redirect(getHomepage(user))
    return null
  }

  return (
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
          <Outils />
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
}

export default LandingPage
