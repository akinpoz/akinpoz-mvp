import React from "react";
import styles from './results.module.css'
import {Card} from "semantic-ui-react";
import isLicensePlate from "validator/es/lib/isLicensePlate";

function Results() {
    const winner = 'Buffalo Chicken'
    const losers = ['Meatzilla', 'Caesar', 'Greek']
    return (
        <div className={styles.container}>
            <div className={styles.translated}>
            <h1>Results</h1>
            <br/>
            <Card color='green'>
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: 10}}>
                    <h2>Winner</h2>
                    <h3 style={{margin: 0, marginBottom: 10}}>{winner}</h3>
                    <p>65%</p>
                </div>
            </Card>
            <Card.Group style={{display: "flex", flexDirection: "row", justifyContent: 'center'}}>
                {losers.map((value, index) => (
                    <Card color='red'>
                        <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: 10}}>
                            <h6>{value}</h6>
                            <p>15%</p>
                        </div>
                    </Card>
                ))}
            </Card.Group>
            </div>
        </div>
    )
}

export default Results
