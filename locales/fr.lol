<plural($n) {
    $n == 0 ? "zero" : $n == 1 ? "one" : "many"
}>

<user_at_venue "{{$user.firstName}} à: {{$venue.name}}">

<anonymous_at_venue "{{$venue.name}}">

<appname "Place">

<settings "Options">

<twitter_settings "Options Twitter">

<twitter_send_badges "Twitter les badges">

<twitter_send_mayorships "Twitter les titres de Mayor">

<facebook_settings "Options Facebook">

<facebook_send_badges "Poster les badges">

<facebook_send_mayorships "Poster les titres de Mayor">

<geolocation_settings "Géolocalisation">

<geolocation_auto "Auto géolocalisation">

<geolocation_high_accuracy "Haute précision (GPS)">

<account_settings "Mon compte">

<log_out "Se déconnecter">

<contact "Contact">

<contact_email "Envoyer an e-mail">

<contact_website "Visiter le site web">

<home "Accueil">

<refresh "Actualiser">

<search "Rechercher">

<home_title "Qui & Où">

<loading "Chargement…">

<loading_recent_checkins "Chargement des activités récentes…">

<no_recent_checkin "Aucune activité récente">

<back "Retour">

<find_me "Me localiser">

<search_title "Recherche">

<place_placeholder "Où est tu?">

<geolocation_placeholder "Je te cherche…">

<query_placeholder "Qu'est ce que tu recherches?">

<need_location "Où est-ce que je dois chercher {{$query}}?">

<need_location_hint "Donnes moi un indice.">

<geolocation_location_hint "Ou utilises la géolocalisation?">

<unknown_location "Je ne sais pas où {{$place}} se trouve.">

<no_result_near_location "Je n'ai pas trouvé de {{$query}} près de {{$location.highlightedName}}.">

<no_result_near_you "Je n'ai pas trouvé de {{$query}} près de toi.">

<like "J'aime">

<unlike "Je n'aime plus">

<like_summary[plural($likes.count), $likes.summary] {
    zero: "Personne n'aime ça",
	one: {
		Toi: "❤ Tu aimes ça",
		*unknown: "❤ {{$likes.summary}} aime ça"
	},
	*many: "❤ {{$likes.summary}} aiment ça"
}>

<loading_comments_and_photos "chargements des commantaires et des photos…">

<post_comment "Poster le commentaire">

<check_in "Check in!">

<shout_placeholder "Quoi de neuf?">

<save_photo "Poster la photo">

<checkin "Check-in">

<loading_photos "Chargement des photos…">

<total_visitors "Nombre de visiteurs">

<total_checkins "Nombre de Check-ins">

<i_see_you "Je sais ou tu es!">

<checkin_failed "Malheuresement votre checkin à échoué. Vérifiez que vous êtes bien connecté puis rééssayer.">

<trademark_statement "Ce(tte) [application/site Web] utilise l'interface de programmation d'application Foursquare®, mais n'est ni approuvé(e), ni certifié(e) par Foursquare Labs, Inc.">
