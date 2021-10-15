import React, {useCallback, useEffect, useRef, useState} from 'react';
import styles from './jukebox.module.css'
import {Button, Card, Message, Search} from "semantic-ui-react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {cleanQuery, startSearch, updateSelection} from "../../actions/searchActions";
import history from '../../history'
import {clearStripeMsg, setupNewTab} from "../../actions/stripeActions";
import {clearSpotifyErrors, queueSong} from "../../actions/spotifyActions";

function Jukebox(props) {
    // Searching should be allowed for customers
    // Queueing needs to check for auth state first
    const {
        auth,
        search,
        spotify,
        stripe,
        location,
        cleanQuery,
        clearSpotifyErrors,
        clearStripeMsg,
        updateSelection,
        startSearch,
        setupNewTab,
        queueSong
    } = props
    const location_id = location.select_location || location.select_location._id
    const timeoutRef = useRef()
    const [loc, setLoc] = useState({name: ""})
    const [msg, setMsg] = useState(null)
    const [buttonLabel, setButtonLabel] = useState('Open New Tab')
    const [locked, setLocked] = useState(true)

    const setMsgWithPriority = useCallback((newMsg) => {
        // checks if new message is prioritized over old message (if no message priority is 5 -- the highest priority is 3)
        if (newMsg && newMsg.priority <= (msg?.priority ?? 5)) {
            setMsg(newMsg)
        }
    }, [msg])

    useEffect(() => {
        if (!location_id) {
            history.push({
                pathname: '/',
                state: {
                    msg: {
                        status: 'yellow',
                        text: "Please click on the location's jukebox button before navigating to the jukebox page."
                    }
                }
            })
        }
        cleanQuery()
    }, [cleanQuery, location_id])

    useEffect(() => {
        setLoc(location.locations.find(location => location._id === location_id) || location.select_location)
    }, [location, location_id])

    useEffect(() => {
        if (auth.isAuthenticated) {
            if (auth.user.paymentMethod && auth.user.paymentMethod.length === 0) {
                setMsgWithPriority({
                    msg: "Please add a payment method in the profile page before queuing a song.",
                    priority: 2,
                    negative: true,
                    positive: false
                })
            }
        } else {
            setMsgWithPriority({
                msg: "Please login to queue a song.",
                priority: 1,
                negative: true,
                positive: false
            })
        }
    }, [auth, setMsgWithPriority])

    useEffect(() => {
        if (spotify.error) {
            setMsgWithPriority({...spotify.error, priority: 3})
            clearSpotifyErrors()
        }
    }, [spotify, clearSpotifyErrors, setMsgWithPriority])

    useEffect(() => {
        if (stripe) {
            if (stripe.hasOpenTab) {
                setButtonLabel('Add To Tab')
            } else {
                setButtonLabel('Open New Tab')
            }

            if (stripe.msg) {
                setMsgWithPriority({...stripe.msg, priority: 3})
                clearStripeMsg()
            }
            if (stripe.unpaidTabs) {
                const hasUnpaidTabs = stripe.unpaidTabs.length !== 0
                if (hasUnpaidTabs) {
                    setMsgWithPriority({
                        msg: 'You currently have an unpaid tab.  Please check your email and settle this before opening a new tab.',
                        priority: 2,
                        negative: true,
                        positive: false
                    })
                }
                setLocked(hasUnpaidTabs)
            } else {
                setLocked(false)
            }
        }
    }, [stripe, clearStripeMsg, setMsgWithPriority])

    const handleSelectionChange = useCallback((e, data) => {
        updateSelection(data.result);
    }, [updateSelection])

    const handleSearchChange = useCallback((e, data) => {
        clearTimeout(timeoutRef.current)
        startSearch(data.value)
        updateSelection(null)
        timeoutRef.current = setTimeout(() => {
            if (data.value.length === 0) {
                cleanQuery()
            }
        }, 300)
    }, [updateSelection, startSearch, cleanQuery])

    const hasPaymentMethod = () => {
        return auth.user.paymentMethod && auth.user.paymentMethod.length > 0
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
            amount: 1,
            user: auth.user,
            description: 'song',
            data: {
                timestamp: new Date().toLocaleDateString("en-US"),
                type: 'song',
                campaign_id: 'jukebox_' + location.select_location._id,
                location_id: location.select_location._id,
                transactionID: auth.user._id + Date.now(),
                name: search.selection.name,
                songUri: search.selection.uri
            }

        }
        setupNewTab(item)
        if (stripe.hasOpenTab && parseInt(stripe.tab?.timeWillBeSubmitted ?? 0) > Date.now()) {
            if (window.confirm('Are you sure you would you like to add this to your tab?')) {
                if (parseInt(stripe.tab?.timeWillBeSubmitted ?? 0) > Date.now() + 5000) {
                    queueSong(item)
                } else {
                    history.push('/checkout')
                }
            }
        } else {
            history.push('/checkout')
        }
        cleanQuery()
    }

    function handleRedirect() {
        history.location.state = history.location
    }

    return (
        <div className={styles.container}>
            <div style={{flex: 1, display: "flex", flexDirection: "column"}}/>
            {msg && msg.msg && <Message positive={msg.positive} negative={msg.negative}>
                <Message.Header>
                    {msg.msg}
                    {msg.msg.includes("login") &&
                    <div><a href="/#/login" onClick={handleRedirect}>Login</a> or <a href="/#/register"
                                                                                     onClick={handleRedirect}>Register</a>
                    </div>
                    }

                </Message.Header>
            </Message>}
            {auth.user && auth.user.type === 'business' &&
            <Message>
                <Message.Header>You are seeing a preview of the jukebox feature.
                    <Message.Content>
                        <p>This feature is only enabled for customers of Apokoz.</p>
                        <p>To test this feature for yourself, please create a customer account.</p>
                        <p>Please also note that in order for customers to play music, you must start playing songs on a
                            device that is linked to the account you linked to Apokoz.</p>
                    </Message.Content>
                </Message.Header>
            </Message>
            }
            <br/>
            <br/>
            <br/>
            <div className={styles.shiftUp}>
                {loc && <h2 style={{textAlign: 'center'}}>Playing @ {loc.name}</h2>}
                <Card fluid>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 40
                    }}>
                        <h1>
                            Search For a Song
                        </h1>
                        <br/>
                        <Search
                            loading={search.loading}
                            size='large'
                            onSearchChange={handleSearchChange}
                            results={search.results?.result}
                            value={search.value}
                            resultRenderer={resultRender}
                            onResultSelect={handleSelectionChange}
                        />
                        <br/>
                        <div style={{flexDirection: "row-reverse", display: "flex"}}>
                            {!locked && auth.isAuthenticated && auth.user.type === "customer" &&
                            <div>
                                <Button style={{marginRight: 10}} onClick={() => cleanQuery()}>
                                    Clear Selection</Button>
                                {hasPaymentMethod() && <Button primary disabled={search.selection === null}
                                                               onClick={handleSubmit}>{buttonLabel}</Button>}
                                {!hasPaymentMethod() && <Button primary onClick={() => {
                                    history.push({pathname: '/profile'})
                                }}>Add a Payment Method</Button>}
                            </div>
                            }
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
}
const mapStateToProps = (state) => ({
    search: state.search,
    location: state.location,
    auth: state.auth,
    stripe: state.stripe,
    spotify: state.spotify
})

export default connect(mapStateToProps, {
    startSearch,
    cleanQuery,
    updateSelection,
    setupNewTab,
    queueSong,
    clearSpotifyErrors,
    clearStripeMsg
})(Jukebox);
