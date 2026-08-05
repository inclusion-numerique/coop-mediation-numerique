import type { ProvidePair } from 'piqure'

// piqure 2.3.0 a fermé sa surface publique : son champ `exports` interdit les imports profonds
// (`piqure/src/Providing`), et ni `InjectionKey` ni `Provide` ne figurent parmi ses exports.
// Seul `ProvidePair<T>`, défini en amont comme `[InjectionKey<T>, T]`, reste public : on en
// dérive les deux types dont on a besoin, sans dépendre d'un chemin interne.
//
// Ce module ne contient QUE des types — aucun import runtime, donc aucune frontière
// client/serveur à franchir. C'est ce qui permet aux composants clients (`hook.ts`) de s'y
// référer sans tirer `node:async_hooks` de `./container` dans le bundle.
export type InjectionKey<T> = ProvidePair<T>[0]

export type Provide = <T>(key: InjectionKey<T>, injected: T) => void
