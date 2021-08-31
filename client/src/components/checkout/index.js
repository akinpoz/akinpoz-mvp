import React from 'react';
import {Button, ButtonGroup, Card, Form, Icon} from "semantic-ui-react";
import styles from './checkout.module.css'


function Checkout(props) {
    let item = props.item ?? {type: 'Queue Song', name: 'Have you ever seen the rain?', price: 0.99}; // TODO: make this a redux field

    let [paymentType, setPaymentType] = React.useState('card')

    return (
        <div className={styles.checkoutContainer}>
            <Card style={{padding: 15}}>

                <h2>Checkout</h2>
                <div className={styles.divider}/>

                <br/>

                <div>
                    <h4 style={{margin: 0}}>{item.type}:</h4>
                    <br/>
                    <div className={styles.itemContainer}>
                        <p style={{margin: 0}}>{item.name}</p>
                        <p>{item.price}</p>
                    </div>
                </div>

                <br/>

                <h4 style={{margin: 0}}>Payment</h4>

                <br/>

                <div className={styles.buttonGroupContainer}>
                    <ButtonGroup size={'tiny'} basic>
                        <Button type={'button'} active={paymentType === 'card'}
                                onClick={() => setPaymentType('card')}>Card</Button>
                        <Button type={'button'} active={paymentType === 'apple pay'}
                                onClick={() => setPaymentType('apple pay')}>Apple Pay</Button>
                        <Button type={'button'} active={paymentType === 'google pay'}
                                onClick={() => setPaymentType('google pay')}>Google Pay</Button>
                    </ButtonGroup>
                </div>

                <br/>

                {paymentType === 'card' && <Form>
                    <div>
                        <Form.Input required placeholder={'Name On Card'}/>
                        <Form.Input required placeholder={'Card Number'}/>
                        <div className={styles.smallInputContainer}>
                            <Form.Input required placeholder={'CVV'} width={7}/>
                            <Form.Input placeholder={'EXP'} width={7}/>
                        </div>
                    </div>

                    <br/>

                    <div className={styles.cardFormButtonsContainer}>
                        <Form.Button type={'button'} style={{marginRight: 5}}>Cancel</Form.Button>
                        <Form.Button primary>Submit</Form.Button>
                    </div>
                </Form>}

                {paymentType === 'apple pay' &&
                <Button color={"black"}>Pay with <Icon style={{margin: 0}} name="apple icon"/> Pay</Button>}

                {paymentType === 'google pay' &&
                <Button color={'black'}><Icon style={{margin: 0}} name={'google icon'}/> Pay </Button>}

            </Card>
        </div>
    )
}

export default Checkout;
