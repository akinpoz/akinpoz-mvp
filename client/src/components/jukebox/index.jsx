import React, {useEffect, useRef, useCallback} from 'react';
import styles from './jukebox.module.css'
import {Button, Card, Search} from "semantic-ui-react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {cleanQuery, startSearch, updateSelection} from "../../actions/searchActions";
import {queueSong} from "../../actions/spotifyActions";

function Jukebox(props) {
    const location_id = props.location.select_location 
    const timeoutRef = useRef()
    const handleSearchChange = useCallback((e, data) => {
        clearTimeout(timeoutRef.current)
        props.startSearch(data.value)
        props.updateSelection(null)
        timeoutRef.current = setTimeout(() => {
            if (data.value.length === 0) {
                props.cleanQuery()
            }
        }, 300)
    }, [])
    useEffect(() => {
        
        return () => {
            clearTimeout(timeoutRef.current)
        }
    }, [])

    const handleSelectionChange = React.useCallback((e, data) => {
        props.updateSelection(data.result);
    }, [])

    const resultRender = (item) => (
        <div>
            <b>{item.name}</b>
            <p>{item.artist}</p>
        </div>
    )
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
                        <Search
                            loading={props.search.loading}
                            size='large'
                            onSearchChange={handleSearchChange}
                            results={props.search.results?.result}
                            value={props.search.value}
                            resultRenderer={resultRender}
                            onResultSelect={handleSelectionChange}
                        />
                        <br/>
                        <div style={{flexDirection: "row-reverse", display: "flex"}}>
                            <Button primary disabled={props.search.selection === null} onClick={() => props.queueSong(location_id, props.search.selection.uri)}>Queue Song</Button>
                            <Button style={{marginRight: 10}} onClick={() => props.cleanQuery()}>Clear Selection</Button>
                        </div>
                    </div>
                </Card>
            </div>
            <div style={{flex: 1, display: "flex", flexDirection: "column"}}/>
        </div>
    )
}

Jukebox.propTypes = {
    startSearch: PropTypes.func.isRequired,
    cleanQuery: PropTypes.func.isRequired,
    updateSelection: PropTypes.func.isRequired,
    queueSong: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
    search: state.search,
    location: state.location
})

export default connect(mapStateToProps, {startSearch, cleanQuery, updateSelection, queueSong})(Jukebox);
