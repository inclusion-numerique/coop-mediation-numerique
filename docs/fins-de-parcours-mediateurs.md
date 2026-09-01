# Fins de parcours des médiateurs et conseillers numériques

État des lieux au 31/08/2026, branche `dev`.

Ce document répond à une question simple et mal couverte : **que se passe-t-il quand
quelqu'un s'en va ?** Il recense ce qui est automatisé aujourd'hui, puis — c'est
l'essentiel — les parcours de fin que la plateforme ne traite pas, et pendant combien
de temps une personne partie reste exposée.

Le constat général tient en une phrase : **La Coop sait faire le ménage des comptes qui
n'ont jamais servi, et ne sait rien faire des comptes qui ont servi puis se sont
arrêtés.** Tout le dispositif de fin de vie est conditionné à « aucune activité, aucun
bénéficiaire, aucune équipe » — c'est-à-dire au cas du compte mort-né. Dès qu'un compte
a produit la moindre donnée, il devient permanent, et rien ne le fait sortir des
vitrines publiques.

---

## 1. Ce qui existe aujourd'hui

### 1.1 Les deux couloirs automatiques

Un seul job nocturne, `inactive-users-reminders` (cron `0 0 * * *`,
`packages/cdk/src/WebAppStack.ts:397`), pilote deux couloirs parallèles.

**Couloir A — inscription jamais terminée** (`signupReminders.ts`)
Cible : `inscription_validee IS NULL`, décompte depuis `created`.

| Jour            | Effet                                                           |
|-----------------|-----------------------------------------------------------------|
| J+7, J+30, J+60 | e-mail « finalisez votre inscription »                          |
| J+90            | e-mail d'avertissement avant suppression                        |
| J+105           | **suppression dure** (`DELETE`) du user et de ses rattachements |

La suppression est physique et en cascade : `employeStructure`, `mediateurCoordonne`,
`mediateurEnActivite`, `mediateur`, `coordinateur`, `user`
(`signupReminders.ts:60-85`). Elle est gardée par deux conditions de sécurité — aucune
activité médiateur, aucun médiateur coordonné vivant (`signupReminders.ts:38-47`).

**Couloir B — inscrit mais jamais actif** (`nouveauReminders.ts`)
Cible : `inscription_validee IS NOT NULL` **et** `derniereCreationActivite IS NULL`
(filtre `nouveauFilter` → `noActivityFilter`, `nouveau-filter.ts:5-30`), décompte depuis
`inscription_validee`.

| Jour       | Effet                                                                                                                                                                        |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| J+7        | e-mail « premiers pas »                                                                                                                                                      |
| J+30, J+60 | e-mail de relance                                                                                                                                                            |
| J+90       | avertissement avant suppression                                                                                                                                              |
| J+105      | **suppression douce** : `deleted = now()`, e-mail remplacé par `deleted+<hash>@…`, nom remplacé par « Utilisateur Supprimé », téléphone effacé (`nouveauReminders.ts:29-41`) |

Le compteur se **réarme** si la personne redevient active dans les 7 jours
(`resetOnboardingStatus`).

### 1.2 Le job de nettoyage des rôles

`fix-users-roles` (cron `0 0 * * *`, `WebAppStack.ts:386`) retire le rôle coordinateur
ou médiateur *en trop* d'un compte double-rôle, 30 jours après validation
d'inscription, à la stricte condition qu'il ne porte **rien** (ni équipe, ni invitation,
ni activité de coordination, ni bénéficiaire, ni lieu d'activité). C'est un correctif de
rôle mal choisi à l'inscription, pas un mécanisme de fin de parcours.

### 1.3 Le job dispositif conseiller numérique

`appliquer-dispositif-conum` (cron `0 2 * * *`, `WebAppStack.ts:377`) répercute chaque
nuit ce que l'Entrepôt a changé aux affectations. Il fait deux choses, et **aucune n'est
un retrait** : il crée la ligne `coop.coordinateurs` manquante, et il notifie Brevo sur
transition. Le commentaire est explicite : *« on ne supprime jamais »*
(`executeAppliquerDispositifConum.ts:22`), et
`garantirCoordinateurDuDispositif.ts:15-17` le redit : retirer le rôle
« orphelinerait les équipes ».

### 1.4 Les statuts d'inactivité — affichage seulement

`statut-compte.ts:17` définit `Inactif J+30`, `Inactif J+90`, `Inactif J+180`, et
`filterUtilisateur.ts:34-37` permet de filtrer là-dessus dans l'administration.
**Aucun job ne consomme ces statuts.** `actifFilter` n'a qu'un seul appelant, et c'est
la liste d'administration (`actif-filter.ts`, appelé uniquement depuis
`filterUtilisateur.ts:5`). Un compte peut donc être « Inactif J+180 » indéfiniment sans
qu'il ne se passe quoi que ce soit.

### 1.5 Les gestes manuels disponibles

| Geste                                            | Qui                                     | Effet                                                                          |
|--------------------------------------------------|-----------------------------------------|--------------------------------------------------------------------------------|
| Suppression de son propre compte                 | l'utilisateur                           | suppression douce + anonymisation partielle (`userRouter.ts:90`)               |
| Suppression d'un compte                          | admin                                   | idem, interdite sur Admin/Support (`userRouter.ts:92-113`)                     |
| Retirer un médiateur d'un lieu                   | le médiateur, un coordinateur, un admin | pose `mediateurEnActivite.fin` (`lieuActiviteRouter.ts:384-392`) + e-mail      |
| Retirer de mon équipe / supprimer définitivement | coordinateur                            | `mediateurCoordonne.suppression` puis `DELETE` (`equipe/deleteFromArchive.ts`) |
| Masquer sa fiche sur la cartographie             | le médiateur seul                       | bascule `mediateur.isVisible` (`mediateurs/setVisibility.ts`)                  |
| Déconnecter son compte RDV Service Public        | le médiateur seul                       | purge les jetons (`deconnecter-compte-rdv.mutation.ts`)                        |

---

## 2. Ce qui décide de l'exposition publique

Trois vitrines, trois jeux de conditions. Aucune ne regarde l'activité récente ni le
contrat.

**A. Cartographie nationale** — via `GET /api/v1/lieux-activite`
(`src/app/api/v1/lieux-activite/route.ts:328-332`). Conditions de publication d'un lieu
et de ses *aidants* (**nom, courriel, téléphone**) :

```
lieu.suppression IS NULL
AND mediateurs_en_activite.suppression IS NULL AND fin_activite IS NULL
AND lieu.visible_pour_cartographie_nationale IS TRUE
AND users.deleted IS NULL
AND mediateurs.is_visible = TRUE        -- condition de jointure, pour les aidants
```

L'API est protégée par clé (scopes, `createApiV1Route.ts:39-50`) ; c'est la
cartographie nationale qui republie ensuite. Le champ
`dispositif_programmes_nationaux = ['Conseillers numériques']` est, lui, **dérivé en
direct** de l'affectation `idposte` active (`route.ts:325`).

**B. Annuaire « Mon réseau »** (`searchActeurs.ts:176-178`, `getMonReseauPageData.ts:29`) :

```
u.deleted IS NULL
AND u.inscription_validee IS NOT NULL
AND (département de l'employeuse courante = X OR département d'un lieu d'activité = X)
```

**C. API `/api/v1/utilisateurs`** : expose tous les comptes, avec un filtre
`soft_deleted` optionnel — donc par défaut, supprimés compris
(`utilisateurs/route.ts:460-473`).

---

## 3. Les parcours de fin non adressés

### 3.1 Rupture de contrat d'un conseiller numérique

**Ce qui se passe côté données.** La Coop ne stocke plus de drapeau
`is_conseiller_numerique` : la qualité se dérive à chaque lecture d'une affectation
`source = 'idposte'` avec `est_active = true`
(`features/employeuse/db/employeuse.sql.ts:60-73`). Cette colonne est maintenue par
l'Entrepôt, pas par nous. Quand l'ANCT la bascule, La Coop le voit **immédiatement**,
sans job.

**Ce qui change effectivement :**
- le badge « conseiller numérique » disparaît de l'annuaire et de l'administration ;
- le lieu d'activité perd la mention `Conseillers numériques` dans le flux carto ;
- Brevo est notifié la nuit suivante.

**Ce qui ne change pas :**
- le **compte reste actif** — rien ne bloque la connexion ;
- la personne **reste dans l'annuaire** de son département ;
- ses lieux d'activité **restent publiés** sur la cartographie, avec son nom, son
  courriel et son téléphone, tant que `mediateur.isVisible` est vrai ;
- la ligne `coop.coordinateurs` **n'est jamais retirée** — un coordinateur sorti du
  dispositif continue de coordonner son équipe, de voir les statistiques et les
  bénéficiaires de ses médiateurs (`garantirCoordinateurDuDispositif.ts:15-17`) ;
- son compte RDV Service Public reste lié.

**Un effet de bord, dans l'autre sens.** L'employeuse courante se lit par la même
jointure `est_active` (`employeuse.sql.ts:29-40`), avec repli sur l'affectation de
source `coop`. Si le conseiller n'a pas d'affectation `coop` (cas courant des comptes
créés par le dispositif) et pas de lieu d'activité géolocalisé, la désactivation de son
affectation `idposte` le fait **disparaître silencieusement de l'annuaire de son
département** — non pas parce qu'il est parti, mais parce qu'il n'a plus d'ancrage
géographique. Départ et perte d'employeuse produisent le même effet, sans distinction
possible à l'écran.

**Mesuré le 31/08/2026 : `est_active` ne suit pas la fin de contrat.** La question
était ouverte ; elle est tranchée, sur une copie locale de la production fraîche au
28/08. `PeriodeEmploi` (`features/employeuse/domain/periode-emploi.ts`) sait lire une
date de fin ou de rupture, mais **aucune règle métier ne la consulte** —
`estConseillerNumerique` ne regarde que `source` + `active`
(`employeuse.transfer.ts:227-236`). Voici ce que disent les deux sources quand on les
confronte.

Sur les 2 649 personnes portant une affectation `idposte` **active** :

| Situation du contrat | Personnes |
|---|---|
| contrat sans terme, en cours | 798 |
| terme à venir, CDD en cours | 1 332 |
| **tous contrats échus — incohérent** | **410** |
| aucun contrat connu | 73 |

Dans l'autre sens, 112 personnes ont une affectation désactivée alors qu'un contrat
court encore.

Surtout, **la désactivation n'est pas un événement**. Pour 2 937 des 3 100 affectations
désactivées dont le contrat est échu, l'horodatage de mise à jour tombe plus de trois
mois après le terme ; et 5 318 des 6 023 affectations `idposte` portent la même date de
mise à jour, le 01/04/2026. C'est la signature d'un rechargement en masse, pas d'un flux
d'événements.

**Conséquence pour la conception : la détection de fin de contrat se branche sur
`main.contrat`, pas sur `est_active`.** La couverture le permet — 2 576 des 2 649
affectations actives ont au moins un contrat, soit 97 %, très loin des ~53 % relevés
côté `source = 'coop'`.

**Arbitrage ANCT du 31/08/2026 : c'est `est_active` qui fait foi, pas le contrat.**
Une affectation `idposte` active vaut conseiller numérique&nbsp;; son absence vaut médiateur
ordinaire. Les contrats ne sont pas une source de vérité sur le statut — les 410
incohérences relevées ci-dessus sont donc 410 conseillers numériques dont les contrats
sont mal tenus, et non 410 départs manqués.

C'est déjà la règle implémentée : `estConseillerNumerique`
(`features/employeuse/domain/affectation.ts:48`) se réduit à
`affectations.some(a => a.active && a.source === 'idposte')`, et les dates de contrat ne
servent qu'à l'historique des employeuses. **Il n'y a rien à reprendre de ce côté.**

Ce que l'arbitrage retire, en revanche, c'est la possibilité d'anticiper : les dates sur
lesquelles reposait le courriel à J-30 ne font pas foi. Le seul signal fiable reste un
rechargement en masse, dont la mesure ci-dessus donne le retard — plus de trois mois
après le terme dans 2 937 cas sur 3 100. On apprend les sorties avec ce retard-là, et la
conception doit s'en accommoder plutôt que le contourner.

**La vague est datée.** Termes à venir des affectations actives, en nombre de comptes
coop concernés : 207 en septembre, 115 en octobre, 123 en novembre, 171 en décembre —
616 comptes sur quatre mois. S'y ajoutent 225 comptes dont le contrat est déjà échu
depuis moins de trois mois, et dont l'affectation est pourtant restée active.

### 3.2 Départ d'un médiateur qui a travaillé

C'est le trou principal, et il est structurel. Les deux couloirs de suppression
(§1.1) exigent `derniereCreationActivite IS NULL`. **Un médiateur qui a saisi une seule
activité sort définitivement du périmètre de tout mécanisme automatique.**

Conséquence, s'il part sans rien faire :

| Vitrine                                               | Durée d'exposition                                  |
|-------------------------------------------------------|-----------------------------------------------------|
| Cartographie nationale (nom, courriel, téléphone)     | **illimitée**                                       |
| Annuaire Mon réseau                                   | **illimitée**                                       |
| Liste des membres de l'équipe de son coordinateur     | **illimitée**                                       |
| Options « lieu d'activité » proposées à ses collègues | **illimitée**                                       |
| Statistiques départementales et nationales            | **illimitée** (par construction, et c'est légitime) |
| Contact RDV Service Public                            | jusqu'à révocation côté RDV SP                      |

Le seul geste qui le retire de la cartographie est **le sien** : basculer
`mediateur.isVisible`, qui n'est modifiable que par le titulaire du compte
(`mediateursRouter.ts:268-274`). Personne — ni coordinateur, ni admin — ne peut le
faire à sa place. Un coordinateur peut en revanche poser `mediateurEnActivite.fin`, ce
qui retire la personne du lieu ; si c'était son dernier lieu, elle sort de la
cartographie par cet effet.

### 3.3 Changement d'employeuse non déclaré

L'affectation de source `coop` n'est désactivée que par
`deactivateCoopAffectationsExcept`, appelé quand l'utilisateur déclare lui-même un
nouvel employeur (`ensureAffectationEmploiMain.ts:47-66`). Sans démarche de sa part,
**l'annuaire affiche indéfiniment l'ancien employeur**, et le rattache au mauvais
département. Aucune date de fin, aucune relance, aucune détection.

### 3.4 Fin de mission sur un lieu

`mediateurEnActivite` porte un champ `fin`, mais **rien ne le renseigne
automatiquement** — le seul écrivain est l'action manuelle « retirer d'un lieu »
(`lieuActiviteRouter.ts:384`). Un lieu fermé, une mission terminée, une mutation : le
rattachement survit.

Un détail à connaître, dans le flux carto : la clause
`mediateurs_en_activite.fin_activite IS NULL` filtre **par ligne jointe**. Un lieu dont
tous les médiateurs ont une date de fin disparaît donc entièrement de la cartographie —
y compris s'il est encore ouvert au public. Un lieu qui n'a **jamais** eu de médiateur,
lui, reste publié (la jointure externe ne produit aucune ligne à filtrer). Les deux
comportements sont des effets de la requête, pas des décisions.

### 3.5 Suppression de compte réversible

La suppression douce anonymise nom, courriel et téléphone. Mais `auth.ts:126-138`
**restaure intégralement le compte** à la première reconnexion ProConnect : `deleted`
remis à `null`, identité réécrite depuis le profil. C'est utile contre la suppression
accidentelle ; c'est aussi la preuve que la « suppression » n'est pas une fin, et que
l'anonymisation n'en est pas une non plus tant que le compte ProConnect existe.

Par ailleurs, aucune session n'est invalidée par la suppression douce du couloir B
(`nouveauReminders.ts:29-41`) — contrairement à `deleteUser` qui, lui, purge les
sessions (`deleteUser.ts:25`).

### 3.6 L'écart avec la politique de confidentialité

La page publique `/confidentialite` (`src/app/(public)/confidentialite/page.tsx:120-152`)
engage la plateforme sur :

| Catégorie                | Engagement affiché                                                | Implémenté ? |
|--------------------------|-------------------------------------------------------------------|--------------|
| Comptes des médiateurs   | 1 an après le dernier contact, puis **anonymisation totale**      | **non**      |
| Bénéficiaires            | 1 an après la dernière mise à jour, puis **anonymisation totale** | **non**      |
| Données d'accompagnement | illimité, **anonymisées après 1 an**                              | **non**      |

Il n'existe aucun job d'anonymisation dans le dépôt (liste complète :
`apps/web/src/jobs/`). Les seuls effacements sont ceux des §1.1, déclenchés à 105 jours
et réservés aux comptes sans données. C'est le point le plus exposé de ce document : ce
n'est pas une lacune fonctionnelle, c'est un engagement RGPD non tenu.

### 3.7 Bénéficiaires et activités orphelins

Les bénéficiaires sont rattachés au médiateur (`Beneficiaire.mediateurId`). Quand le
compte est supprimé en douceur, **le médiateur et ses bénéficiaires restent** — seul le
`user` est anonymisé. Personne n'hérite du portefeuille, personne ne peut le consulter,
et il n'est ni anonymisé ni purgé. Le coordinateur perd l'accès en même temps que le
médiateur disparaît de son équipe.

### 3.8 RDV Service Public

Trois fins possibles, aucune traitée de bout en bout :

- **Retrait d'une organisation** : géré depuis le correctif de
  `plan-synchronisation.ts` — les rattachements absents de la réponse sont détachés,
  sauf si la réponse est vide (garde anti-incident, `plan-synchronisation.ts:69-89`).
- **Révocation du compte agent** : le `refresh_token` devient invalide, la synchro
  s'arrête, le compte passe en erreur. La reconnexion est à l'initiative de la personne
  seule ; personne n'est alerté côté administration.
- **Départ de la structure** : rien. Le lien `rdvAccount ↔ user` survit, et seul le
  titulaire peut le rompre.

### 3.9 Invitations d'équipe sans péremption

`InvitationEquipe` (`prisma/schema.prisma:370-387`) n'a **pas de date d'expiration**.
Une invitation envoyée à quelqu'un qui ne viendra jamais reste « en attente »
indéfiniment — et, tant qu'elle est en attente, elle **protège le compte du
coordinateur** contre la suppression du couloir B (`nouveau-filter.ts:3`,
`invitations: noPendingInvitations`).

---

## 4. Récapitulatif des durées d'exposition

Pour une personne qui cesse son activité **sans faire aucune démarche** :

| Situation                                                              | Retiré de la carto                                   | Retiré de l'annuaire                                                          | Compte supprimé              |
|------------------------------------------------------------------------|------------------------------------------------------|-------------------------------------------------------------------------------|------------------------------|
| N'a jamais validé son inscription                                      | sans objet                                           | sans objet                                                                    | **J+105**, suppression dure  |
| Inscrit, jamais saisi d'activité                                       | sans objet (pas de lieu publié en général)           | **J+105**                                                                     | **J+105**, suppression douce |
| A saisi au moins une activité                                          | **jamais**                                           | **jamais**                                                                    | **jamais**                   |
| Conseiller numérique, contrat rompu, affectation désactivée par l'ANCT | **jamais** (perd seulement la mention du dispositif) | jamais — sauf disparition accidentelle si l'employeuse était son seul ancrage | **jamais**                   |
| Conseiller numérique, contrat rompu, affectation **non** désactivée    | **jamais**                                           | **jamais**                                                                    | **jamais**                   |

---

## 5. Pistes, par ordre de gravité décroissante

Ces pistes datent de l'état des lieux initial. Les décisions prises depuis sont
consignées au §6, ce qui reste ouvert au §7 — plusieurs d'entre elles sont caduques.

Aucune n'est engagée ; elles sont là pour cadrer la discussion.

1. **Tenir l'engagement d'anonymisation à 1 an** (§3.6). C'est le seul point de nature
   juridique. Suppose de définir « dernier contact » — la dernière connexion et la
   dernière activité ne disent pas la même chose — et d'écrire un job d'anonymisation
   qui préserve les agrégats statistiques.
2. **Décider ce que « parti » veut dire, et le rendre lisible en base.** Aujourd'hui la
   plateforme n'a aucun état pour ça : `deleted` est une suppression, pas un départ.
   Un état intermédiaire — sorti, mais données conservées — débloquerait les points
   suivants d'un coup.
3. **Brancher les statuts d'inactivité existants sur un effet** (§1.4). `Inactif J+180`
   est déjà calculé et filtrable ; il ne manque qu'une conséquence — a minima un
   dépublication de la cartographie, réversible à la reconnexion.
4. **Clarifier avec l'ANCT le contrat de `est_active`** (§3.1) : est-ce que la fin d'un
   contrat désactive l'affectation, et sous quel délai ? Tant que la réponse est non ou
   inconnue, La Coop ne peut réagir à aucune rupture.
5. **Donner aux coordinateurs et aux admins la main sur `isVisible`** (§3.2), ou au
   moins un signalement. Aujourd'hui la personne partie est la seule à pouvoir se
   retirer de la cartographie.
6. **Poser une expiration sur les invitations d'équipe** (§3.9).
7. **Prévoir la reprise d'un portefeuille de bénéficiaires** au départ d'un médiateur
   (§3.7).

---

## 6. Décisions arrêtées — 31/08/2026

### D1 — Anonymisation à l'échéance, sur le patron qui existe déjà

Le job d'échéance reprend la mécanique de `supprimerBeneficiaires`
(`supprimer-beneficiaires.mutation.ts:26-44`) : identité effacée, valeur statistique
conservée — année de naissance, commune, genre, tranche d'âge et statut social restent.
Périmètre complet, « la totale » :

| Cible | Ce qui est effacé |
|---|---|
| `users` | déjà couvert par la suppression douce (nom, courriel, téléphone) |
| `beneficiaires` | patron de référence, déjà implémenté |
| `rdv_users` | nom, nom de naissance, date de naissance, courriel, téléphone, adresse, **numéro d'affiliation et caisse CAF** (`schema.prisma:1803-1821`) |
| `activites.notes` | texte libre (`schema.prisma:1384`) |

`rdv_users` était l'angle mort : aucune colonne `deleted`, aucun propriétaire, supprimé
uniquement sur webhook « usager supprimé » de RDV SP
(`webhook-usager.prisma.ts:70`) — et l'anonymisation d'un bénéficiaire **détache**
`rdvUserId` sans toucher la ligne, qui devient orpheline avec son identité intacte.

### D2 — La suppression de compte purge ce qu'elle laissait derrière

- **`accounts` : jetons vidés, ligne conservée.** `access_token`, `refresh_token`,
  `id_token`, `expires_at`, `session_state` à `null` ; `provider` et
  `provider_account_id` intacts. C'est la contrainte structurante : l'adaptateur
  NextAuth retrouve la personne par `@@unique([provider, providerAccountId])`
  (`schema.prisma:41`), pas par courriel — supprimer la ligne rendrait la résurrection
  impossible.
- **`rdv_accounts` : supprimé**, comme `mergeUser` le fait déjà (`mergeUser.ts:523`).
  Rien ne dépend de sa survie pour se reconnecter.
- **`sessions` : purgées aussi dans le couloir « nouveau »**, qui l'oublie aujourd'hui
  (`nouveauReminders.ts:29-41`) là où `deleteUser` le fait (`deleteUser.ts:25`).

Aujourd'hui, ni `accounts` ni `rdv_accounts` ne sont touchés par `deleteUser` : des
jetons OAuth actifs survivent à la suppression du compte.

### D3 — La résurrection ProConnect est une fonctionnalité

Contrat, énonçable en une phrase : **l'identité et l'historique statistique reviennent ;
les rattachements et les données personnelles de tiers, non.**

| Revient | Ne revient pas |
|---|---|
| la ligne `mediateur` | les bénéficiaires (anonymisés, **sans reprise de portefeuille**) |
| les activités et accompagnements | les équipes (`mediateurCoordonne`) |
| les compteurs et statistiques | les rattachements aux lieux |
| | le lien RDV Service Public |

L'intention : quelqu'un qui revient après une longue pause ne repart pas tout à fait de
zéro.

### D4 — L'état de dépublication ne réutilise pas `onboarding_status`

Deux colonnes dédiées : `depublie_le` et `depublie_motif` (fin de contrat, employeuse
périmée, inactivité). Trois raisons :

- `onboarding_status` est une **position sur une échelle unique**, déjà partagée par
  deux couloirs qui ne se croisent que par un invariant tacite (`inscription_validee`
  nul d'un côté, non nul de l'autre) — la dépublication, elle, n'est disjointe d'aucun
  des deux ;
- `resetOnboardingStatus` remet la colonne à `null` dès 7 jours d'activité, ce qui
  effacerait un état qu'on veut voir levé **explicitement** par la personne ;
- une valeur d'enum comme `depublie_fin_contrat_envoye` mélange l'événement et sa
  notification, là où un horodatage plus un motif se lisent, s'auditent, et alimentent
  le texte de la modal.

Le constat sur le nom reste juste : `onboarding_status` ne parle pas d'onboarding mais
de progression vers la suppression (`warning_j90_sent`). Le renommage est souhaitable,
mais c'est un chantier séparé et sans risque.

### D5 — Dépublier la personne, pas le rattachement

`mediateur.isVisible` est le levier de la dépublication automatique.
`mediateurEnActivite.fin` reste un geste humain : le poser automatiquement ferait
**disparaître le lieu entier** de la cartographie dès le départ de son dernier
médiateur, ce qui punirait la structure pour le départ d'une personne.

### D6 — Un seul flux de sortie : l'inactivité

Révisée le 31/08 après arbitrage. La fin de contrat reste un **changement de régime** —
le conseiller devient médiateur hors dispositif — mais elle n'ouvre plus de rampe
d'accès à un flux de sortie. Elle ne déclenche rien : ni courriel, ni dépublication.

Il ne reste donc qu'**un seul mécanisme**, celui de l'inactivité (D13), et il traite
indifféremment les médiateurs, les anciens conseillers et les coordinateurs.

### D7 — Anticipation par courriel à J-30 · ABANDONNÉE

Elle reposait sur `PeriodeEmploi.finPrevue`, lu depuis `main.contrat`. L'arbitrage du
31/08 retire à ces dates leur valeur de vérité (§3.1) : on ne peut pas annoncer à
quelqu'un la fin d'un contrat sur une donnée qui ne fait pas foi. Conservée ici pour
mémoire, parce que la raison de l'abandon vaut pour toute reprise ultérieure du sujet.

### D8 — Invitations d'équipe supprimées à 30 jours

Sans quoi une invitation morte prolonge indéfiniment la conservation du compte du
coordinateur, qu'elle protège de la suppression (`nouveau-filter.ts:3`).

### D9 — Sortie du dispositif : ne rien faire tant que la personne ne revient pas

Entre le passage de l'affectation à `false` et la reconnexion de la personne, elle
disparaît de **tous les écrans qui exigent une structure administrative active** —
annuaire départemental compris — faute d'ancrage. C'est assumé : le retour de la
personne est le seul moment où l'on peut savoir ce qu'elle devient.

### D10 — À la reconnexion, l'employeuse se reconstruit depuis ProConnect

Un ancien conseiller qui se connecte avec une affectation `idposte` inactive et sans
structure déclarée dans La Coop se voit recréer une affectation de source `coop` vers la
structure dont le SIRET est celui fourni par ProConnect — la structure étant créée dans
`main` si elle n'existe pas. La personne devient alors un médiateur **comme si elle
n'avait jamais été conseillère numérique** dans La Coop.

Quand ProConnect ne fournit pas de SIRET, ou en fournit un non diffusible, l'accès à La
Coop reste ouvert&nbsp;; c'est au premier compte rendu d'activité que le lieu d'activité
devient obligatoire.

**Règle de bordure : on ne touche à rien dont la source n'est pas `coop`.** L'ancienne
affectation `idposte` reste en base, inactive, comme trace.

### D11 — L'exposition sur la cartographie est assumée jusqu'à un an

Un médiateur parti reste publié — nom, courriel, téléphone — jusqu'à l'échéance
d'inactivité. Deux sorties anticipées existent, toutes deux volontaires : la personne
supprime son compte, ou un administrateur le fait pour elle.

### D12 — Inactivité : anonymisation à un an, relances à partir de J-115 · EN PAUSE

Détection par la **date de dernière connexion**. Vérifié le 31/08 : l'écart entre
dernière connexion et dernière activité est borné par la durée d'une session, soit 30
jours (2 277 comptes sur 2 278, maximum exactement 30). À un horizon d'un an, le critère
est donc sain, et la réserve initiale sur `last_login` ne s'applique pas.

Calendrier envisagé : relances à partir de 250 jours d'inactivité (J-115 avant
l'échéance), anonymisation à un an.

**Chantier en pause dans l'attente du juriste de l'ANCT**, sur deux points qui peuvent
tous deux déplacer la conception :

- la durée elle-même, susceptible de passer à **deux ans**&nbsp;;
- surtout, la propagation : les données de La Coop sont consommées par des outils
  externes — l'Entrepôt, MIN. Anonymiser chez nous ne dit rien des copies déjà parties.
  La question juridique porte sur la cohabitation de sources dont certaines sont
  anonymisées et d'autres non.

Conséquence de conception à retenir dès maintenant : **le délai doit être un paramètre,
pas une constante.**

### D13 — Le rôle coordinateur ne se retire pas

Un coordinateur qui sort du dispositif garde son rôle et son équipe. S'il cesse
réellement de venir, c'est le flux d'inactivité qui le traite, exactement comme un
médiateur.

### D14 — Les 321 médiateurs déjà au-delà d'un an attendent

Aucun rattrapage tant que le traitement nominal n'est pas arrêté.

---

## 7. Ce qui reste ouvert

Mis à jour après la réunion du 31/08/2026. Les questions posées à l'ANCT sur le
fonctionnement des affectations et des contrats sont retirées : l'arbitrage du §3.1 les
rend sans objet, puisque le contrat n'est plus une source de vérité.

**1. La réponse du juriste de l'ANCT — bloquant sur D12.** Deux points, dont le second
est le plus lourd :

- la **durée de conservation** peut passer d'un an à deux, ce qui déplace aussi le seuil
  de relance (250 jours aujourd'hui envisagés) ;
- la **propagation aux outils externes**. Les données de La Coop alimentent l'Entrepôt
  et MIN. Anonymiser chez nous ne dit rien des copies déjà parties, et la question porte
  sur la cohabitation de sources dont certaines sont anonymisées et d'autres non. Ce
  n'est pas un problème interne à La Coop : c'est un problème de chaîne.

**2. Que faire du lieu quand son dernier médiateur part ?** Non posé en réunion,
reporté au moment de l'implémentation. Vérifié en base le 31/08 : **727 lieux** cochés
« visible pour la cartographie nationale » n'y figurent pas, parce que tous leurs
rattachements portent une date de fin — aucun des 727 n'apparaît parmi les 7 947 lieux
effectivement publiés. À l'inverse, **28 lieux** n'ont jamais eu le moindre médiateur et
sont publiés, tous les 28. Les deux comportements sont des effets de la requête (§3.4),
pas des décisions.

**3. Le sort des 321 médiateurs déjà au-delà d'un an d'inactivité.** Gelé jusqu'à ce que
le traitement nominal soit arrêté (D14).

**4. Ce que l'anonymisation fait à un coordinateur.** D13 fait suivre au coordinateur le
même flux qu'un médiateur, mais la ligne `coop.coordinateurs` est la cible de clés
étrangères dans tout le schéma — équipes, invitations, tags, activités de coordination,
partage de statistiques. C'est l'argument même qui justifie de ne jamais retirer le rôle
(`garantirCoordinateurDuDispositif.ts:15-17`). Anonymiser l'identité sans toucher aux
rattachements est probablement la réponse, mais elle n'a pas été énoncée.

**5. Fenêtre de repêchage : distinguer « pas encore vue » de « vue et déclinée »**, pour
ne pas la reproposer à chaque connexion. Question devenue secondaire depuis l'abandon de
la dépublication automatique (D7, D11), mais elle ressurgira avec les relances de D12.

---

## Annexe — crons en production

Extraits de `packages/cdk/src/WebAppStack.ts` :

| Job                                        | Cron         | Rôle vis-à-vis des fins de parcours       |
|--------------------------------------------|--------------|-------------------------------------------|
| `inactive-users-reminders`                 | `0 0 * * *`  | seul mécanisme de suppression automatique |
| `fix-users-roles`                          | `0 0 * * *`  | retire un rôle en trop, jamais un compte  |
| `appliquer-dispositif-conum`               | `0 2 * * *`  | crée, ne retire jamais                    |
| `sync-rdvsp-data`                          | `0 2 * * *`  | dev et main uniquement                    |
| `update-structures-cartographie-nationale` | `30 5 * * *` | lit l'Entrepôt vers la Coop, dédoublonne  |
| `normalize-sirets`                         | `0 4 * * *`  | —                                         |
| `remove-orphan-brevo-contacts`             | `0 3 * * *`  | nettoyage Brevo                           |
