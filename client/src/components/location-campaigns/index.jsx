import React from "react";
import styles from './location-campaigns.module.css'
import {Card} from "semantic-ui-react";

const campaigns = [
    {name: 'Menu', ref: '/#/jukebox'},
    {name: 'Pick a Song', ref: '/#/jukebox'},
    {name: 'Pick the Special (September)', ref: '/#/campaign'},
    {name: 'Enter Raffle', ref: '/#/campaign'}
]
const colors = ['green', 'pink', 'yellow', 'orange']

function LocationCampaigns() {
    return (
        <div className={styles.container}>
            <h2>Location Campaigns</h2>
            <br/>
            <Card.Group style={{justifyContent: 'center', maxWidth: 800}}>
                {campaigns.map((value, index) => (
                    <Card color={colors[index]}>
                        <a href={value.ref}>
                        <div className={styles.cardContainer}>
                            <h4 className={styles.noselect} style={{textAlign: 'center'}}>{value.name}</h4>
                        </div>
                        </a>
                    </Card>
                ))}
            </Card.Group>
        </div>

    )
}

export default LocationCampaigns;
