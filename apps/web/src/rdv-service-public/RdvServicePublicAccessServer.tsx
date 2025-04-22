import { getSessionUser } from '@app/web/auth/getSessionUser'
import RdvServicePublicAccessClient from '@app/web/rdv-service-public/RdvServicePublicAccessClient'
import React from 'react'

const RdvServicePublicAccessServer = async () => {
  const user = await getSessionUser()

  if (!user) {
    return null
  }

  return <RdvServicePublicAccessClient user={user} />
}

export default RdvServicePublicAccessServer
