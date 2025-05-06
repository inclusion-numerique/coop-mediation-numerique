'use client'

import CustomSelectFormField from '@app/ui/components/Form/CustomSelectFormField'
import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { SearchUserResult } from '@app/web/features/utilisateurs/use-cases/search/searchUser'
import { trpc } from '@app/web/trpc'
import { ReactElement, useRef } from 'react'
import { useForm } from 'react-hook-form'

const toLabel = ({ name, email }: { name: string | null; email: string }) => (
  <>
    <div className="fr-width-full fr-text--sm fr-mb-0">{name ?? email}</div>
    {name && (
      <div className="fr-width-full fr-text--xs fr-text-mention--grey fr-mb-0">
        {email}
      </div>
    )}
  </>
)

const AdministrationSearchSingleUtilisateur = ({
  excludeUserIds = [],
  defaultUser,
  onSelect,
}: {
  excludeUserIds?: string[]
  defaultUser?: { name: string | null; id: string; email: string }
  onSelect?: (option: { label: ReactElement; value: string }) => void
}) => {
  const form = useForm<{ utilisateur: string }>()

  const { client: trpcClient } = trpc.useContext()

  const utilisateursMapRef = useRef(new Map<string, SearchUserResult>())

  const loadOptions = async (search: string) => {
    const result = await trpcClient.user.search.query({
      query: search,
    })

    for (const user of result.users) {
      utilisateursMapRef.current.set(user.id, result)
    }

    return [
      {
        label: `${result.matchesCount} résultat${sPluriel(result.matchesCount)}`,
        value: '',
      },
      ...result.users
        .filter((user: { id: string }) => !excludeUserIds.includes(user.id))
        .map((user: { id: string; name: string | null; email: string }) => ({
          label: toLabel(user),
          value: user.id,
        })),
    ] as {
      label: ReactElement
      value: string
    }[]
  }

  return (
    <CustomSelectFormField
      label={null}
      control={form.control}
      path="utilisateur"
      placeholder="Rechercher"
      loadOptions={loadOptions}
      defaultValue={
        defaultUser == null
          ? undefined
          : { label: toLabel(defaultUser), value: defaultUser.id }
      }
      isOptionDisabled={(option) => option.value === ''}
      cacheOptions
      onChange={(option) => {
        if (option == null || option.value === '') return
        onSelect?.(option)
      }}
    />
  )
}

export default withTrpc(AdministrationSearchSingleUtilisateur)
