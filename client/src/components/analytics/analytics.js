import React from "react";
import styles from "./analytics.module.css"

function Analytics() {
    return (
        <div className={styles.container}>
            <i className='massive hourglass half icon'/>
            <h1>Coming Soon!</h1>
            <h4>
                We're working hard to bring you new features to help you and your business.  Please check back here
                in a few weeks to take advantage of the analytics we will compile from your patrons!
            </h4>
            <br/>
            <div style={{textAlign: 'center', width: '90%'}}>
                <h4 style={{margin: 0}}>Sincerely,</h4>
                <h4 style={{margin: 0}}>Akinpoz</h4>
            </div>
        </div>
    )
}

export default Analytics;
