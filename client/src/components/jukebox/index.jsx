import React, {useEffect} from 'react';
import styles from './jukebox.module.css'
import {Button, Card, Search, Transition} from "semantic-ui-react";
import {getClientAuth} from "../../actions/spotifyActions";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import SpotifyApi from 'spotify-web-api-node'

const initialSearchState = {
    loading: false,
    results: [],
    value: '',
}

function searchReducer(state, action) {
    switch (action.type) {
        case 'CLEAN_QUERY':
            return initialSearchState
        case 'START_SEARCH':
            return { ...state, loading: true, value: action.query }
        case 'FINISH_SEARCH':
            return { ...state, loading: false, results: action.results }
        case 'UPDATE_SELECTION':
            return { ...state, value: action.selection }

        default:
            throw new Error()
    }
}

function Jukebox(props) {
    useEffect(() => {
        props.getClientAuth()
    }, [])
    const spotifyApi = new SpotifyApi();

    const [searchState, searchDispatch] = React.useReducer(searchReducer, initialSearchState);
    const {loading, results, value} = searchState;

    const timeoutRef = React.useRef()
    const handleSearchChange = React.useCallback((e, data) => {
        clearTimeout(timeoutRef.current)

        searchDispatch({ type: 'START_SEARCH', query: data.value })

        spotifyApi.setAccessToken(props.spotify.clientToken)

        if (!spotifyApi.getAccessToken()) {
            console.log('No access token')
            searchDispatch({type: 'FINISH_SEARCH', results: []})
            return
        }

        timeoutRef.current = setTimeout(() => {
            if (data.value.length === 0) {
                searchDispatch({ type: 'CLEAN_QUERY' })
                return
            }
            // spotifyApi.searchTracks('artist:Green Day').then(r => searchDispatch({type:'FINISH_SEARCH', results: r}))
            spotifyApi.search(data.value, ['track']).then(r => searchDispatch({type:'FINISH_SEARCH', results: r}))
        }, 300)
    }, [])
    React.useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current)
        }
    }, [])

    return (
        <div className={styles.container}>
            <div style={{flex: 1, display: "flex", flexDirection: "column"}}/>
            <div className={styles.shiftUp}>
                <Card fluid>
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40}}>
                        <h1>
                            Search For a Song
                        </h1>
                        <br/>
                        <Search loading={loading} fluid size='large' onSearchChange={handleSearchChange} results={results} value={value}/>
                    </div>
                </Card>
            </div>
            <div style={{flex: 1, display: "flex", flexDirection: "column"}}/>
        </div>
    )
}

Jukebox.propTypes = {
    auth: PropTypes.object.isRequired,
    getClientAuth: PropTypes.func.isRequired,
}
const mapStateToProps = (state) => ({
    auth: state.auth,
    spotify: state.spotify
})

export default connect(mapStateToProps, {getClientAuth})(Jukebox);
