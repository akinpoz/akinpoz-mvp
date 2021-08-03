import React from 'react';
import {Button, Form,  Modal} from "semantic-ui-react";


function ModalUpdateCampaign() {
    const [open, setOpen] = React.useState(false);
    return (
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={<div><i className="pencil alternate icon" style={{marginRight: 10}}/></div>}>
            <Modal.Header>Edit Campaign</Modal.Header>
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
                    content="Save"
                    labelPosition='right'
                    icon='check'
                    onClick={() => setOpen(false)}
                    positive
                />
            </Modal.Actions>
        </Modal>
    )
}


export default ModalUpdateCampaign;