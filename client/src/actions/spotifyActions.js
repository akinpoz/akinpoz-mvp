import {
    SPOTIFY_USER_AUTH,
    SPOTIFY_QUEUE_SONG,
    SPOTIFY_LOADING,
} from "./types";
import axios from "axios";
import {tokenConfig} from "./authActions";



export const setSpotifyLoading = () => {
    return {
        type: SPOTIFY_LOADING
    }
}
