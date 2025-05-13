# Vanishing-Wild
- Take a pull from main
- `npm install`
- `npm run dev`
- go to localhost:3000/

# structure
- ./src/app/ is the primary directory. Any folder created inside it that contains a page.js file is considered as a frontend page route. Any folder inside the app directory that has the route.js file in it is considered as an API endpoint.
- ./src/app/api contains the api route handlers for this project. The sightings/ endpoint provides geoJSON data for each year of sightings and allows filtering based on species and common name. The sightings/filter-options/ endpoints sends the lists of options for each filter.
- page.js is a server side rendered component
- Sightings is the client rendered component containing the map and user interactions