# akinpoz-mvp

## TODOS

- [ ] Set up a MongoDB Atlas Custer so we can use the same data across our dev environments if needed. Keep the option to switch to local DB if dev wants it. Atlas Custer should really only be used for displaying designs
- [ ] Decide how to implement the naming a menu item after yourself feature
- [ ] Profile page
- [ ] Update logo/fonts/design
  - [x] Logo update
- [ ] Git notifications for changes
- [ ] Crud operations for fastpass list?

### Drew

#### Currently working on

- [ ] Payment wall
  - [x] frontend implemented
  - [ ] design history management - CRUD
  - [ ] connect history to redux (front / back)
  - [ ] add to jukebox, raffle and survey

#### Completed (Summary of work)

- [x] Spotify Integration for Jukebox
- [x] Profile UI Framing
- [x] Jukebox UI Framing
- [x] Generate QR Code Feature

### Paul

#### Currently working

- [ ] User side
  - [ ] figure out how to QR code navigation works
  - [ ]create customer landing page
    - [ ] if from QR code render landing page that's location specific
    - [ ] if no location_id param, render a location search page. Mobile first.
  - [ ] Create each campaign card
    - [ ] Survey
      - [ ] Front-end
      - [ ] CRUD operations
    - [ ] Raffle
      - [ ] Front-end
      - [ ] CRUD operations
    - [ ] FastPass
      - [ ] Front-end
      - [ ] CRUD operations

#### Completed

- [x] Authentication
- [x] Location CRUD operations
- [x] Merged Dependencies to top level of project
- [x] Campaign CRUD operations
- [x] Make location id available in the jukebox page.
- [x] File structure change
- [x] Check if jukebox is enabled / token is not null. Set up example for page to page status messaging
- [x] Skip the line campaign (business side)

##### Tentative Change Log

- 9/5 - 9/7
  - What to expect:
    - Blank Jukebox bug fix
    - Skip the line campaign CRUD operations & example of not using redux for all actions
  - What's left to do:
    - Start the user side of the app.

## Known bugs

- [ ] JWT token expires too quickly and makes actions like add fail. When those actions fail, they crash the site. Either extend the token to infinite or handle the 400 user not found error and redirect to the login for all actions.

## Change Log

- 8/31 - 9/3
  - What to expect:
    - When you reload the page you now see a loader instead the login page.
    - File structure change
    - New logo/navbar/fonts/button color (not all buttons)
    - locations/campaigns are now loaded all at once from the home page then campaigns are filtered by location_id which is passed down from each locations
    - README change & code standards update
  - Left to do:
    - Next tasks

- 8/31
  - What to expect:
    - Payment Wall UI completed
    - Left to do:
      - Connect to backend and incorporate redux actions
      - Incorporate Stripe
  - 8/30
    - What to expect:
      - Location ID 500 server bug fix
      - README updates: merged considerations, updated todos

  - 8/25: Began payment wall
    - What to expect:
      - Payment wall UI (started)
    - Left to do:
      - design history management - CRUD
      - connect history to redux (front / back)
      - add to jukebox, raffle and survey

  - 8/23: Added Spotify integration
    - How to use:
      - Spotify account must be active (playing music from intended device)
      - Jukebox must be enabled and authenticated via spotify account associated with device playing music
      - The spotify client_id, client_secret and authentication_key must all be present in the .env file in server
    - What is left to do:
      - Server error handling

## Considerations

1. React.useEffect/useState or import React, {useEffect, useState}?
2. Don't use redux for everything (it is considered bad practice). Only use redux for things like getting all of the data.
   - For example, getLocationsByUserID should be in the redux lifecycle as we can utilize it in the jukebox page, campaigns, etc. However, update location should probably just be a direct API called in the Modal.jsx file.

## Our Code Standards

1. mapStateToProps should only include the exact necessary data
2. functional components unless absolutely necessary (i.e. chart.js)
3. use console.error for printing errors. use console.log for temporary debugging (delete afterwards)
4. There should be no nameless divs. Give each div an id that describes what it does
