import React from "react";
import styles from "./campaigns-crud.module.css"

function CampaignsCrud() {

    const locations = ['Restaurant 1', 'Restaurant 2'];
    const campaigns = ['Campaign 1', 'Campaign 2', 'Campaign 3'];

    return (
        <div className={styles.container}>
            {locations.map(i => {
                return (
                    <div style={{marginBottom: 20}}>
                        <h2>{i}</h2>
                        {campaigns.map(j => {
                            return (
                                <div style={{display: "flex", flexDirection: 'row'}}>
                                    <h4 style={{marginLeft: 20}}>{j}</h4>
                                    <div style={{flex: 1}} />
                                    <i className="pencil alternate icon" style={{marginRight: 10}}/>
                                    <i className='red trash icon' style={{marginRight: 30}} />
                                    <p><u>View Results</u></p>
                                </div>
                            )
                        })}
                        <div style={{height: 1, width: '100%', background: "slategray", marginTop: 20}} />
                    </div>
                )
            })}
        </div>
    )
}

export default CampaignsCrud;
