import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {login} from '../../actions/authActions'
import {clearErrors} from '../../actions/errorActions'
import history from '../../history'
import styles from './Auth.module.css'
import {Form, Message} from 'semantic-ui-react'


function Login(props) {
    const {error, clearErrors, login} = props
    const [values, setValues] = useState({email: '', password: ''})
    const [msg, setMsg] = useState()
    useEffect(() => {
        if (error.id === 'LOGIN_FAIL') {
            setMsg(error.msg)
            clearErrors()
        }
    }, [error, clearErrors])

    const handleChange = e => {
        setValues({...values, [e.target.name]: e.target.value})
    }

    function onSubmit(e) {
        const {email, password} = values
        const user = {
            email,
            password
        }
        // clear errors
        clearErrors()
        // Attempt Login
        const data = {user, history}
        login(data)
    }

    return (
        <div className={styles.auth}>
            <Form className={styles.formContainer} onSubmit={onSubmit}>
                {msg && msg.msg &&
                <Message negative className={styles.message}>
                    <Message.Header>{msg.msg}</Message.Header>
                </Message>
                }
                <Form.Input type="email" onChange={handleChange} placeholder="Email..." label="Email"
                            value={values.email} name="email"/>
                <Form.Input type="password" onChange={handleChange} placeholder="Password..." label="Password"
                            value={values.password} name="password"/>
                <Form.Button content="Login" color="blue" type="submit"/>
                <Message>
                    <Message.Header>Don't have an account? <a href="/#/register">Sign Up</a></Message.Header>
                </Message>
            </Form>
        </div>
    )
}

Login.propTypes = {
    isAuthenticated: PropTypes.bool,
    error: PropTypes.object.isRequired,
    login: PropTypes.func.isRequired,
    clearErrors: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    error: state.error,
})

export default connect(mapStateToProps, {login, clearErrors})(Login)
