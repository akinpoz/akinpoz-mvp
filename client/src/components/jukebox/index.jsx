import React, { useEffect, useRef, useCallback } from 'react';
import styles from './jukebox.module.css'
import { Button, Card, Search, Message } from "semantic-ui-react";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import { cleanQuery, startSearch, updateSelection } from "../../actions/searchActions";
import history from '../../history'
import { useState } from 'react';
import {getDraftInvoice, setupNewTab, submitCampaignData} from "../../actions/stripeActions";

function Jukebox(props) {
    // Searching should be allowed for customers
    // Queueing needs to check for auth state first
    const location_id = props.location.select_location || props.location.select_location._id
    const timeoutRef = useRef()
    const [location, setLocation] = useState({ name: "" })
    const [msg, setMsg] = useState()
    const [buttonLabel, setButtonLabel] = useState('Open New Tab')
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
        if (props.stripe.hasOpenTab) {
            setButtonLabel('Add To Tab')
        } else {
            setButtonLabel('Open New Tab')
        }
    }, [props.stripe.hasOpenTab])
    useEffect(() => {
        if (!location_id) {
            history.push({
                pathname: '/',
                state: {
                    msg: { status: 'yellow', text: "Please click on the location's jukebox button before navigating to the jukebox page." }
                }
            })
        }
        if (props.auth.isAuthenticated) {
            if (props.auth.user.paymentMethod.length === 0) setMsg("Please add a payment method in the profile page before queuing a song.")
        }
        if (!props.auth.isAuthenticated) setMsg("Please login to queue a song... You must also have a valid payment method associated with your account.")
        setLocation(props.location.locations.find(location => location._id === location_id) || props.location.select_location)
        if (props.stripe && props.stripe.hasOpenTab) {
            setButtonLabel('Add To Tab')
        }
        return () => {
            clearTimeout(timeoutRef.current)
        }
    }, [])

    useEffect(() => {
        if (props.auth.user) {
            if (props.auth.isAuthenticated && props.auth.user.paymentMethod) {
                if (props.auth.user.paymentMethod.length === 0) setMsg("Please add a payment method in the profile page before queuing a song.")
                props.getDraftInvoice(props.auth.user._id)
            }
            if (!props.auth.isAuthenticated) setMsg("Please login to queue a song... You must also have a valid payment method associated with your account.")
            setLocation(props.location.locations.find(location => location._id === location_id) || props.location.select_location)
            return () => {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [props.auth])

    useEffect(() => {
        if (props.spotify.error) {
            setMsg(props.spotify.error)
        }
    }, [props.spotify])

    useEffect(() => {
        if (props?.stripe?.msg ?? false) {
            setMsg(props.stripe.msg)
        }
    }, [props.stripe.msg])

    const handleSelectionChange = useCallback((e, data) => {
        props.updateSelection(data.result);
    }, [])

    const hasPaymentMethod = () => {
        return props.auth.user.paymentMethod && props.auth.user.paymentMethod.length > 0
    }

    const resultRender = (item) => (
        <div>
            <b>{item.name}</b>
            <p>{item.artist}</p>
        </div>
    )

    function handleSubmit() {
        // Check for auth state here. Set redux store with info. If not logged in, redirect to login page. If logged in redirect to payment page.
        // At payment page access the info from the redux store
        // Add the name/number of tickets to the select campaign redux object
        // Grab user's email from redux store on payment & send to stripe backend/campaign list endpoint

        const item = {
            amount: 100,
            user: props.auth.user,
            description: 'song',
            data: {
                timestamp: new Date().toLocaleDateString("en-US"),
                type: 'song',
                campaignID: 'jukebox_' + props.location.select_location._id,
                locationID: props.location.select_location._id,
                transactionID: props.auth.user._id + Date.now(),
                name: props.search.selection.name,
                songUri: props.search.selection.uri
            }

        }
        if (props.stripe.hasOpenTab) {
            if (window.confirm('Your tab is at $' + props.stripe.tab.subtotal + '.  Would you like to add this to your tab?')) {
                props.submitCampaignData(item, props.location.select_location.name)
            }
        } else {
            props.setupNewTab(item)
            history.push('/checkout')
        }

    }

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
                                {hasPaymentMethod() && <Button primary disabled={props.search.selection === null} onClick={handleSubmit}>{buttonLabel}</Button>}
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
}
const mapStateToProps = (state) => ({
    search: state.search,
    location: state.location,
    auth: state.auth,
    stripe: state.stripe,
    spotify: state.spotify
})

export default connect(mapStateToProps, { startSearch, cleanQuery, updateSelection, getDraftInvoice, setupNewTab, submitCampaignData })(Jukebox);
