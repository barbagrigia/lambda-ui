import React, {PropTypes} from "react";
import {connect} from "react-redux";
import BuildDetails from "./BuildDetails.es6";
import {toggleBuildDetails as toggleAction} from "actions/BuildDetailActions.es6";
import Moment, {now} from "moment";

import {FormattedDuration} from "./DateAndTime.es6";

const SUCCESS_ICON = "fa-check";
const FAILURE_ICON = "fa-times";
const RUNNING_ICON = "fa-cog";


const icon = (buildState) => {
    switch (buildState) {
        case "success" :
            return SUCCESS_ICON;
        case "failed" :
            return FAILURE_ICON;
        case "running" :
            return RUNNING_ICON;
        default :
            return "";
    }
};


export const renderSummary = (properties) => {
    const {buildId, buildNumber, startTime, state, toggleBuildDetails, open} = properties;
    let classesForState = "row buildSummary " + state;
    if (open) {
        classesForState += " open";
    }
    const iconClassName = "fa " + icon(state);
    let {endTime} = properties;
    if (!endTime) {
        endTime = now();
    }

    const timeToNow = Moment(startTime).diff(Moment(now()));

    const startMoment = Moment.duration(timeToNow).humanize("minutes");
    const duration = Moment.duration(Moment(endTime).diff(Moment(startTime))).seconds();

    return <div className={classesForState}>

        <div className="buildInfo" onClick={toggleBuildDetails}>
            <div className="buildIcon"><i className={iconClassName} aria-hidden="true"></i></div>
            <div className="buildInfoRow overview">
                <div className="buildNumber">Build #{buildNumber}</div>
            </div>
            <div className="buildInfoRow time">
                <div className="buildStartTime"><i className="fa fa-flag-checkered" aria-hidden="true"></i>Started: {startMoment}</div>
                <div className="buildDuration"><i className="fa fa-clock-o" aria-hidden="true"></i>Duration: <FormattedDuration seconds={duration}/></div>
            </div>
        </div>
        <BuildDetails buildId={buildId}/>
    </div>;

};

export class BuildSummary extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.state === "running") {
            setTimeout(() => this.forceUpdate(), 1000);
        }

        return renderSummary(this.props);
    }
}


BuildSummary.propTypes = {
    buildId: PropTypes.number.isRequired,
    buildNumber: PropTypes.number.isRequired,
    state: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    toggleBuildDetails: PropTypes.func.isRequired,
    endTime: PropTypes.string,
    open: PropTypes.boolean
};

export const mapStateToProps = (state, props) => {
    const {buildId, buildNumber, startTime, endTime} = props.build;
    const buildState = props.build.state;
    const open = state.openedBuilds[buildId] || false;

    return {
        buildId: buildId,
        buildNumber: buildNumber,
        state: buildState,
        startTime: startTime,
        endTime: endTime,
        open: open
    };
};

export const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        toggleBuildDetails: () => {
            dispatch(toggleAction(ownProps.build.buildId));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BuildSummary);
