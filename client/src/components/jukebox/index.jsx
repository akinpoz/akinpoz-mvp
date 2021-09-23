import React, { useEffect, useRef, useCallback } from 'react';
import styles from './jukebox.module.css'
import { Button, Card, Search, Message } from "semantic-ui-react";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import { cleanQuery, startSearch, updateSelection } from "../../actions/searchActions";
import { queueSong } from "../../actions/spotifyActions";
import history from '../../history'
import { useState } from 'react';
import {getDraftInvoice} from "../../actions/stripeActions";

function Jukebox(props) {
    // Searching should be allowed for customers
    // Queueing needs to check for auth state first
    const location_id = props.location.select_location || props.location.select_location._id
    const timeoutRef = useRef()
    const [location, setLocation] = useState({ name: "" })
    const [msg, setMsg] = useState()
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
        if (!location_id) {
            history.push({
                pathname: '/',
                state: {
                    msg: { status: 'yellow', text: "Please click on the location's jukebox button before navigating to the jukebox page." }
                }
            })
        }
    }, [])

    useEffect(() => {
        if (props.auth) {
            if (props.auth.isAuthenticated && props.auth.user.paymentMethod) {
                if (props.auth.user.paymentMethod.length === 0) setMsg("Please add a payment method in the profile page before queuing a song.")
                props.getDraftInvoice()
            }
            if (!props.auth.isAuthenticated) setMsg("Please login to queue a song... You must also have a valid payment method associated with your account.")
            setLocation(props.location.locations.find(location => location._id === location_id) || props.location.select_location)
            return () => {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [props.auth])

    const handleSelectionChange = useCallback((e, data) => {
        props.updateSelection(data.result);
    }, [])

    const handleQueueClick = () => {

    }

    const hasPaymentMethod = () => {
        return props.auth.user.paymentMethod && props.auth.user.paymentMethod.length > 0
    }

    const resultRender = (item) => (
        <div>
            <b>{item.name}</b>
            <p>{item.artist}</p>
        </div>
    )
    return (
        <div className={styles.container}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }} />
            <div className={styles.shiftUp}>
                {msg &&
                    <Message color="red">
                        <Message.Header>{msg}</Message.Header>
                    </Message>
                }
                {location && <h2 style={{ textAlign: 'center' }}>Playing @ {location.name}</h2>}
                <Card fluid>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
                        <h1>
                            Search For a Song
                        </h1>
                        <br />
                        <Search
                            loading={props.search.loading}
                            size='large'
                            onSearchChange={handleSearchChange}
                            results={props.search.results?.result}
                            value={props.search.value}
                            resultRenderer={resultRender}
                            onResultSelect={handleSelectionChange}
                        />
                        <br />
                        <div style={{ flexDirection: "row-reverse", display: "flex" }}>
                            {props.auth.isAuthenticated && <div>
                                {hasPaymentMethod() && <Button primary disabled={props.search.selection === null} onClick={() => props.queueSong(location_id, props.search.selection.uri)}>Queue Song</Button>}
                                {!hasPaymentMethod() && <Button primary onClick={() => {
                                    history.push({ pathname: '/profile' })
                                }}>Add a Payment Method</Button>}
                            </div>}
                            {!props.auth.isAuthenticated && <Button primary onClick={() => { history.push({ pathname: '/login' }) }}>Login to Queue a Song</Button>}
                            <Button style={{ marginRight: 10 }} onClick={() => props.cleanQuery()}>Clear Selection</Button>
                        </div>
                    </div>
                </Card>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }} />
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
    location: state.location,
    auth: state.auth
})

export default connect(mapStateToProps, { startSearch, cleanQuery, updateSelection, queueSong, getDraftInvoice })(Jukebox);
