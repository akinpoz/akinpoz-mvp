import React, { useEffect, useState } from 'react';
import { Button, Form, Message, Modal } from "semantic-ui-react";
import styles from './locations.module.css'
import { connect } from 'react-redux'

function LocationModal(props) {
    const { name, description, _id, menu_url, address, auth, action, trigger } = props
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState({
        name: name || "",
        description: description || "",
        menu_url: menu_url || "",
        address: address || ""
    });
    const [msg, setMsg] = useState();
    useEffect(() => {
        setValues({ name: name, description: description, menu_url: menu_url, address: address });
    }, [open, name, description, menu_url, address]);

    function submit(e) {
        e.preventDefault();
        //Location ID will be null if new location but has value if updating
        const locationDetails = {
            name: values.name,
            description: values.description,
            menu_url: values.menu_url,
            address: values.address,
            user: auth.user._id,
            location_id: _id
        }
        if (values.name && values.address) {
            props[`${action}Location`](locationDetails)
            close()
        } else {
            setMsg({msg: "Failed to add location: Please fill out all required fields", positive: false, negative: true})
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

    const title = action.substring(0, 1).toUpperCase() + action.substring(1)
    return (
        <Modal onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={trigger}
            closeIcon>
            <Modal.Header>{title} Location</Modal.Header>
            <Modal.Content>
                <Form>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {msg && msg?.msg && <Message style={{ height: '100%', width: '100%', margin: 'auto auto' }}
                            negative={msg.negative}
                            positive={msg.positive} className={styles.message}>
                            <Message.Header>{msg.msg}</Message.Header>
                        </Message>}
                        {/* <img src={imageData} className={styles.image} /> */}
                        {/* <input type="file" accept="image/*" onChange={handleUpload} placeholder="Upload your logo"/> */}
                    </div>
                    <Form.Input required value={values.name || ""} name="name" label='Location Name'
                        placeholder='Enter Name' onChange={handleChange} />
                    <Form.TextArea value={values.description || ""} name="description"
                        label={'Location Description (any notes you want to include about this location)'}
                        placeholder='Enter Description' onChange={handleChange} />
                    <Form.Input required value={values.address || ""} name="address" label={'Address'}
                        placeholder='Enter Address' onChange={handleChange} />
                    <Form.Input value={values.menu_url || ""} name="menu_url" label={'Menu URL'}
                        placeholder='Enter Menu URL' onChange={handleChange} />

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
