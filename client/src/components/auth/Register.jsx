import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { register } from '../../actions/authActions'
import { clearErrors } from '../../actions/errorActions'
import history from '../../history'
import styles from './Auth.module.css'
import {Accordion, Card, Dropdown, Form, Icon, Message} from 'semantic-ui-react'
import PasswordStrengthBar from 'react-password-strength-bar';
import {CardElement, Elements, PaymentRequestButtonElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import {createCustomer, createSetupIntent, markComplete, markProcessing} from "../../actions/stripeActions";


function Register(props) {
    const stripePromise = loadStripe('pk_test_51JWi5VF1ZFxObEV7LvPvFO1JN2lbNwc3HjjGRHeUnWsl8POZ2jR151PHL2tnjcpVdqeOn1rGZ7SQJSzUMxXPoSRa00opX0TiTk');
    return (
        <Elements stripe={stripePromise}>
            <div className={styles.auth}>
                <RegisterForm {...props} />
            </div>
        </Elements>
    )
}

function RegisterForm(props) {

    const propTypes = {
        isAuthenticated: PropTypes.bool,
        error: PropTypes.object.isRequired,
        register: PropTypes.func.isRequired,
        clearErrors: PropTypes.func.isRequired
    }

    const stripe = useStripe()
    const elements = useElements();

    const [values, setValues] = useState({ name: '', email: '', password: '', type: '', nameOnCard: '', cardApproved: false })
    const [paymentMethod, setPaymentMethod] = useState('')
    const [msg, setMsg] = useState(null)
    const [score, setScore] = useState(0)
    const [feedback, setFeedback] = useState(undefined)
    const [paymentActive, setPaymentActive] = useState(false)
    const [paymentRequest, setPaymentRequest] = useState(null);
    const [paymentAuthenticatedByMobile, setPaymentAuthenticatedByMobile] = useState(false)

    useEffect(() => {

        if (stripe && elements) {
            // Creates payment request that checks if order can be fulfilled by and facilitates the use of apple/google pay
            const pr = stripe.paymentRequest({
                country: 'US',
                currency: 'usd',
                total: {
                    label: 'Authorize Card For Apokoz',
                    amount: 0,
                },
                requestPayerName: true,
                requestPayerEmail: true,
            });

            // Check the availability of the Payment Request API.
            pr.canMakePayment().then(result => {
                if (result) {
                    setPaymentRequest(pr);
                }
            });
        }
    }, [stripe, elements])

    useEffect(() => {
        if (paymentRequest) {
            paymentRequest.on('paymentmethod', async (event) => {
                props.markProcessing()
                if (props.stripe.loading || props.stripe.status !== 'unfulfilled') {
                    event.complete('fail')
                    return;
                }

                const result = await stripe.confirmCardSetup(
                    props.stripe.clientSecret,
                    {payment_method: event.paymentMethod.id}
                );
                if (result.error) {
                    event.complete('fail')
                    props.markComplete('fail')
                } else {
                    // even if the request comes back as successful double check payment intent
                    event.complete('success')
                    if (result.setupIntent.status === 'requires_action') {
                        // can redirect to bank for further action / confirmation, etc.
                        const {error} = await stripe.confirmCardSetup(props.stripe.clientSecret);
                        if (error) {
                            console.error(error.message)
                            props.markComplete('fail')
                            // TODO: Error handling
                        } else {
                            console.log('Needed action but successful')
                            props.markComplete('success')
                            // TODO: Success Logic
                        }
                    } else {
                        console.log('successful')
                        setPaymentMethod(result.setupIntent.payment_method)
                        setPaymentAuthenticatedByMobile(true)
                        props.markComplete('success')
                        // TODO: Success Logic
                    }
                }
            })
        }
    }, [paymentRequest, props.stripe])

    useEffect(() => {
        if (props.error.id === 'REGISTER_FAIL') {
            setMsg(props.error.msg.msg)
        }
    }, [props.error])

    useEffect(() => {
        if (props.isAuthenticated) {
            history.push('/')
        }
    }, [props.isAuthenticated])

    useEffect(() => {
        props.createSetupIntent()
    }, [])

    useEffect(() => {
        if (elements) {
            elements.getElement(CardElement).on("change", (event) => {
                if (event.complete && !event.error) {
                    if (!values.cardApproved) {
                        setValues({...values, cardApproved: true})
                    }
                } else {
                    setValues({...values, cardApproved: false})
                }
            })
        }
    }, [elements, values])

    useEffect(() => {
        if (props.stripe.customer !== '') {
            const {name, email, password, type} = values
            const customerID = props.stripe.customer;

            let newUser
            if (paymentActive) {
                newUser = {
                    name,
                    email,
                    password,
                    type,
                    customerID,
                    paymentMethod
                }
            }
            else {
                newUser = {
                    name,
                    email,
                    password,
                    type,
                    customerID
                }
            }
            props.register(newUser)
        }
    }, [props.stripe.customer])

    const handleChange = e => {
        setValues({ ...values, [e.target.name]: e.target.value })
    }

    function isValid() {
        const {name, email, password, type, nameOnCard, cardApproved} = values
        const paymentValid = nameOnCard !== '' && cardApproved
        const cardConsidered = !paymentActive || paymentValid || paymentAuthenticatedByMobile
        return (score > 0 && name !== '' && email !== '' && password !== '' && type !== '' && cardConsidered);
    }

    const onSubmit = async e => {
        e.preventDefault()
        const {name, email, nameOnCard} = values

        // clear prev errors
        props.clearErrors()
        if (!isValid()) {
            setMsg('Please fill in all the fields')
            return;
        }
        else {
            setMsg('')
        }

        let result = ''

        if (paymentAuthenticatedByMobile) {
            props.createCustomer(name, email, paymentMethod)
        }

        else {
            if (paymentActive) {
                result = await stripe.confirmCardSetup(props.stripe.clientSecret, {
                    payment_method: {
                        card: elements.getElement(CardElement), billing_details: {name: nameOnCard}
                    }
                })
                setPaymentMethod(result.setupIntent.payment_method)
                if (result.error) {
                    props.createCustomer(name, email)
                    console.error(result.error)
                } else {
                    props.createCustomer(name, email, result.setupIntent.payment_method)
                }
            }
            else {
                props.createCustomer(name, email)
            }
        }
    }

    const PaymentForm = (
        <div id='optionalPaymentInput'>
            {paymentRequest &&
            <div id='browser-card-support'>
                <PaymentRequestButtonElement options={{paymentRequest}} type='button'/>
                <br/>
                <div className={styles.divider}/>
                <br/>
            </div>
            }
            <Form.Field>
                <Form.Input name='nameOnCard' value={values.nameOnCard} onChange={handleChange} required={paymentActive && !paymentAuthenticatedByMobile} placeholder='Name On Card' />
            </Form.Field>
            <Card style={{padding: 10}} >
                <CardElement />
            </Card>
        </div>
    )

    return (
        <Form className={styles.formContainer} onSubmit={onSubmit}>
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
                <Dropdown selection fluid options={[{ key: 'business', text: 'Business', value: 'business' }, { key: 'customer', text: 'Customer', value: 'customer' }]} placeholder="Are you a business or a customer"
                          onChange={(e, data) => {
                              setValues({ ...values, type: data.value })
                          }
                          } />
            </Form.Field>
            <Accordion style={{marginBottom: 20}} hidden={paymentAuthenticatedByMobile}>
                <Accordion.Title active={paymentActive} content='Payment (optional)' onClick={() => setPaymentActive(!paymentActive)} />
                <Accordion.Content active={paymentActive} content={PaymentForm} />
            </Accordion>
            <div id={'paymentAuthenticated'} style={{marginBottom: 20}} hidden={!paymentAuthenticatedByMobile}>
                <Icon name={"check"} color={'green'} />
                <b>Payment Authenticated Via Browser Card</b>
            </div>
            <Form.Button content="Submit" color="blue" disabled={!isValid() || props.stripe.loading}/>
            <Message>
                <Message.Header>Have An Account? <a href="/#/login">Login.</a></Message.Header>
            </Message>
        </Form>
    )
}

Register.propTypes = {
    isAuthenticated: PropTypes.bool,
    error: PropTypes.object.isRequired,
    register: PropTypes.func.isRequired,
    clearErrors: PropTypes.func.isRequired
}


const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    error: state.error,
    stripe: state.stripe
})

export default connect(mapStateToProps, { register, clearErrors, createCustomer, createSetupIntent, markProcessing, markComplete })(Register)
