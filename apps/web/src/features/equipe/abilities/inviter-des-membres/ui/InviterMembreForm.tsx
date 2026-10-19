'use client'

import CustomSelectFormField from '@app/ui/components/Form/CustomSelectFormField'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { useMediateursSearch } from '@app/web/hooks/useMediateurSearch'
import { inject } from '@app/web/libs/injection/client'
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { INVITER_DES_MEMBRES_ACTION_KEY } from '../action/inviter-des-membres.key'
import { FormatOptionLabel } from './FormatOptionLabel'
import {
  type InviterMembreData,
  type InviterMembreInput,
  InviterMembreValidation,
} from './inviter-membre.form'
import type { MediateurToAddOption } from './MediateurToAddOption'

const EMAIL_REGEXP =
  /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/

const toEmail = ({ email }: { email: string }) => email

const isEmail = (email: string) => EMAIL_REGEXP.test(email)

const alreadyAddedIn = (fields: { email: string }[]) => (email: string) =>
  fields.map(toEmail).includes(email)

const emailNotIn =
  (fields: { email: string }[]) =>
  ({ data }: { data: MediateurToAddOption }) =>
    data.value != null &&
    isEmail(data.value.email) &&
    !alreadyAddedIn(fields)(data.value.email)

const InviterMembreForm = () => {
  const { loadOptions } = useMediateursSearch({
    initialMediateursOptions: [],
    allowTextValue: true,
  })

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const form = useForm<InviterMembreInput, unknown, InviterMembreData>({
    resolver: zodResolver(InviterMembreValidation),
    defaultValues: { members: [] },
  })

  const [enCours, setEnCours] = useState(false)

  const router = useRouter()

  const { append, fields, remove } = useFieldArray({
    control: form.control,
    name: 'members',
  })

  const onSubmit = async (data: InviterMembreData) => {
    setEnCours(true)
    const resultat = await inject(INVITER_DES_MEMBRES_ACTION_KEY)({
      emails: data.members.map(toEmail),
    })
    setEnCours(false)

    if (!resultat.success) {
      createToast({ priority: 'error', message: resultat.error })
      return
    }

    if (resultat.data.echecs.length > 0) {
      createToast({
        priority: 'warning',
        message: `L’invitation est enregistrée, mais l’email n’a pas pu être envoyé à ${resultat.data.echecs.join(', ')} : vous pourrez la relancer depuis votre équipe.`,
      })
      router.push('/coop/mon-equipe')
      router.refresh()
      return
    }

    createToast({
      priority: 'success',
      message:
        data.members.length > 1
          ? 'Un email d’invitation a été envoyé aux membres que vous souhaitez ajouter à votre équipe'
          : `Un email d’invitation a été envoyé à ${data.members[0].nom ?? data.members[0].email}`,
    })
    router.push('/coop/mon-equipe')
    router.refresh()
  }

  const onSelectMediateurAInviter = (option: MediateurToAddOption | null) => {
    if (option?.value?.email == null) return

    append([
      ...fields,
      {
        email: option.value.email,
        nom: option.value.mediateurId ? option?.label : undefined,
        mediateurId: option.value.mediateurId,
      },
    ])
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <CustomSelectFormField
        label={
          <span className="fr-display-block fr-mt-12v fr-mb-4v">
            Rechercher par nom ou adresse e-mail
          </span>
        }
        path="members"
        control={form.control}
        placeholder="Nom ou adresse e-mail"
        className="fr-mb-2v fr-mt-3v"
        loadOptions={loadOptions}
        filterOption={emailNotIn(fields)}
        onChange={onSelectMediateurAInviter}
        clearInputOnChange
        getOptionLabel={FormatOptionLabel}
        onMenuOpen={() => setIsMenuOpen(true)}
        onMenuClose={() => setIsMenuOpen(false)}
      />
      {fields.length > 0 && (
        <ul className="fr-list-group fr-flex fr-flex-wrap fr-flex-gap-1v fr-mt-6v">
          {fields.map((mediateurToAdd, index) => (
            <li key={mediateurToAdd.email}>
              <Tag
                nativeButtonProps={{
                  type: 'button',
                  onClick: () => remove(index),
                }}
              >
                {mediateurToAdd.nom ?? mediateurToAdd.email}&nbsp;
                <span className="fr-icon-close-line fr-icon--sm" aria-hidden />
              </Tag>
            </li>
          ))}
        </ul>
      )}
      <hr className="fr-separator-12v" />
      <ButtonsGroup
        buttonsSize="large"
        buttons={[
          {
            children: 'Inviter',
            type: 'submit',
            disabled: fields.length === 0 || enCours || isMenuOpen,
            ...buttonLoadingClassname(enCours),
          },
          {
            children: 'Annuler',
            priority: 'secondary',
            linkProps: { href: '/coop/mon-equipe' },
          },
        ]}
      />
    </form>
  )
}

export default withTrpc(InviterMembreForm)
