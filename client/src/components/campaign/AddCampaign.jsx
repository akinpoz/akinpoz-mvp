import React from 'react';
import {Button, Form, Modal} from "semantic-ui-react";


function ModalAddCampaign() {
    const [open, setOpen] = React.useState(false);
    return (
        <Modal onClose={() => setOpen(false)}
               onOpen={() => setOpen(true)}
               open={open}
               trigger={<a style={{display: 'flex', flexDirection: 'row', cursor: 'pointer', color: '#4183c4', fontWeight: 'bold'}} icon labelPosition='right' color='white'><i className='add icon'/>Add Another Campaign</a>}>
            <Modal.Header>Add New Campaign</Modal.Header>
            <Modal.Content scrolling>
                <Form>
                    <Form.Input label='Campaign Title' placeholder='Enter Title'/>
                    <Form.TextArea label='Description' placeholder='Enter Description'/>
                    <Form.Input label='What do you want to ask?' placeholder='Enter Question'/>
                    <Form.TextArea label='Options (Separate by three commas)'
                                   placeholder='Enter Options Separated by Three Commas (,,,)'/>
                </Form>
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