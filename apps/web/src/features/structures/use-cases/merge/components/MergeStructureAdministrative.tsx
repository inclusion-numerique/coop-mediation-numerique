'use client'

import CustomSelectFormField from '@app/ui/components/Form/CustomSelectFormField'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { pluriel } from '@app/web/libraries/pluriel'
import { trpc } from '@app/web/trpc'
import { useRouter } from 'next/navigation'
import { type ReactElement } from 'react'
import { useForm } from 'react-hook-form'

const toLabel = ({
  nom,
  adresse,
  commune,
  codePostal,
  siret,
}: {
  nom: string
  adresse: string
  commune: string
  codePostal: string
  siret: string | null
}) => (
  <>
    <div className="fr-width-full fr-text--sm fr-mb-0">{nom}</div>
    <div className="fr-width-full fr-text--xs fr-text-mention--grey fr-mb-0">
      {siret ? `${siret} · ` : 'Sans SIRET · '}
      {adresse}, {codePostal} {commune}
    </div>
  </>
)

// Étape 1 de la fusion employeuse : rechercher l'employeuse à fusionner (la SOURCE, qui
// sera supprimée) puis naviguer vers l'aperçu. `structure` est la page d'origine = la CIBLE
// conservée — même convention et même combobox que la fusion de lieux.
const MergeStructureAdministrative = ({
  structure,
}: {
  structure: { id: string; nom: string }
}) => {
  const router = useRouter()
  const form = useForm<{ employeuse: string }>()
  const { client: trpcClient } = trpc.useContext()

  const loadOptions = async (search: string) => {
    const result = await trpcClient.structures.searchAdministrative.query({
      query: search,
    })

    const filtered = result.structures.filter((s) => s.id !== structure.id)

    const hasMoreMessage =
      result.moreResults > 0
        ? `Veuillez préciser votre recherche — ${result.moreResults} ${pluriel(
            result.moreResults,
            'employeuse non affichée',
            'employeuses non affichées',
          )}`
        : null

    return [
      {
        label: `${filtered.length} ${pluriel(filtered.length, 'résultat', 'résultats')}`,
        value: '',
      },
      ...filtered.map((s) => ({ label: toLabel(s), value: s.id })),
      ...(hasMoreMessage ? [{ label: hasMoreMessage, value: '' }] : []),
    ] as { label: ReactElement; value: string }[]
  }

  return (
    <div className="fr-border-radius--8 fr-border fr-p-8v fr-mb-6v">
      <h2 className="fr-h6">
        Rechercher la structure employeuse avec laquelle fusionner
      </h2>
      <p className="fr-text--sm fr-text-mention--grey fr-mb-2v">
        L’employeuse sélectionnée sera supprimée et ses données rattachées à{' '}
        <strong>{structure.nom}</strong>.
      </p>
      <CustomSelectFormField
        label={null}
        control={form.control}
        path="employeuse"
        placeholder="Rechercher une employeuse (nom, SIRET, adresse, commune)…"
        loadOptions={loadOptions}
        isOptionDisabled={(option) => option.value === ''}
        onChange={(option) => {
          if (option == null || option.value === '') return
          router.push(
            `/administration/structures-employeuses/${structure.id}/merge/${option.value}`,
          )
        }}
      />
    </div>
  )
}

export default withTrpc(MergeStructureAdministrative)
