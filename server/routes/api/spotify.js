const express = require('express')
const router = express.Router()
const dotenv = require('dotenv');
const auth = require("../../middleware/auth");
const Location = require('../../models/Location');
const SpotifyWebApi = require('spotify-web-api-node')
dotenv.config();

const redirectUri = 'http://localhost:8001/api/spotify/callback';

router.get('/search', auth, async function (req, res) {
    const credentials = {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_SECRET,
        redirectUri: redirectUri
    }
    let spotifyApi = new SpotifyWebApi(credentials);
    spotifyApi.clientCredentialsGrant().then(request => {
        spotifyApi.setAccessToken(request.body.access_token)
        spotifyApi.searchTracks(req.query.query, {limit: 3}).then(result => {
            let resultObj = result.body.tracks.items
            let resultsArray = []
            for (let i of resultObj) {
                const song = {
                    name: i.name,
                    artist: i.artists[0].name,
                    uri: i.uri
                }
                resultsArray.push(song);
            }
            res.status(200).send({result: resultsArray})
        })
    })
})

router.get('/getAuthURL', auth, async function(req, res) {
    const scopes = 'user-modify-playback-state'

    const constructedUrl = 'https://accounts.spotify.com/authorize' +
    '?response_type=code' + '&client_id=' + process.env.SPOTIFY_CLIENT_ID + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(redirectUri) + '&state=' + req.query.location;
    res.status(200).send(constructedUrl)
})

router.get('/callback', async function (req, res) {
    const authorizationCode  = req.query.code; // Read the authorization code from the query parameters
    console.log('state: ' + req.query.state)

    const credentials = {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_SECRET,
        redirectUri: redirectUri
    }
    let spotifyApi = new SpotifyWebApi(credentials);
    spotifyApi.authorizationCodeGrant(authorizationCode)
        .then(async (data) => {
            try {
                const location = await Location.findOneAndUpdate({_id: req.query.state}, {

                    // TODO: encrypt these keys
                    access_token: data.body['access_token'],
                    refresh_token: data.body['refresh_token']
                    // TODO: encrypt these keys

                }, {useFindAndModify: false, new: true})
                res.status(200).send(location)
            } catch (e) {
                console.error(e)
                res.status(500).send(e)
            }

        }, function(err) {
            console.log('Something went wrong when retrieving the access token!', err.message);
            res.status(500).send(err);
        });
})

router.post('/queueSong', async function (req, res) {
    Location.findById(req.body.location).then((location) => {
        const credentials = {
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_SECRET,
            redirectUri: redirectUri
        }
        let spotifyApi = new SpotifyWebApi(credentials);
        spotifyApi.setAccessToken(location.access_token);
        spotifyApi.setRefreshToken(location.refresh_token);
        spotifyApi.refreshAccessToken().then((data) => {
            const access_token = data.body['access_token'];
            spotifyApi.setAccessToken(access_token);
            location.access_token = access_token;
            Location.findOneAndUpdate(location._id, {access_token: access_token}, {useFindAndModify: false, new: true});
            spotifyApi.addToQueue(req.body.songUri).then(() => {
                res.status(200).send(req.body.songUri)
            },
                (err) => {
                res.status(500).send(err)
                });
        },
            (err) => {
                res.status(500).send(err)
            })
    },
        (err) => {
            res.status(500).send(err)
        })
})

module.exports = router;
