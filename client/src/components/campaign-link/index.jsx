import React, { useState } from 'react'
import { Card, Icon } from 'semantic-ui-react'
import Modal from './Modal'
import styles from './campaign.module.css'
import { connect } from 'react-redux'
import { deleteCampaign } from '../../actions/campaignActions'


function CampaignLink(props) {
    const { title, description, details, _id, user, location } = props
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
        // TODO: create campaign action/reducer/type for name removal in redux
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
                <abbr style={{ textDecoration: 'none' }} title="Edit Campaign"><Modal action={"update"} trigger={updateTrigger} {...props} /></abbr>
                <Icon color="red" name="trash" onClick={handleDelete} />
            </Card.Content>
            {toggleList &&
                <table style={{ width: '95%', marginLeft: 'auto', marginRight: 'auto'}}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th style={{textAlign: 'end'}}>Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.options.map(option => {
                            if (option !== "") {
                                return (
                                    <tr key={option} >
                                        <td>{option}</td>
                                        <td style={{textAlign: 'end'}}><Icon name="remove" color="red" onClick={handleNameRemove.bind(null, option)} /></td>
                                    </tr>
                                )
                            }
                            else {
                                return (
                                    <tr>
                                        <td>There are no names on the list</td>
                                        <td style={{textAlign: 'end'}}><Icon name="remove" color="red" onClick={handleNameRemove.bind(null, option)} /></td>

                                    </tr>
                                )
                            }
                        }
                        )}
                    </tbody>
                </table>
            }
        </Card >
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    campaign: state.campaign,
})

export default connect(mapStateToProps, { deleteCampaign })(CampaignLink)