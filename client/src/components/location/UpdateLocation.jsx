import React from 'react';
import {Button, Form, Modal} from "semantic-ui-react";


function ModalUpdateLocation() {
    const [open, setOpen] = React.useState(false);
    return (
        <Modal onClose={() => setOpen(false)}
               onOpen={() => setOpen(true)}
               open={open}
               trigger={
                   <div><i className="pencil alternate icon" style={{marginRight: 10}}/></div>
               }>
            <Modal.Header>Edit Location</Modal.Header>
            <Modal.Content>
                <Form>
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <div style={{height: 80, width: 80,  backgroundColor: "gray", borderRadius: 10, marginBottom: 15}} />
                        <Button
                            content="Choose Logo"
                            labelPosition="left"
                            icon="file"
                        />
                        <input
                            type="file"
                            hidden
                        />
                    </div>
                    <Form.Input label='Location Name' placeholder='Enter Name'/>
                    <Form.TextArea label={'Location Description'} placeholder='Enter Description'/>
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

export default ModalUpdateLocation;