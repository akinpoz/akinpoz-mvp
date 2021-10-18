import React, {useEffect, useState} from "react";
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import BusinessHome from './business-home'
import CustomerHome from './customer-home'
import history from '../../history'
import BusinessOwnerImage from '../../assets/images/day13-it-girl.png'
import PatronImage from '../../assets/images/patron-image.png'
import {Card, Image, Message} from 'semantic-ui-react'
import styles from './home.module.css'

function Home(props) {
    history.location.search = ""
    const [msg, setMsg] = useState(history.location.state)
    const {auth} = props
    useEffect(() => {
        if (history.location.state) {
            setMsg(history.location.state)
        }
    }, [])
    return (
        <div id="home-container" style={{height: '100%'}}>
            {auth.user && auth.user.type === 'business' && <BusinessHome/>}
            {auth.user && auth.user.type === 'customer' && <CustomerHome/>}
            {!auth.user && <Welcome {...msg}/>}
        </div>
    )
}

Home.propTypes = {
    auth: PropTypes.object.isRequired,
}

const Welcome = (props) => {
    const {msg} = props
    return (
        <div id="welcome-container" className={styles.welcome_container}>
            {msg && <Message color={msg.status}>
                <Message.Header>
                    {msg.text}
                </Message.Header></Message>}
            <Card.Group id="cards-wrapper" doubling>
                <a href="/#/login">
                    <div className={styles.welcome_item}>
                        <Card fluid>
                            <Image src={BusinessOwnerImage} wrapped ui={false}/>
                            <Card.Content extra>
                                <Card.Header>Business Owner</Card.Header>
                                <Card.Meta>
                                    <p>
                                        Sign in or sign up to manage your business with Akopoz
                                    </p>
                                </Card.Meta>
                            </Card.Content>
                        </Card>
                    </div>
                </a>
                <a href="/#/customer-home">
                    <div className={styles.welcome_item}>
                        <Card fluid>
                            <Image src={PatronImage} wrapped ui={false}/>
                            <Card.Content extra>
                                <Card.Header>Patron</Card.Header>
                                <Card.Meta>
                                    <p>Whether you are just looking for ready to order, click here to get started</p>
                                </Card.Meta>
                            </Card.Content>
                        </Card>
                    </div>
                </a>
            </Card.Group>
        </div>
    )
}
const mapStateToProps = (state) => ({
    auth: state.auth
})
export default connect(mapStateToProps, {})(Home)
