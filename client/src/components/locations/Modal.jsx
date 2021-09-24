import React, { useEffect, useState } from 'react';
import { Button, Form, Icon, Message, Modal } from "semantic-ui-react";
import styles from './locations.module.css'
import { connect } from 'react-redux'

function LocationModal(props) {
    const {name, description, _id, menu_url, address} = props
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState({ name: name || "", description: description || "", menu_url: menu_url || "", address: address || ""  });
    const [msg, setmsg] = useState();
    useEffect(() => {
        setValues({ ...values, name: name, description: description, menu_url: menu_url, address: address });
    }, [open]);
    function submit(e) {
        e.preventDefault();
        //Location ID will be null if new location but has value if updating
        const locationDetails = {
            name: values.name,
            description: values.description,
            menu_url: values.menu_url,
            address: values.address,
            user: props.auth.user._id,
            location_id: _id
        }
        if (values.name) {
            props[`${props.action}Location`](locationDetails)
            close()
        }
    }
    function handleChange(e) {
        setValues({ ...values, [e.target.name]: e.target.value });
    }
    function clear() {
        setValues({ ...values, name: "", description: "" });
    }
    function close() {
        setOpen(false);
        clear()
    }
    const title = props.action.substring(0, 1).toUpperCase() + props.action.substring(1)
    return (
        <Modal onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={
                props.trigger
            }>
            <Modal.Header>{title} Location</Modal.Header>
            <Modal.Content>
                <Form>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {msg && <Message style={{ height: '100%', width: '100%', margin: 'auto auto' }} negative={msg.includes("Failed")} positive={msg.includes("Success")} className={styles.message}>
                            <Message.Header>{msg}</Message.Header>
                        </Message>}
                        {/* <img src={imageData} className={styles.image} /> */}
                        {/* <input type="file" accept="image/*" onChange={handleUpload} placeholder="Upload your logo"/> */}
                    </div>
                    <Form.Input value={values.name || ""} name="name" label='Location Name' placeholder='Enter Name' onChange={handleChange} />
                    <Form.TextArea value={values.description || ""} name="description" label={'Location Description (any notes you want to include about this location)'} placeholder='Enter Description' onChange={handleChange} />
                    <Form.Input value={values.menu_url || ""} name="menu_url" label={'Menu URL'} placeholder='Enter Menu URL' onChange={handleChange} />
                    <Form.Input value={values.address || ""} name="address" label={'Address'} placeholder='Enter Address' onChange={handleChange} />
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
    auth: state.auth
})

export default connect(mapStateToProps, null)(LocationModal)