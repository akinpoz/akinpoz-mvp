import React from 'react';
import {Button, Form, Icon, Modal} from "semantic-ui-react";
import styles from './location.module.css'

function ModalAddLocation() {
    const [open, setOpen] = React.useState(false);
    return (
        <Modal onClose={() => setOpen(false)}
               onOpen={() => setOpen(true)}
               open={open}
               trigger={
                   <Button className={styles.button} size="tiny" icon labelPosition='left'
                                color='green'>
                       <Icon className='plus'/>
                       Add Location
                   </Button>
               }>
            <Modal.Header>Add Location</Modal.Header>
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
                    content="Add Location"
                    labelPosition='right'
                    icon='plus'
                    onClick={() => setOpen(false)}
                    positive
                />
            </Modal.Actions>
        </Modal>
    )
}

export default ModalAddLocation;