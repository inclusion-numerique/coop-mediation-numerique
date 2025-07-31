import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'

export const EnvInformation = () => {
  const {
    isPreview,
    isDev,
    Chromatic: chromatic,
    Branch: branch,
    projectTitle,
    repository,
    mainLiveUrl,
  } = PublicWebAppConfig

  // Only display something on preview env and dev env
  if (!isPreview && !isDev) {
    return null
  }

  const prLink = `${repository}/pulls?q=${encodeURIComponent(
    `is:pr head:${branch}`,
  )}`

  const storybookLink = `https://${branch.replaceAll('/', '-')}--${chromatic.appId}.chromatic.com`

  return (
    <div id="environment-information" className="fr-notice fr-notice--info">
      <div className="fr-container">
        <div className="fr-notice__body">
          <p className="fr-notice__title">
            Ceci est la version &#34;{branch}&#34; de {projectTitle} présentant
            des données de démonstration.
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
              {branch}&#34; sur Github
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
              {branch}&#34; sur Storybook
            </a>
            <br className="fr-hidden-lg fr-mt-2v" />
            <a href={mainLiveUrl} target="_blank">
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
