# akinpoz-mvp

  

## TODOS

### Drew

#### Currently working on

#### Completed (Summary of work)

  

### Paul

#### Currently working on

- [ ] Campaign CRUD operations
    - [ ] add fails. Says options are undefined. 

#### Completed (Summary of work)

- [x] Authentication

- [x] Location CRUD operations

- [x] Merged Dependencies to top level of project

## Known bugs
- [ ] JWT token expires too quickly and makes actions like add fail. When those actions fail, they crash the site. Either extend the token to infinite or handle the 400 user not found error and redirect to the login for all actions. 