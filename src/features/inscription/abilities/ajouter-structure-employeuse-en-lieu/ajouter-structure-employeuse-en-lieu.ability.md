# Feature: La structure employeuse comme lieu d’activité

## Rule: Déclarer sa structure employeuse comme lieu d’activité la confie au rattachement

Le lieu ne porte aucun lien vers l’employeuse : l’inscription la décrit comme un
lieu — sa dénomination, son adresse reconnue, son référent — et confie ce lieu
décrit au rattachement, qui le crée ou le rejoint.

### Scenario: Oui — la structure employeuse est confiée au rattachement

* Given je suis médiateur
* And j’ai une structure employeuse
* When je déclare que ma structure employeuse est un lieu d’activité
* Then ma structure employeuse est confiée au rattachement

## Rule: Déclarer que ce n’est pas un lieu d’activité la confie au détachement

### Scenario: Non — la structure employeuse est confiée au détachement

* Given je suis médiateur
* And j’ai une structure employeuse
* When je déclare que ma structure employeuse n’est pas un lieu d’activité
* Then ma structure employeuse est confiée au détachement

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
* And rien n’est confié au rattachement

### Scenario: Une panne du service d’adresse ne passe pas pour une adresse introuvable

* Given je suis médiateur
* And j’ai une structure employeuse
* And le service d’adresse est indisponible
* When je déclare que ma structure employeuse est un lieu d’activité
* Then la déclaration m’est refusée faute de service d’adresse
* And rien n’est confié au rattachement

### Scenario: Le lieu porte l’adresse que la Base Adresse Nationale rend

* Given je suis médiateur
* And j’ai une structure employeuse
* When je déclare que ma structure employeuse est un lieu d’activité
* Then ma structure employeuse est confiée au rattachement
* And le lieu confié porte l’adresse de la Base Adresse Nationale
