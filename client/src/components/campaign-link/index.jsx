import React from 'react'
import { Card, Icon } from 'semantic-ui-react'
import Modal from './Modal'
import styles from './campaign.module.css'


function CampaignLink(props) {
    const updateTrigger = <Icon name='pencil' />
const { title, description, details } = props
return (
    <Card fluid>
        <Card.Content>
            <Card.Header>{title}</Card.Header>
            <Card.Meta>{details.type}</Card.Meta>
        </Card.Content>
        <Card.Content description={description} />
        <Card.Content className={styles.campaign_extra_div} extra>
            <a href="/#/campaign"><abbr style={{ textDecoration: 'none' }} title="Preview Campaign"><Icon name="eye" /></abbr></a>
            <abbr style={{ textDecoration: 'none' }} title="Edit Campaign"><Modal action={"update"} trigger={updateTrigger} {...props}/></abbr>
            <Icon color="red" name="trash" />
        </Card.Content>
    </Card>
)
}

export default CampaignLink