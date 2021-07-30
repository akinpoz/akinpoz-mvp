import React from "react";
import styles from "./campaigns-crud.module.css"
import {Button, Form, Label, Modal} from "semantic-ui-react";

function CampaignsCrud() {

    const locations = ['Restaurant 1', 'Restaurant 2'];
    const campaigns = ['Campaign 1', 'Campaign 2', 'Campaign 3'];

    return (
        <div className={styles.container}>
            <h1 style={{textAlign: "center"}}><u>Campaign Manager</u></h1>
            <br/>
            {locations.map(i => {
                return (
                    <div style={{marginBottom: 20}}>
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
                            <h2 style={{marginRight: 10, marginBottom: 0, marginTop: 0}}>{i}</h2>
                            <ModalAddCampaign/>
                        </div>
                        {campaigns.map(j => {
                            return (
                                <div style={{display: "flex", flexDirection: 'row'}}>
                                    <a href='/#/interactive-campaign'><h4 style={{marginLeft: 20}}>{j}</h4></a>
                                    <div style={{flex: 1}}/>
                                    <a href='/#/interactive-campaign' style={{color: "inherit"}}><i
                                        className="pencil alternate icon" style={{marginRight: 10}}/> </a>
                                    <i className='red trash icon' style={{marginRight: 30}}/>
                                    <p><u>View Results</u></p>
                                </div>
                            )
                        })}
                        <div style={{height: 1, width: '100%', background: "slategray", marginTop: 20}}/>
                    </div>
                )
            })}
        </div>
    )
}

function ModalAddCampaign() {
    const [open, setOpen] = React.useState(false);
    return (
        <Modal onClose={() => setOpen(false)}
               onOpen={() => setOpen(true)}
               open={open}
               trigger={<div><i className='large circle add icon'/></div>}>
            <Modal.Header>Add New Campaign</Modal.Header>
            <Modal.Content scrolling>
                <Form>
                    <Form.Input label='Campaign Title' placeholder='Enter Title'/>
                    <Form.TextArea label='Description' placeholder='Enter Description'/>
                    <Form.Input label='What do you want to ask?' placeholder='Enter Question' />
                    <Form.TextArea label='Options (Separate by three commas)' placeholder='Enter Options Separated by Three Commas (,,,)' />
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

export default CampaignsCrud;
