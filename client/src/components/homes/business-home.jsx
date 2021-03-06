import React, {useEffect, useState} from "react";
import Locations from "../locations";
import {connect} from 'react-redux'
import history from '../../history'
import PropTypes from 'prop-types'
import {addLocation, getLocationsByUserID} from "../../actions/locationActions"
import {getCampaignsByUserID} from "../../actions/campaignActions"
import {Message} from "semantic-ui-react";

function Home(props) {
    const [msg, setMsg] = useState({ status: "", text: "" })
    const {auth, getLocationsByUserID, getCampaignsByUserID} = props
    useEffect(() => {
        if (auth.user) {
            getLocationsByUserID(auth.user._id)
            getCampaignsByUserID(auth.user._id)
            if (history.location.state) {
                setMsg({ status: history.location.state.msg.status, text: history.location.state.msg.text })
            }
        }
        else {
            history.push('/login')
        }
    }, [auth, getCampaignsByUserID, getLocationsByUserID])
    return (
        <div id="home-container">
            <div style={{width: '80%', marginLeft: 'auto', marginRight: 'auto', marginTop: '2%' }}>
                {msg.status && <Message color={msg.status}>
                    <Message.Header>{msg.text}</Message.Header>
                </Message>}
            </div>
            <h1 style={{ textAlign: "center", marginTop: "2%" }}>Location Manager</h1>
            <Locations />
        </div>
    )
}
Home.propTypes = {
    auth: PropTypes.object.isRequired,
    getLocationsByUserID: PropTypes.func.isRequired,
    getCampaignsByUserID: PropTypes.func.isRequired,
    addLocation: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth
})
export default connect(mapStateToProps, { getLocationsByUserID, addLocation, getCampaignsByUserID })(Home)
