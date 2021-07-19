import React, { useEffect, useState, useRef } from 'react'

import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { register } from '../../actions/authActions'
import { clearErrors } from '../../actions/errorActions'
import history from '../../history'
import styles from './Auth.module.css'
import { Button, Dropdown, Message } from 'semantic-ui-react'
import logo from '../../images/akinpoz-logo.png'


function Register(props) {
    const [values, setvalues] = useState({ name: '', email: '', password: '', type: '' })
    const [msg, setmsg] = useState(null)
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

        // Attempt Register
        props.register(newUser)

    }
    return (
        <div className={styles.registerConatiner}>
            <img className={styles.logo} src={logo} />
            {msg &&
                <Message negative className={styles.message}>
                    <Message.Header>{msg}</Message.Header>
                </Message>
            }
            
            <input type="text" onChange={handleChange} value={values.name} name="name" placeholder="First and Last Name..." />
            {/* <input type="text" onChange={handleChange} value={values.type} name="type" placeholder="Are you a business or a customer?" /> */}
            <Dropdown selection fluid options={[{key: 'business', text: 'Business', value: 'business'}, {key: 'customer', text: 'Customer', value: 'customer'}]} placeholder="Are you a business or a customer"/>
            <input type="email" onChange={handleChange} value={values.email} name="email" placeholder="Email..." />
            <input type="password" onChange={handleChange} value={values.password} name="password" placeholder="Password..." />
            <Button className={styles.submit} onClick={onSubmit}>Register</Button>
            <p>Have An Account? <a href="/#/login">Login.</a></p>
        </div>
    )
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    error: state.error,
})

export default connect(mapStateToProps, { register, clearErrors })(Register)