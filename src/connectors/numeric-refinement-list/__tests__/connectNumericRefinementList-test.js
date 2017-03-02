/* eslint-env mocha */

import expect from 'expect';
import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectNumericRefinementList from '../connectNumericRefinementList.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectNumericRefinementList', () => {
  it('Renders during init and render', () => {
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectNumericRefinementList(rendering);
    const widget = makeWidget({
      container,
      attributeName: 'numerics',
      options: [
        {name: 'below 10', end: 10},
        {name: '10 - 20', start: 10, end: 20},
        {name: 'more than 20', start: 20},
      ],
    });

    expect(widget.getConfiguration).toBe(undefined);

    // test if widget is not rendered yet at this point
    expect(rendering.callCount).toBe(0);

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // test that rendering has been called during init with isFirstRendering = true
    expect(rendering.callCount).toBe(1);
    // test if isFirstRendering is true during init
    expect(rendering.lastCall.args[1]).toBe(true);

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.shouldAutoHideContainer).toBe(true);
    expect(firstRenderingOptions.collapsible).toBe(false);
    expect(firstRenderingOptions.containerNode).toBe(container);

    widget.render({
      results: new SearchResults(helper.state, [{nbHits: 0}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering.callCount).toBe(2);
    expect(rendering.lastCall.args[1]).toBe(false);

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.shouldAutoHideContainer).toBe(true);
    expect(secondRenderingOptions.collapsible).toBe(false);
    expect(secondRenderingOptions.containerNode).toBe(container);
  });

  it('Provide a function to update the refinements at each step', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectNumericRefinementList(rendering);
    const widget = makeWidget({
      container,
      attributeName: 'numerics',
      options: [
        {name: 'below 10', end: 10},
        {name: '10 - 20', start: 10, end: 20},
        {name: 'more than 20', start: 20},
        {name: '42', start: 42, end: 42},
        {name: 'void'},
      ],
    });

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    const {toggleRefinement, facetValues} = firstRenderingOptions;
    expect(helper.state.getNumericRefinements('numerics')).toEqual({});
    toggleRefinement(facetValues[0].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'<=': [10]});
    toggleRefinement(facetValues[1].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'>=': [10], '<=': [20]});
    toggleRefinement(facetValues[2].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'>=': [20]});
    toggleRefinement(facetValues[3].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'=': [42]});
    toggleRefinement(facetValues[4].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({});

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    const {toggleRefinement: renderToggleRefinement, facetValues: renderFacetValues} = secondRenderingOptions;
    expect(helper.state.getNumericRefinements('numerics')).toEqual({});
    renderToggleRefinement(renderFacetValues[0].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'<=': [10]});
    renderToggleRefinement(renderFacetValues[1].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'>=': [10], '<=': [20]});
    renderToggleRefinement(renderFacetValues[2].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'>=': [20]});
    renderToggleRefinement(renderFacetValues[3].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'=': [42]});
    renderToggleRefinement(renderFacetValues[4].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({});
  });

  it('provides the correct facet values', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectNumericRefinementList(rendering);
    const widget = makeWidget({
      container,
      attributeName: 'numerics',
      options: [
        {name: 'below 10', end: 10},
        {name: '10 - 20', start: 10, end: 20},
        {name: 'more than 20', start: 20},
      ],
    });

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.facetValues).toEqual([
      {name: 'below 10', end: 10, isRefined: false, attributeName: 'numerics'},
      {name: '10 - 20', start: 10, end: 20, isRefined: false, attributeName: 'numerics'},
      {name: 'more than 20', start: 20, isRefined: false, attributeName: 'numerics'},
    ]);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.facetValues).toEqual([
      {name: 'below 10', end: 10, isRefined: false, attributeName: 'numerics'},
      {name: '10 - 20', start: 10, end: 20, isRefined: false, attributeName: 'numerics'},
      {name: 'more than 20', start: 20, isRefined: false, attributeName: 'numerics'},
    ]);
  });

  it('provides isRefined for the currently selected value', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectNumericRefinementList(rendering);
    const listOptions = [
      {name: 'below 10', end: 10},
      {name: '10 - 20', start: 10, end: 20},
      {name: 'more than 20', start: 20},
      {name: '42', start: 42, end: 42},
      {name: 'void'},
    ];
    const widget = makeWidget({
      container,
      attributeName: 'numerics',
      options: listOptions,
    });

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    let toggleRefinement = rendering.lastCall.args[0].toggleRefinement;

    listOptions.forEach((currentOption, i) => {
      toggleRefinement(currentOption.name);

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      // The current option should be the one selected
      // First we copy and set the default added values
      const expectedResults = [...listOptions].map(o => ({...o, isRefined: false, attributeName: 'numerics'}));
      // Then we modify the isRefined value of the one that is supposed to be refined
      expectedResults[i].isRefined = true;

      const renderingParameters = rendering.lastCall.args[0];
      expect(renderingParameters.facetValues).toEqual(expectedResults);

      toggleRefinement = renderingParameters.toggleRefinement;
    });
  });
});