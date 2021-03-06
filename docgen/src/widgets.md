---
title: Introduction
mainTitle: Widgets
layout: main.pug
category: widgets
withHeadings: true
navWeight: 100
editable: true
githubSource: docgen/src/widgets.md
---

## Introduction to widgets

In InstantSearch.js, widgets are the building blocks of search UI.

In order to make your work efficient, InstantSearch.js it comes with a set
of 18 widgets factories, functions that create widget instances. Each one
of them is specialized by role: searchbox, pagination, numeric filters and so
on...

Widgets can be added to the InstantSearch instance using the `addWidget` method.

```javascript
const search = instantsearch(/* parameters here */);
search.addWidget(instantsearch.searchbox(/* searchbox parameters */));
```

## Common parameters

Most widgets share a common set of options. Here is a list of the one
that you'll encounter using the different widgets.

### container

The `container` represents the place where the widget will be rendered in your
HTML page. As a parameter, it can either be a CSS selector or a DOM element.

When used as a CSS selector, it is important that it identifies a single element.
Otherwise, the widget factory will use the first one returned by the browser, which
may be unpredictable.

This is usually one of the only attribute required to use a widget.

```javascript
const search = instantsearch(/* parameters here */);
search.addWidget(instantsearch.searchbox({
  container: '#my-searchbox',
}));
```

### cssClasses

`cssClasses` is a parameter that let you specify one or more classes to add to
some specific element of the rendered widget. When available, this parameter is
an object of either string or array of strings. The different keys available
is define in the widget reference.

```javascript
const search = instantsearch(/* parameters here */);
search.addWidget(instantsearch.searchbox({
  container: '#search-box',
  cssClasses: {
    root: 'my-searchbox',
    input: ['searchbox-input', 'input', 'form-element'],
  }
}));
```

### templates

The `templates` are a way to customize to customize the rendering of a widget using
string-based templates or functions.

In their string format, the templates should be written using
[mustache](https://mustache.github.io/mustache.5.html).

Like the css classes they can only be written for some specific parts of the rendered
widget.

```javascript
const search = instantsearch(/* parameters here */);
search.addWidget(instantsearch.refinementList({
  container: '#hits',
  templates: {
    header: 'Header',
    item: '{{value}} {{#isRefined}}Selected{{/isRefined}} ({{count}})',
    // OR
    item: function(param) {
      return '👉 ' + param.value;
    }
  }
}));
```

### transformData

`transformData` is used to provide function that will transform the data
passed to the templates. This is particularly handy when using using mustache
because it only accepts conditionnals over `boolean` value.

Those function map the different template keys available, when it makes sense.
For example, if a widget accepts an `item` template, you can provide an `item`
transformData.

The `transformData` functions use the same parameters as the templates and should
return an object. Usually, it is an enhanced version of the original object with
new properties.

```javascript
const search = instantsearch(/* parameters here */);
search.addWidget(instantsearch.refinementList({
  container: '#categories',
  attribute: 'categories',
  templates: {
    item: '{{customData}}',
  },
  transformData: {
    item: function(data) {
      data.customData = 'test';
      return data;
    }
  }
}));
```

### collapsible

`collapsible` makes the widget optional in the UI. In practice, when this property
is `true`, the widget can be collapsed when clicking on the header. This can help
better managed the space real estate of your search UI.

This option can either take a boolean or an object. When an object is passed it is
like the property is true and you can defined it's initial state using the property
`collapsed`.

```javascript
const search = instantsearch(/* parameters here */);
search.addWidget(instantsearch.refinementList({
  container: '#categories',
  attribute: 'categories',
  collapsible: true,
});

// OR for an initially collapsed refinement list

const search = instantsearch(/* parameters here */);
search.addWidget(instantsearch.refinementList({
  container: '#categories',
  attribute: 'categories',
  collapsible: { collapsed: true },
});
```

### autoHideContainer

`autoHideContainer` makes the widget disappear when it is not meaningful. For example,
when `autoHideContainer` is set to true on a refinement list and there is no results,
the widget is hidden.

This can help the users focus on the important like the current refined values so that
they can remove some filters.

```javascript
const search = instantsearch(/* parameters here */);
search.addWidget(instantsearch.refinementList({
  container: '#categories',
  attribute: 'categories',
  autoHideContainer: true,
});
