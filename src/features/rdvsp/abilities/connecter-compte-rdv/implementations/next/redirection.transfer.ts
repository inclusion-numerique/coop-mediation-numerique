import { NextResponse } from 'next/server'
import { getServerUrl } from '@/configuration/projet/base-url'
import { cheminDeRedirection } from '../../domain/retour-connexion'

export const redirection = (
  chemin: string,
  motif?: Readonly<Record<string, string>>,
): NextResponse =>
  NextResponse.redirect(
    getServerUrl(cheminDeRedirection(chemin, motif), { absolutePath: true }),
  )
