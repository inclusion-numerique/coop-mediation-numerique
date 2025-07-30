import NouvelleFonctionnaliteCard from '@app/web/features/dashboard/nouvelles-fonctionnalites/components/NouvelleFonctionnaliteCard'
import SnoozeNouvelleFonctionnaliteButton from '../../../components/SnoozeNouvelleFonctionnaliteButton'
import CafeIaDecouvrirButton from './TagsDecouvrirButton'

const tagsFeatureId = 'tags'

const TagsNouvelleFonctionnaliteCard = () => (
  <NouvelleFonctionnaliteCard
    featureId={tagsFeatureId}
    showFrom={new Date('2025-07-15')}
    showUntil={new Date('2025-09-01')}
    featureName={
      <>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.26979 1.40015L13.8695 2.34295L14.8123 8.94265L8.68399 15.0708C8.42366 15.3312 8.00159 15.3312 7.74119 15.0708L1.14155 8.47125C0.881201 8.21085 0.881201 7.78878 1.14155 7.52838L7.26979 1.40015ZM7.74119 2.81436L2.55577 7.99978L8.21259 13.6566L13.3981 8.47125L12.691 3.52147L7.74119 2.81436ZM9.15546 7.05698C8.63473 6.5363 8.63473 5.69208 9.15546 5.17138C9.67613 4.65069 10.5203 4.65069 11.0411 5.17138C11.5617 5.69208 11.5617 6.5363 11.0411 7.05698C10.5203 7.57771 9.67613 7.57771 9.15546 7.05698Z"
            fill="#716043"
          />
        </svg>
        <span className="fr-ml-2v">Nouveauté : les tags</span>
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
        <CafeIaDecouvrirButton />
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
