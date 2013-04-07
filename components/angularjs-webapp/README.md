# AngularJS-WebApp #

[AngularJS-WebApp][homepage] helps you buid web applications by taking care of your application state navigation and routing. 

## Getting started ##

### Installation ###

#### with bower ####

> bower install angularjs-webapp

### with git ###

from your project public directory root : 

> git clone git://texthtml.net/webapp/lib/angularjs/webapp components/angularjs-webapp

or : 

> git submodule add git://texthtml.net/webapp/lib/angularjs/webapp components/angularjs-webapp

### Configuration ###

#### Loading the javascript and css ####

    <script type="text/javascript" src="/components/angularjs-webapp/angularjs-webapp.js"></script>
    <link rel="stylesheet" type="text/css" href="/components/angularjs-webapp/angularjs-webapp.css"></link>

You need to adjust the path if you install AngularJS-WebApp somewhere else.

## Usage ##

AngualarJs-WebApp bind application state to the browser history object using a History service so that the browser back/forward buttons are still working. In the exemples here I will use section element for the app screens but you can use any element. AngularJS-WebApp only add/remove a class to the app screens to indicate the current screen. 

You have to use css to hide/show screen. A very basic css file is included to get you started. This css file suppose the section elements are your app screens.

### directives ###

#### screen (attribute) ####

    <section id="home">
      <h1>Home Screen</h1>
      <button screen="#secondscreen">go to secondscreen</button>
    </section>
    <section id="secondscreen">
      <button screen="$home">Home</button>
      <h1>Home Screen</h1>
      <input ng:init="firstname='World'" ng:model="firstname" />
      <button screen="#thirdscreen" screen:model="firstname">go to thirdscreen</button>
    </section>
    <section id="thirdscreen" ng:model="name">
      <button screen="$back">Back</button>
      <h1>Third Screen</h1>
      Hello {{ name }}
    </section>

This represent an app with 3 screen. The app is initilized with the #home screen (selector configurable). the screen directive is used to move between screens, the value can be:
* $home to take the user to home screen
* $back to take the user to the previous screen
* $backOrHome to take the user to the previous screen if a previous state is availlable and to $home if not
* a css selector to take the user to the screen the selector point to (using document.querySelector)

If a screen have a ng:model attribute, the screen directive can communicate data to the targeted screen. In the previous screen, the value of 'firstname' on second screen scope is injected into the thirdscreen scope as 'name'.
If a screen directive on a button have ther value '$back' and there is no more previous state, the button will be disabled.

#### route (attribute) ####

AngualarJs-WebApp can also change the URL according to the screen. The route is described on the screens element with the route attribute. Only screen you want to be availlable with a custom URL need a route attribute. Screens with and without route attribute can be mixed.

    <section id="home">
      <h1>Home Screen</h1>
      <button screen="#secondscreen">go to secondscreen</button>
    </section>
    <section id="secondscreen" route="/second">
      <button screen="$home">Home</button>
      <h1>Home Screen</h1>
      <input ng:init="firstname='World'" ng:model="firstname" />
      <button screen="#thirdscreen" screen:model="firstname">go to thirdscreen</button>
    </section>
    <section id="thirdscreen" ng:model="name" route="/hello/:name">
      <button screen="$back">Back</button>
      <h1>Third Screen</h1>
      Hello {{ name }}
    </section>

now when going to the second screen, the URL will be changed to /second and when moving to the third, the URL will be changed to /hello/:name. where :name will be replaced using the screen scope 'name' value.
Be careful, when you use this, you have to make sure the application is served on all the reachable URLs. You can do this on your server or with a FALLBACK if you are using Application Cache with your app.
When accessing the app with an URL matching a screen route, AngualarJs-WebApp will initilize the app to this screen and populate its scope with variable found in the URL if any. In the exemple, going to /hello/Pierre would load the third screen and show "Hello Pierre"

#### ngApp ####

You are already using this one. ngApp is extended to initialize the StateManager and can be configured with optional attributes:
   
* first-screen: css selector to the first screen of your app (defaults to #home)
* screen-class: class used to identify the current screen


## Documentation ##

This is a work in progress. There is no other documentation than the source code and your browser console yet. 
Some day it will be there : [AngularJS-WebApp Wiki][wiki].

## Bugs ##

There are [bugs][bugs] (even if they are not listed). But I'd like to get rid of them. If you want to help, you can [report one][report-bug].

## Suggestions & Contributions ##

The easiest way to get started here is to send me en email at <mathieu@rochette.cc>.


[homepage]: https://texthtml.net/trac/projects/webapp-lib-angularjs-webapp
[bugs]: https://texthtml.net/trac/projects/webapp-lib-angularjs-webapp/issues
[report-bug]: https://texthtml.net/trac/projects/webapp-lib-angularjs-webapp/issues/new
[wiki]: https://texthtml.net/trac/projects/webapp-lib-angularjs-webapp/wiki