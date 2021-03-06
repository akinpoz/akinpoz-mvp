import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {register} from '../../actions/authActions'
import {clearErrors} from '../../actions/errorActions'
import history from '../../history'
import styles from './Auth.module.css'
import {Accordion, Card, Dropdown, Form, Icon, Loader, Message} from 'semantic-ui-react'
import PasswordStrengthBar from 'react-password-strength-bar';
import {CardElement, Elements, PaymentRequestButtonElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import {
    createCustomer,
    createSetupIntent,
    markComplete,
    markProcessing,
    resetCustomer
} from "../../actions/stripeActions";


function Register(props) {
    const [stripePromise] = useState(() => loadStripe('pk_test_51JWi5VF1ZFxObEV7LvPvFO1JN2lbNwc3HjjGRHeUnWsl8POZ2jR151PHL2tnjcpVdqeOn1rGZ7SQJSzUMxXPoSRa00opX0TiTk'))
    return (
        <Elements stripe={stripePromise}>
            <div className={styles.auth}>
                <RegisterForm {...props} />
            </div>
        </Elements>
    )
}

function RegisterForm(props) {
    const useStripeInst = useStripe()
    const elements = useElements();

    const [values, setValues] = useState({
        name: '',
        email: '',
        password: '',
        type: '',
        nameOnCard: '',
        cardApproved: false,
        age: 0,
        phone: ''
    })
    const [paymentMethod, setPaymentMethod] = useState('')
    const [msg, setMsg] = useState(null)
    const [score, setScore] = useState(0)
    const [feedback, setFeedback] = useState(undefined)
    const [paymentActive, setPaymentActive] = useState(false)
    const [paymentRequest, setPaymentRequest] = useState(null);
    const [paymentAuthenticatedByMobile, setPaymentAuthenticatedByMobile] = useState(false)
    const [loading, setLoading] = useState(false)

    const {
        auth,
        stripe,
        markProcessing,
        markComplete,
        register,
        error,
        createSetupIntent,
        createCustomer,
        clearErrors,
        resetCustomer
    } = props

    useEffect(() => {

        if (useStripeInst && elements && !paymentAuthenticatedByMobile) {
            // Creates payment request that checks if order can be fulfilled by and facilitates the use of apple/google pay
            const pr = useStripeInst.paymentRequest({
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
                    setPaymentRequest(pr)
                }
            });
        }
    }, [useStripeInst, elements, paymentAuthenticatedByMobile])

    useEffect(() => {
        if (paymentRequest) {
            paymentRequest.removeAllListeners()
            paymentRequest.on('paymentmethod', async (event) => {
                markProcessing()
                if (stripe.loading || stripe.status !== 'unfulfilled') {
                    event.complete('fail')
                    setMsg({msg: 'Could Not Process Card Information', positive: false, negative: true})
                    return;
                }

                const result = await useStripeInst.confirmCardSetup(
                    stripe.clientSecret,
                    {payment_method: event.paymentMethod.id}
                );
                if (result.error) {
                    event.complete('fail')
                    markComplete('fail')
                    setMsg({msg: 'Could Not Process Card Information', positive: false, negative: true})
                } else {
                    // even if the request comes back as successful double check payment intent
                    event.complete('success')
                    if (result.setupIntent.status === 'requires_action') {
                        // can redirect to bank for further action / confirmation, etc.
                        const {error} = await useStripeInst.confirmCardSetup(stripe.clientSecret);
                        if (error) {
                            console.error(error.message)
                            markComplete('fail')
                            setMsg({msg: 'Could Not Process Card Information', positive: false, negative: true})
                        } else {
                            markComplete('success')
                            setMsg({msg: 'Successfully Added Card Information!', positive: true, negative: false})
                        }
                    } else {
                        setPaymentMethod(result.setupIntent.payment_method)
                        setPaymentAuthenticatedByMobile(true)
                        markComplete('success')
                        setMsg({msg: 'Successfully Added Card Information!', positive: true, negative: false})

                    }
                }
            })
        }
    }, [paymentRequest, stripe, useStripeInst, markComplete, markProcessing])

    useEffect(() => {
        if (error.id === 'REGISTER_FAIL') {
            setMsg(error.msg)
            clearErrors()
            resetCustomer()
        }
    }, [error, clearErrors, resetCustomer])

    useEffect(() => {
        if (auth.isAuthenticated) {
            history.push('/')
        }
    }, [auth.isAuthenticated])

    useEffect(() => {
        createSetupIntent()
    }, [createSetupIntent])
    useEffect(() => {
        setLoading(auth.isLoading)
    }, [auth.isLoading])
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
        if (stripe.customer !== '' && !auth.isLoading) {
            const {name, email, password, type, age, phone} = values
            const customerID = stripe.customer;
            let newUser
            if (paymentActive) {
                newUser = {
                    name,
                    email,
                    password,
                    type,
                    customerID,
                    paymentMethod,
                    age,
                    phone
                }
            } else {
                newUser = {
                    name,
                    email,
                    password,
                    type,
                    customerID,
                    age,
                    phone
                }
            }
            register(newUser)
        }
    }, [stripe.customer, auth.isLoading, register, paymentActive, paymentMethod, values])

    useEffect(() => {
        setMsg({msg: 'Adding card information is required before participating in a campaign', positive: false, negative: false})
    }, [])

    const handleChange = e => {
        setValues({...values, [e.target.name]: e.target.value})
    }

    function isValid() {
        const {name, email, password, type, age, phone} = values
        return (score > 0 && name !== '' && email !== '' && password !== '' && type !== '' && age >= 13 && phone.length > 9 && phone.length <= 11 && !isNaN(phone));
    }

    const onSubmit = async e => {
        e.preventDefault()
        const {name, email, nameOnCard, phone, age} = values

        // clear prev errors
        clearErrors()
        if (!isValid()) {
            setMsg({msg: 'Please fill in all the fields', positive: false, negative: true})
            return;
        } else {
            setMsg(null)
        }

        let result = ''

        if (paymentAuthenticatedByMobile) {
            createCustomer(name, email, phone, age, paymentMethod)
        } else {
            if (paymentActive) {
                result = await useStripeInst.confirmCardSetup(stripe.clientSecret, {
                    payment_method: {
                        card: elements.getElement(CardElement), billing_details: {name: nameOnCard}
                    }
                })
                setPaymentMethod(result.setupIntent.payment_method)
                if (result.error) {
                    createCustomer(name, email, phone, age)
                    console.error(result.error)
                } else {
                    createCustomer(name, email, phone, age, result.setupIntent.payment_method)
                }
            } else {
                createCustomer(name, email, phone, age)
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
                <Form.Input name='nameOnCard' value={values.nameOnCard} onChange={handleChange}
                            required={paymentActive && !paymentAuthenticatedByMobile} placeholder='Name On Card'/>
            </Form.Field>
            <Card style={{padding: 10}}>
                <CardElement/>
            </Card>
        </div>
    )

    return (
        <Form className={styles.formContainer} onSubmit={onSubmit}>
            {msg && msg.msg &&
            <Message positive={msg.positive} negative={msg.negative} className={styles.message}>
                <Message.Header>{msg.msg}</Message.Header>
            </Message>
            }

            <Form.Input required name="name" label="Name" placeholder="First and Last Name" onChange={handleChange}
                        value={values.name}/>
            <div id={'age_and_phone_container'} style={{display: "flex", flexDirection: "row", justifyContent: 'space-between'}}>
                <Form.Input required name='age' error={values.age < 13} label='Age (13+)' placeholder='18' type='number' fluid width={6} onChange={handleChange} value={values.age}/>
                <Form.Input required name='phone' label='Phone Number' error={values.phone.length < 10 || values.phone.length > 11 || isNaN(values.phone)} placeholder='Just enter the numbers' fluid width={9} onChange={handleChange} value={values.phone}/>
            </div>
            <Form.Input required type="email" label="Email" onChange={handleChange} placeholder="Email..."
                        value={values.email} name="email"/>
            <Form.Input required type="password" label="Password" onChange={handleChange} placeholder="Password..."
                        value={values.password} name="password"/>
            <Form.Field>
                <PasswordStrengthBar password={values.password} onChangeScore={(score, feedback) => {
                    setScore(score)
                    setFeedback(feedback.warning)
                }
                }/>
            </Form.Field>
            {feedback && <Message color='yellow'>
                <Message.Header>
                </Message.Header>
                <p>{feedback}</p>
            </Message>}
            <Form.Field required>
                <label>Select If you are a Business or Customer</label>
                <Dropdown selection fluid options={[{key: 'business', text: 'Business', value: 'business'}, {
                    key: 'customer',
                    text: 'Customer',
                    value: 'customer'
                }]} placeholder="Are you a business or a customer"
                          onChange={(e, data) => {
                              setValues({...values, type: data.value})
                          }
                          }/>
            </Form.Field>
            <Accordion style={{marginBottom: 20}} hidden={paymentAuthenticatedByMobile}>
                <Accordion.Title active={paymentActive} content='Payment (recommended)'
                                 onClick={() => setPaymentActive(!paymentActive)}/>
                <Accordion.Content active={paymentActive} content={PaymentForm}/>
            </Accordion>
            <div id={'paymentAuthenticated'} style={{marginBottom: 20}} hidden={!paymentAuthenticatedByMobile}>
                <Icon name={"check"} color={'green'}/>
                <b>Payment Authenticated</b>
            </div>
            {!loading &&
            <Form.Button content={"Register"} type="submit" color="blue" disabled={!isValid() || stripe.loading}/>}
            {loading && <Loader/>}
            <Message>
                <Message.Header>Have An Account? <a href="/#/login">Login.</a></Message.Header>
            </Message>
        </Form>
    )
}

Register.propTypes = {
    error: PropTypes.object.isRequired,
    register: PropTypes.func.isRequired,
    clearErrors: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
}


const mapStateToProps = state => ({
    error: state.error,
    stripe: state.stripe,
    auth: state.auth
})

export default connect(mapStateToProps, {
    register,
    clearErrors,
    createCustomer,
    createSetupIntent,
    markProcessing,
    markComplete,
    resetCustomer
})(Register)
