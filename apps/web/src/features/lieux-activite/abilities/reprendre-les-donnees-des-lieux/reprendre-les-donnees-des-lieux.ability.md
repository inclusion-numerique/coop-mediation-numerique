# Feature: Reprendre les données des lieux d'activité

Les fiches de lieux ont été saisies, importées et moissonnées avant que le
standard de la médiation numérique ne les gouverne. Une passe relève ce que les
règles n'acceptent plus et reprend ce qui se reprend sans arbitrage.

Chaque reprise est ajoutée séparément, une fois la précédente vérifiée sur la
base. La première est le tri des listes de vocabulaire.

## Rule: L'ordre d'une liste de vocabulaire ne porte aucune information

> Deux fiches qui annoncent les mêmes services doivent les annoncer dans le même
> ordre, sans quoi toute comparaison — entre la coop et le registre, entre deux
> versions d'une même fiche — invente une différence qui n'existe pas (D37).
> Une valeur répétée ne dit rien de plus non plus.

### Scenario: Une liste désordonnée est relevée puis triée

* Given un lieu dont les services sont désordonnés
* When on reprend les données des lieux
* Then le relevé compte ce lieu dans la colonne "services"
* And les services du lieu sont triés

### Scenario: Un lieu dont tout est en ordre reste hors du relevé

> Un relevé énumère ce qu'il reste à faire, pas ce qui va bien.

* Given un lieu dont les listes sont en ordre
* When on reprend les données des lieux
* Then le relevé ne retient pas ce lieu

## Rule: Le registre est trié dans la même transaction que la coop

> Le lieu paraît sur la cartographie nationale par son inscription au registre :
> trier d'un côté seulement recréerait l'écart qu'on vient de supprimer.

### Scenario: La coop et le registre sont triés ensemble

* Given un lieu dont les services sont désordonnés
* And il est inscrit au registre avec les mêmes services désordonnés
* When on reprend les données des lieux
* Then les services du lieu sont triés
* And les services de son inscription au registre sont triés

## Rule: Trier une liste ne date pas la fiche

> Une date de mise à jour annonce à ceux qui republient le lieu que quelque
> chose a changé pour le public. Un tri ne change rien pour le public : le
> signaler fabriquerait le faux changement que ce tri vient supprimer.

### Scenario: La date de modification ne bouge pas

* Given un lieu dont les services sont désordonnés
* When on reprend les données des lieux
* Then la date de modification du lieu n’a pas bougé

## Rule: Relever sans reprendre est la même passe menée avec des ports qui n'écrivent pas

> On regarde avant de toucher. Ce que la passe écrit tient à ses ports et non à
> un drapeau : le relevé d'une passe à blanc est celui qu'on obtiendrait.

### Scenario: Une passe à blanc relève sans rien reprendre

* Given un lieu dont les services sont désordonnés
* When on relève les données des lieux sans les reprendre
* Then le relevé compte ce lieu dans la colonne "services"
* And les services du lieu sont restés en l’état
