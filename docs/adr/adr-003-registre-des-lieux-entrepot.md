# ADR-003 : Registre des lieux de l'Entrepôt

## Auteurs et historique

| Date | Auteur | Action |
|------|--------|--------|
| 2026-09-11 | Marc Gavanier | Rédaction initiale : extraction de la section « Registre des lieux de l'Entrepôt » de `CONTRIBUTING.md` |
| 2026-09-11 | Marc Gavanier | Règles de lecture : le registre prime sauf sur le partage à la cartographie ; « modifié depuis » se dérive des quatre horodatages |

## Statut

Accepté — double écriture en place (`feat/registre-lieux-main`).

## Contexte

`coop.lieu_inclusion` garde la vérité de la coop. `main.lieu_inclusion`, possédé par
l'Entrepôt, porte la vérité servie à tous les autres consommateurs (Mon Inclusion Numérique, API de
la carte nationale, data.gouv) : `main.lieu_inclusion` en est une projection directe.

`coop` et `main` sont deux schémas d'une même base, atteints par un même client Prisma. Un
rattrapage quotidien existe côté Entrepôt, mais il ne couvre que l'**identité** du lieu — pas ses
champs métier. Sans écriture explicite dans le registre, une valeur métier corrigée côté coop reste
donc invisible pour les consommateurs.

## Décision

### Double écriture applicative, en une seule transaction

L'application écrit dans `coop.lieu_inclusion` et dans `main.lieu_inclusion` dans **une
seule transaction**. Le code vit dans
`apps/web/src/features/lieux-activite/implementation/prisma/registre/`.

### Le compilateur tient les colonnes, pas la documentation

Les colonnes du registre ouvertes au rôle `coop` sont tenues à deux endroits, et à deux seulement :

- les `GRANT` PostgreSQL posés par l'Entrepôt — une écriture sur une colonne fermée
  (`updated_at_carto`, `updated_at_min`, `mediateurs_en_activite`, `emplois`… alimentées par
  d'autres producteurs) est refusée par la base ;
- le type `ColonnesDuRegistre` (`…/registre/lieu.registre.transfer.ts`), qui exclut ces colonnes et
  fait échouer la compilation avant la base.

Aucune liste de colonnes n'est recopiée en markdown : elle dériverait à la première colonne ajoutée.

### Les dates disent la vérité

`updated_at_coop` reflète une modification **réelle** du contenu. On ne bumpe jamais
`coop.lieu_inclusion.modification` ni `updated_at_coop` en masse sans changement de valeur : ces
dates arbitrent la fraîcheur entre sources côté Entrepôt.

`main.lieu_inclusion.updated_at` est une colonne **générée**
(`GREATEST(updated_at_carto, updated_at_coop, updated_at_min)`) : on ne l'écrit jamais.

### En lecture, le registre prime — sauf sur le partage à la cartographie

La fiche affichée vient du registre : nom, adresse, contact, horaires, présentation,
nomenclatures. Chaque producteur n'y écrit que ses colonnes, si bien que la fusion champ par
champ y a déjà eu lieu.

`visible_pour_cartographie_nationale` est la seule exception, et elle n'est pas un oubli : la
coop en est l'**auteur**, le registre n'en tient qu'une copie qu'on lui pousse. C'est la colonne
coop que l'interrupteur de partage écrit, et c'est elle que `lieuxPublies` interroge à la
moisson. La lire au registre ferait annoncer par la coop une publication que la carte ne ferait
pas.

Corollaire : tout chemin qui dépublie côté coop doit le dire au registre. Il y en a deux —
l'interrupteur, et le relèvement d'un lieu modéré (`preparerCorrele`), qui revient invisible.

### Ce que « modifié depuis » veut dire pour un client d'API

La fiche venant du registre, `coop.lieu_inclusion.modification` ne date plus ce qu'on publie :
une valeur reprise par un autre producteur change le contenu rendu sans la faire bouger. Le
filtre `filter[modification][depuis]` et la date exposée dérivent donc tous deux des quatre
horodatages — celui de la coop et les trois du registre (`derniere-ecriture.ts`).

Les deux doivent regarder les mêmes colonnes : un lieu écarté par le filtre alors que sa date
le dit récent serait perdu pour toujours par une synchronisation incrémentale, qui ne redemande
jamais ce qu'elle croit à jour.

### Adresses : mutualisées, jamais modifiées en place

`main.adresse` est partagée avec les autres producteurs. On appelle
`main.trouver_ou_creer_adresse_lieu` et on repointe `adresse_id` ; on ne modifie jamais une adresse
existante en place.

### Périmètre d'écriture

Rien d'autre : aucune écriture dans `main.lieu_appariement` ni dans les autres tables `main.*` des
lieux.

### Une dérogation assumée

Le job `normalize-sirets` efface `coop.lieu_inclusion.siret` sans toucher
`main.lieu_inclusion.siret_a_l_enrichissement`, qui garde sa valeur jusqu'à la prochaine
édition de la section « Informations générales ». Ce SIRET n'est qu'une entrée déclarative pour
l'enrichissement ; le SIRET canonique est celui de la `structure_administrative` associée.

### Règle opératoire

> **Tout script SQL, backfill ou migration qui touche `coop.lieu_inclusion` en dehors de
> l'application doit passer par l'application, ou être signalé à l'équipe Dataspace.**

Un backfill se fait dates inchangées, et se signale.

## Alternatives écartées

### Un trigger PostgreSQL ou une réplication vers `main`

L'adoption d'une inscription déjà présente dans le registre est une **logique applicative**
(corrélation, arbitrage de la ligne existante). Un trigger la contourne et casse cette adoption. La
double écriture applicative garde la décision là où elle est décidable.

### S'en remettre au rattrapage quotidien de l'Entrepôt

Il ne couvre que l'identité du lieu. Les champs métier (services, horaires, présentation, contact…)
resteraient sur leur ancienne valeur chez tous les consommateurs.

## Conséquences

- Une correction passée en SQL direct laisse le référentiel sur l'ancienne valeur, et les
  consommateurs avec : d'où la règle opératoire ci-dessus.
- Un bump de dates en masse fausse durablement les arbitrages de fraîcheur entre sources — celui des
  6 et 7 juillet 2026, sur 12 086 lieux, produit encore ses effets.
- Ouvrir une nouvelle colonne du registre à l'écriture demande deux gestes : un `GRANT` côté
  Entrepôt, et son ajout dans `ColonnesDuRegistre`.

## Références

- `apps/web/src/features/lieux-activite/implementation/prisma/registre/`
- `docs/runbook-migrations-entrepot.md`
