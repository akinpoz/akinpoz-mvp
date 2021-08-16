const express = require('express')
const router = express.Router()
const dotenv = require('dotenv');
const auth = require("../../middleware/auth");
const SpotifyWebApi = require('spotify-web-api-node')
dotenv.config();

router.get('/search', auth, async function (req, res) {
    const credentials = {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_SECRET,
        callbackURL: 'http://localhost:8001/callback'
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

module.exports = router;
