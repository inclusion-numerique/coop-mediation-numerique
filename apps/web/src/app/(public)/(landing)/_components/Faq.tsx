import Accordion from '@codegouvfr/react-dsfr/Accordion'
import Link from 'next/link'

export const Faq = () => (
  <div className="fr-container fr-container--medium">
    <div className="fr-text--center">
      <h2 className="fr-h1">Questions fréquentes</h2>
      <p className="fr-mb-6w">
        Pour en savoir plus, visitez notre{' '}
        <Link
          className="fr-link"
          target="_blank"
          href="https://docs.numerique.gouv.fr/docs/1cf724be-c40c-4299-906d-df22c181c77b/"
        >
          centre d’aide
        </Link>
        .
      </p>
    </div>
    <div className="fr-accordions-group fr-container--medium fr-mx-auto">
      <Accordion label="Qui peut utiliser La Coop de la médiation numérique ?">
        La Coop de la médiation numérique est à destination des médiateur·rice·s
        numériques professionnel·le·s, conseillers numériques et
        coordinateur.trice.s de conseillers numériques.
      </Accordion>
      <Accordion label="Comment créer mon compte sur La Coop de la médiation numérique ?">
        <p>Pour créer votre compte sur La Coop de la médiation numérique :</p>
        <ol>
          <li>
            Cliquez sur <strong>&quot;Se créer un compte&quot;</strong> en haut
            de cette page.
          </li>
          <li>
            Vous serez redirigé vers ProConnect, le nouveau système
            d’identifiant unique (SSO) de l’État qui vous identifie en tant que
            professionnel·le.
            <Link
              className="fr-link"
              target="_blank"
              href="https://www.proconnect.gouv.fr/"
            >
              En savoir plus sur ProConnect ici
            </Link>
          </li>
          <li>Identifiez-vous avec ProConnect.</li>
          <li>
            Vous serez redirigé vers La Coop de la médiation numérique pour
            finaliser la création de votre compte. Suivez ensuite les étapes
            d&apos;inscription qui varient en fonction de votre intitulé de
            poste (médiateur·rice·s numériques professionnel·le·s, conseillers
            numériques et coordinateur·trice·s de conseillers numériques).
            <Link
              className="fr-link"
              target="_blank"
              href="https://docs.numerique.gouv.fr/docs/126f1452-8fac-4073-a86b-82e8559a1be0/"
            >
              En savoir plus sur les étapes à suivre en fonction de votre poste
            </Link>
          </li>
        </ol>
      </Accordion>
      <Accordion label="Qui utilise les données collectés sur La Coop de la médiation numérique et pourquoi ?">
        <p>
          La Coop de la médiation numérique{' '}
          <strong>collecte et partage des données</strong> à différents acteurs
          de l’inclusion numérique (préfectures, collectivités territoriales,
          hubs, coordinateurs de conseillers numériques...) pour contribuer à la
          compréhension et au déploiement des dispositifs d&apos;inclusion
          numérique sur les territoires, dans le cadre de la feuille de route
          France Numérique Ensemble.
        </p>

        <p>
          Certaines données restent <strong>strictement confidentielles</strong>{' '}
          et limitées à votre usage personnel (notamment les informations
          d’identité sur vos bénéficiaires).{' '}
          <strong>
            Les données partagées avec différents acteurs sont toujours
            anonymisées.
          </strong>
        </p>

        <p>
          Certaines données collectées sont également{' '}
          <strong>des données publiques</strong>, accessibles sur l’Espace
          France numérique Ensemble, dans un souci de transparence avec les
          citoyens.
        </p>

        <p>
          <Link
            className="fr-link"
            href="https://docs.numerique.gouv.fr/docs/c97336c0-2ab3-4137-8d4d-b36f87d941de/"
            target="_blank"
          >
            En savoir plus sur l’utilisation des données sur la Coop de la
            médiation numérique
          </Link>
        </p>
      </Accordion>
      <Accordion label="Pourquoi et comment exporter mes statistiques d’activité ?">
        <ul>
          <li>
            <strong>
              Pour valoriser votre travail auprès de différents partenaires
            </strong>{' '}
            (structure employeuse, lieux d&apos;activités, collectivités...) en
            partageant facilement vos statistiques grâce aux différents options
            d&apos;exports.
          </li>
          <li>
            <strong>
              Pour comprendre et suivre l&apos;évolution de votre activité, de
              vos accompagnements et des bénéficiaires accompagnés.
            </strong>
          </li>
        </ul>
        <p>Comment exporter mes statistiques d’activité ?</p>
        <ul>
          <li>
            Vous pouvez filtrer (par période, lieu d’activité, type
            d’accompagnement et bénéficiaire) vos statistiques pour exporter
            uniquement la partie de vos statistiques qui vous intéresse
          </li>
          <li>Exporter au format tableur et/ou PDF</li>
        </ul>
        <p>
          <Link
            className="fr-link"
            href="https://www.notion.so/incubateurdesterritoires/Mes-statistiques-retrouvez-des-statistiques-sur-votre-activit-ca94359e3696428fab2e4b06969635d8#278b386430ce4e579d1b566b16f0d2fb"
            target="_blank"
          >
            En savoir plus sur l’export des statistiques
          </Link>
        </p>{' '}
      </Accordion>
      <Accordion label="Comment j’accède aux différents outils disponibles sur la plateforme ?">
        <p>
          Nos prochains grands chantiers et évolutions à venir sur la plateforme
          portent notamment sur :
        </p>
        <ul>
          <li>
            Un identifiant unique (ProConnect) pour se connecter aux différents
            outils proposés.
          </li>
          <li>
            L’interopérabilité des différents outils proposés afin d’améliorer
            le partage d’informations entre ces outils pour fluidifier
            l’organisation du travail.
          </li>
        </ul>
        Nous vous tiendrons au courant de nos prochaines avancées sur ces sujets
        via{' '}
        <Link
          className="fr-link"
          href="https://projets.suite.anct.gouv.fr/boards/1572441353164424613"
          target="_blank"
        >
          notre feuille de route publique.
        </Link>
      </Accordion>
    </div>
  </div>
)
