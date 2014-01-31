<plural($n) {
    $n == 0 ? "zero" : $n == 1 ? "one" : "many"
}>

<user_at_venue "{{$user.firstName}} at {{$venue.name}}">

<anonymous_at_venue "At {{$venue.name}}">

<appname "Place">

<settings "Settings">

<twitter_settings "Twitter options">

<twitter_send_badges "Send badges">

<twitter_send_mayorships "Send mayorships">

<facebook_settings "Facebook options">

<facebook_send_badges "Send badges">

<facebook_send_mayorships "Send mayorships">

<geolocation_settings "Geolocation">

<geolocation_auto "Auto geolocation">

<geolocation_high_accuracy "High Accuracy">

<account_settings "Account">

<log_out "log out">

<contact "Contact">

<contact_email "Send an e-mail">

<contact_website "Visit the website">

<home "Home">

<refresh "Refresh">

<search "Search">

<home_title "Who & Where">

<loading "Loading…">

<loading_recent_checkins "Loading recent checkins…">

<no_recent_checkin "No recent checkin">

<back "Back">

<find_me "Find me">

<search_title "Search">

<place_placeholder "Where are you?">

<geolocation_placeholder "I'm looking for you…">

<query_placeholder "What are you looking for?">

<need_location "Where am I suppose to look for {{$query}}?">

<need_location_hint "Please give me a hint.">

<geolocation_location_hint "Do you want me to look for you?">

<unknown_location "I don't know where {{$place}} is.">

<no_result_near_location "I couldn't find any {{$query}} near {{$location.highlightedName}}.">

<no_result_near_you "I couldn't find any {{$query}} near you.">

<like "I like it">

<unlike "I don't like it anymore">

<like_summary[plural($likes.count), $likes.summary] {
    zero: "Nobody like this", 
	one: {
		You: "❤ You like this", 
		*unknown: "❤ {{$likes.summary}} likes this"
	}, 
	*many: "❤ {{$likes.summary}} like this"
}>

<loading_comments_and_photos "Loading comments & photos…">

<post_comment "Post comment">

<check_in "Check in!">

<shout_placeholder "What are you doing?">

<save_photo "Post photo">

<checkin "Checkin">

<loading_photos "Loading photos…">

<total_visitors "Total Visitors">

<total_checkins "Total Checkins">

<i_see_you "I know where you are!">

<checkin_failed "Unfortunately your checkin failed. Check that you are connected and retry in a few seconds.">
