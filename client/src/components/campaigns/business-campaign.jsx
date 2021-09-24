import React, { useState } from 'react'
import { Card, Icon } from 'semantic-ui-react'
import Modal from './Modal'
import styles from './campaigns.module.css'
import { connect } from 'react-redux'
import { deleteCampaign } from '../../actions/campaignActions'
import axios from 'axios'
import { getHeaders } from '../../utils'


function BusinessCampaign(props) {
    const { title, description, details, _id, user, location } = props.campaign
    const [options, setOptions] = useState(details.options)
    const [toggleList, setToggleList] = useState(false)
    function handleDelete() {
        const campaign = {
            _id,
            user,
            location,
        }
        if (window.confirm("Are you sure you want to delete this campaign?")) props.deleteCampaign(campaign)
    }
    function handleClick() {
        setToggleList(!toggleList)
    }
    function handleNameRemove(name) {
        const headers = getHeaders()
        headers["x-auth-token"] = props.auth.token
        if (window.confirm("Are you sure you want to remove this name?")) {
            axios.post('/api/campaigns/removeName', { name, _id, token: { headers: { ...headers } } }).then(res => {
                setOptions(options.filter(option => option !== res.data.name))
            }).catch(e => {
                alert(`Failed to move name. ${e}`)
                console.error(e)
            })
        }
    }
    const updateTrigger = <Icon name='pencil' />
    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>{title}</Card.Header>
                <Card.Meta>{details.type}</Card.Meta>
            </Card.Content>
            <Card.Content description={description} />
            <Card.Content className={styles.campaign_extra_div} extra>
                {details.type === "Fastpass" && <abbr style={{ textDecoration: 'none' }} title="View current list"><a onClick={handleClick}>{toggleList === true ? "Hide" : "View"} List</a></abbr>}
                {details.type !== "Fastpass" && <abbr style={{ textDecoration: 'none' }} title="View Results"><a onClick={handleClick}>Results</a></abbr>}
                <abbr style={{ textDecoration: 'none' }} title="Edit Campaign"><Modal action={"update"} trigger={updateTrigger} {...props} {...props.campaign} /></abbr>
                <Icon color="red" name="trash" onClick={handleDelete} />
            </Card.Content>
            {toggleList && <ExtraContent options={options} handleNameRemove={handleNameRemove}/>}
        </Card >
    )
}

// a component that displays the list of names/results that are in the campaign
function ExtraContent(props) {
    <table style={{ width: '95%', marginLeft: 'auto', marginRight: 'auto' }}>
        <thead>
            {props.options.length > 0 &&
                <tr>
                    <th>Name</th>
                    <th style={{ textAlign: 'end' }}>Remove</th>
                </tr>
            }
        </thead>
        <tbody>
            {props.options.length > 0 && props.options.map(option => {
                return (
                    <tr key={option} >
                        <td>{option}</td>
                        <td style={{ textAlign: 'end' }}><Icon name="remove" color="red" onClick={props.handleNameRemove.bind(null, option)} /></td>
                    </tr>
                )
            })}
            {props.options.length === 0 &&
                <tr>
                    <td>There are no names on the list</td>
                </tr>
            }
        </tbody>
    </table>
}

const mapStateToProps = (state) => ({
    auth: state.auth
})

export default connect(mapStateToProps, { deleteCampaign })(BusinessCampaign)