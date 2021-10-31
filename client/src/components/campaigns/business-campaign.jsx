import React, { useState } from 'react'
import { Button, Card, Icon } from 'semantic-ui-react'
import Modal from './Modal'
import styles from './campaigns.module.css'
import { connect } from 'react-redux'
import { deleteCampaign, updateCampaign } from '../../actions/campaignActions'
import axios from 'axios'
import { getHeaders } from '../../utils'
// import ResultsModal from './results-modal'
import {arrayBufferToBase64} from '../../utils'


function BusinessCampaign(props) {
    const { auth, campaign, deleteCampaign, updateCampaign } = props
    const { title, details, _id, user, location, description, question, active, imageOne, imageTwo } = campaign

    const [options, setOptions] = useState(details.options)
    // const [toggleList, setToggleList] = useState(false)
    function handleDelete() {
        const campaign = {
            _id,
            user,
            location,
        }
        if (window.confirm("Are you sure you want to delete this campaign?")) deleteCampaign(campaign)
    }
    function handleNameRemove(name) {
        const headers = getHeaders()
        headers["x-auth-token"] = auth.token
        if (window.confirm("Are you sure you want to remove this name?")) {
            axios.post('/api/campaigns/removeName', { name, _id, token: { headers: { ...headers } } }).then(res => {
                setOptions(options.filter(option => option !== res.data.name))
            }).catch(e => {
                alert(`Failed to move name. ${e}`)
                console.error(e)
            })
        }
    }
    const UpdateTrigger = <Icon name='pencil' />
    // const ResultsTrigger = <Button basic>View Results</Button>


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
            details: { ...details, results: { "0": winner } },
            user: user,
            location: location,
            campaign_id: _id,
            active: false
        }
        updateCampaign(campaignDetails)
    }

    // Ending Product Pluck logic
    function handleEnd() {
        const options = Object.entries(details.results).sort((a, b) => a[1] - b[1]);
        const winner = options[0][0];
        const campaignDetails = {
            title: title,
            description: description,
            question: question,
            details: { ...details, results: { "0": winner } },
            user: user,
            location: location,
            campaign_id: _id,
            active: false
        }
        updateCampaign(campaignDetails)
    }

    const results = Object.entries(details.results ?? [])
    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>{title}</Card.Header>
                {details.type === 'Raffle' && <Card.Meta>{details.type}</Card.Meta>}
            </Card.Content>
            <Card.Content>
                {details.type === 'Fastpass' && <FastPassList options={options} handleNameRemove={handleNameRemove} />}
                {details.type === "Product Pluck" &&
                    <div>
                         <div>
                            <img src={`data:image/*;base64,${arrayBufferToBase64(imageOne.data.data)}`} styles={{ width: "50%", margin: "auto auto", marginTop: "2%" }} />
                        </div>
                        <div>
                            <img src={`data:image/*;base64,${arrayBufferToBase64(imageTwo.data.data)}`} styles={{ width: "50%", margin: "auto auto", marginTop: "2%" }} />
                        </div>
                        {active && results && results.map((result, index) => {
                            return (
                                <div key={index}>
                                    <p><b>{result[0]}</b> : {result[1]}</p>
                                    <br />
                                </div>
                            )
                        })}
                        {active && results.length === 0 && details.options.map((option, index) => {
                            return (
                                <div key={index}>
                                    <p><b>{option}</b> : 0</p>
                                    <br />
                                </div>
                            )
                        })}
                        {!active &&
                            <div>
                                <h5>Winner</h5>
                                <b>{details.results[0]}</b>
                            </div>
                        }
                    </div>
                }
                {details.type === "Raffle" &&
                    <div>
                        <b>Please note: it is your responsibility to notify the winner</b>
                        {!active && <div>
                            <br />
                            <h4>Winner</h4>
                            <b>{details.results[0]}</b>
                        </div>}
                    </div>
                }
            </Card.Content>
            <Card.Content className={styles.campaign_extra_div} extra>
                {(details.type === "Fastpass" || (details.type !== "Fastpass" && (!active || results.length === 0))) && <abbr style={{ textDecoration: 'none' }} title="View current list"><div /></abbr>}
                {/*{details.type !== "Fastpass" && <abbr style={{ textDecoration: 'none' }} title="View Results"><ResultsModal trigger={ResultsTrigger} {...campaign} /></abbr>}*/}
                {details.type === 'Product Pluck' && active && results.length > 0 &&
                    <Button basic primary onClick={handleEnd}>End Campaign</Button>
                }
                {details.type === 'Raffle' && active && results.length > 0 &&
                    <div>
                        <Button basic primary onClick={handlePick}>Pick Winner</Button>
                    </div>
                }
                <abbr style={{ textDecoration: 'none' }} title="Edit Campaign"><Modal action={"update"} trigger={UpdateTrigger} {...props} {...campaign} /></abbr>
                <Icon color="red" name="trash" onClick={handleDelete} />
            </Card.Content>
            {/*{toggleList && <FastPassList options={options} handleNameRemove={handleNameRemove} />}*/}
        </Card >
    )
}

// Fastpass "Results" equivalent.
function FastPassList(props) {
    const { options, handleNameRemove } = props
    return (
        <table style={{ width: '95%', marginLeft: 'auto', marginRight: 'auto' }}>
            <thead>
                {options.length > 0 &&
                    <tr>
                        <th>Name</th>
                        <th style={{ textAlign: 'end' }}>Remove</th>
                    </tr>
                }
            </thead>
            <tbody>
                {options.length > 0 && options.map((option, index) => {
                    return (
                        <tr key={option + index} >
                            <td>{option}</td>
                            <td style={{ textAlign: 'end' }}><Icon name="remove" color="red" onClick={handleNameRemove.bind(null, option)} /></td>
                        </tr>
                    )
                })}
                {options.length === 0 &&
                    <tr>
                        <td>There are no names on the list</td>
                    </tr>
                }
            </tbody>
        </table>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth
})

export default connect(mapStateToProps, { deleteCampaign, updateCampaign })(BusinessCampaign)
