# akinpoz-mvp

## TODOS
- [ ] Update logo/fonts/design
- [ ] Profile page
- [ ] Decide how to implement the naming a menu item after yourself feature
- [ ] Make the home link the Akopoz logo and get rid of the home nav tag
- [ ] Set up a MongoDB Atlas Custer so we can use the same data across our dev environments if needed. Keep the option to switch to local DB if dev wants it. Atlas Custer should really only be used for displaying designs
- [ ] Make sure to include all of the required env properties when deploying

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
- [ ] Check if jukebox is enabled / token is not null 
- [ ] Skip the line campaign
	- [x] Frontend implemented
	- [ ] connect to frontend to redux
	- [ ] create api endpoint to remove
	- [ ] create customer side front-end to purchase pass
	- [ ] connect to ^^ to redux
	- [ ] create endpoint to add user to detials.option of that campaign

#### Completed (Summary of work)

##### Tentative Change Log

- [x] Authentication
- [x] Location CRUD operations
- [x] Merged Dependencies to top level of project
- [x] Campaign CRUD operations
- [x] Make location id available in the jukebox page.


## Known bugs
- [ ] JWT token expires too quickly and makes actions like add fail. When those actions fail, they crash the site. Either extend the token to infinite or handle the 400 user not found error and redirect to the login for all actions. 

## Change Log
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
 
```
Client
│   node_modules
│   public    
│   src
│
└───actions
└───assets
└───components
│
│   │
│   └───analytics
│   └───auth
│   └───campaigns
│       │   index.jsx (gets campaigns)
│       │   business-campaign.jsx (each campaign card)
│       │   Modal.jsx (add/update modal)
│       │  	customer-campaign.jsx (customer side of campaign)
│       │  	results-modal.jsx (end/current results of campaign)		
│       │   campaigns.module.css 
│   └─── locations
│       │   index.jsx (gets locations)
│       │   location.jsx (each location card)
│       │   Modal.jsx (add/update modal)		
│       │   locations.module.css 
│   └─── homes
│       │   business-home.jsx (renders locations/index.jsx)
│       │   customer-home.jsx (renders customer landing page)
│       │  	homes.module.css
│   └─── jukebox
│       │   index.jsx 
│       │   jukeboxs.module.css
│   └─── navbar
│   └─── profile
│ ...
```

- campaigns/index.jsx would essentially hold this section from location/index.jsx:
    ```
     {campaigns.map(campaign => {
                        return (
                            <Campaign key={campaign._id} {...campaign} />
                        )
                    })}
                    {campaigns.length === 0 &&
                        <div style={{ display: 'grid', placeItems: 'center' }}>
                            <h4>No Campaigns added yet, click "Add Campaign" to create your first Campaign!</h4>
                        </div>
                    }
    ```
- locations/index.jsx would essentially hold this section from home/index.jsx:
    ```
      {locations.length > 0 && locations.map(location => {
                return (
                    <Location {...location} />
                )
            })}
            {locations.length == 0 &&
                <div style={{display: 'grid', placeItems: 'center'}}>
                    <h4>No Locations added yet, click "Add Location" to get started!</h4>
                </div>
            }
    ```
- customer-home.jsx will essentially be what location-campaigns/index.jsx is now. location-campaigns would then be deleted.
