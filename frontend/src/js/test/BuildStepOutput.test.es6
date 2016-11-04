/* globals describe it xit expect jest beforeEach afterEach */
import {BuildStepOutput, mapStateToProps, mapDispatchToProps} from "BuildStepOutput.es6"
import {shallow} from "enzyme";
import {HIDE_BUILD_OUTPUT} from "actions/OutputActions.es6";
import React from "react";

describe("Output presentation", () => {

  let realConsole;

  beforeEach(() => {
    const consoleThrowing = {
      error: (...args) => {
        realConsole.error("Got errors on console: ", args);
        throw new Error(args); },
      log: (...args) => { realConsole.log(args); }
    };
    realConsole = window.console;
    window.console = consoleThrowing;
  });

  afterEach(() => {
    window.console = realConsole;
  });

  it("should be hidden when output is false", () => {
      const component = shallow(<BuildStepOutput showOutput={false}/>);

      expect(component.type()).toBe(null);
  });

  it("should display output of step if not hidden", () => {
    const component = shallow(<BuildStepOutput showOutput={true} buildId = { 1 } stepName = { "meinStep"} stepId = { "stepId"} output = { ["hierTestOutput"]}/>);

    expect(component.find("#outputHeader__buildId").text()).toBe("1");
    expect(component.find("#outputHeader__stepName").text()).toBe("meinStep (stepId)");
    expect(component.find(".layerText").text()).toBe("hierTestOutput");

  });

  it("should request output if no output exists in build step", () => {
      const requestFnMock = jest.fn();
      shallow(<BuildStepOutput showOutput={true} buildId = { 1 } stepName = { "meinStep"} requestFn = {requestFnMock} />);

    expect(requestFnMock).toBeCalled();
  });

  it("should call closeLayer function if close button was clicked", () => {
    //given
    let wasClicked = false;
    const closeLayerFunctionFake = () => {wasClicked = true;};

    const component = shallow(<BuildStepOutput showOutput={true} buildId = { 1 } stepName = { "2"} requestFn = {() => {}} closeLayerFn={closeLayerFunctionFake} />);
    component.find(".layerClose").simulate("click");

    expect(wasClicked).toEqual(true);
  });

});

describe("Output redux", () => {
  it("should not output render props if hidden", () => {
    expect(mapStateToProps({output: {showOutput: false}},{})).toEqual({showOutput:false});
  });

  it("should get output from buildstep", () => {
    const state = {
      buildDetails: {1: {"1": {name: "myStep"}}},
      output: {showOutput:true, buildId: 1, stepId: "1", content: {1: {"1" : ["line1"]}}}
    };
    const expected = {buildId: 1, stepId: "1", stepName: "myStep", output: ["line1"], showOutput: true};

    expect(mapStateToProps(state)).toEqual(expected);
  });

  it("should get undefined from buildstep if no output exists", () => {
    const state = {
      buildDetails: {1: {"1": {name: "myStep"}}},
      output: {showOutput:true, buildId: 1, stepId: "1", content: {}}
    };
    const expected = {buildId: 1, stepId: "1", stepName: "myStep", showOutput: true};

    expect(mapStateToProps(state)).toEqual(expected);
  });

  it("should dispatch HideOutputAction on closeLayerFn", () => {
    const dispatchMock = jest.fn();
    const props = mapDispatchToProps(dispatchMock);

    props.closeLayerFn();

    expect(dispatchMock).toBeCalledWith({type: HIDE_BUILD_OUTPUT});
  });

});

describe("Output scrollbar", () => {
    xit("should check, that output text is scroll down", () => {

        const component = shallow(<BuildStepOutput showOutput={true} buildId = {1} stepName = {"meinStep"} stepId = {"stepId"} requestFn={() => {}} />);
        // TODO: Implement with real browser testing

    });
})
