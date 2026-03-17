import {
  modaliteAccompagnementIcons,
  modaliteAccompagnementLabels,
} from '@app/web/features/structures/modaliteAccompagnement'
import { serviceLabels } from '@app/web/features/structures/service'
import type { ModaliteAccompagnement, Service } from '@prisma/client'

export const ServicesEtAccompagnementView = ({
  services = [],
  modalitesAccompagnement = [],
}: {
  services?: Service[]
  modalitesAccompagnement?: ModaliteAccompagnement[]
}) => (
  <div className="fr-flex fr-direction-column fr-flex-gap-4v">
    <div data-testid="services-et-accompagnement-services">
      <div className="fr-mb-3v">
        Thématiques des services d’inclusion numérique
        <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
          Renseignez ici les services proposés dans ce lieu.
        </p>
      </div>
      {services.length > 0 ? (
        <ul>
          {services.map((service) => (
            <li key={service}>{serviceLabels[service]}</li>
          ))}
        </ul>
      ) : (
        <div className="fr-text--medium">Non renseigné</div>
      )}
    </div>
    <div data-testid="services-et-accompagnement-modalite-accompagnements">
      <div className="fr-mb-3v">Types d’accompagnements proposés</div>
      {modalitesAccompagnement.length > 0 ? (
        <ul className="fr-list-group fr-flex fr-flex-wrap fr-flex-gap-3v">
          {modalitesAccompagnement.map((modaliteAccompagnement) => {
            const Icon = modaliteAccompagnementIcons[modaliteAccompagnement]
            return (
              <li
                key={modaliteAccompagnement}
                className="fr-background-alt--blue-france fr-pr-6v fr-py-2v fr-border-radius--8 fr-text--nowrap fr-flex fr-align-items-center"
              >
                <span className="fr-flex fr-px-4v">
                  <Icon width={32} height={32} />
                </span>
                {modaliteAccompagnementLabels[modaliteAccompagnement]}
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="fr-text--medium">Non renseigné</div>
      )}
    </div>
  </div>
)
