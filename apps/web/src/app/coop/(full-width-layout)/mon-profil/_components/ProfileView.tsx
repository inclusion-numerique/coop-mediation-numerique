import Notice from '@codegouvfr/react-dsfr/Notice'
import Link from 'next/link'

export const ProfileView = ({
  email,
  name,
  phone,
}: {
  email: string
  name?: string | null
  phone?: string | null
}) => (
  <div className="fr-flex fr-direction-column fr-flex-gap-6v">
    <div>
      <span className="fr-text-mention--grey">Prénom Nom</span>
      <div className="fr-text--medium" data-testid="informations-generales-nom">
        {name}
      </div>
    </div>
    <div>
      <span className="fr-text-mention--grey">
        Numéro de téléphone professionnel
      </span>
      <div
        className="fr-text--medium"
        data-testid="informations-generales-complement-adresse"
      >
        {(phone?.length ?? 0) > 0 ? phone : 'Non renseigné'}
      </div>
    </div>
    <div>
      <span className="fr-text-mention--grey">Adresse e-mail</span>
      <div className="fr-text--medium" data-testid="informations-generales-nom">
        {email}
      </div>
    </div>
    <Notice
      className="fr-notice--flex fr-align-items-center"
      title={
        <span className="fr-text--regular fr-text--sm fr-text-default--grey">
          Pour des raisons de sécurité, ProConnect ne propose pas le changement
          d'adresse email. Vous souhaitez changer d’adresse email ?{' '}
          <Link
            className="fr-link fr-text--sm"
            href="https://docs.numerique.gouv.fr/docs/61b72695-b954-4273-9cb4-37cab5d0d407"
            target="_blank"
            rel="noreferrer"
          >
            Consultez notre centre d’aide
          </Link>
        </span>
      }
    />
  </div>
)
