import React, {useState, useEffect} from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styles from './profile.module.css'

function Profile(props) {
    return (
        <div className={styles.profileContainer}>
            <EndUserDashboard props={props} /> {/* TODO: Figure out how to pass through props easier */}
            {/* TODO: Make client Dashboard, make switch with profile type */}
        </div>
    )
}

function EndUserDashboard(props) {
    return (
        <div>
            <br/>
            <h1 style={{textAlign: "center"}}>Welcome, {props.props.auth.user.name}!</h1>
            <div className={styles.endUserDashboardContainer}>
                <AccountSettings/>
                <History/>
            </div>
        </div>
    )
}

function AccountSettings() {
    // TODO: Make these inputs update user in backend
    return (
        <div className={styles.userAccountSettings}>
            <div style={{backgroundColor: 'gray', width: 200, height: 150, borderRadius: 10}}>
                Profile Pic
            </div>
            <br/>
            <div className="ui input" style={{marginBottom: 10}}>
                <input type="text" placeholder="Email" required/>
            </div>

            <div className="ui input" style={{marginBottom: 10}}>
                <input type="text" placeholder="Username" required/>
            </div>

            <div className="ui input">
                <input type="text" placeholder="Password" required/>
            </div>
            <br/>
            <div>
                {/* TODO: Make Buttons work, reset fields */}
                <button className="ui button">
                    Cancel
                </button>
                <button className="ui primary button">
                    Submit
                </button>
            </div>
        </div>
    )
}

function History() {

    // TODO: Figure out what exactly we want to report here.  What information do we need to display?
    return (
        <div className={styles.userAccountSettings}>
            <h2>History</h2>
            <br/>
            <div className={styles.divider}/>
            <br/>
            <LocationHistory name='Restaurant 1' />
            <br/>
            <div className={styles.divider}/>
            <br/>
            <LocationHistory name='Restaurant 2' />
        </div>
    )
}

/**
 * Made Location History different because it will be used multiple times.  Takes in name as prop
 */
function LocationHistory(props) {
    // TODO: Figure out how history will be stored in the backend, and how the
    //  data will be passed through to this component

    return (
        <div>
            <h4>{props.name}</h4>
            <p>Entered raffle 10/10/21</p>
        </div>
    )
}


Profile.propTypes = {
    auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth
})
export default connect(mapStateToProps, null)(Profile)
