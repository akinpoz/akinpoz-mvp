import React from "react";
import styles from "./Home.module.css"

function Home() {
    return (
        <div className={styles.container}>
            <h2 style={{marginBottom: 50, marginTop: 50, textAlign: "center"}}>Welcome back, User</h2>
            <div className={styles.rowOne}>
                <div className={styles.tabItem}>
                    <i className="huge user icon"/>
                    <h4>Profile</h4>
                </div>
                <div className={styles.spacer} />
                <div className={styles.tabItem}>
                    <i className="huge building icon"/>
                    <h4>Places</h4>
                </div>
            </div>
            <div className={styles.spacer} />
            <div className={styles.rowOne}>
                <div className={styles.tabItem}>
                    <i className="huge rocket icon"/>
                    <h4>Campaigns</h4>
                </div>
                <div className={styles.spacer} />
                <div className={styles.tabItem}>
                    <i className="huge pie chart icon"/>
                    <h4>Analytics</h4>
                </div>
            </div>
        </div>
    )
}

export default Home;
