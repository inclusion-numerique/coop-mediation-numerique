import { redirect } from 'next/navigation'
import { contentId, defaultSkipLinks } from '@app/web/utils/skipLinks'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { getAuthenticatedSessionUser } from '@app/web/auth/getSessionUser'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { getUserRoleLabel } from '@app/web/utils/getUserRoleLabel'
import ProfileEditCard from './_components/ProfileEditCard'

const MonProfilPage = async () => {
  const user = await getAuthenticatedSessionUser()

  if (!user) {
    return redirect('/')
  }

  return (
    <>
      <SkipLinksPortal links={defaultSkipLinks} />
      <div className="fr-container fr-mt-2w">
        <CoopBreadcrumbs className="fr-mb-0" currentPage="Mon profil" />
        <main
          id={contentId}
          className="fr-container fr-container--800 fr-mb-16w"
        >
          <span className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v fr-my-5w">
            <span
              className="ri-account-circle-fill ri-lg fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
              aria-hidden
            />
            <h1 className="fr-h3 fr-page-title fr-m-0">Mon profil</h1>
          </span>
          <ProfileEditCard
            name={user.name}
            email={user.email}
            phone={user.phone}
            userRole={getUserRoleLabel(user)}
          />
        </main>
      </div>
    </>
  )
}

export default MonProfilPage
