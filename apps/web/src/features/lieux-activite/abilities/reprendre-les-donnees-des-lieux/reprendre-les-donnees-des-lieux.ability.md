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

## Rule: Les listes de contact se rangent comme les autres

> L'ordre d'une liste ne porte aucune information, qu'elle nomme des services ou
> des adresses (D37). Le registre le sait déjà — il reçoit la liste par le
> domaine, qui la range — si bien qu'une coop qui garde l'ordre de saisie
> diverge de lui sans que rien n'ait change.

### Scenario: Des courriels dans le désordre sont rangés

* Given un lieu dont les courriels sont désordonnés
* When on reprend les données des lieux
* Then le relevé compte ce lieu dans la colonne "courriels"
* And les courriels du lieu sont rangés

## Rule: La coop n'écrit au registre que ce qu'elle possède

> Le registre accueille d'autres producteurs que la coop : un lieu peut y porter
> un téléphone ou un site web dont la coop n'a rien. Une reprise n'a donc le
> droit de toucher qu'au champ dont elle s'occupe — ranger des courriels ne
> saurait faire disparaître un numéro que quelqu'un d'autre y a mis.

### Scenario: Ranger les courriels laisse intact le reste du contact

* Given un lieu dont les courriels sont désordonnés
* And son inscription au registre porte un téléphone que la coop n’a pas
* When on reprend les données des lieux
* Then les courriels du lieu sont rangés
* And ses courriels au registre sont rangés
* And son inscription au registre garde ce téléphone

## Rule: Un lieu publié sans service se retire de la carte

> Une fiche publiée dit à quelqu'un qui cherche de l'aide où il peut en trouver.
> Sans un seul service annoncé, elle n'oriente personne. Le lieu reste dans la
> coop, il quitte la cartographie — le retirer n'efface rien, et ses médiateurs
> le retrouvent entier le jour où ils déclarent ce qu'ils y font.

### Scenario: Le lieu sans service quitte la cartographie

* Given un lieu publié qui n’annonce aucun service
* When on reprend les données des lieux
* Then le relevé compte ce lieu dans la colonne "publication"
* And le lieu ne paraît plus sur la cartographie

## Rule: Le RNA n'immatricule plus un lieu

> Le pivot du standard est le SIRET, et lui seul (D13). Un numéro RNA en base
> n'est plus lu par personne : il ne désigne plus rien, il encombre. Le relevé
> montre sa valeur avant qu'elle ne parte.

### Scenario: Un RNA est montré puis effacé

* Given un lieu qui porte un RNA
* When on reprend les données des lieux
* Then le relevé montre le RNA effacé
* And le lieu ne porte plus de RNA

## Rule: Un résumé trop long descend dans la description

> Le résumé annonce le lieu en deux phrases ; au-delà de deux cent quatre-vingts
> caractères, ce n'est plus un résumé mais une description. On le déplace plutôt
> que de le tronquer, et s'il redit ce que la description porte déjà, il s'en va
> sans rien ajouter.

### Scenario: Un résumé trop long rejoint la description

* Given un lieu dont le résumé dépasse la longueur admise
* When on reprend les données des lieux
* Then le relevé compte ce lieu dans la colonne "presentationResume"
* And le résumé du lieu descend dans sa description

## Rule: Une adresse ne se garde que si la Base Adresse Nationale la rend elle-même

> Une adresse qu'aucun référentiel ne connaît n'est pas une adresse : c'est une
> phrase. Le lieu qui la porte ne se situe sur aucune carte et ne se compare à
> aucun autre. La base doit donc porter exactement ce que la Base Adresse
> Nationale rend — voie, commune, codes, identifiant et coordonnées comprises.
> Au-delà de quatre-vingt-dix centièmes d'appariement, c'est la même adresse, et
> c'est sa version à elle qui fait foi.
>
> On l'interroge deux fois sur la même adresse, avec puis sans le code postal
> enregistré, et on garde la réponse la mieux notée qui tienne. Le code postal
> est l'une des données qu'on vient justement lui chercher : le lui donner en
> entrée, c'est lui demander de confirmer une erreur. Dès qu'une commune en porte
> plusieurs, elle préfère alors n'importe quelle voie du code postal demandé à la
> bonne voie — « Route de Marseille » à Avignon devient « Route de Lyon » parce
> que la première est en 84140 et non en 84000. L'ôter seul ne suffit pas non
> plus : ailleurs, c'est lui qui départage.
>
> Un lieu-dit est une adresse entière là où il n'y a pas de voie — « Le Bourg »,
> « Terres Sainville », « Bois de Nèfles ». La Base Adresse Nationale le range à
> part de ses voies, mais c'est bien l'adresse du lieu, et elle se garde comme
> une autre.

### Scenario: La mieux notée des deux réponses l'emporte

* Given un lieu dont l’adresse diffère de celle de la Base Adresse Nationale
* And la Base Adresse Nationale rend deux réponses de qualité inégale
* When on reprend les données des lieux
* Then l’adresse du lieu est celle que la Base Adresse Nationale rend

### Scenario: Un lieu-dit est une adresse comme une autre

* Given un lieu dont l’adresse est un lieu-dit
* And la Base Adresse Nationale rend un lieu-dit
* When on reprend les données des lieux
* Then le relevé compte ce lieu dans la colonne "adresse"
* And l’adresse du lieu est celle que la Base Adresse Nationale rend

## Rule: La commune reste la même quand seul son code change

> Paris, Marseille et Lyon portent un code de commune que la Base Adresse
> Nationale n'emploie pas : elle répond par l'arrondissement. Une commune nouvelle
> a remplacé celles qui l'ont formée, et nos fiches portent encore l'ancien code —
> la Base Adresse Nationale le dit elle-même en rendant le code déchu à côté du
> sien. Dans les deux cas c'est la même commune, et refuser l'adresse pour cette
> seule raison ferait tomber des appariements parfaits.

### Scenario: L'adresse est réalignée sur celle de la Base Adresse Nationale

* Given un lieu dont l’adresse diffère de celle de la Base Adresse Nationale
* When on reprend les données des lieux
* Then le relevé compte ce lieu dans la colonne "adresse"
* And l’adresse du lieu est celle que la Base Adresse Nationale rend
* And l’inscription au registre pointe vers une adresse

### Scenario: L'arrondissement rendu vaut la commune enregistrée

* Given un lieu d’une ville à arrondissements
* And la Base Adresse Nationale répond par l’arrondissement
* When on reprend les données des lieux
* Then l’adresse du lieu est celle que la Base Adresse Nationale rend

### Scenario: La commune nouvelle vaut celle qu'elle a remplacée

* Given un lieu d’une commune qui a fusionné
* And la Base Adresse Nationale répond par la commune nouvelle
* When on reprend les données des lieux
* Then l’adresse du lieu est celle que la Base Adresse Nationale rend

## Rule: Ce que la Base Adresse Nationale ne reconnaît pas n'est pas corrigé d'office

> Un repli sur le centre de la commune ne désigne pas un lieu, une voie trouvée
> dans une autre commune contredit ce qui est enregistré, et un appariement
> faible n'est qu'une ressemblance. Aucun des trois ne se tranche sans qu'on
> l'ait regardé : ils paraissent au relevé avec leur motif, et rien n'est écrit.
>
> Encore faut-il ne pas prendre pour faible ce qui ne l'est pas. Le score de la
> Base Adresse Nationale mêle la ressemblance du libellé à sa propre confiance, et
> chute pour des raisons qui ne nous regardent pas : une particule, un hameau
> entre parenthèses, un prénom qu'elle connaît et pas nous. Deux recours lui sont
> donc opposés. Le rapprochement d'abord — la ressemblance des voies, corrigée par
> la distance : deux adresses au même point et dont le nom propre coïncide sont la
> même, même si l'une dit « place » et l'autre « chemin ». L'inclusion des mots
> ensuite : la ligne enregistrée porte le nom du bâtiment ou du service en plus de
> la voie — « 32 RUE FREDERIC MISTRAL LA STATION » —, ou c'est la Base Adresse
> Nationale qui complète un prénom que nous n'avions pas. Deux voies réellement
> différentes ne se contiennent pas.

### Scenario: Une voie mal qualifiée au même point est retenue

* Given un lieu dont la voie est mal qualifiée
* And la Base Adresse Nationale doute de son appariement
* When on reprend les données des lieux
* Then l’adresse du lieu est celle que la Base Adresse Nationale rend

### Scenario: La voie noyée dans le nom du bâtiment est retenue

* Given un lieu dont la voie est noyée dans le nom du bâtiment
* And la Base Adresse Nationale doute de son appariement
* When on reprend les données des lieux
* Then l’adresse du lieu est celle que la Base Adresse Nationale rend

### Scenario: Une tout autre voie reste refusée, fût-elle au même point

* Given un lieu dont la voie ne ressemble à aucune autre
* And elle doute et rend une tout autre voie
* When on reprend les données des lieux
* Then le relevé compte ce lieu dans la colonne "adresse"
* And l’adresse du lieu n’a pas bougé

## Rule: Le numéro de voie ne se perd qu'au même endroit

> L'adresse rendue n'a pas toujours le numéro que la nôtre porte, ou porte celui
> qui nous manquait. Au même endroit, c'est sans conséquence : la Base Adresse
> Nationale ne connaît pas ce numéro-là, son point est celui du lieu, et sa
> version fait foi comme pour le reste. Plus loin, l'adresse « à la voie » n'est
> plus qu'une ressemblance de nom et échangerait une précision contre une source.

### Scenario: Une voie introuvable paraît au relevé sans être corrigée

* Given un lieu dont l’adresse diffère de celle de la Base Adresse Nationale
* And la Base Adresse Nationale ne reconnaît pas la voie
* When on reprend les données des lieux
* Then le relevé compte ce lieu dans la colonne "adresse"
* And l’adresse du lieu n’a pas bougé

### Scenario: Le numéro se perd au point même du lieu

* Given un lieu dont la voie porte un numéro
* And la Base Adresse Nationale rend la voie sans son numéro
* When on reprend les données des lieux
* Then l’adresse du lieu est celle que la Base Adresse Nationale rend

### Scenario: Le numéro ne se perd pas pour une voie située ailleurs

* Given un lieu dont la voie porte un numéro
* And elle rend la voie sans son numéro, à trois cents mètres de là
* When on reprend les données des lieux
* Then le relevé compte ce lieu dans la colonne "adresse"
* And l’adresse du lieu n’a pas bougé

## Rule: Le point du lieu rattrape ce que son adresse ne dit pas

> Des imports ont écrit dans la ligne de voie le nom de la commune, celui du
> bâtiment, ou rien du tout, tout en posant des coordonnées justes. Le point, lui,
> ne ment pas : on demande à la Base Adresse Nationale ce qui s'y trouve. Encore
> faut-il que l'adresse rendue soit à portée — au-delà de vingt-cinq mètres, ce
> n'est plus le même endroit — et dans la commune enregistrée, faute de quoi ce
> sont les coordonnées qui sont fausses.
>
> Le point est un recours, jamais une source : quand la Base Adresse Nationale
> reconnaît déjà l'adresse écrite, c'est elle qui fait foi.
>
> Le point décide seul quand la voie se tait — vide, réduite au nom de la
> commune, ou ne nommant aucun type de voie. Là où une voie est écrite, il ne
> peut que la confirmer : il faut qu'il en porte les mêmes mots, ou qu'il lui
> ressemble assez, et le numéro n'entre pas dans la comparaison puisque c'est
> justement ce qu'il apporte ou retire. Le remplacer sans cela reviendrait à
> croire les coordonnées plus que la saisie, et « Route de Marseille »
> deviendrait « Route de Lyon » parce que le point est mal placé.

### Scenario: L'adresse est retrouvée au point du lieu

* Given un lieu dont la voie ne nomme aucune voie
* And la Base Adresse Nationale ne reconnaît pas la voie
* And elle retrouve une adresse au point du lieu
* When on reprend les données des lieux
* Then le relevé compte ce lieu dans la colonne "adresse"
* And l’adresse du lieu est celle que la Base Adresse Nationale rend

### Scenario: Un point trop éloigné de son adresse ne sert à rien

* Given un lieu dont la voie ne nomme aucune voie
* And la Base Adresse Nationale ne reconnaît pas la voie
* And elle retrouve une adresse trop loin du point du lieu
* When on reprend les données des lieux
* Then la voie du lieu n’a pas bougé

### Scenario: Le point confirme la voie écrite

* Given un lieu dont l’adresse diffère de celle de la Base Adresse Nationale
* And la Base Adresse Nationale ne reconnaît pas la voie
* And elle retrouve au point la voie écrite, sans son numéro
* When on reprend les données des lieux
* Then le relevé compte ce lieu dans la colonne "adresse"
* And l’adresse du lieu est celle que la Base Adresse Nationale rend

### Scenario: Le point ne remplace pas une voie qui parle

* Given un lieu dont l’adresse diffère de celle de la Base Adresse Nationale
* And la Base Adresse Nationale ne reconnaît pas la voie
* And elle retrouve au point une tout autre voie
* When on reprend les données des lieux
* Then l’adresse du lieu n’a pas bougé
