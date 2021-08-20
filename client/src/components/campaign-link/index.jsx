import React from 'react'
import { Card, Icon } from 'semantic-ui-react'
import Modal from './Modal'
import styles from './campaign.module.css'
import {connect} from 'react-redux'
import {deleteCampaign} from '../../actions/campaignActions'


function CampaignLink(props) {
    const { title, description, details, _id, user, location } = props
    function handleDelete() {
        const campaign = {
            _id, 
            user,
            location,
        }
       if(window.confirm("Are you sure you want to delete this campaign?")) props.deleteCampaign(campaign)
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
                <a href="/#/campaign"><abbr style={{ textDecoration: 'none' }} title="Preview Campaign"><Icon name="eye" /></abbr></a>
                <abbr style={{ textDecoration: 'none' }} title="Edit Campaign"><Modal action={"update"} trigger={updateTrigger} {...props} /></abbr>
                <Icon color="red" name="trash" onClick={handleDelete}/>
            </Card.Content>
        </Card>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    campaign: state.campaign,
})

export default connect(mapStateToProps, {deleteCampaign})(CampaignLink)