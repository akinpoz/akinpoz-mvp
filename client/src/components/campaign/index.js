import React from 'react';
import styles from './interactive-campaign.module.css'
import {Card, Form, Input, Radio} from "semantic-ui-react";

function Campaign() {
    return (
        <div className={styles.containerDiv}>
            {/*<LocationInfo/>*/}

            {/* TODO: Make this have conditional visibility based on number of actions */}
            {/* Change this to see Multi-Action or Single-Action View*/}
            <SingleAction/>

        </div>
    )
}

function LocationInfo() {
    return (
        <div className={styles.actionContainer}>
            <br/>
            <h2 style={{textAlign: 'center'}}>Angelico's Pizzeria</h2>
            <div style={{width: '80%', height: 155, background: 'gray', marginLeft: '10%'}}>
                <p>Insert Image Here</p>
            </div>
            <br/>
            <p style={{padding: 5, textAlign: 'center'}}>
                Welcome to Angelico's the best pizzeria in town! We offer all sorts of stuff like pizza and drinks.
                Come by on tuesday for karaoke or thursday for DJ Night!
            </p>

        </div>
    )
}

const fakeOptions = ['Buffalo Chicken', 'Caesar', 'Meatzilla']

// This will be the one action option
function SingleAction() {
    const otherVisible = true;
    const handleChange = (event, {value}) => setChoice(value);
    const [choiceState, setChoice] = React.useState('');
    const [otherValue, setOtherValue] = React.useState('');
    const handleOtherChange = (event, {value}) => {
        setOtherValue(value);
        setChoice(value)
    }

    return (
        <div style={{width: '100%', maxWidth: 650, alignItems: "center", display: "flex"}}>
            <Card fluid className={styles.actionCard}>
                <div className={styles.actionContainer}>
                    <br/>
                    <h2 style={{textAlign: 'center'}}>What Pizza Should Be Our Special Next Week?</h2>
                    <br/>
                    <div style={{width: '70%', marginBottom: 20}}>
                        <Form>
                            {fakeOptions.map((value, index) => {
                                return (
                                    <div style={{width: '100%'}}>
                                        <Form.Field>
                                            <Radio
                                                label={value}
                                                name='radioGroup'
                                                value={value}
                                                checked={choiceState === value}
                                                onChange={handleChange}
                                            />
                                        </Form.Field>
                                    </div>
                                )
                            })}
                            <Form.Field>
                                <Radio
                                    label='Other Suggestions'
                                    name='radioGroup'
                                    value={otherValue}
                                    checked={choiceState === otherValue}
                                    onChange={handleChange}
                                />
                                <div hidden={choiceState !== otherValue} style={{maxWidth: 350}}>
                                    <Form.Input
                                        onChange={handleOtherChange}
                                        required={choiceState === otherValue}
                                    />
                                </div>
                            </Form.Field>
                        </Form>
                    </div>


                    <div className={styles.buttonContainer}>
                        <p className={styles.noselect} style={{paddingTop: 10, marginRight: 10}}>4 Votes Left</p>
                        <button className="ui primary button">
                            Submit
                        </button>
                    </div>
                </div>
            </Card>
        </div>

    )
}

// This will be the multi action option
function MultiAction() {
    return (

        <div className={styles.actionContainer}>
            <div style={{width: '100%', marginTop: 80}}>
                <div className={styles.selection}>
                    <div style={{height: 15}}/>
                    <p style={{textAlign: 'center'}}>Pick a Beverage >></p>
                </div>
                <br/>
                <div className={styles.selection}>
                    <div style={{height: 15}}/>
                    <p style={{textAlign: 'center'}}>Pick Next Month's Special >></p>
                </div>
                <br/>
                <div className={styles.selection}>
                    <div style={{height: 15}}/>
                    <p style={{textAlign: 'center'}}>Enter Raffle >></p>
                </div>
            </div>
        </div>
    )
}

export default Campaign

// TODO: generally we need to figure out how we are differentiating clients and users.  We also need
//  to figure out how we are storing a client's campaigns
