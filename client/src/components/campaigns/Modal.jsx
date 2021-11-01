import React, {useEffect, useState} from 'react';
import {Button, Form, Message, Modal} from "semantic-ui-react";
import {connect} from "react-redux"
import {addCampaign, updateCampaign} from "../../actions/campaignActions"


function CampaignModal(props) {
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState({msg: null, positive: false, negative: false});
    const {title, description, question, details, auth, location, _id, action, trigger} = props
    const [values, setValues] = useState(
        {
            title: title || "",
            description: description || "",
            question: question || "",
            details: details || {type: "Product Pluck", options: ["", ""], results: new Map()},

        });
    const [imageOne, setImageOne] = useState()
    const [imageTwo, setImageTwo] = useState()
    useEffect(() => {
        setValues(
            {
                title: title || "",
                description: description || "",
                question: question || "",
                details: details || {type: "Product Pluck", options: ["", ""], results: new Map()},
            }
        );
        setImageOne(null)
        setImageTwo(null)
    }, [open, title, description, question, details]);

    function submit(e) {
        e.preventDefault()

        if (values.details.type === 'Fastpass' && parseInt(values.question) < 25) {
            setMsg({msg: 'Please enter an amount greater than $24.99', positive: false, negative: true})
            return;
        }

        let question = values.question
        let title = values.title
        if (values.details.type === 'Product Pluck') {
            if (values.details.options[0] !== '' && values.details.options[1] !== '') {
                question = values.details.options[0] + ' vs ' + values.details.options[1]
                title = 'Product Pluck'
            } else {
                setMsg({msg: 'Please name your products!', positive: false, negative: true})
                return
            }
            if (imageOne === null || imageTwo === null) {
                setMsg({msg: 'Please add images for both product 1 and product 2', positive: false, negative: true})
                return
            }
        }

        const campaignDetails = {
            title: title,
            description: values.description,
            question: question,
            details: values.details,
            user: auth.user._id,
            location: location,
            campaign_id: _id,
            active: true,

        }
        const formData = new FormData()
        formData.append('imageOne', imageOne)
        formData.append('imageTwo', imageTwo)
        formData.append('campaignDetails', JSON.stringify(campaignDetails))
        if (!values.details) {
            setMsg({msg: "Please fill in all required fields", positive: false, negative: true});
        } else {
            if (values.details.type === "Fastpass") {
                values.details.options = []
            }
            props[`${action}Campaign`](formData);
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

    function handleUpload(e) {
        const fileName = e.target.files[0].name
        var extFile = fileName.split(".")[1]
        if (extFile === "jpg" || extFile === "jpeg" || extFile === "png" || extFile === 'PNG') {
            if (e.target.name === "One") {
                setImageOne(e.target.files[0])
            } else {
                setImageTwo(e.target.files[0])
            }
        } else {
            setMsg({
                msg: "Failed: Only .jpg, .jpeg, .png, and .PNG files are allowed!",
                positive: false,
                negative: true
            });
        }
    }

    const campaignTitle = action?.substring(0, 1).toUpperCase() + action?.substring(1)
    return (
        <Modal onClose={() => setOpen(false)}
               onOpen={() => {
                   setOpen(true)
                   setMsg(null)
               }}
               open={open}
               trigger={trigger}>
            <Modal.Header>{campaignTitle} Campaign</Modal.Header>
            <Modal.Content scrolling>
                {action === "add" && <Button.Group basic>
                    <Button toggle active={values.details.type === "Product Pluck"} onClick={handleClick}>Product
                        Pluck</Button>
                    <Button toggle active={values.details.type === "Raffle"} onClick={handleClick}>Raffle</Button>
                    <Button toggle active={values.details.type === "Fastpass"} onClick={handleClick}>Fastpass</Button>
                </Button.Group>}
                <Form style={{marginTop: 10}}>
                    {msg?.msg &&
                    <Message negative={msg?.negative} positive={msg?.positive} style={{marginTop: 20}}>
                        <Message.Header>{msg?.msg}</Message.Header>
                    </Message>}
                    {values.details.type === 'Raffle' &&
                    <Form.Input required label={`${values.details.type} Title`} placeholder="e.g. Fat Baby's Raffle"
                                value={values.title} onChange={handleChange} name="title"/>
                    }
                    {values.details.type === "Raffle" &&
                    <Form.TextArea required label='Description' placeholder='e.g. Enter for a chance to win free drinks'
                                   value={values.description} name="description" onChange={handleChange}/>
                    }
                    {values.details.type === "Product Pluck" &&
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: "49% 49%",
                        gridGap: '2%',
                        padding: "8px"
                    }}>
                        <div id={'product_one_input'} style={{display: "flex", flexDirection: 'column', flex: 1}}>
                            <h6><b>Product One</b></h6>
                            <input type="file" name="One" accept="image/*" onChange={handleUpload}/>
                            <Form.Input placeholder={`Name for product 1`}
                                        name={`Product 1`}
                                        value={values.details.options[0]}
                                        onChange={(e, data) => handleOptionChange(data, 0)}
                                        required style={{marginTop: 5}}/>
                            <img hidden={imageOne === null} alt={'imageOne'}
                                 src={imageOne && URL.createObjectURL(imageOne)}
                                 style={{width: "50%", margin: "auto auto", marginTop: "2%"}} />
                        </div>
                        <div id={'product_two_input'} style={{display: "flex", flexDirection: 'column', flex: 1}}>
                            <h6><b>Product Two</b></h6>
                            <input type="file" accept="image/*" name="Two" onChange={handleUpload}/>
                            <Form.Input placeholder={`Name for product 2`}
                                        name={`Product 2`}
                                        value={values.details.options[1]}
                                        onChange={(e, data) => handleOptionChange(data, 1)}
                                        required style={{marginTop: 5}}/>
                            <img hidden={imageTwo === null} alt={'imageTwo'}
                                 src={imageTwo && URL.createObjectURL(imageTwo)}
                                 style={{width: "50%", margin: "auto auto", marginTop: "2%"}}/>
                        </div>
                    </div>
                    }
                    {values.details.type === "Raffle" &&
                    <Form.Input required value={values.question} label='Cost Per Ticket' type="number"
                                placeholder='Enter in dollar amount...' onChange={handleChange} name="question"/>}
                    {values.details.type === "Fastpass" &&
                    <Form.Input required value={values.question} label='Cost to Skip' type="number"
                                placeholder='Enter in dollar amount greater than $24.99...' min="25"
                                onChange={handleChange} name="question"/>}
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
                    color="purple"
                />
            </Modal.Actions>
        </Modal>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    campaign: state.campaign
})
export default connect(mapStateToProps, {addCampaign, updateCampaign})(CampaignModal)
