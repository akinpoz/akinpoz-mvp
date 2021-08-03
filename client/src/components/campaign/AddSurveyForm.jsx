import React from "react";
import {Form} from "semantic-ui-react";

function SurveyForm() {
    return (
        <Form>
            <br/>
            <Form.Input label='Survey Title' placeholder='Enter Title'/>
            <Form.TextArea label='Description' placeholder='Enter Description'/>
            <Form.Input label='What do you want to ask?' placeholder='Enter Question'/>
            <Form.TextArea label='Options (Separate by three commas)'
                           placeholder='Enter Options Separated by Three Commas (,,,)'/>
        </Form>
    )
}

export default SurveyForm;
