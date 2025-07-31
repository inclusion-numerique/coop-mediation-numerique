import { getSessionUser } from '@app/web/auth/getSessionUser'
import { isUserInscriptionEnCours } from '@app/web/auth/isUserInscriptionEnCours'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { getHomepage } from '@app/web/security/getHomepage'
import { contentId } from '@app/web/utils/skipLinks'
import { redirect } from 'next/navigation'
import { Contexte } from './_components/Contexte'
import { Faq } from './_components/Faq'
import { Fonctionnalites } from './_components/Fonctionnalites'
import { Hero } from './_components/Hero'
import { Outils } from './_components/Outils'
import { QuiSommesNous } from './_components/QuiSommesNous'
import { Solution } from './_components/Solution'
import Webinaire from './_components/Webinaire'

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
