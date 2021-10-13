const express = require('express')
const router = express.Router()
const dotenv = require('dotenv');
const auth = require("../../middleware/auth");
const Location = require('../../models/Location');
const SpotifyWebApi = require('spotify-web-api-node')
const {encrypt, decrypt} = require("./encryption");
dotenv.config();

const redirectUri = 'http://localhost:8001/api/spotify/callback';

/**
 * searches for song based on query.  Uses access token retrieved from client credentials flow through the spotify api
 *
 * @param query query string
 * @return resultsArray -- song results in the format: {name, artist, uri}
 */
router.get('/search', async function (req, res) {
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
                    title: i.name,
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

/**
 * Constructs url to authorize spotify for a business to enable jukebox feature.
 *
 * @return authorizationUrl
 */
router.get('/getAuthURL', auth, async function(req, res) {
    const scopes = 'user-modify-playback-state'

    const constructedUrl = 'https://accounts.spotify.com/authorize' +
    '?response_type=code' + '&client_id=' + process.env.SPOTIFY_CLIENT_ID + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(redirectUri) + '&state=' + req.query.location + '&show_dialog=true';
    res.status(200).send(constructedUrl)
})

/**
 * handles callback from the spotify api backend call and adds encrypted access and refresh tokens to a location
 *
 * @return location
 */
router.get('/callback', async function (req, res) {
    const authorizationCode  = req.query.code; // Read the authorization code from the query parameters
    const credentials = {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_SECRET,
        redirectUri: redirectUri
    }

    let spotifyApi = new SpotifyWebApi(credentials);
    spotifyApi.authorizationCodeGrant(authorizationCode)
        .then(async (data) => {
            try {
                await Location.findOneAndUpdate({_id: req.query.state}, {
                    access_token: encrypt(data.body['access_token']),
                    refresh_token: encrypt(data.body['refresh_token'])
                }, {useFindAndModify: false, new: true})
                res.status(200).send("<script>window.close();</script >")
            } catch (e) {
                console.error(e)
                res.status(500).send(e)
            }
        }, function(err) {
            console.error('Something went wrong when retrieving the access token!', err.message);
            res.status(500).send(err);
        });
})
/**
 * Queues song to the spotify account associated with that location
 *
 * @param location_id
 * @param songUri
 * @return songUri (if successful)
 */
router.post('/queueSong', function (req, res) {
    Location.findOne({_id: req.body.location_id}).then((location) => {
        const credentials = {
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_SECRET,
            redirectUri: redirectUri
        }
        let access_token = decrypt(location.access_token);
        const refresh_token = decrypt(location.refresh_token);
        let spotifyApi = new SpotifyWebApi(credentials);
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
        spotifyApi.refreshAccessToken().then((data) => {
            access_token = data.body['access_token'];
            spotifyApi.setAccessToken(access_token);
            Location.findOneAndUpdate(location._id, {access_token: encrypt(access_token)}, {useFindAndModify: false, new: true});
            spotifyApi.addToQueue(req.body.song_uri).then(() => {
                res.status(200).send(req.body.song_uri)
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
