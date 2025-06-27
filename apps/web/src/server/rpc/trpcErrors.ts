import { TRPCError } from '@trpc/server'

export const forbiddenError = (message?: string) =>
  new TRPCError({
    code: 'FORBIDDEN',
    message:
      message ?? "Vous n'êtes pas autoriser a effectuer cette opération.",
  })

export const notFoundError = (message?: string) =>
  new TRPCError({
    code: 'NOT_FOUND',
    message: message ?? 'Introuvable. Veuillez réessayer ultérieurement.',
  })

export const invalidError = (message?: string) =>
  new TRPCError({
    code: 'BAD_REQUEST',
    message:
      message ?? 'Opération invalide. Veuillez réessayer ultérieurement.',
  })

export const externalApiError = (message?: string) =>
  new TRPCError({
    code: 'SERVICE_UNAVAILABLE',
    message:
      message ??
      'Une erreur est survenue lors de l’appel à l’API externe. Veuillez réessayer ultérieurement.',
  })
