import NouvelleFonctionnaliteCard from '@app/web/features/dashboard/nouvelles-fonctionnalites/components/NouvelleFonctionnaliteCard'
import SnoozeNouvelleFonctionnaliteButton from '../../../components/SnoozeNouvelleFonctionnaliteButton'
import TagsDecouvrirButton from './TagsDecouvrirButton'

const tagsFeatureId = 'tags'

const TagsNouvelleFonctionnaliteCard = () => (
  <NouvelleFonctionnaliteCard
    featureId={tagsFeatureId}
    showFrom={new Date('2025-07-15')}
    showUntil={new Date('2025-09-01')}
    featureName={
      <>
        <span className="ri-price-tag-3-line ri-lg fr-mr-1w" aria-hidden />
        Nouveauté : les tags
      </>
    }
    illustration={
      <img
        src="/images/fonctionnalites/tags-logo.svg"
        alt=""
        style={{ width: 64, textAlign: 'center', margin: '0 auto' }}
      />
    }
    action={
      <div>
        <TagsDecouvrirButton />
        <SnoozeNouvelleFonctionnaliteButton
          className="fr-ml-2v"
          featureId={tagsFeatureId}
        />
      </div>
    }
  >
    <p className="fr-mb-0 fr-text--medium">
      Suivez des thématiques spécifiques, dispositifs locaux&hellip;
      <br />
      grâce aux tags&nbsp;!
    </p>
  </NouvelleFonctionnaliteCard>
)

export default TagsNouvelleFonctionnaliteCard
