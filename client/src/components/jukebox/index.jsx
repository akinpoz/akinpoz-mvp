import React, {useEffect, useRef, useCallback} from 'react';
import styles from './jukebox.module.css'
import {Button, Card, Search, Message} from "semantic-ui-react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {cleanQuery, startSearch, updateSelection} from "../../actions/searchActions";
import history from '../../history'
import {useState} from 'react';
import {clearStripeMsg, setupNewTab} from "../../actions/stripeActions";
import {clearSpotifyErrors, queueSong} from "../../actions/spotifyActions";

function Jukebox(props) {
    // Searching should be allowed for customers
    // Queueing needs to check for auth state first
    const location_id = props.location.select_location || props.location.select_location._id
    const timeoutRef = useRef()
    const [location, setLocation] = useState({name: ""})
    const [msg, setMsg] = useState(null)
    const [buttonLabel, setButtonLabel] = useState('Open New Tab')
    const [locked, setLocked] = useState(true)

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
        props.cleanQuery()
    }, [])

    useEffect(() => {
        setLocation(props.location.locations.find(location => location._id === location_id) || props.location.select_location)
    }, [props.location])

    useEffect(() => {
        if (props.auth.isAuthenticated) {
            if (props.auth.user.paymentMethod && props.auth.user.paymentMethod.length === 0) {
                setMsgWithPriority({
                    msg: "Please add a payment method in the profile page before queuing a song.",
                    priority: 2
                })
            }
        } else {
            setMsgWithPriority({
                msg: "Please login to queue a song... You must also have a valid payment method associated with your account.",
                priority: 1
            })
        }
    }, [props.auth])

    useEffect(() => {
        if (props.spotify.error) {
            setMsgWithPriority({...props.spotify.error, priority: 3})
            props.clearSpotifyErrors()
        }
    }, [props.spotify])

    useEffect(() => {
        if (props.stripe) {
            if (props.stripe.hasOpenTab) {
                setButtonLabel('Add To Tab')
            } else {
                setButtonLabel('Open New Tab')
            }

            if (props.stripe.msg) {
                setMsgWithPriority({...props.stripe.msg, priority: 3})
                props.clearStripeMsg()
            }
            if (props.stripe.unpaidTabs) {
                const hasUnpaidTabs = props.stripe.unpaidTabs.length !== 0
                if (hasUnpaidTabs) {
                    setMsgWithPriority({
                        msg: 'You currently have an unpaid tab.  Please check your email and settle this before opening a new tab.',
                        priority: 2
                    })
                }
                setLocked(hasUnpaidTabs)
            }
            else {
                setLocked(false)
            }
        }
    }, [props.stripe])

    const handleSelectionChange = useCallback((e, data) => {
        props.updateSelection(data.result);
    }, [])

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

    function setMsgWithPriority(newMsg) {
        // checks if new message is prioritized over old message (if no message priority is 5 -- the highest priority is 3)
        if (newMsg && newMsg.priority < (msg?.priority ?? 5)) {
            setMsg(newMsg)
        }
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

    function handleSubmit() {
        // Check for auth state here. Set redux store with info. If not logged in, redirect to login page. If logged in redirect to payment page.
        // At payment page access the info from the redux store
        // Add the name/number of tickets to the select campaign redux object
        // Grab user's email from redux store on payment & send to stripe backend/campaign list endpoint
        const item = {
            amount: 1,
            user: props.auth.user,
            description: 'song',
            data: {
                timestamp: new Date().toLocaleDateString("en-US"),
                type: 'song',
                campaign_id: 'jukebox_' + props.location.select_location._id,
                location_id: props.location.select_location._id,
                transactionID: props.auth.user._id + Date.now(),
                name: props.search.selection.name,
                songUri: props.search.selection.uri
            }

        }
        props.setupNewTab(item)
        if (props.stripe.hasOpenTab && parseInt(props.stripe?.tab?.timeWillBeSubmitted ?? 0) > Date.now()) {
            if (window.confirm('Are you sure you would you like to add this to your tab?')) {
                if (parseInt(props.stripe?.tab?.timeWillBeSubmitted ?? 0) > Date.now() + 5000) {
                    props.submitCampaignData(item)
                } else {
                    history.push('/checkout')
                }
            }
        } else {
            history.push('/checkout')
        }
        props.cleanQuery()
    }

    function handleRedirect() {
        history.location.state = history.location
    }

    return (
        <div className={styles.container}>
            {msg && msg.msg && <Message color={(msg.msg.includes("login") || msg.msg.includes("payment") || msg.msg.includes('unpaid')) ? "red" : "green"}>
                <Message.Header>
                    {msg.msg}
                    {msg.msg.includes("login") &&
                    <div><a href="/#/login" onClick={handleRedirect}>Login</a> or <a href="/#/register"
                                                                                     onClick={handleRedirect}>Register</a>
                    </div>
                    }

                </Message.Header>
            </Message>}
            {props.auth.user && props.auth.user.type === 'business' &&
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
            <div style={{flex: 1, display: "flex", flexDirection: "column"}}/>
            <div className={styles.shiftUp}>
                {location && <h2 style={{textAlign: 'center'}}>Playing @ {location.name}</h2>}
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
                            {!locked && props.auth.isAuthenticated && props.auth.user.type === "customer" &&
                            <div>
                                <Button style={{marginRight: 10}} onClick={() => props.cleanQuery()}>
                                    Clear Selection</Button>
                                {hasPaymentMethod() && <Button primary disabled={props.search.selection === null}
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
