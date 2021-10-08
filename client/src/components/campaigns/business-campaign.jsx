import React, {useState} from 'react'
import {Button, Card, Icon} from 'semantic-ui-react'
import Modal from './Modal'
import styles from './campaigns.module.css'
import {connect} from 'react-redux'
import {deleteCampaign} from '../../actions/campaignActions'
import axios from 'axios'
import {getHeaders} from '../../utils'
import ResultsModal from './results-modal'


function BusinessCampaign(props) {
    const {auth, campaign, deleteCampaign} = props
    const { title, description, details, _id, user, location } = campaign

    const [options, setOptions] = useState(details.options)
    const [toggleList, setToggleList] = useState(false)
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
    const ResultsTrigger = <Button basic>View Results</Button>
    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>{title}</Card.Header>
                <Card.Meta>{details.type}</Card.Meta>
            </Card.Content>
            <Card.Content description={description} />
            <Card.Content className={styles.campaign_extra_div} extra>
                {details.type === "Fastpass" && <abbr style={{ textDecoration: 'none' }} title="View current list"><Button basic onClick={() => setToggleList(!toggleList)}>{toggleList === true ? "Hide" : "View"} List</Button></abbr>}
                {details.type !== "Fastpass" && <abbr style={{ textDecoration: 'none' }} title="View Results"><ResultsModal trigger={ResultsTrigger} {...campaign} /></abbr>}
                <abbr style={{ textDecoration: 'none' }} title="Edit Campaign"><Modal action={"update"} trigger={UpdateTrigger} {...props} {...campaign} /></abbr>
                <Icon color="red" name="trash" onClick={handleDelete} />
            </Card.Content>
            {toggleList && <FastPassList options={options} handleNameRemove={handleNameRemove} />}
        </Card >
    )
}

// Fastpass "Results" equivalent.
function FastPassList(props) {
    const {options, handleNameRemove} = props
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

export default connect(mapStateToProps, { deleteCampaign })(BusinessCampaign)
