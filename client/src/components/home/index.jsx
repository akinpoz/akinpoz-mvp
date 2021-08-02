import React, { useEffect, useState } from "react";
import styles from "./home.module.css"
import Location from "../location";
import { connect } from 'react-redux'
import AddLocation from '../location/AddLocation'
import PropTypes from 'prop-types'

function Home(props) {
    const [isLoggedIn, setIsLoggedIn] = useState(props.auth.isAuthenticated)
    // get locations
    const locations = ['Restaurant 1', 'Restaurant 2'];
    useEffect(() => {
        setIsLoggedIn(props.auth.isAuthenticated)
    }, [props])
    return (
        <div className={styles.container}>
            <h1 style={{textAlign: "center"}}>Campaign Manager</h1>
            <AddLocation  {...props}/>

            <br/>
            {locations.map((i, index) => {
                return (
                   <Location i={i} index={index} {...props}/>
                )
            })}
        </div>
    )
}
Home.propTypes = {
    auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth
})
export default connect(mapStateToProps, null)(Home)
