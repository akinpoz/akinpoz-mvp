import React from "react";
import styles from "./home.module.css"
import {Button, Card, Form, Icon, Modal} from "semantic-ui-react";

function CampaignsCrud() {

    const locations = ['Restaurant 1', 'Restaurant 2'];
    const campaigns = ['Campaign 1', 'Campaign 2', 'Campaign 3'];

    return (
        <div className={styles.container}>
            <h1 style={{textAlign: "center"}}>Campaign Manager</h1>
            <br/>
            {locations.map((i, index) => {
                return (
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", width: '100%'}}>
                    <Card style={{marginBottom: 20, width: '90%', padding: 20}}>
                        <div style={{display: "flex", flexDirection: 'row', alignItems: "center", marginBottom: 10}}>
                            <div style={{
                                height: 40,
                                width: 40,
                                backgroundColor: "gray",
                                borderRadius: 10,
                                marginRight: 10
                            }}>
                                Logo
                            </div>
                            <h2 style={{marginRight: 20, marginBottom: 0, marginTop: 0}}>{i}</h2>
                            <div style={{display: 'flex', alignItems: 'flex-start'}}>
                                <ModalEditLocation />
                                <i className='red trash icon'/>
                            </div>

                        </div>
                        <div style={{marginLeft: 20}}>
                            <div style={{marginBottom: 20}}>
                                {campaigns.map(j => {
                                    return (
                                        <div style={{display: "flex", flexDirection: 'row', marginBottom: 5}}>
                                            <a href='/#/interactive-campaign'><h4>{j}</h4></a>
                                            <div style={{flex: 1}}/>
                                            <ModalEditCampaign />
                                            <i className='red trash icon' style={{marginRight: 30}}/>
                                            <a href='/#/analytics'>View Results</a>
                                        </div>
                                    )
                                })}
                            </div>
                            <ModalAddCampaign/>
                        </div>
                        {/*<div style={{height: 1, width: '100%', background: "slategray", marginTop: 20}}*/}
                        {/*     hidden={index === (locations.length - 1)}/>*/}
                    </Card>
                    </div>
                )
            })}
            <ModalAddLocation />
        </div>
    )
}

function ModalAddCampaign() {
    const [open, setOpen] = React.useState(false);
    return (
        <Modal onClose={() => setOpen(false)}
               onOpen={() => setOpen(true)}
               open={open}
               trigger={<Button style={{display: 'flex', flexDirection: 'row', cursor: 'pointer'}} icon labelPosition='right' color='white'><i className='add icon'/>Add New Campaign</Button>}>
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

function ModalEditCampaign() {
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


function ModalAddLocation() {
    const [open, setOpen] = React.useState(false);
    return (
        <Modal onClose={() => setOpen(false)}
               onOpen={() => setOpen(true)}
               open={open}
               trigger={
                   <Button style={{position: 'fixed', bottom: 15, right: 15}} icon labelPosition='right'
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

function ModalEditLocation() {
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

export default CampaignsCrud;
