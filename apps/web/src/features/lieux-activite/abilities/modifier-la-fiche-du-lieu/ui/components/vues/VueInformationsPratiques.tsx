import Link from 'next/link'
import { HorairesDOuverture } from './HorairesDOuverture'

export const VueInformationsPratiques = ({
  sitesWeb,
  ficheAccesLibre,
  priseRdv,
  horaires,
}: {
  /**
   * Le schéma national autorise plusieurs sites, joints par « | » en base. Les
   * afficher comme un seul lien produisait une URL qui ne menait nulle part.
   */
  sitesWeb: readonly string[]
  ficheAccesLibre?: string | null
  priseRdv?: string | null
  horaires?: string | null
}) => (
  <div className="fr-flex fr-direction-column fr-flex-gap-6v">
    <div>
      <span className="fr-text-mention--grey">Site internet du lieu</span>
      {/*
        La colonne empile les sites ; sans `align-items: start`, ses enfants
        s'étirent sur toute la largeur et le lien devient souligné — et
        cliquable — jusqu'au bord.
      */}
      <div
        className="fr-flex fr-direction-column fr-align-items-start"
        data-testid="informations-pratiques-site-web"
      >
        {sitesWeb.length > 0 ? (
          sitesWeb.map((site) => (
            <Link
              key={site}
              className="fr-link"
              href={site}
              target="_blank"
              rel="noreferrer"
            >
              {site}
            </Link>
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
          <Link
            className="fr-link"
            href={ficheAccesLibre}
            target="_blank"
            rel="noreferrer"
          >
            Retrouvez les informations d’accessibilité via ce lien
          </Link>
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
          <Link
            className="fr-link"
            href={priseRdv}
            target="_blank"
            rel="noreferrer"
          >
            Prenez rendez-vous en ligne via ce lien
          </Link>
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
