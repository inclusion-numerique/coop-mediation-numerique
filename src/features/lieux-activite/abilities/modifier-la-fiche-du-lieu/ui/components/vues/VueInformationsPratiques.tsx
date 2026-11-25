import { HorairesDOuverture } from './HorairesDOuverture'

export const VueInformationsPratiques = ({
  sitesWeb,
  ficheAccesLibre,
  priseRdv,
  horaires,
}: {
  sitesWeb: readonly string[]
  ficheAccesLibre?: string | null
  priseRdv?: string | null
  horaires?: string | null
}) => (
  <div className="fr-flex fr-direction-column fr-flex-gap-6v">
    <div>
      <span className="fr-text-mention--grey">Site internet du lieu</span>
      <div
        className="fr-flex fr-direction-column fr-align-items-start"
        data-testid="informations-pratiques-site-web"
      >
        {sitesWeb.length > 0 ? (
          sitesWeb.map((site) => (
            <div key={site}>
              <a
                className="fr-link"
                href={site}
                target="_blank"
                rel="noreferrer"
              >
                {site}
              </a>
            </div>
          ))
        ) : (
          <span className="fr-text--medium">Non renseigné</span>
        )}
      </div>
    </div>
    <div>
      <span className="fr-text-mention--grey">Accessibilité</span>
      <div data-testid="informations-pratiques-accessibilite">
        {ficheAccesLibre ? (
          <a
            className="fr-link"
            href={ficheAccesLibre}
            target="_blank"
            rel="noreferrer"
          >
            Retrouvez les informations d’accessibilité via ce lien
          </a>
        ) : (
          <span className="fr-text--medium">Non renseignée</span>
        )}
      </div>
    </div>
    <div>
      <span className="fr-text-mention--grey">
        Prise de rendez-vous en ligne{' '}
      </span>
      <div data-testid="informations-pratiques-prise-rdv">
        {priseRdv ? (
          <a
            className="fr-link"
            href={priseRdv}
            target="_blank"
            rel="noreferrer"
          >
            Prenez rendez-vous en ligne via ce lien
          </a>
        ) : (
          <span className="fr-text--medium">Non renseignée</span>
        )}
      </div>
    </div>
    <div>
      <span className="fr-text-mention--grey">
        Horaires d'ouverture du lieu
      </span>
      <div data-testid="informations-pratiques-horaires">
        {horaires ? (
          <HorairesDOuverture className="fr-mt-1w" horaires={horaires} />
        ) : (
          <div className="fr-text--medium">Non renseigné</div>
        )}
      </div>
    </div>
  </div>
)
