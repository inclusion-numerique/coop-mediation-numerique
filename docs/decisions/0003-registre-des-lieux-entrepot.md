# ADR-003 : Registre des lieux de l'Entrepôt

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                                            |
| ---------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-11 | Marc Gavanier | Rédaction initiale : extraction de la section « Registre des lieux de l'Entrepôt » de `CONTRIBUTING.md`                           |
| 2026-09-11 | Marc Gavanier | Règles de lecture : le registre prime sauf sur le partage à la cartographie ; « modifié depuis » se dérive des quatre horodatages |
| 2026-11-17 | Marc Gavanier | Réécriture alignée sur les abilities                                                                                              |

## Statut

Accepté

## Contexte

Le Dataspace gère les données de l'inclusion numérique ; la coop gère son application. Le Dataspace
fait autorité sur le schéma `main`, et la coop s'y conforme
([ADR-002](./0002-migration-structures-employeuses-vers-main.md)).

Les lieux existent deux fois : dans le registre du Dataspace, `main.lieu_inclusion`, d'où la coop
affiche leurs données, et dans la table de lieux de la coop, à laquelle se rattachent de nombreuses
relations métier propres à l'application. Fusionner les deux tables reporterait ces relations dans
le schéma du Dataspace, ce qui n'est pas souhaitable. Les deux tables vivent dans la même base,
dans deux schémas distincts.

L'historique des saisies du médiateur est un effet de bord de cette séparation, et la coop
l'exploite : si une autre source a modifié le lieu, le médiateur peut revenir rapidement à sa
saisie, par la fenêtre de comparaison de l'ability
[modifier la fiche du lieu](../../src/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/modifier-la-fiche-du-lieu.ability.md).

Un rattrapage quotidien existe côté Dataspace, mais il ne couvre que l'identité du lieu, pas ses
champs métier. Sans écriture explicite dans le registre, une valeur métier corrigée dans la coop
resterait invisible pour les autres consommateurs.

## Décision

### Double écriture, en une seule transaction

Chaque enregistrement relatif à un lieu écrit dans la table de lieux de la coop et dans le registre,
en une seule transaction. Les cas concernés sont décrits par les abilities
[modifier la fiche du lieu](../../src/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/modifier-la-fiche-du-lieu.ability.md),
[créer un lieu d'activité](../../src/features/lieux-activite/abilities/creer-lieu-activite/creer-lieu-activite.ability.md),
[ajouter des lieux d'activité](../../src/features/lieux-activite/abilities/ajouter-des-lieux-activite/ajouter-des-lieux-activite.ability.md),
[renseigner ses lieux d'activité à l'inscription](../../src/features/inscription/abilities/renseigner-lieux-activite/renseigner-lieux-activite.ability.md),
[la structure employeuse comme lieu d'activité](../../src/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/ajouter-structure-employeuse-en-lieu.ability.md)
et [fusionner des lieux](../../src/features/lieux-activite/abilities/fusionner-des-lieux/fusionner-des-lieux.ability.md).

### Colonnes ouvertes en écriture

Le Dataspace décide, par les droits de la base, des colonnes du registre ouvertes en écriture à la
coop. La coop n'écrit que celles-là ; les autres sont alimentées par d'autres producteurs. Ouvrir
une nouvelle colonne se demande à l'équipe Dataspace. Aucune liste de colonnes n'est recopiée ici :
elle dériverait à la première évolution.

### Les dates disent la vérité

La date de modification côté coop reflète une modification réelle du contenu. Elle ne bouge jamais
lors d'un changement en masse sans modification de valeur : le Dataspace s'en sert pour arbitrer la
fraîcheur entre sources.

La date de modification globale du registre est calculée par la base à partir de quatre dates. La
coop ne l'écrit jamais.

Le filtre « modifié depuis » de l'API de la coop et la date qu'elle expose se calculent sur ces
mêmes quatre dates. S'ils regardaient des dates différentes, un lieu écarté par le filtre alors que
sa date le dit récent serait perdu pour toujours par une synchronisation incrémentale, qui ne
redemande jamais ce qu'elle croit à jour.

### En lecture, le registre prime

L'affichage d'un lieu vient du registre, sauf pour quelques éléments dont la coop fait autorité :

- le SIRET ou le RNA, élément technique qui indique si l'identification vient du registre Sirène
  ou d'une saisie ;
- la localisation ;
- le nom d'usage, par lequel le médiateur surcharge un nom officiel trop générique ou périmé ;
- l'identifiant d'adresse ;
- la visibilité sur la carte, décision du médiateur, qui n'a accès qu'au schéma de la coop.

L'API de la coop expose les données propres de la coop. Le Dataspace les ingère et décide de
l'affichage final ; la cartographie nationale lit le Dataspace.

Pour chercher des lieux dans la cartographie, la coop utilise un second client Prisma, en lecture
seule. La cible sur les clients Prisma est décrite par
l'[ADR-002](./0002-migration-structures-employeuses-vers-main.md).

### Dépublication

Toute dépublication côté coop est répercutée au registre. Voir
[modifier la fiche du lieu](../../src/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/modifier-la-fiche-du-lieu.ability.md)
et [fusionner des lieux](../../src/features/lieux-activite/abilities/fusionner-des-lieux/fusionner-des-lieux.ability.md).

### Adresses et périmètre d'écriture

Les adresses sont partagées dans `main` : la coop cherche ou crée une adresse par la fonction prévue
à cet effet, repointe le lieu dessus, et ne modifie jamais une adresse existante en place. Voir
[créer un lieu d'activité](../../src/features/lieux-activite/abilities/creer-lieu-activite/creer-lieu-activite.ability.md).

Pour les lieux, la coop n'écrit que dans le registre et, par cette fonction, dans la table des
adresses. Elle n'écrit jamais dans les autres tables de `main` liées aux lieux.

### Règle opératoire

> **Tout script SQL, rattrapage ou migration qui touche la table de lieux de la coop en dehors de
> l'application doit passer par l'application, ou être signalé à l'équipe Dataspace.**

Un rattrapage se fait à dates inchangées.

## Alternatives écartées

### Un trigger PostgreSQL ou une réplication vers `main`

L'adoption d'une inscription déjà présente dans le registre relève de la logique applicative
(corrélation, arbitrage de la ligne existante). Un trigger la contournerait et casserait cette
adoption. La double écriture applicative garde la décision là où elle est décidable.

### S'en remettre au rattrapage quotidien du Dataspace

Il ne couvre que l'identité du lieu. Les champs métier (services, horaires, présentation, contact)
resteraient sur leur ancienne valeur chez tous les consommateurs.

## Conséquences

- Une correction faite en SQL direct laisse le registre sur l'ancienne valeur, et les consommateurs
  avec : d'où la règle opératoire ci-dessus.
- Un changement de dates en masse fausse durablement l'arbitrage de fraîcheur entre sources.
- Ouvrir une nouvelle colonne du registre à l'écriture se demande à l'équipe Dataspace.

## Où trouver le détail

Les abilities décrivent chaque comportement ; ce sont des specs exécutables, jouées par les tests
Cucumber de chaque feature, et elles font foi.

- Feature lieux d'activité : les [abilities](../../src/features/lieux-activite/abilities/),
  dont [modifier la fiche du lieu](../../src/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/modifier-la-fiche-du-lieu.ability.md),
  [créer un lieu d'activité](../../src/features/lieux-activite/abilities/creer-lieu-activite/creer-lieu-activite.ability.md)
  et [ajouter des lieux d'activité](../../src/features/lieux-activite/abilities/ajouter-des-lieux-activite/ajouter-des-lieux-activite.ability.md).
- Feature inscription : [renseigner ses lieux d'activité](../../src/features/inscription/abilities/renseigner-lieux-activite/renseigner-lieux-activite.ability.md)
  et [la structure employeuse comme lieu d'activité](../../src/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/ajouter-structure-employeuse-en-lieu.ability.md).
- Fusion : [fusionner des lieux](../../src/features/lieux-activite/abilities/fusionner-des-lieux/fusionner-des-lieux.ability.md).

## Références

- [ADR-002 : Les structures employeuses vivent dans main (Dataspace)](./0002-migration-structures-employeuses-vers-main.md)
