<plural($n) {
    $n == 0 ? "zero" : $n == 1 ? "one" : "many"
}>

<user_at_venue "{{$user.firstName}} ist hier: {{$venue.name}}">

<anonymous_at_venue "{{$venue.name}}">

<appname "Place">

<settings "Einstellungen">

<twitter_settings "Twitter Einstellungen">

<twitter_send_badges "Badges twittern">

<twitter_send_mayorships "Mayorships twittern">

<facebook_settings "Facebook Einstellungen">

<facebook_send_badges "Badges posten">

<facebook_send_mayorships "Mayorships posten">

<geolocation_settings "Geolocalisation">

<geolocation_auto "Automatische Geolocalisation">

<geolocation_high_accuracy "Hochpräzise Geolocation (GPS)">

<account_settings "Mein Konto">

<log_out "Abmelden">

<contact "Kontakt">

<contact_email "E-mail senden">

<contact_website "Website besuchen">

<home "Startseite">

<refresh "Aktualisieren">

<search "Suchen">

<home_title "Wer & Wo">

<loading "Lädt…">

<loading_recent_checkins "Letzte Aktivitäten laden…">

<no_recent_checkin "Keine aktuellen Aktivitäten">

<back "Zurück">

<find_me "Mich orten">

<search_title "Suche">

<place_placeholder "Wo bist du?">

<geolocation_placeholder "Ich suche dich…">

<query_placeholder "Wonach suchst du?">

<need_location "Wo soll ich {{$query}} suchen?">

<need_location_hint "Gib mir einen Hinweis.">

<geolocation_location_hint "Ou utilises la géolocalisation?">

<unknown_location "Ich weiß nicht, wo sich {{$place}} befindet.">

<no_result_near_location "Ich habe kein {{$query}} in der Nähe von {{$location.highlightedName}} gefunden.">

<no_result_near_you "Ich habe kein {{$query}} in deiner Nähe gefunden.">

<like "Mag ich">

<unlike "Nicht mehr mögen">

<like_summary[plural($likes.count), $likes.summary] {
    zero: "Niemandem gefällt das",
	one: {
		Toi: "❤ Du magst das",
		*unknown: "❤ {{$likes.summary}} mag das"
	},
	*many: "❤ {{$likes.summary}} mögen das"
}>

<loading_comments_and_photos "Lädt Kommentare und Fotos…">

<post_comment "Kommentar posten">

<check_in "Checkin!">

<shout_placeholder "Was gibt's Neues?">

<save_photo "Foto posten">

<checkin "Checkin">

<loading_photos "Lädt Fotos…">

<total_visitors "Anzahl der Besucher">

<total_checkins "Anzahl der Checkins">

<i_see_you "Ich sehe dich!">

<checkin_failed "Der Checkin ist leider fehlgeschlagen. Überprüfe vor dem nächsten Versuch die Verbindung.">

<trademark_statement "Diese Anwendung nutzt die Programmierschnittstelle Foursquare® Application Progamming Interface (API), wird aber nicht von Foursquare Labs, Inc unterstützt oder zertifiziert.">

<timeframes "Öffnungszeiten">

<location "Adresse">

<website "Webseite">

<directions "Wegbeschreibung">
