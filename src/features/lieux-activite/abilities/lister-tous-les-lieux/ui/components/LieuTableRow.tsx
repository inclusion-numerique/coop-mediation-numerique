import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import classNames from 'classnames'
import Link from 'next/link'
import { hrefDeModificationDuLieu } from '@/features/lieux-activite/ui/presenters/href-du-lieu.presenter'
import { lienDuLieuDansLaCartographie } from '@/features/lieux-activite/ui/presenters/liens-de-la-cartographie.presenter'
import { dateAsDayAndTime } from '@/libraries/date/date-as-day-and-time'
import { optionalNumberToString } from '@/libraries/nombre/format-number'
import type { LigneDeLaListe } from '../../domain/ligne-de-la-liste'

const estUnLieuDActivite = ({ _count }: LigneDeLaListe) =>
  _count.mediateursEnActivite > 0 || _count.activites > 0

const VisibiliteCarto = ({
  visiblePourCartographieNationale,
  structureCartographieNationaleId,
}: LigneDeLaListe) =>
  !visiblePourCartographieNationale ? (
    <Badge small severity="warning">
      Non partagé
    </Badge>
  ) : !structureCartographieNationaleId ? (
    <Badge small severity="info">
      En cours d'ajout
    </Badge>
  ) : (
    <div className="fr-flex fr-direction-column fr-flex-gap-2v fr-position-relative">
      <Badge small severity="success">
        Visible
      </Badge>
      <Button
        size="small"
        style={{ position: 'relative', zIndex: 10 }}
        priority="tertiary"
        linkProps={{
          href: lienDuLieuDansLaCartographie({
            structureCartographieNationaleId,
          }),
          target: '_blank',
          rel: 'noreferrer',
        }}
      >
        Voir sur la carto
      </Button>
    </div>
  )

export const LieuTableRow = ({ ligne }: { ligne: LigneDeLaListe }) => (
  <tr className={classNames('fr-enlarge-link', 'fr-table-row--link')}>
    <td className="fr-cell--data">{ligne.nom}</td>
    <td className="fr-cell--data">
      <div className="fr-flex fr-flex-gap-2v">
        {estUnLieuDActivite(ligne) && <Tag small>Lieu d'activité</Tag>}
      </div>
    </td>
    <td className="fr-cell--data">
      <div>
        <div className="fr-text--sm fr-mb-0">{ligne.adresse}</div>
        <div className="fr-text--xs fr-text-mention--grey fr-mb-0">
          {ligne.codePostal} {ligne.commune}
        </div>
        {ligne.adresseAPreciser && (
          <Badge small severity="warning" className="fr-mt-1v">
            Adresse à préciser
          </Badge>
        )}
      </div>
    </td>
    <td className="fr-cell--data">{ligne.siret}</td>
    <td className="fr-cell--data">
      {ligne.typologies.length > 0 ? ligne.typologies.join(', ') : null}
    </td>
    <td className="fr-cell--data" style={{ minWidth: 150 }}>
      <VisibiliteCarto {...ligne} />
    </td>
    <td className="fr-cell--data">{dateAsDayAndTime(ligne.creation)}</td>
    <td className="fr-cell--data">{dateAsDayAndTime(ligne.modification)}</td>
    <td className="fr-cell--data">
      {optionalNumberToString(ligne._count.mediateursEnActivite, null)}
    </td>
    <td className="fr-p-0">
      <Link href={hrefDeModificationDuLieu(ligne.id)}>
        <span className="fr-sr-only">Modifier le lieu {ligne.nom}</span>
      </Link>
    </td>
  </tr>
)
