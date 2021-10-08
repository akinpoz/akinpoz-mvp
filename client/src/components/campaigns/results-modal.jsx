import React, {useState} from 'react'
import {Button, Modal} from "semantic-ui-react";
import {connect} from 'react-redux'
import {updateCampaign} from '../../actions/campaignActions'


function ResultsModal(props) {
    const [open, setOpen] = useState(false);
    const {details, title, description, question, user, location, _id, updateCampaign, trigger, active} = props
    // Jukebox & Fastpass are not in this file (jukebox/index.jsx, campaigns/business-campaign.jsx respectively)
    // Picking Raffle winner
    function handlePick() {
        const options = []
        for (let entry of Object.entries(details.results)) {
            while (entry[1] > 0) {
                options.push(entry[0])
                entry[1]--;
            }
        }
        const winner = options[Math.floor(Math.random() * options.length)];
        // updateCampaign. Set results {"0": winner}, active: false
        const campaignDetails = {
            title: title,
            description: description,
            question: question,
            details: {...details, results: {"0": winner}},
            user: user,
            location: location,
            campaign_id: _id,
            active: false
        }
        updateCampaign(campaignDetails)
    }

    // Ending survey logic
    function handleEnd() {
        const options = Object.entries(details.results).sort((a, b) => a[1] - b[1]);
        const winner = options[0][0];
        const campaignDetails = {
            title: title,
            description: description,
            question: question,
            details: {...details, results: {"0": winner}},
            user: user,
            location: location,
            campaign_id: _id,
            active: false
        }
        updateCampaign(campaignDetails)
    }

    const results = Object.entries(details.results)
    return (
        <Modal onClose={() => setOpen(false)}
               onOpen={() => setOpen(true)}
               open={open}
               trigger={trigger}
               closeIcon>
            <Modal.Header>{active ? "Campaign in Progress..." : "Results"}
                {active &&
                <h6>
                    {results.length === 0 ? 'There have been no entries yet...' : `${results.length} Entries`}
                </h6>}
            </Modal.Header>
            <Modal.Content>
                {details.type === "Survey" &&
                <div>
                    {active && results && results.map((result, index) => {
                        return (
                            <div key={index}>
                                <h4>{result[0]} : {result[1]}</h4>
                                <br/>
                            </div>
                        )
                    })}
                    {active && results.length === 0 && details.options.map((option, index) => {
                        return (
                            <div key={index}>
                                <h4>{option} : 0</h4>
                                <br/>
                            </div>
                        )
                    })}
                    {!active &&
                    <div>
                        <h4>Winner</h4>
                        <p>{details.results[0]}</p>
                    </div>
                    }
                </div>
                }
                {details.type === "Raffle" &&
                <div>
                    <b>Please note: it is your responsibility to notify the winner</b>
                    {!active && <div>
                        <h4>Winner</h4>
                        <p>{details.results[0]}</p>
                    </div>}
                </div>
                }
            </Modal.Content>
            <Modal.Actions>
                {details.type === 'Survey' && active && results.length > 0 &&
                <Button primary onClick={handleEnd}>End Campaign</Button>
                }
                {details.type === 'Raffle' && active && results.length > 0 &&
                <div>
                    <Button primary onClick={handlePick}>Pick Winner</Button>
                </div>
                }

            </Modal.Actions>
        </Modal>

    )
}

export default connect(null, {updateCampaign})(ResultsModal);
