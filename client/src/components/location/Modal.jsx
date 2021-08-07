import React, { useEffect, useState } from 'react';
import { Button, Form, Icon, Message, Modal } from "semantic-ui-react";
import styles from './location.module.css'
import { connect } from 'react-redux'

function LocationModal(props) {
    const [open, setOpen] = useState(false);
    const [values, setvalues] = useState({ name: props.name || "", description: props.description || ""});
    // const [image, setImage] = useState();
    // const [imageData, setImageData] = useState();
    const [msg, setmsg] = useState();
    useEffect(() => {
        setvalues({ ...values, name: props.name, description: props.description});
    }, [open]);
    function submit(e) {
        e.preventDefault();
        const locationDetails = {
            name: values.name,
            description: values.description,
            user: props.auth.user._id,
            location_id: props._id
        }
        if (values.name) {
            props[`${props.action}Location`](locationDetails)
            close()
        }
    }
    // const handleUpload = (e) => {
    //     var fileName = e.target.files[0].name
    //     var extFile = fileName.split(".")[1]
    //     if (extFile == "jpg" || extFile == "jpeg" || extFile == "png" || extFile === 'PNG') {
    //         var file = e.target.files[0]
    //         setImageData(URL.createObjectURL(file))
    //         setImage(file)
    //     } else {
    //         setmsg("Failed: Only jpg, jpeg, png, or PNG files are allowed!");
    //     }

    // }
    function handleChange(e) {
        setvalues({ ...values, [e.target.name]: e.target.value });
    }
    function clear() {
        setvalues({ ...values, name: "", description: "" });
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
                    <Form.TextArea value={values.description || ""} name="description" label={'Location Description'} placeholder='Enter Description' onChange={handleChange} />
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
    location: state.location
})

export default connect(mapStateToProps, null)(LocationModal)