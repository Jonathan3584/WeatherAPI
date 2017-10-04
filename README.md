Fair-Weather Finder

An app to find the climate for you.

This app will make use of the Dark Skies historical ('Time Machine') weather API and a geocoding API in order to compare user preferences against weather patterns over a selected period of time.

The app will allow user registration and creation of a profile.  Once logged-in, the user will fill out a weather preference form that will be stored in the database and allow the app to make tailored queries to the API.

Once the profile is in place, the user will be able to use the weather profile to determine how many days are likely to meet their criteria over a given period of time, in a given location.

User stories:

-I am a newly graduated developer with job offers in three major cities.  Bad weather is bad weather -- I'm inside either way.  How many really perfect days did each location have last year?

-I have a three month internship in Pittsburgh.  Will I be done and out of there before winter really hits, or should I reconsider?

-I have a week's vacation and know I want to go to Portland, ME.  When should I schedule it?

My minimum viable product has the following attributes:

-User registration and profile retention
-Weather preferences input form, capable of later edits
-API interface to pull data from Dark Skies
-Data collection for multiple location sites
-Comparison feature

My reach goals include:

-Reverse search that allows you to find locations by climate
-Storage of multiple weather preference profiles
-Find the intersection of two preference sets --ideal locations for a couple
-Climate snapshot that sets preferecne profile to weather data of current location and time
-Weighted preferences (avoiding precipitation is twice as important as high temps to user 1, but less important than low temps to user 2)
-Ranged preferences -- (user 1 has a very specific temperature range before she gets too hot or too cold, but user 2 is okay with any temp over 65)

The obstacles I foresee running into

-I will be drawing on two APIs -- I will use a geocoding API to convert a zipcode input into latitude/longitude that can be processed by the weather API.  This will require specifically ordering the middleware, and creates a lot of opportunities for bugs to crop up.
-Date and time formatting will be tricky.
-Comparison feature is very specific in MVP, but seems like a very steep cliff when it becomes more complex.

Technologies I will use:

HTML
CSS
Javascript
Jquery
SQL
Node.js

NPM libraries:

Express
Mustache
PG-Promise
Mustache-Express
DotEnv
Passport
Morgan
Express-session
Cookie-parser
Bcrypt
Cookie-parser
RESTify