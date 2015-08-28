<plural($n) {
    $n == (n==1 ? "one" : (n==0 || (n%100 > 0 && n%100 < 20)) ? "few" : "many)
}>

<user_at_venue "{{$user.firstName}} la {{$venue.name}}">

<anonymous_at_venue "La {{$venue.name}}">

<appname "Place">

<settings "Setări">

<twitter_settings "Opțiuni Twitter">

<twitter_send_badges "Trimite insigne">

<twitter_send_mayorships "Trimite primării">

<facebook_settings "Opțiuni Facebook">

<facebook_send_badges "Trimite insigne">

<facebook_send_mayorships "Trimite primării">

<geolocation_settings "Geolocație">

<geolocation_auto "Auto geolocație">

<geolocation_high_accuracy "Acuratețe mare">

<account_settings "Cont">

<log_out "deconectează">

<contact "Contact">

<contact_email "Trimite un e-mail">

<contact_website "Vizitează site-ul">

<home "Acasă">

<refresh "Reîmprospătează">

<search "Caută">

<home_title "Cine și unde">

<loading "Se încarcă…">

<loading_recent_checkins "Se încarcă activitățile recente…">

<no_recent_checkin "Nu sunt activități recente">

<back "Înapoi">

<find_me "Localizează-mă">

<search_title "Caută">

<place_placeholder "Unde ești">

<geolocation_placeholder "Se caută…">

<query_placeholder "Ce cauți?">

<need_location "Unde ar trebui să caut {{$query}}?">

<need_location_hint "Te rugăm să ne dai un indiciu.">

<geolocation_location_hint "Vrei să folosești geolocalizarea?">

<unknown_location "Nu știu unde se află {{$place}}.">

<no_result_near_location "Nu s-a găsit vreun {{$query}} în apropierea {{$location.highlightedName}}.">

<no_result_near_you "Nu s-a găsit vreun {{$query}} în apropierea ta.">

<like "Îmi place">

<unlike "Nu-mi mai place">

<like_summary[plural($likes.count), $likes.summary] {
    zero: "Nimănui nu-i place",
    one: {
        You: "❤ Îți place",
        *unknown: "❤ {{$likes.summary}} îi place"
    },
    *many: "❤ {{$likes.summary}} le place"
}>

<loading_comments_and_photos "Se încarcă comentarii și fotografii…">

<post_comment "Postează comentariu">

<check_in "Check in!">

<shout_placeholder "Ce faci?">

<save_photo "Postează poză">

<checkin "Checkin">

<loading_photos "Se încarcă pozele…">

<total_visitors "Total vizitatori">

<total_checkins "Total checkin-uri">

<i_see_you "Știu unde ești!">

<checkin_failed "Din păcate, checkin-ul a eșuat. Verifică-ți conexiunea și reîncearcă în câteva secunde.">

<trademark_statement "Această aplicație utilizează interfața de programare foursquare®, dar nu e recomandată sau certificată de către Foursquare Labs, Inc.">

<timeframes "Ore">

<location "Locație">

<website "Site web">

<directions "Itinerar">
