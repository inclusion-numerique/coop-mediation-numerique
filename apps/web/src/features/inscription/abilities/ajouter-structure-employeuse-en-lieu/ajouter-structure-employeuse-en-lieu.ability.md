# Feature: La structure employeuse comme lieu d’activité

## Rule: Déclarer sa structure employeuse comme lieu d’activité la rattache

### Scenario: Oui — la structure employeuse devient un lieu d’activité

* Given je suis médiateur
* And j’ai une structure employeuse
* When je déclare que ma structure employeuse est un lieu d’activité
* Then ma structure employeuse est rattachée comme lieu d’activité

### Scenario: Rattacher deux fois ne crée qu’un seul lieu d’activité

* Given je suis médiateur
* And j’ai une structure employeuse
* And ma structure employeuse est déjà rattachée comme lieu d’activité
* When je déclare que ma structure employeuse est un lieu d’activité
* Then ma structure employeuse n’a qu’un seul lieu d’activité actif

### Scenario: Deux médiateurs de la même employeuse partagent le lieu

* Given je suis médiateur
* And j’ai une structure employeuse
* And un collègue partage ma structure employeuse
* When je déclare que ma structure employeuse est un lieu d’activité
* And mon collègue déclare que notre structure employeuse est un lieu d’activité
* Then nous sommes rattachés au même lieu d’activité

## Rule: Déclarer que ce n’est pas un lieu d’activité la détache

### Scenario: Non — la structure employeuse cesse d’être un lieu d’activité

* Given je suis médiateur
* And j’ai une structure employeuse
* And ma structure employeuse est déjà rattachée comme lieu d’activité
* When je déclare que ma structure employeuse n’est pas un lieu d’activité
* Then ma structure employeuse n’est plus rattachée comme lieu d’activité

## Rule: Une employeuse que la coop connaît déjà comme lieu n’est pas recréée

Le lieu ne porte aucun lien vers l’employeuse : on le reconnaît par la sonde de
corrélation de la feature. La coop peut déjà le connaître sous une autre
dénomination que celle de `main` — le comparer à l’identique en créerait un
doublon.

### Scenario: L’employeuse est rattachée au lieu que la coop connaissait déjà

* Given je suis médiateur
* And j’ai une structure employeuse dénommée comme une mairie
* And la coop connaît déjà ce lieu sous la dénomination de la commune
* When je déclare que ma structure employeuse est un lieu d’activité
* Then je suis rattaché au lieu que la coop connaissait déjà
* And ce lieu n’a pas été recréé

## Rule: Le lieu matérialisé s’inscrit au registre de l’Entrepôt

Matérialiser une employeuse en lieu, c’est poser la fiche des deux côtés dans la
même transaction. Sans quoi ce lieu n’existerait pour le registre national qu’à
sa première modification, qui l’y rattraperait. Rien n’est inscrit quand la sonde
a corrélé : on rejoint alors une fiche que la coop connaissait déjà.

### Scenario: L’employeuse matérialisée en lieu paraît au registre

* Given je suis médiateur
* And j’ai une structure employeuse
* When je déclare que ma structure employeuse est un lieu d’activité
* Then ce lieu d’activité est inscrit au registre

## Rule: On ne matérialise pas un lieu dont la Base Adresse Nationale ignore l’adresse

L’adresse de l’employeuse vient de SIRENE, qui mêle au libellé de voie le nom du
bâtiment, la boîte postale ou le service — « Ccas 1 Impasse Jean Mermoz », « Bp
117 2 Avenue du Parc ». Créer le lieu avec elle, c’est écrire une adresse que
personne n’a validée et qu’aucune carte ne saura situer. Le refus est celui
qu’oppose déjà la recherche par SIRET, et l’adresse retenue est celle que la
Base Adresse Nationale rend, avec son identifiant et ses coordonnées.

Le refus ne laisse personne sans recours : l’étape suivante permet d’ajouter ce
lieu en saisissant soi-même son adresse, choisie dans la Base Adresse Nationale.

### Scenario: L’adresse de l’employeuse est introuvable

* Given je suis médiateur
* And j’ai une structure employeuse
* And la Base Adresse Nationale ne reconnaît pas son adresse
* When je déclare que ma structure employeuse est un lieu d’activité
* Then la déclaration m’est refusée faute d’adresse reconnue
* And aucun lieu d’activité n’a été créé

### Scenario: Le lieu porte l’adresse que la Base Adresse Nationale rend

* Given je suis médiateur
* And j’ai une structure employeuse
* When je déclare que ma structure employeuse est un lieu d’activité
* Then ma structure employeuse est rattachée comme lieu d’activité
* And l’adresse du lieu est celle de la Base Adresse Nationale
