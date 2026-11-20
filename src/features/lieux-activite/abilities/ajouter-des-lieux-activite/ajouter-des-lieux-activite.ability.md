# Feature: Ajouter des lieux d'activité

> Le médiateur constitue un panier — des lieux trouvés dans la coop, d'autres
> venus de la cartographie nationale, d'autres qu'il saisit lui-même — puis
> valide l'ensemble d'un coup.

## Rule: Ajouter un lieu, c'est y exercer

### Scenario: Un lieu déjà référencé rejoint l'activité du médiateur

* Given un médiateur rattaché à deux lieux d'activité
* And un lieu référencé dans la coop
* When ce médiateur ajoute ce lieu référencé
* Then ce médiateur exerce dans ce lieu référencé

### Scenario: Un lieu que rien n'identifie est créé puis rejoint

* Given un médiateur rattaché à deux lieux d'activité
* When ce médiateur ajoute un lieu saisi « Tiers-lieu du Port »
* Then le lieu « Tiers-lieu du Port » existe
* And ce médiateur exerce dans le lieu « Tiers-lieu du Port »

## Rule: On n'ajoute pas deux fois le même lieu

### Scenario: Un lieu où l'on exerce déjà n'est pas ajouté une seconde fois

* Given un médiateur rattaché à deux lieux d'activité
* When ce médiateur ajoute un lieu où il exerce déjà
* Then ce médiateur n'exerce toujours que dans deux lieux

### Scenario: Le même lieu deux fois dans le panier ne compte qu'une fois

* Given un médiateur rattaché à deux lieux d'activité
* And un lieu référencé dans la coop
* When ce médiateur ajoute deux fois ce lieu référencé
* Then ce médiateur exerce dans trois lieux

## Rule: Un lieu saisi qui désigne un lieu connu ne crée pas de doublon

> La corrélation s'en remet au standard partagé : même adresse, dénomination
> voisine, c'est le même endroit.

### Scenario: Une saisie qui retrouve un lieu existant s'y rattache

* Given un médiateur rattaché à deux lieux d'activité
* And un lieu référencé dans la coop
* When ce médiateur saisit un lieu à la même adresse que ce lieu référencé
* Then aucun lieu n'a été créé
* And ce médiateur exerce dans ce lieu référencé

## Rule: Seul un médiateur ajoute des lieux

### Scenario: Sans médiateur, l'ajout est refusé

* Given un médiateur rattaché à deux lieux d'activité
* When quelqu'un sans médiateur tente d'ajouter un lieu
* Then l'ajout est refusé

### Scenario: Un panier vide n'est pas une demande

* Given un médiateur rattaché à deux lieux d'activité
* When ce médiateur valide un panier vide
* Then l'ajout est refusé

## Rule: Ce qui est matérialisé dans la coop s'inscrit au registre de l'Entrepôt

> Matérialiser un lieu, c'est le poser des deux côtés dans la même transaction.
> Rien de tel quand la sonde a corrélé : on rejoint une fiche que la coop
> connaissait déjà, et le registre n'a rien de nouveau à apprendre.

### Scenario: Un lieu saisi que personne ne connaît est inscrit au registre

* Given un médiateur rattaché à deux lieux d'activité
* When ce médiateur ajoute un lieu saisi « Tiers-lieu du Port »
* Then le lieu « Tiers-lieu du Port » existe
* And le lieu saisi est inscrit au registre

### Scenario: Un lieu venu de la cartographie adopte l'inscription d'où il sort

> Il porte son identifiant de cartographie dès sa création, et le registre a
> forcément déjà la ligne d'où il vient — cet identifiant y est UNIQUE. Inscrire
> sans regarder violerait la contrainte, en plein enregistrement du médiateur.

* Given un médiateur rattaché à deux lieux d'activité
* And le registre connaît déjà un lieu de la cartographie
* When ce médiateur ajoute ce lieu de la cartographie
* Then le registre ne porte qu'une inscription sous cet identifiant
* And cette inscription porte le lien vers le lieu matérialisé

### Scenario: Un lieu que le registre relie déjà à la coop est rejoint, pas recréé

> « Quel lieu coop porte cet identifiant ? » se demande au registre, où il est
> unique — et non à la copie que la coop en tenait, qui ne l'était pas et qu'il
> fallait départager par ancienneté.

* Given un médiateur rattaché à deux lieux d'activité
* And un lieu référencé dans la coop
* And le registre relie ce lieu référencé à un identifiant de cartographie
* When ce médiateur ajoute le lieu de la cartographie ainsi relié
* Then ce médiateur exerce dans ce lieu référencé

## Rule: Un nouveau lieu (nom + adresse géocodée) est matérialisé

### Scenario: Renseigner un nouveau lieu le crée et le rattache

* Given je suis un médiateur
* When je renseigne un nouveau lieu nommé "Maison France Services"
* Then un lieu d’activité nommé "Maison France Services" est créé et rattaché

## Rule: L’id interne prime sur l’id de cartographie nationale

L’id de cartographie nationale n’est pas posé à la création d’un lieu : c’est la
cartographie qui, après agrégation des sources, normalisation et déduplication,
l’attribue au lieu publié. Son absence ne dit donc rien de l’existence du lieu,
et sa présence ne prime jamais sur l’id interne — seule identité certaine d’un
lieu de la coop.

> Le scénario qui vérifiait qu’un doublon de même id carto ne détourne pas le
> rattachement a été retiré : sa prémisse n’existe plus. L’identité
> cartographique vit dans l’inscription au registre de l’Entrepôt, où elle est
> unique — deux lieux de la coop ne peuvent plus la partager. Ce qu’un scénario
> surveillait, une contrainte l’interdit.

### Scenario: Un lieu de la carto introuvable dans l’Entrepôt est matérialisé depuis son adresse

* Given je suis un médiateur
* When je renseigne un lieu de la cartographie nationale introuvable dans l’Entrepôt, nommé "Tiers-lieu du Marais"
* Then un lieu d’activité nommé "Tiers-lieu du Marais" est créé et rattaché

## Rule: Un lieu déjà présent dans la coop n’est jamais recréé

Un lieu venu de la cartographie nationale ou de l’annuaire des entreprises ne
porte pas l’id du lieu coop qui lui correspond, et l’id de cartographie
nationale ne peut pas jouer ce rôle : le lieu créé dans la coop puis publié ne
le porte pas encore. On corrèle donc sur ce qui désigne un ENDROIT — sa
dénomination, à la même adresse, dans la même commune.

### Scenario: Un lieu de la carto que la coop connaît déjà est rattaché, pas recréé

* Given je suis un médiateur
* And un lieu d’activité est disponible
* When je renseigne ce lieu par son entrée de cartographie nationale
* Then ce lieu est un de mes lieux d’activité actifs
* And aucun autre lieu d’activité n’a été créé

### Scenario: Un lieu de l’annuaire des entreprises que la coop connaît déjà est rattaché, pas recréé

* Given je suis un médiateur
* And un lieu d’activité est disponible, identifié par son SIRET
* When je renseigne un lieu de l’annuaire des entreprises à la même adresse
* Then ce lieu est un de mes lieux d’activité actifs
* And aucun autre lieu d’activité n’a été créé

### Scenario: Le même nouveau lieu renseigné deux fois n’est créé qu’une fois

* Given je suis un médiateur
* When je renseigne deux fois le nouveau lieu nommé "Maison France Services"
* Then un seul lieu d’activité nommé "Maison France Services" est créé et rattaché

## Rule: Le SIRET ne dit pas où l’on se trouve

Un SIRET identifie une entité juridique, pas un endroit. Une association dont le
siège est à Paris déclare légitimement ce SIRET pour son antenne de Nantes, et
deux structures distinctes partagent l’adresse d’un même tiers-lieu. Son égalité
ne prouve donc pas qu’il s’agit du même lieu, et sa divergence ne prouve pas
qu’il s’agit de deux lieux — quelle que soit la provenance de la valeur : un
SIRET exact, issu de l’API entreprise, reste muet sur l’endroit.

Le SIRET n’entre donc dans aucun rapprochement de lieux. Il reste stocké sur le
lieu, pour ce qu’il est : le renseignement d’une entité juridique.

### Scenario: Un SIRET différent ne sépare pas deux lieux à la même adresse

* Given je suis un médiateur
* And un lieu d’activité est disponible, identifié par son SIRET
* When je renseigne un lieu de l’annuaire des entreprises de même nom et même adresse, mais d’un autre SIRET
* Then ce lieu est un de mes lieux d’activité actifs
* And aucun autre lieu d’activité n’a été créé

## Rule: Un SIRET soumis par le navigateur n’est pas réputé vérifié

Le SIRET vient de l’annuaire des entreprises, mais il a transité par le
navigateur : le serveur ne peut pas distinguer celui que l’annuaire a rendu de
celui qu’on lui souffle. Il est donc stocké non vérifié — le job de
normalisation lui donnera sa valeur de preuve. L’horodater le dirait vérifié, et
dispenserait précisément ce job de le vérifier.

### Scenario: Le SIRET d’un lieu créé depuis l’annuaire reste à vérifier

* Given je suis un médiateur
* When je renseigne un lieu de l’annuaire des entreprises portant un SIRET
* Then le lieu créé porte ce SIRET, non vérifié
* And le lieu créé porte l’identifiant BAN de son adresse
