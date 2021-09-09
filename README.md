# akinpoz-mvp

## TODOS

- [ ] Set up a MongoDB Atlas Custer so we can use the same data across our dev environments if needed. Keep the option to switch to local DB if dev wants it. Atlas Custer should really only be used for displaying designs
- [ ] Make the home link the Akopoz logo and get rid of the home nav tag
- [ ] Decide how to implement the naming a menu item after yourself feature
- [ ] Profile page
- [ ] Update logo/fonts/design
- [ ] Git notifications for changes
- [ ] Crud operations for fastpass list

### Drew

#### Currently working on

- [ ] Payment wall
  - [x] frontend implemented
  - [ ] implement stripe
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

- [ ] File structure change
- [ ] Check if jukebox is enabled / token is not null
- [ ] Skip the line campaign
  - [x] Frontend implemented
  - [ ] connect to frontend to redux
  - [ ] create api endpoint to remove
  - [ ] create customer side front-end to purchase pass
  - [ ] connect to ^^ to redux
  - [ ] create endpoint to add user to details.option of that campaign

#### Completed

- [x] Authentication
- [x] Location CRUD operations
- [x] Merged Dependencies to top level of project
- [x] Campaign CRUD operations
- [x] Make location id available in the jukebox page.

##### Tentative Change Log

## Known bugs

- [ ] JWT token expires too quickly and makes actions like add fail. When those actions fail, they crash the site. Either extend the token to infinite or handle the 400 user not found error and redirect to the login for all actions.

## Change Log

- 9/9
  - What to expect:
    - Integrated card and google pay support to front end
    - Needs HTTPS connection for Google Pay support
      - Either use 'yarn https' to deploy to https on port 3000
      - Or tunnel using 'ngrok http 3000 --host-header=rewrite' to create a dedicated domain using https (needed for apple pay)
  - TODO:
    - Process Success/Error responses from server and client
      - Need to redirect users after successful payment
      - Need to show error message and create new payment request + intent (or reset if we want to reuse it)
      - Clear redux when appropriate
    - The app generally does not work for safari authActions fails because the error 'e.response' is null and 'e.response.data' fails on line 13
    - Need safari to work to test apple pay -- otherwise should work
      - In order to test apple pay use ngrok command above and register the https domain in stripe web dashboard 
        - stripe-->>settings-->>payment methods-->> apple pay -->> configure
        - Add https domain (without 'https://')
        - download config file
        - place in 'client/public/.well-known'
        - Click done -- should be working 
          - (if you copy link on bottom of modal before hitting done it will download config file again if successful since it is hosted at that link in public)

- 9/8
  - What to expect:
    - Integrated Stripe to backend
    - Set up stripe webhook with signature verification
      - Needed to 'shut off' parser for that command.  Made express.json conditional to whether or not it was calling stripe webhook.
      - Run yarn install.  Needed to download body-parser dependency (no longer part of express)

- 9/7
  - What to expect:
    - Began adding stripe to backend, create payment intent method added -- must be requested and passed back to front end.
    - New env variables -- stripe publishable key, stripe secret key, stripe webhook secret
      - webhook secret generated from stripe cli -- for local testing
  - TODO: 
    - Add error handling and payment verification via webhooks.
    - Set up endpoint action middleware

- 9/6
  - What to expect:
    - Added Stripe to package.json (run yarn install)
    - Added https script in package.json (run yarn https so stripe features work)
      - yarn https just includes self-signed certs (generate 'certificate.pem', 'csr.pem' and 'private-key.pem' and put in root/cert) then runs yarn dev
    - Added responsive google/apple pay button
    - Working to fully implement stripe api
  - Left to do: 
    - Finish implementing Stripe and store relevant information in our db

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
2. Add toggle for allowing explicit songs on jukebox?
3. Should the price for jukebox be fixed or should the establishment set the price?

## Our Code Standards

1. mapStateToProps should only include the exact necessary data
2. functional components unless absolutely necessary (i.e. chart.js)
3. use console.error for printing errors. use console.log for temporary debugging (delete afterwards)
4. There should be no nameless divs. Give each div an id that describes what it does
