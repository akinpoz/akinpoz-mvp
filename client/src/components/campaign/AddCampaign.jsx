import React from 'react';
import {Button, Form, Modal, Tab} from "semantic-ui-react";

const panes = [
    {
        menuItem: 'Survey', render: () => (
            <Form>
                <br/>
                <Form.Input label='Survey Title' placeholder='Enter Title'/>
                <Form.TextArea label='Description' placeholder='Enter Description'/>
                <Form.Input label='What do you want to ask?' placeholder='Enter Question'/>
                <Form.TextArea label='Options (Separate by three commas)'
                               placeholder='Enter Options Separated by Three Commas (,,,)'/>
            </Form>
        )
    },
    {
        menuItem: 'Raffle', render: () => (
            <Form>
                <br/>
                <Form.Input label='Raffle Title' placeholder='Enter Title' />
                <Form.TextArea label='Description' placeholder='Enter Description' />
                <Form.Input label='Cost Per Ticket' placeholder='Enter in Dollars' />
            </Form>
        )
    }
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
                       Add Another Campaign
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
