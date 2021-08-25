# akinpoz-mvp

  

## TODOS

- [ ] Set up a MongoDB Atlas Custer so we can use the same data across our dev environments if needed. Keep the option to switch to local DB if dev wants it. Atlas Custer should really only be used for displaying designs

### Drew

#### Currently working on

    - [ ] Payment wall
        - [ ] frontend implemented
        - [ ] design history management - CRUD
        - [ ] connect history to redux (front / back)
        - [ ] add to jukebox, raffle and survey

#### Completed (Summary of work)

- [x] Spotify Integration for Jukebox
- [x] Profile UI Framing
- [x] Jukebox UI Framing
- [x] Generate QR Code Feature
- [x] 
  

### Paul

#### Currently working on

    - [ ] Skip the line campaign
        - [x] Frontend implemented
        - [ ] connect to frontend to redux
        - [ ] create api endpoint to remove
        - [ ] create customer side front-end to purchase pass
        - [ ] connect to ^^ to redux
        - [ ] create endpoint to add user to detials.option of that campaign

#### Completed (Summary of work)

- [x] Authentication

- [x] Location CRUD operations

- [x] Merged Dependencies to top level of project

- [x] Campaign CRUD operations

## Known bugs
- [ ] JWT token expires too quickly and makes actions like add fail. When those actions fail, they crash the site. Either extend the token to infinite or handle the 400 user not found error and redirect to the login for all actions. 

## Change Log

  - 8/23: Added Spotify integration
    - How to use:
      - Spotify account must be active (playing music from intended device)
      - Jukebox must be enabled and authenticated via spotify account associated with device playing music
      - The spotify client_id, client_secret and authentication_key must all be present in the .env file in server
    - What is left to do:
      - Make location id available in the jukebox page.
      - Check if jukebox is enabled / token is not null
      - Server error handling

  - 8/25: Began payment wall
    - What to expect:
      - Payment wall UI (started)
    - Left to do:
      - design history management - CRUD
      - connect history to redux (front / back)
      - add to jukebox, raffle and survey
