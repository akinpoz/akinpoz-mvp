import React from 'react';
import {Button, Form, Modal, Radio, Tab} from "semantic-ui-react";
import SurveyForm from "./AddSurveyForm";
import RaffleForm from "./AddRaffleForm";

const panes = [
    { menuItem: 'Survey', render: () => <SurveyForm /> },
    { menuItem: 'Raffle', render: () => <RaffleForm /> }
]

function ModalAddCampaign() {
    const [open, setOpen] = React.useState(false);
    return (
        <Modal onClose={() => setOpen(false)}
               onOpen={() => setOpen(true)}
               open={open}
               trigger={
                   <a style={{
                       display: 'flex',
                       flexDirection: 'row',
                       cursor: 'pointer',
                       color: '#4183c4',
                       fontWeight: 'bold'
                   }}
                      icon
                      labelPosition='right'
                      color='white'>
                       <i className='add icon'/>
                       Add Campaign
                   </a>}>
            <Modal.Header>Add New Campaign</Modal.Header>
            <Modal.Content scrolling>
                <Tab panes={panes}/>
            </Modal.Content>
            <Modal.Actions>
                <Button color='black' onClick={() => setOpen(false)}>
                    Cancel
                </Button>

                <Button
                    content="Add Campaign"
                    labelPosition='right'
                    icon='plus'
                    onClick={() => setOpen(false)}
                    positive
                />
            </Modal.Actions>
        </Modal>
    )
}

export default ModalAddCampaign;
