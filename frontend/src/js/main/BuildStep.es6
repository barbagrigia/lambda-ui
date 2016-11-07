/* eslint-disable */
import React, {PropTypes} from "react";
import {connect} from "react-redux";
import Moment from "moment";
import Utils from "./ComponentUtils.es6";
import "moment-duration-format";
import {showBuildOutput} from "actions/OutputActions.es6";
import {viewBuildStep} from "./actions/BuildDetailActions.es6";
import {findParentOfFailedSubstep} from "steps/FailureStepFinder.es6";
import R from "ramda";

export const duration = ({startTime, endTime}) => {
    const start = Moment(startTime);
    const end = Moment(endTime);

    const duration = Moment.duration(end.diff(start), "milliseconds");
    const durationString = duration.format("hh:mm:ss");
    return durationString.length < 5 ? "00:" + durationString : durationString;
};

const SUCCESS_ICON = "fa-check";
const FAILURE_ICON = "fa-times";
const RUNNING_ICON = "fa-cog";
const KILLED_ICON = "fa-ban";
const DEFAULT_ICON = "fa-ellipsis-h";

const buildIcon = (stepState) => {
    let iconClass;
    switch (stepState){
        case "success":
            iconClass = SUCCESS_ICON;
            break;
        case "failure":
            iconClass = FAILURE_ICON;
            break;
        case "running":
            iconClass = RUNNING_ICON;
            break;
        case "killed":
            iconClass = KILLED_ICON;
            break;
        default:
            iconClass = DEFAULT_ICON;
    }
    return <div className="buildIcon"><i className={"fa " + iconClass}/></div>;
};

export const getStepDuration = (step) => {
    if(step.endTime || !step.startTime){
        return step;
    }
    const endTime = Moment();
    return ({startTime: step.startTime, endTime: endTime});
};

export const BuildStep = props => {
    const {step, goIntoStepFn, showOutputFn, goIntoFailureStepFn, failureStep} = props;


    const buildStepIcon = buildIcon(step.state);

    const infos = <div>
        {buildStepIcon}
        <div className="stepName">{step.name}</div>
        <div className="stepDuration">{duration(getStepDuration(step))}</div>
    </div>;
    const goIntoStepLink = <a className="goIntoStepLink" href="#" onClick={goIntoStepFn}>Substeps</a>;
    const goIntoFailureStepLink = <a className="goIntoFailureStepLink" href="#" onClick={() => goIntoFailureStepFn(failureStep)}>Failure Substep</a>;
    const showOutputLink = <a className="showOutputLink" href="#" onClick={showOutputFn}>Show Output</a>;
    const hasSubsteps = step.steps && step.steps.length !== 0;

    return <div className={Utils.classes("buildStep", step.state)}>
        {infos}
        {showOutputLink}
        <br/>&nbsp;
        {hasSubsteps ? goIntoStepLink : ""}
        <br/>&nbsp;
        {failureStep && hasSubsteps ? goIntoFailureStepLink : ""}
    </div>;
};
BuildStep.propTypes = {
    step: PropTypes.object.isRequired,
    failureStep: PropTypes.string,
    goIntoStepFn: PropTypes.func.isRequired,
    goIntoFailureStepFn: PropTypes.func.isRequired,
    showOutputFn: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
    const newProps = R.merge(ownProps, {failureStep: findParentOfFailedSubstep(state, ownProps.buildId, ownProps.step.stepId)});
    return newProps;
};

const mapDispatchToProps = (dispatch, ownProps) => {

    return {
        goIntoStepFn: () => dispatch(viewBuildStep(ownProps.buildId, ownProps.step.stepId)),
        showOutputFn: () => dispatch(showBuildOutput(ownProps.buildId, ownProps.step.stepId)),
        goIntoFailureStepFn: (failureStep) => dispatch(viewBuildStep(ownProps.buildId, failureStep))
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(BuildStep);