import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import Link from 'next/link'
import React from 'react'

export const Support = () => (
  <>
    <div className="fr-flex-1">
      <h2 className="fr-mb-1w fr-text--uppercase fr-flex fr-flex-gap-3v fr-text--md fr-align-items-center">
        <span className="ri-video-chat-line ri-xl fr-text--light" aria-hidden />
        <span className="fr-text--xs fr-mb-0">
          Participez au prochain webinaire
        </span>
      </h2>
      <p className="fr-text--sm fr-mt-4v fr-mb-6v">
        Nous organisons régulièrement des présentations de l’outil & des
        prochaines évolutions.
      </p>
      <Link
        href="https://tally.so/r/nWDMXv"
        target="_blank"
        rel="noreferrer"
        title="Accéder à l'inscription au prochain webinaire - nouvelle fenêtre"
        className="fr-btn"
      >
        S’inscrire au prochain webinaire
      </Link>
    </div>
    <div className="fr-border-right fr-border--blue-france fr-mx-md-6v" />
    <div className="fr-border-bottom fr-border--blue-france fr-my-8v fr-hidden-xl" />
    <div className="fr-flex-1">
      <h2 className="fr-mb-1w fr-text--uppercase fr-flex fr-flex-gap-3v fr-text--md fr-align-items-center">
        <span
          className="ri-question-answer-line ri-xl fr-text--light"
          aria-hidden
        />
        <span className="fr-text--xs fr-mb-0">Contactez le support</span>
      </h2>
      <p className="fr-text--sm fr-my-2w">
        En cas de problèmes rencontrés sur la plateforme (ex&nbsp;: bugs,
        problème de sécurité), n’hésitez pas à nous contacter&nbsp;:
      </p>
      <div className="fr-text-label--blue-france fr-flex fr-flex-gap-2v fr-align-items-center fr-mb-0">
        <span className="ri-mail-line fr-text--light" aria-hidden />
        <Link href={`mailto:${PublicWebAppConfig.contactEmail}`}>
          {PublicWebAppConfig.contactEmail}
        </Link>
      </div>
    </div>
  </>
)
