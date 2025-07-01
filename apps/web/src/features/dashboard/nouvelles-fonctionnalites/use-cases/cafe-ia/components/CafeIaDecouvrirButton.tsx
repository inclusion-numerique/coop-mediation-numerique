import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'

const CafeIaDecouvrirModalInstance = createModal({
  id: 'cafe-ia-decouvrir',
  isOpenedByDefault: false,
})

const CafeIaDecouvrirButton = () => {
  return (
    <>
      <Button
        type="button"
        priority="secondary"
        size="small"
        {...CafeIaDecouvrirModalInstance.buttonProps}
      >
        Découvrir
      </Button>
      <CafeIaDecouvrirModalInstance.Component
        title="Référencement des conseillers et médiateurs numériques animateurs de Café IA"
        buttons={[
          {
            children: 'Passer',
            doClosesModal: true,
          },
          {
            children: 'Se référencer comme animateur Café IA',
            linkProps: {
              href: 'https://grist.numerique.gouv.fr/o/cnnum/forms/n79FcyYTy4sgYZrhFnDXBH/79',
              target: '_blank',
            },
          },
        ]}
      >
        <img
          src="/images/fonctionnalites/cafe-ia-illustration.jpg"
          style={{ width: '100%' }}
          alt=""
          className="fr-mt-8v fr-mb-12v"
        />
        <h6>☕ Les Cafés IA, c’est quoi&nbsp;?</h6>
        <p>
          Les Cafés IA sont des moments conviviaux{' '}
          <strong>
            d’échange et de partage de connaissances autour de l’intelligence
            artificielle
          </strong>
          . Ils s’adressent à tous les publics, quel que soit le niveau de
          connaissance initial.
        </p>
        <p>
          Déjà près de{' '}
          <strong>10&nbsp;000 personnes ont participé à un Café IA</strong>,
          avec <strong>plusieurs centaines de rencontres organisées</strong> à
          travers la France. De nombreuses{' '}
          <strong>ressources pédagogiques</strong> ont été conçues et partagées
          pour accompagner ces temps d’échange conviviaux et accessibles à tous.
          Toutes les ressources et informations disponibles sont sur le site
          dédié{' '}
          <a href="https://cafeia.org" target="_blank">
            Cafeia.org
          </a>
          .
        </p>
        <h6>🚀 Un outil à la main des conseillers numériques</h6>
        <p>
          Grâce à <strong>leur expertise en médiation numérique</strong>, les
          conseillers numériques sont des acteurs clés pour permettre à la
          population française de discerner le potentiel et les limites de l’IA
          et de construire son propre usage de cette technologie, de manière
          accessible et inclusive. 
        </p>
        <p>
          Depuis mars 2025, les conseillers numériques ont la possibilité
          de&nbsp;:
        </p>
        <ul>
          <li className="fr-mb-6v">
            <strong>Se former</strong> en 17 heures (en présentiel ou à
            distance) pour animer un Café IA. Déjà plus de 850 conseillers
            numériques se sont inscrits&nbsp;!
            <br />👉{' '}
            <a
              href="https://lamednum.coop/formation/#modalites"
              target="_blank"
            >
              Formation conseillers numériques
            </a>
          </li>
          <li className="fr-mb-6v">
            <strong>S’outiller</strong> avec la <strong>Mallette IA</strong>, un
            kit pédagogique complet et modulable.
            <br />👉{' '}
            <a
              href="https://lesbases.anct.gouv.fr/ressources/la-mallette-ia"
              target="_blank"
            >
              La Mallette IA | Les Bases du numérique d’intérêt général
            </a>
          </li>
          <li className="fr-mb-6v">
            <strong>Recourir</strong> à l’ensemble des{' '}
            <strong>modules pédagogiques et formats d’animation</strong>{' '}
            disponibles sur le site de Café IA.
            <br />👉{' '}
            <a href="https://cafeia.org" target="_blank">
              Café IA – Informations et ressources au sujet de l'IA
            </a>
          </li>
        </ul>
        <h6>
          📣 A partir d’aujourd’hui, référencez-vous pour être identifié comme
          animateur de Café IA&nbsp;!
        </h6>
        <p>
          Le référencement permettra d’être identifié comme animateur de Café IA
          sur une carte afin d’être mis en relation avec des structures ou
          personnes souhaitant organiser un Café IA. Ce référencement est ouvert
          aux conseillers et médiateurs numériques qui ont suivi la formation
          « Animer un Café IA auprès de ses publics » ou estiment disposer des
          compétences nécessaires pour animer des temps d’échanges collectifs
          sur l’IA, notamment grâce aux nombreuses ressources disponibles sur
          Cafeia.org ou Les Bases.
        </p>
        <p>
          <strong>C’est simple, rapide et utile</strong>&nbsp;: vous devenez
          visible sur votre territoire, tout en affirmant votre engagement pour
          une appropriation citoyenne des enjeux relatifs à l’IA. 
        </p>
        <p>
          📧 Une question&nbsp;? Contactez l’équipe Café IA à{' '}
          <a href="mailto:bonjour@cafeia.org">bonjour@cafeia.org</a>
        </p>
        <p>
          📝 Vous avez utilisé la Mallette IA&nbsp;? Donnez-nous votre
          avis&nbsp;! 👉{' '}
          <a
            href="https://airtable.com/appSDjGTJXw9k2EXW/pagZlrjOK5PtFRh6W/form"
            target="_blank"
          >
            Vos retours sur la Mallette IA
          </a>
        </p>
      </CafeIaDecouvrirModalInstance.Component>
    </>
  )
}

export default CafeIaDecouvrirButton
