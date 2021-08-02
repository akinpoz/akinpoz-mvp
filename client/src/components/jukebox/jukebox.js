import React from 'react';
import styles from './jukebox.module.css'
import {Search, Transition} from "semantic-ui-react";


function Jukebox() {
    return (
        <div className={styles.container}>
            <div style={{flex: 1, display: "flex", flexDirection: "column"}}/>
            <div className={styles.shiftUp}>
                <h1>
                    Search For a Song
                </h1>
                <Search fluid size='large'/>
            </div>
            <div style={{flex: 1, display: "flex", flexDirection: "column"}}/>
        </div>
    )
}

export default Jukebox;
