import _ from 'lodash';
import React, { Component }  from 'react';
import { reduxForm, Field } from 'redux-form';
import { Link } from 'react-router-dom';
import SurveyField from './SurveyField';
import validateEmails from '../../utils/validateEmails';
import formFields from './formFields';

class SurveyForm extends Component {
    renderFields() {
        return _.map(formFields, ({label, name}) => {
            return (
                <Field
                    key={name}
                    name={name}
                    label={label} 
                    type="text"
                    component={SurveyField} 
                />
            )
        });
    }
    render() {
        return (
            <div>
                <form
                    onSubmit={this.props.handleSubmit( () => this.props.onSurveySubmit() ) }
                >
                    {this.renderFields()}
                    <Link to="/surveys" className="red btn-flat white-text">
                        Cancel
                    </Link>
                    <button type="submit" className="teal btn-flat right white-text">
                        NEXT
                        <i className="material-icons right">done</i>
                    </button>
                </form>
            </div>
        )
    }
}
function validate(values) {
    const errors = {};

    _.each(formFields, ({ name }) => {
        if (!values[name]) {
            errors[name] = `You must provide a ${name}`;
        }
    });

    errors.recipients = validateEmails(values.recipients || '');
    return errors;
}

export default reduxForm({
    validate: validate,
    form: 'surveyForm', // form name, used in state by redux-form
    destroyOnUnmount: false
})(SurveyForm);