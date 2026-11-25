import Link from 'next/link'
import { contactEmail, projectTitle } from '@/configuration/projet'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { Breadcrumbs } from '@/libraries/ui/components'

export const MentionsLegalesPage = () => (
  <div className="fr-container">
    <SkipLinksPortal />
    <Breadcrumbs currentPage="Mentions légales" />
    <main
      id={contentId}
      className="fr-container landing-main-container fr-my-8w"
    >
      <h1>Mentions légales</h1>
      <h2>Éditeur de la plateforme</h2>
      <p>
        <strong>{projectTitle}</strong> est édité au sein de l’Incubateur des
        Territoires de l’Agence nationale de la cohésion des territoires (ANCT)
        située :
      </p>
      <p>
        20 avenue de Ségur <br />
        75007 Paris <br />
        France <br />
        <br />
        Téléphone : 01 85 58 60 00
      </p>
      <h2>Directeur de la publication</h2>
      <p>
        Le directeur de publication est Henri Prevost, Directeur général de
        l’ANCT
      </p>

      <h2>Hébergement de la plateforme</h2>
      <p>La plateforme est hébergée par :</p>
      <p>
        Scaleway SAS <br />8 rue de la Ville l’Evêque <br />
        75008 Paris <br />
        France <br />
        <br />
        Téléphone : 01 84 13 00 00
      </p>
      <h2>Accessibilité</h2>
      <p>
        La conformité aux normes d’accessibilité numérique est un objectif
        ultérieur mais nous tâchons de rendre ce site accessible à toutes et à
        tous.
      </p>
      <h2>En savoir plus</h2>
      <p>
        Pour en savoir plus sur la politique d’accessibilité numérique de l’État
        : <br />
        <Link
          href="http://references.modernisation.gouv.fr/accessibilite-numerique"
          target="_blank"
          rel="noreferrer"
        >
          Cliquez ici
        </Link>
      </p>
      <h2>Signaler un dysfonctionnement</h2>
      <p>
        Si vous rencontrez un défaut d’accessibilité vous empêchant d’accéder à
        un contenu ou une fonctionnalité du site, merci de nous en faire part:{' '}
        <a href={contactEmail && `mailto:${contactEmail}`}>{contactEmail}</a>
      </p>
      <p>
        Si vous n’obtenez pas de réponse rapide de notre part, vous êtes en
        droit de faire parvenir vos doléances ou une demande de saisine au
        Défenseur des droits.
      </p>

      <h2>Sécurité</h2>
      <p>
        Le site est protégé par un certificat électronique, matérialisé pour la
        grande majorité des navigateurs par un cadenas. Cette protection
        participe à la confidentialité des échanges.
      </p>
      <p>
        En aucun cas les services associés à la plateforme ne seront à l’origine
        d’envoi d&lsquo;email pour demander la saisie d’informations
        personnelles.
      </p>
    </main>
  </div>
)
