import React from 'react';
import styles from './jukebox.module.css'
import {Card, Search} from "semantic-ui-react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {cleanQuery, startSearch, updateSelection} from "../../actions/searchActions";

function Jukebox(props) {

    const timeoutRef = React.useRef()
    const handleSearchChange = React.useCallback((e, data) => {
        clearTimeout(timeoutRef.current)
        props.startSearch(data.value)
        timeoutRef.current = setTimeout(() => {
            if (data.value.length === 0) {
                props.cleanQuery()
            }
        }, 300)
    }, [])
    React.useEffect(() => {
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
                    </div>
                </Card>
            </div>
            <div style={{flex: 1, display: "flex", flexDirection: "column"}}/>
        </div>
    )
}

Jukebox.propTypes = {
    auth: PropTypes.object.isRequired,
    startSearch: PropTypes.func.isRequired,
    cleanQuery: PropTypes.func.isRequired,
    updateSelection: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
    auth: state.auth,
    spotify: state.spotify,
    search: state.search
})

export default connect(mapStateToProps, {startSearch, cleanQuery, updateSelection})(Jukebox);
