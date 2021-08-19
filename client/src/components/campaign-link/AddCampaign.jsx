import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Radio, Tab } from "semantic-ui-react";
import SurveyForm from "./AddSurveyForm";
import RaffleForm from "./AddRaffleForm";
import { connect } from "react-redux"
import { addCampaign } from "../../actions/campaignActions"


function ModalAddCampaign(props) {
    const panes = [
        { menuItem: 'Survey', render: () => <SurveyForm /> },
        { menuItem: 'Raffle', render: () => <RaffleForm /> }
    ]
    const [open, setOpen] = useState(false);
    const [values, setvalues] = useState(
        {
            title: props.title,
            description: props.description,
            details: props.details || { type: "Survery", options: ["abc"] },
        });
    useEffect(() => {
        setvalues({
            ...values,
            title: props.title,
            description: props.description,
            details: props.details || { type: "Survery", options: ["abc"] }
        })
    }, [open]);
    function submit(e) {
        e.preventDefault();
        //campaign ID will be null if new location but has value if updating
        const campaignDetails = {
            title: values.title,
            description: values.description,
            details: values.details,
            user: props.auth.user._id,
            campaign_id: props._id
        }
        if (values.name && values.details) {
            props[`${props.action}Campaign`](campaignDetails);
            close()
        }
    }
    function handleChange(e) {
        setvalues({ ...values, [e.target.name]: e.target.value });
    }
    function clear() {
        setvalues({ ...values, title: "", description: "", details: { type: "Survey" } });
    }
    function close() {
        setOpen(false);
        clear()
    }
    function handleClick(e) {
        var details = values.details
        details.type = e.target.innerHTML
        setvalues({ ...values, details })
    }
    function handleOptionChange(data, index) {
        var options = values.details.options
        options[index] = data.value
        setvalues({ ...values, details: { ...values.details, options } })
    }
    const title = props.action.substring(0, 1).toUpperCase() + props.action.substring(1)
    console.log(values.details)
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
                    <i className='add icon' />
                    Add Campaign
                </a>}>
            <Modal.Header>{title} Campaign</Modal.Header>
            <Modal.Content scrolling>
                {/* {props.action === "add" &&  <Tab panes={panes} /> } */}
                {props.action === "add" && <Button.Group basic>
                    <Button toggle active={values.details.type === "Survery"} onClick={handleClick}>Survery</Button>
                    <Button toggle active={values.details.type === "Raffle"} onClick={handleClick}>Raffle</Button>
                </Button.Group>}
                <Form>
                    <br />
                    <Form.Input label={`${values.details.type} Title`} placeholder='Enter Title' />
                    <Form.TextArea label='Description' placeholder='Enter Description' />
                    {values.details.type === "Survery" && <Form.Input label='What do you want to ask?' placeholder='Enter Question' />}
                    {values.details.type === "Raffle" && <Form.Input label='Cost Per Ticket' placeholder='Enter in Dollars' />}
                    {values.details.type === "Survery" &&
                        <table>
                            <thead>
                                <tr>
                                    <th>Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {values.details.options.map((option, index) => {
                                        return (
                                            <td>
                                                <Form.Input name={`${values.details.options}_${index}`} value={values.details.options[index]} onChange={(e, data) => handleOptionChange(data, index)} />
                                            </td>
                                        )
                                    })}
                                </tr>
                            </tbody>
                        </table>

                    }
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color='black' onClick={close}>
                    Cancel
                </Button>
                <Button
                    content="Submit"
                    onClick={submit}
                    positive
                />
            </Modal.Actions>
        </Modal>
    )
}


const mapStateToProps = (state) => ({
    auth: state.auth,
    campaign: state.campaign,
})
export default connect(mapStateToProps, { addCampaign })(ModalAddCampaign)
