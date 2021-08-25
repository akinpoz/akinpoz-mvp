const express = require('express')
const router = express.Router()
const dotenv = require('dotenv');
const auth = require("../../middleware/auth");
const Location = require('../../models/Location');
const SpotifyWebApi = require('spotify-web-api-node')
dotenv.config();

const redirectUri = 'http://localhost:8001/api/spotify/callback';

/**
 * searches for song based on query.  Uses access token retreived from client credentials flow through the spotify api
 *
 * @param query query string
 * @return resultsArray -- song results in the format: {name, artist, uri}
 */
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

/**
 * Constructs url to authorize spotify for a business to enable jukebox feature.
 *
 * @return authorizationUrl
 */
router.get('/getAuthURL', auth, async function(req, res) {
    const scopes = 'user-modify-playback-state'

    const constructedUrl = 'https://accounts.spotify.com/authorize' +
    '?response_type=code' + '&client_id=' + process.env.SPOTIFY_CLIENT_ID + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(redirectUri) + '&state=' + req.query.location;
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
                const location = await Location.findOneAndUpdate({_id: req.query.state}, {

                    // TODO: encrypt these keys
                    access_token: encrypt(data.body['access_token']),
                    refresh_token: encrypt(data.body['refresh_token'])
                    // TODO: encrypt these keys

                }, {useFindAndModify: false, new: true})
                res.status(200).send("<script>window.close();</script >")
            } catch (e) {
                console.error(e)
                res.status(500).send(e)
            }
        }, function(err) {
            console.log('Something went wrong when retrieving the access token!', err.message);
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
router.post('/queueSong', async function (req, res) {
    Location.findById(req.body.location).then((location) => {
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

/**
 * helper methods for encryption and decryption of access tokens
 */
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);
const encrypt = (text) => {

    const cipher = crypto.createCipheriv(algorithm, process.env.ENCRYPTION_KEY, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return [
        iv.toString('hex'),
        encrypted.toString('hex')
    ];
};

const decrypt = (hash) => {

    if (hash.length < 2) {
        return '';
    }

    const decipher = crypto.createDecipheriv(algorithm, process.env.ENCRYPTION_KEY, Buffer.from(hash[0], 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash[1], 'hex')), decipher.final()]);

    return decrpyted.toString();
};

module.exports = router;
