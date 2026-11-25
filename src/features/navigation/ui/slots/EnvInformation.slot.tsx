import {
  branche,
  chromaticAppId,
  estDev,
  estPreview,
  mainLiveUrl,
  projectTitle,
  repositoryUrl,
} from '@/configuration/projet'

export const EnvInformation = () => {
  // Only display something on preview env and dev env
  if (!estPreview() && !estDev()) {
    return null
  }

  const prLink = `${repositoryUrl()}/pulls?q=${encodeURIComponent(
    `is:pr head:${branche()}`,
  )}`

  const storybookLink = `https://${branche().replaceAll('/', '-')}--${chromaticAppId}.chromatic.com`

  return (
    <div id="environment-information" className="fr-notice fr-notice--info">
      <div className="fr-container">
        <div className="fr-notice__body">
          <p className="fr-notice__title">
            Ceci est la version &#34;{branche()}&#34; de {projectTitle()}{' '}
            présentant des données de démonstration.
          </p>
          <p className="fr-text--sm">
            <a
              href={prLink}
              className="fr-mr-2w"
              rel="noreferrer"
              target="_blank"
            >
              <span className="fr-icon--sm fr-icon-github-fill" aria-hidden />{' '}
              PR &#34;
              {branche()}&#34; sur Github
            </a>
            <br className="fr-hidden-lg fr-mt-2v" />
            <a
              href={storybookLink}
              className="fr-mr-2w"
              rel="noreferrer"
              target="_blank"
            >
              <span className="fr-icon--sm  fr-icon-image-line" aria-hidden />{' '}
              Composants &#34;
              {branche()}&#34; sur Storybook
            </a>
            <br className="fr-hidden-lg fr-mt-2v" />
            <a href={mainLiveUrl()} target="_blank" rel="noreferrer">
              <span className="fr-icon--sm fr-icon-france-line" aria-hidden />{' '}
              Version officielle
            </a>
            <br className="fr-hidden-lg fr-mt-2v" />
          </p>
        </div>
      </div>
    </div>
  )
}
