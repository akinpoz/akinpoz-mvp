import React from 'react';
import {Button, Card, Form} from "semantic-ui-react";


function Checkout(props) {
    let items = props.items ?? [{type: 'song', name: 'Have you ever seen the rain?'}];
    return (
        <div className='checkoutContainer'>
            <Form>
                {items.map(item => {
                    if (item.type === 'song') {
                        return (
                            <Card>
                                <h2>Song: {item.name}</h2>
                            </Card>
                        )
                    }
                })}
                <Form.Button>Cancel</Form.Button>
                <Form.Button primary>Submit</Form.Button>
            </Form>
        </div>
    )
}

export default Checkout;
