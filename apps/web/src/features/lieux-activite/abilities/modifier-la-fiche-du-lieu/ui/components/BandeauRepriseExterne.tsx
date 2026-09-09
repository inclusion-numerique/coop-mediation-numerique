import { formatDate } from '@app/web/utils/formatDate'
import Notice from '@codegouvfr/react-dsfr/Notice'
import type { FicheAffichee } from '../fiche-du-lieu.presenter'
import {
  BoutonDesDifferences,
  ModaleDesDifferences,
} from './ModaleDesDifferences'

/**
 * Prévient le médiateur qu'un autre producteur a repris sa fiche après lui.
 *
 * Sans lui, l'écran annonce une mise à jour dont ni la date ni les valeurs ne
 * sont les siennes, et rien ne le lui dit : il croit relire ce qu'il a saisi.
 *
 * Le bouton n'apparaît que s'il y a quelque chose à arbitrer : une source peut
 * avoir horodaté un moissonnage sans rien changer, et proposer alors de
 * « voir les différences » mènerait à une modale vide.
 *
 * Rare, et c'est voulu : 29 lieux sur 12 765 aujourd'hui. Un bandeau qui
 * s'afficherait partout ne serait plus lu nulle part.
 */
export const BandeauRepriseExterne = ({
  lieuId,
  reprise,
}: {
  lieuId: string
  reprise: NonNullable<FicheAffichee['repriseExterne']>
}) => (
  <>
    <Notice
      className="fr-notice--flex fr-notice--titre-pleine-largeur fr-align-items-center fr-mb-4v"
      // `fr-notice--flex` fait du titre un conteneur flex, `fr-align-items-center`
      // y centre l'icône — son `::before` — et `fr-notice--titre-pleine-largeur`
      // étire le paragraphe que react-dsfr interpose, sans quoi le titre ne fait
      // que la largeur de son texte et le bouton n'a nulle part où s'écarter.
      title={
        <>
          <span className="fr-flex-grow-1 fr-text--left fr-text--regular fr-text-default--grey">
            <b>{reprise.source}</b>
            {/* La phrase tient dans une seule expression : le titre est un
                conteneur flex, où une chaîne laissée au fil du JSX perd son
                espace de tête. */}
            {` a modifié cette fiche le ${formatDate(reprise.le, 'dd.MM.yyyy')}.`}
          </span>
          {reprise.differences.length > 0 && <BoutonDesDifferences />}
        </>
      }
    />
    {reprise.differences.length > 0 && (
      <ModaleDesDifferences lieuId={lieuId} differences={reprise.differences} />
    )}
  </>
)
