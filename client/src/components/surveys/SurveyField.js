import React  from 'react';
//import SurveyForm from '../surveys/SurveyForm';
export default ({input, label, meta: {error, touched} }) => {
    return (
        <div>
            <label>{label}</label>
            <input {...input} style={{ marginBottom: "20px" }}/>
            <div className="red-text" style={{ marginBottom: "20px" }}>
                {touched === true && error}
            </div>
            
        </div>
    )
}