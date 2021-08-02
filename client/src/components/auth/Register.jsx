import React, { useEffect, useState, useRef } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { register } from '../../actions/authActions'
import { clearErrors } from '../../actions/errorActions'
import history from '../../history'
import styles from './Auth.module.css'
import { Dropdown, Form, Message } from 'semantic-ui-react'
import PasswordStrengthBar from 'react-password-strength-bar';


function Register(props) {
    const [values, setvalues] = useState({ name: '', email: '', password: '', type: '' })
    const [msg, setmsg] = useState(null)
    const [score, setScore] = useState(0)
    const [feedback, setFeedback] = useState(undefined)
    const propTypes = {
        isAuthenticated: PropTypes.bool,
        error: PropTypes.object.isRequired,
        register: PropTypes.func.isRequired,
        clearErrors: PropTypes.func.isRequired
    }

    useEffect(() => {
        if (props.error.id === 'REGISTER_FAIL') {
            setmsg(props.error.msg.msg)
        }
    }, [props.error])

    useEffect(() => {
        if (props.isAuthenticated) {
            history.push('/')
        }
    }, [props.isAuthenticated])

    const handleChange = e => {
        setvalues({ ...values, [e.target.name]: e.target.value })
    }
    const onSubmit = e => {
        e.preventDefault()
        const { name, email, password, type } = values
        const newUser = {
            name,
            email,
            password,
            type
        }
        // clear prev errors
        props.clearErrors()
        if (score > 0 && name && email && password && type) {
            props.register(newUser)
        }
        else {
            console.log(score, name, email, password, type);
            setmsg('Please fill in all the fields')
        }
    }
    return (
        <div className={styles.auth}>
            <Form className={styles.formContainer}>
                {msg &&
                    <Message negative className={styles.message}>
                        <Message.Header>{msg}</Message.Header>
                    </Message>
                }
                <Form.Input required name="name" label="Name" placeholder="First and Last Name" onChange={handleChange} value={values.name} />
                <Form.Input required type="email" label="Email" onChange={handleChange} placeholder="Email..." value={values.email} name="email" />
                <Form.Input required type="password" label="Password" onChange={handleChange} placeholder="Password..." value={values.password} name="password" />
                <Form.Field>
                    <PasswordStrengthBar password={values.password} onChangeScore={(score, feedback) => {
                        setScore(score)
                        setFeedback(feedback.warning)
                    }
                    } />
                </Form.Field>
                {feedback && <Message color='yellow'>
                    <Message.Header>
                    </Message.Header>
                    <p>{feedback}</p>
                </Message>}
                <Form.Field required>
                    <label>Select If you are a Business or Customer</label>
                    <Dropdown selection fluid options={[{ key: 'business', text: 'Business', value: 'business' }, { key: 'customer', text: 'Customer', value: 'customer' }]} placeholder="Are you a business or a customer" onChange={(e, value) => {
                        setvalues({ ...values, type: value })
                    }
                    } />
                </Form.Field>
                <Form.Button content="Submit" type="submit" color="blue" onClick={onSubmit} />
                <Message>
                    <Message.Header>Have An Account? <a href="/#/login">Login.</a></Message.Header>
                </Message>
            </Form>
        </div>
        // <div className={styles.registerConatiner}>
        //     <img className={styles.logo} src={logo} />
        //     {msg &&
        //         <Message negative className={styles.message}>
        //             <Message.Header>{msg}</Message.Header>
        //         </Message>
        //     }

        //     <input type="text" onChange={handleChange} value={values.name} name="name" placeholder="First and Last Name..." />
        //     {/* <input type="text" onChange={handleChange} value={values.type} name="type" placeholder="Are you a business or a customer?" /> */}
        //     <input type="email" onChange={handleChange} value={values.email} name="email" placeholder="Email..." />
        //     <input type="password" onChange={handleChange} value={values.password} name="password" placeholder="Password..." />
        //     <Button className={styles.submit} onClick={onSubmit}>Register</Button>
        //     <p>Have An Account? <a href="/#/login">Login.</a></p>
        // </div>
    )
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    error: state.error,
})

export default connect(mapStateToProps, { register, clearErrors })(Register)