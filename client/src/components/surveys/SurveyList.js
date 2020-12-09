import React, { Component } from 'react';
import { connect } from 'react-redux';
import {CanvasJSChart} from 'canvasjs-react-charts';
import { fetchSurveys } from '../../actions';

class SurveyList extends Component {
    componentDidMount() {
        this.props.fetchSurveys();
    }

    renderSurveys() {
        return this.props.surveys.reverse().map(survey => {
            const options = {
                animationEnabled: true,
                theme: "light2",
                title:{
                    text: "Survey Responses"
                },
                axisX: {
                    title: "Response",
                    reversed: true,
                },
                axisY: {
                    title: "Count",
                    includeZero: true,
                },
                data: [{
                    type: "stackedBar",
                    name: "Yes",                
                    dataPoints: []
                },
                ]
            }

            const responseYes = {
                y : survey.yes,
                label : "Yes",
            }
            const responseNo = {
                y : survey.no,
                label : "No",
            }
            options.data[0].dataPoints.push(responseYes);
            options.data[0].dataPoints.push(responseNo);
            return (
                <div className="card blue" key={survey._id}>
                    <div className="card-content white-text">
                        <span className="card-title">{survey.title}</span>
                        <p>
                            {survey.body}
                        </p>
                        <p className="right">
                            Sent On: {new Date(survey.dateSent).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="card-action">
                        {/*<a>Yes: {survey.yes}</a>
                        <a>No: {survey.no}</a>*/}
                        {/*<a className="delete-btn">
                            Delete Survey
                        </a>*/}
                        <a className="right white-text">
                            Last Responded: {survey.lastResponded && new Date(survey.lastResponded).toLocaleDateString()}
                        </a>
                    </div>
                    {
                        (survey.yes > 0 || survey.no > 0) &&
                        <CanvasJSChart options = {options}
                        onRef={ref => this.chart = ref}
                        />
                    }
                    
                </div>
            )
        });
    }

    render() {        
        //super();
        return (
            <div>
                {this.renderSurveys()}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { surveys: state.surveys }
}

export default connect(mapStateToProps, { fetchSurveys })(SurveyList)