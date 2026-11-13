import { pluriel } from '@app/web/libraries/pluriel'
import Badge from '@codegouvfr/react-dsfr/Badge'

export type StatutDuCompteur = 'unknown' | 'past'

const APPARENCE: Readonly<
  Record<
    StatutDuCompteur,
    {
      readonly severite: 'new' | 'info'
      readonly libelle: (nombre: number) => string
    }
  >
> = {
  unknown: { severite: 'new', libelle: () => 'à venir' },
  past: {
    severite: 'info',
    libelle: (nombre) => pluriel(nombre, 'passé', 'passés'),
  },
}

export const BadgeDuCompteur = ({
  statut,
  nombre,
  className,
}: {
  statut: StatutDuCompteur
  nombre: number
  className?: string
}) => (
  <Badge small severity={APPARENCE[statut].severite} className={className}>
    {`Rdv ${APPARENCE[statut].libelle(nombre)}`}
  </Badge>
)
