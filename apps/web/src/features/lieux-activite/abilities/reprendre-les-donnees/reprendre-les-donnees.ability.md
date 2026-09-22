# Feature: Reprendre les données des lieux d'activité

Les fiches de lieux ont été saisies, importées et moissonnées avant que le
standard de la médiation numérique ne les gouverne. Une passe confronte chaque
valeur au modèle qui la gouverne désormais, rend de quoi décider, et reprend ce
qui se reprend sans arbitrage.

## Rule: Une valeur qu'un champ obligatoire refuse écarte le lieu

> Sans adresse valide, ce n'est pas une fiche diminuée : c'est une fiche qu'on
> ne sait plus désigner, et qu'on ne saurait pas atteindre sur une carte (D21).

### Scenario: Le lieu sans voie est signalé comme écarté

* Given un lieu dont la voie est vide
* When on reprend les données des lieux
* Then le relevé compte ce lieu parmi les écartés
* And il porte le motif "voie-absente"

## Rule: Une valeur qu'un champ facultatif refuse se perd, le lieu reste

> Un horaire illisible ne doit pas faire disparaître un lieu de la carte : il y
> reste utile sans ses horaires, il n'existe plus du tout s'il est écarté.

### Scenario: Le lieu aux horaires illisibles reste, son horaire se perd

* Given un lieu dont les horaires ne suivent pas le format OpenStreetMap
* When on reprend les données des lieux
* Then le relevé ne compte pas ce lieu parmi les écartés
* And il porte le motif "horaires-non-osm"

## Rule: L'ordre d'une liste de vocabulaire ne porte aucune information

> Deux fiches qui annoncent les mêmes services doivent les annoncer dans le même
> ordre, sans quoi toute comparaison — entre la coop et le registre, entre deux
> versions d'une même fiche — invente une différence qui n'existe pas (D37).
>
> C'est la seule reprise que cette passe s'autorise : ranger ne choisit rien à la
> place de personne.

### Scenario: Une liste désordonnée est relevée puis rangée

* Given un lieu dont les services sont désordonnés
* When on reprend les données des lieux
* Then il porte le motif "liste-desordonnee"
* And les services du lieu sont rangés

### Scenario: Le registre est rangé dans la même transaction que la coop

> Le lieu paraît sur la cartographie nationale par son inscription au registre :
> ranger d'un côté seulement recréerait l'écart qu'on vient de supprimer.

* Given un lieu dont les services sont désordonnés
* And il est inscrit au registre avec les mêmes services désordonnés
* When on reprend les données des lieux
* Then les services du lieu sont rangés
* And les services de son inscription au registre sont rangés

### Scenario: Ranger une liste ne date pas la fiche

> Une date de mise à jour annonce à ceux qui republient le lieu que quelque
> chose a changé pour le public. Un tri ne change rien pour le public : le
> signaler fabriquerait le faux changement que ce tri vient supprimer.

* Given un lieu dont les services sont désordonnés
* When on reprend les données des lieux
* Then la date de modification du lieu n’a pas bougé

## Rule: Mesurer sans reprendre est la même passe menée avec des ports qui n'écrivent pas

> On regarde avant de toucher. Ce que la passe écrit tient à ses ports et non à
> un drapeau : le relevé d'une passe à blanc est celui qu'on obtiendrait.

### Scenario: Une passe à blanc relève sans rien ranger

* Given un lieu dont les services sont désordonnés
* When on mesure les données des lieux sans rien reprendre
* Then il porte le motif "liste-desordonnee"
* And les services du lieu sont restés en l’état
