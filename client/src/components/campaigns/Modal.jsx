import React, {useEffect, useState} from 'react';
import {Button, Form, Icon, Message, Modal} from "semantic-ui-react";
import {connect} from "react-redux"
import {addCampaign, updateCampaign} from "../../actions/campaignActions"


function CampaignModal(props) {
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState();
    const {title, description, question, details, auth, location, _id, action, trigger} = props
    const [values, setValues] = useState(
        {
            title: title || "",
            description: description || "",
            question: question || "",
            details: details || {type: "Survey", options: [""], results: new Map()},

        });



    useEffect(() => {
        setValues(
            {
                title: title || "",
                description: description || "",
                question: question || "",
                details: details || {type: "Survey", options: [""], results: new Map()},

            }
        );
    }, [open, title, description, question, details]);

    function submit(e) {
        e.preventDefault();
        const campaignDetails = {
            title: values.title,
            description: values.description,
            question: values.question,
            details: values.details,
            user: auth.user._id,
            location: location,
            campaign_id: _id,
            active: true
        }

        if (!values.title || !values.description || !values.details || !values.question) {
            setMsg("Please fill in all required fields and verify you have at least two options");
        } else {
            if (values.details.type === "Fastpass") {
                values.details.options = []
            }
            props[`${action}Campaign`](campaignDetails);
            close()
        }
    }

    function handleChange(e) {
        setValues({...values, [e.target.name]: e.target.value});
    }

    function close() {
        setOpen(false);
    }

    function handleClick(e) {
        let details = values.details
        details.type = e.target.innerHTML
        setValues({...values, question: "", details})
    }

    function handleOptionChange(data, index) {
        let options = values.details.options
        options[index] = data.value
        setValues({...values, details: {...values.details, options}})
    }

    function handleOptionAdd() {
        let options = values.details.options
        options.push("")
        setValues({...values, details: {...values.details, options}})
    }

    function handleOptionRemove(index) {
        let options = values.details.options
        options.splice(index, 1)
        setValues({...values, details: {...values.details, options}})
    }

    const campaignTitle = action?.substring(0, 1).toUpperCase() + action?.substring(1)
    return (
        <Modal onClose={() => setOpen(false)}
               onOpen={() => setOpen(true)}
               open={open}
               trigger={trigger}
               closeIcon>
            <Modal.Header>{campaignTitle} Campaign</Modal.Header>
            <Modal.Content scrolling>
                {/* {props.action === "add" &&  <Tab panes={panes} /> } */}
                {action === "add" && <Button.Group basic>
                    <Button toggle active={values.details.type === "Survey"} onClick={handleClick}>Survey</Button>
                    <Button toggle active={values.details.type === "Raffle"} onClick={handleClick}>Raffle</Button>
                    <Button toggle active={values.details.type === "Fastpass"} onClick={handleClick}>Fastpass</Button>
                </Button.Group>}
                <Form>
                    {msg && msg.msg && <Message negative>
                        <Message.Header>{msg.msg}</Message.Header>
                    </Message>}
                    <br/>
                    <Form.Input required label={`${values.details.type} Title`} placeholder='enter title...'
                                value={values.title} onChange={handleChange} name="title"/>
                    <Form.TextArea required label='Description' placeholder='enter description...'
                                   value={values.description} name="description" onChange={handleChange}/>
                    {values.details.type === "Survey" &&
                    <Form.Input required label='What do you want to ask?' placeholder='enter question...'
                                onChange={handleChange} value={values.question} name="question"/>}
                    {values.details.type === "Raffle" &&
                    <Form.Input required value={values.question} label='Cost Per Ticket' type="number"
                                placeholder='enter in dollar amount...' onChange={handleChange} name="question"/>}
                    {values.details.type === "Fastpass" &&
                    <Form.Input required value={values.question} label='Cost to Skip' type="number"
                                placeholder='enter in dollar amount...' onChange={handleChange} name="question"/>}
                    {values.details.type === "Survey" &&
                    <div id={'survey-options'}>
                        <table style={{width: '100%'}}>
                            <thead>
                            <tr>
                                <th>Options (2 required)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {values.details.options.map((option, index) => {
                                return (
                                    <tr key={index}>
                                        <td>
                                            <Form.Input placeholder={`enter option ${index + 1}...`}
                                                        name={`${values.details.options}_${index}`}
                                                        value={values.details.options[index]}
                                                        onChange={(e, data) => handleOptionChange(data, index)}/>
                                        </td>
                                        <td>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                cursor: 'pointer',
                                                color: 'red',
                                                fontWeight: 'bold'
                                            }}
                                                 color='white'
                                                 onClick={handleOptionRemove.bind(null, index)}>
                                                <Icon name="trash"/>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                        <br/>
                        <AddOptionButton handler={handleOptionAdd}/>
                    </div>

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

function AddOptionButton(props) {
    const {handler} = props
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            cursor: 'pointer',
            color: '#4183c4',
            fontWeight: 'bold'
        }}
             color='white'
             onClick={handler}>
            <i className='add icon'/>
            Add Option
        </div>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    campaign: state.campaign,
})
export default connect(mapStateToProps, {addCampaign, updateCampaign})(CampaignModal)
