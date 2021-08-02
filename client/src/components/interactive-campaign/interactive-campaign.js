import React from 'react';
import styles from './interactive-campaign.module.css'

function InteractiveCampaign() {
    return (
        <div className={styles.containerDiv}>
            {/*<LocationInfo/>*/}

            {/* TODO: Make this have conditional visibility based on number of actions */}
            {/* Change this to see Multi-Action or Single-Action View*/}
            <SingleAction/>

        </div>
    )
}

function LocationInfo() {
    return (
        <div className={styles.actionContainer}>
            <br/>
            <h2 style={{textAlign: 'center'}}>Angelico's Pizzeria</h2>
            <div style={{width: '80%', height: 155, background: 'gray', marginLeft: '10%'}}>
                <p>Insert Image Here</p>
            </div>
            <br/>
            <p style={{padding: 5, textAlign: 'center'}}>
                Welcome to Angelico's the best pizzeria in town!  We offer all sorts of stuff like pizza and drinks.
                Come by on tuesday for karaoke or thursday for DJ Night!
            </p>

        </div>
    )
}

// This will be the one action option
function SingleAction() {
    return (
        <div className={styles.actionContainer}>
            <br/>
            <h3 style={{textAlign: 'center'}}>What Pizza Should Be Our Special Next Week?</h3>
            <br/>
            <div style={{width: '100%', marginBottom: 20}}>
                <div className={styles.selection}>
                    <div style={{height: 15}}/>
                    <p style={{textAlign: 'center'}}>Buffalo Chicken</p>
                </div>
                <br/>
                <div className={styles.selection}>
                    <div style={{height: 15}}/>
                    <p style={{textAlign: 'center'}}>Caesar</p>
                </div>
                <br/>
                <div className={styles.selection}>
                    <div style={{height: 15}}/>
                    <p style={{textAlign: 'center'}}>Meatzilla</p>
                </div>
            </div>
            <div className={styles.buttonContainer}>
                <p style={{paddingTop: 10, marginRight: 10}}>4 Votes Left</p>
                <button className="ui primary button">
                    Submit
                </button>
            </div>
        </div>

    )
}

// This will be the multi action option
function MultiAction() {
    return (

        <div className={styles.actionContainer}>
            <div style={{width: '100%', marginTop: 80}}>
                <div className={styles.selection}>
                    <div style={{height: 15}}/>
                    <p style={{textAlign: 'center'}}>Pick a Beverage >></p>
                </div>
                <br/>
                <div className={styles.selection}>
                    <div style={{height: 15}}/>
                    <p style={{textAlign: 'center'}}>Pick Next Month's Special >></p>
                </div>
                <br/>
                <div className={styles.selection}>
                    <div style={{height: 15}}/>
                    <p style={{textAlign: 'center'}}>Enter Raffle >></p>
                </div>
            </div>
        </div>
    )
}

export default InteractiveCampaign

// TODO: generally we need to figure out how we are differentiating clients and users.  We also need
//  to figure out how we are storing a client's campaigns
