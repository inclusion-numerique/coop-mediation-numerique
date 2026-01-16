'use client'

import type { RoleFiltre } from '@app/web/equipe/EquipeListePage/searchMediateursCoordonneBy'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter, useSearchParams } from 'next/navigation'
import { Actifs } from './Actifs'
import { Archives } from './Archives'
import { Inactifs } from './Inactifs'
import { InvitationsEnvoyees } from './InvitationsEnvoyees'
import { RoleFilter } from './RoleFilter'

export const FiltresEquipe = ({
  actifs,
  inactifs,
  invitations,
  archives,
  defaultRole,
}: {
  actifs: number
  inactifs: number
  invitations: number
  archives: number
  defaultRole?: RoleFiltre
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const hasStatutFilter = searchParams.has('statut')
  const hasRoleFilter = searchParams.has('role')
  const hasFilters = hasStatutFilter || hasRoleFilter

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('statut')
    params.delete('role')
    params.delete('page')
    router.replace(`?${params}`, { scroll: false })
  }

  return (
    <div className="fr-py-3v fr-flex fr-flex-gap-2v fr-justify-content-space-between fr-align-items-center">
      <div className="fr-flex fr-flex-gap-2v">
        <Actifs count={actifs} />
        <Inactifs count={inactifs} />
        <InvitationsEnvoyees count={invitations} />
        <Archives count={archives} />
        <RoleFilter defaultValue={defaultRole} />
      </div>
      {hasFilters && (
        <Button
          type="button"
          priority="tertiary no outline"
          onClick={handleClearFilters}
        >
          <span className="ri-close-circle-line" aria-hidden />
          &nbsp;Effacer les filtres
        </Button>
      )}
    </div>
  )
}
