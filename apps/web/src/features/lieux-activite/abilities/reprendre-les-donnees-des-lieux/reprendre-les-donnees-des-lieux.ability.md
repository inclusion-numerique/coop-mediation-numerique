# Feature: Reprendre les données des lieux d'activité

Les fiches de lieux ont été saisies, importées et moissonnées avant que le
standard de la médiation numérique ne les gouverne. Une passe relève ce que les
règles n'acceptent plus et reprend ce qui se reprend sans arbitrage.

Chaque reprise est ajoutée séparément, une fois la précédente vérifiée sur la
base.

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

## Rule: Des horaires que le format refuse se réparent plutôt qu'ils ne se perdent

> Le format OpenStreetMap n'accepte un commentaire qu'entre guillemets, en fin
> de chaîne. Or la coop a enregistré des notes collées aux créneaux, et le
> modèle rejetait la valeur entière : ces lieux n'affichaient aucun horaire
> alors qu'ils en portaient. On guillemète la note, on garde les créneaux.

### Scenario: Un commentaire non guillemeté est remis à sa place

* Given un lieu dont les horaires portent un commentaire non guillemeté
* When on reprend les données des lieux
* Then le relevé annonce des horaires à corriger
* And les horaires du lieu sont corrigés

### Scenario: Le registre est corrigé en même temps que la coop

* Given un lieu dont les horaires portent un commentaire non guillemeté
* And il est inscrit au registre avec les mêmes horaires
* When on reprend les données des lieux
* Then les horaires du lieu sont corrigés
* And les horaires de son inscription au registre sont corrigés

## Rule: Une précision qui n'est pas un horaire descend dans la description

> « Sur rendez-vous uniquement » n'est pas un horaire : il n'y a aucun créneau à
> en tirer, et le champ la rendait invisible puisque le modèle rejetait la
> valeur. Ce n'est pas une raison pour la perdre — c'est ce que le lieu avait à
> dire de son accueil, et la description est faite pour ça. La chaîne paraît
> telle quelle au relevé, pour qu'on la lise avant qu'elle ne change de place.

### Scenario: Une note sans créneau descend dans une description vide

* Given un lieu dont les horaires ne portent aucun créneau
* When on reprend les données des lieux
* Then le relevé annonce des horaires à déplacer
* And les horaires du lieu sont effacés
* And la note passe dans la description du lieu

### Scenario: Une note sans créneau rejoint une description déjà écrite

* Given un lieu sans créneau mais avec une description
* When on reprend les données des lieux
* Then les horaires du lieu sont effacés
* And la note rejoint la description déjà écrite

## Rule: Une suite de créneaux que rien ne rattrape s'efface

> Une chaîne qui nomme des jours et des heures voulait être un horaire, pas une
> précision. Mal écrite au point qu'on ne puisse pas la lire, elle n'a rien à
> faire dans la description d'un lieu : on ne descend pas `09:00-14:00-19:00`
> sous le nez du public. Elle paraît telle quelle au relevé, puis elle part.

### Scenario: Des créneaux illisibles sont montrés puis effacés

* Given un lieu dont les créneaux sont illisibles
* When on reprend les données des lieux
* Then le relevé annonce des horaires à effacer
* And les horaires du lieu sont effacés
* And la description du lieu n’a pas bougé

## Rule: Le registre est repris dans la même transaction que la coop

> Le lieu paraît sur la cartographie nationale par son inscription au registre :
> reprendre d'un côté seulement recréerait l'écart qu'on vient de supprimer.

### Scenario: La coop et le registre sont triés ensemble

* Given un lieu dont les services sont désordonnés
* And il est inscrit au registre avec les mêmes services désordonnés
* When on reprend les données des lieux
* Then les services du lieu sont triés
* And les services de son inscription au registre sont triés

## Rule: Une reprise ne date pas la fiche

> Une date de mise à jour annonce à ceux qui republient le lieu que quelqu'un a
> tenu la fiche. Personne ne l'a tenue : on répare ce que d'anciens imports ont
> laissé. La dater ferait passer une réparation pour une mise à jour.

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

### Scenario: Une passe à blanc ne corrige aucun horaire

* Given un lieu dont les horaires portent un commentaire non guillemeté
* When on relève les données des lieux sans les reprendre
* Then le relevé annonce des horaires à corriger
* And les horaires du lieu sont restés en l’état

## Rule: Un téléphone français s'écrit en E.164

> Le standard veut l'indicatif international. Un numéro noté à la française
> désigne pourtant le même poste : on le réécrit plutôt que de le perdre, en
> prenant l'indicatif du territoire dans le code postal du lieu.

### Scenario: Un numéro noté à la française est réécrit

* Given un lieu dont le téléphone est noté à la française
* When on reprend les données des lieux
* Then le relevé compte ce lieu dans la colonne "telephone"
* And le téléphone du lieu est écrit en E.164

## Rule: Une adresse sans domaine n'est pas une adresse

> Des imports ont laissé des `https://www.` sans rien derrière. Il n'y a pas de
> site à visiter là : la valeur paraît au relevé, puis elle part. Une autre
> adresse de la même fiche n'en souffre pas — c'est l'élément fautif qui tombe,
> pas la liste.

### Scenario: Seule l'adresse sans domaine disparaît

* Given un lieu dont un site web n’a pas de domaine
* When on reprend les données des lieux
* Then le relevé montre l’adresse abandonnée
* And le lieu garde son autre site web
