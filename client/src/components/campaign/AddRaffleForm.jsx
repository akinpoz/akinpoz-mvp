import React from "react";
import {Checkbox, Form, Header, Label} from "semantic-ui-react";

function RaffleForm() {
    const amounts = [1, 5, 10, 15, 20, 25, 50, 75, 100]
    const handleRadioChange = (event, {value}) => {
        const index = checkBoxChoices.indexOf(value)
        if (index === -1) {
            checkBoxChoices.push(value)
            console.log(checkBoxChoices)

        }
        else {
            checkBoxChoices.splice(index, 1)
            console.log(checkBoxChoices)
        }
    };
    const checkBoxChoices = React.useState([]);
    return (
        <Form>
            <br/>
            <Form.Input label='Raffle Title' placeholder='Enter Title' />
            <Form.TextArea label='Description' placeholder='Enter Description' />
            <Form.Input label='Cost Per Ticket' placeholder='Enter in Dollars' />
        </Form>
    )
}

export default RaffleForm;
