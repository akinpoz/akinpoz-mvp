import React, { useEffect, useState } from 'react'
import { Button, Form, Modal, Icon, Message } from "semantic-ui-react";
import { connect } from 'react-redux'
import { updateCampaign } from '../../actions/campaignActions'

function ResultsModal(props) {
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState();
    useEffect(() => { }, [props])
    function handlePick() {
        const winner = props.details.options[Math.floor(Math.random() * props.details.options.length)];
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
    function handleEnd() {
        var options = Object.values(props.details.results).sort((a, b) => a - b);
        var winner = options[0];
        const campaignDetails = {
            title: props.title,
            description: props.description,
            question: props.question,
            details: {...props.details, results: { "0": winner }},
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
            trigger={props.trigger}>
            <Modal.Header>{props.active ? "Campaign in Progress..." : "Results"}</Modal.Header>
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
                        {props.active &&
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
                        {props.active && <div>
                            <Button onClick={handlePick}>Pick Winner</Button>
                        </div>}
                    </div>
                }
            </Modal.Content>
        </Modal>

    )
}

export default connect(null, { updateCampaign })(ResultsModal);