var express = require('express')
var router = express.Router()
const dotenv = require('dotenv');
const auth = require("../../middleware/auth");
const SpotifyWebApi = require('spotify-web-api-node')
dotenv.config();

router.get('/client', auth, async function (req, res) {
    const credentials = {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_SECRET
    }
    let spotifyApi = new SpotifyWebApi(credentials);
    spotifyApi.clientCredentialsGrant().then(request => {
        res.status(200).send({clientToken: request})
    })
})

module.exports = router;
