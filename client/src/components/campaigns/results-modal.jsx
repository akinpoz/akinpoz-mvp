import React, { useEffect, useState } from 'react'
import { Button, Modal } from "semantic-ui-react";
import { connect } from 'react-redux'
import { updateCampaign } from '../../actions/campaignActions'


function ResultsModal(props) {
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState();
    useEffect(() => { }, [props])
    // Jukebox & Fastpass are not in this file (jukebox/index.jsx, campaigns/business-campaign.jsx respectively)
    // Picking Raffle winner
    function handlePick() {
        const options = []
        for (let entry of Object.entries(props.details.results)) {
            while (entry[1] > 0) {
                options.push(entry[0])
                entry[1]--;
            }
        }
        const winner = options[Math.floor(Math.random() * options.length)];
        // updateCampaign. Set results {"0": winner}, active: false
        const campaignDetails = {
            title: props.title,
            description: props.description,
            question: props.question,
            details: { ...props.details, results: { "0": winner } },
            user: props.user,
            location: props.location,
            campaign_id: props._id,
            active: false
        }
        props.updateCampaign(campaignDetails)
    }
    // Ending survey logic
    function handleEnd() {
        const options = Object.entries(props.details.results).sort((a, b) => a[1] - b[1]);
        const winner = options[0][0];
        const campaignDetails = {
            title: props.title,
            description: props.description,
            question: props.question,
            details: { ...props.details, results: { "0": winner } },
            user: props.user,
            location: props.location,
            campaign_id: props._id,
            active: false
        }
        props.updateCampaign(campaignDetails)
    }
    const results = Object.entries(props.details.results)
    return (
        <Modal onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={props.trigger}
            closeIcon>
            <Modal.Header>{props.active ? "Campaign in Progress..." : "Results"}
                {props.active &&
                    <h6>
                        {results.length === 0 ? 'There have been no entries yet...' : `${results.length} Entries`}
                    </h6>}
            </Modal.Header>
            <Modal.Content>
                {props.details.type === "Survey" &&
                    <div>
                        {props.active && results && results.map((result, index) => {
                            return (
                                <div key={index}>
                                    <h4>{result[0]} : {result[1]}</h4>
                                </div>
                            )
                        })}
                        {props.active && results.length === 0 && props.details.options.map((option, index) => {
                            return (
                                <div key={index}>
                                    <h4>{option} : 0</h4>
                                </div>
                            )
                        })}
                        {props.active && results.length > 0 &&
                            <Button onClick={handleEnd}>End Campaign</Button>
                        }
                        {!props.active &&
                            <div>
                                <h4>Winner</h4>
                                <p>{props.details.results[0]}</p>
                            </div>
                        }
                    </div>
                }
                {props.details.type === "Raffle" &&
                    <div>
                        <p>Please note: it is your responsibility to notify the winner</p>
                        {!props.active && <div>
                            <h4>Winner</h4>
                            <p>{props.details.results[0]}</p>
                        </div>}
                        {props.active && results.length > 0 && <div>
                            <Button onClick={handlePick}>Pick Winner</Button>
                        </div>}
                    </div>
                }
            </Modal.Content>
        </Modal>

    )
}

export default connect(null, { updateCampaign })(ResultsModal);
