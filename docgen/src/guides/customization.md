---
title: Custom widgets
mainTitle: Guides
layout: main.pug
name: customize
category: guides
withHeadings: true
navWeight: 0
---

## Custom widgets

InstantSearch.js comes bundled with a set of 18 UI components. Each of them
has options to manipulate CSS classes or even modifying part of the HTML
output (templates).

However, those may not be enough for your use-case or you might want
to use parameters from that are not usable in the current set of widgets.

That's what this guide is all about: extending instantsearch.js to fit your
needs perfectly.

InstantSearch.js offers two ways for building new widgets:
 - use connectors to reuse the business logic of an existing widget
 - use the widget specification to interact directly with Algolia

## Connectors

Connectors are the render-less counterparts of the widgets. They encapsulate
all the logic needed for making search widgets. Each one of them is specialized
to make a certain type of widget.

Connectors are functions that will create a widget factory, functions that can
creates widgets instances.

They follow the pattern:

```javascript
(rendering) => (widgetParameters) => Widget
```

We will cover two examples in this guide, a menu as dropdown and a second one to display hits with having a custom message every 5 results.

Don't be scared! let's go together step by step on how to write a custom widget.

### How to create a custom menu with a dropdown

In this example we will create a new custom widget using [connectMenu](/connectors.html#connectMenu) connector.
We will cover step by step on how to write a render function used by the connector.

For simplicity, we will write custom widgets with [jQuery](https://jquery.com/) to manipulate the DOM.


#### 1. First render

First of all, we want to use `isFirstRendering` boolean (which is second argument of the render function) to insert the needed markup in the DOM on the first rendering lifecycle:

```javascript
var customMenuRenderFn = function(renderParams, isFirstRendering) {
  if (isFirstRendering) {
    // insert needed markup in the DOM
    // here we want a `<select></select>` element and the title
    $(window.document.body).append(
      '<h1>My first custom menu widget</h1>' +
      '<select></select>'
    );
  }
}
```


#### 2. Display available menu select options

Then, on every render we want to update and insert the available menu items as `<option>` DOM nodes:

```javascript
var customMenuRenderFn = function(renderParams, isFirstRendering) {
  if (isFirstRendering) {
    $(document.body).append(
      '<h1>My first custom menu widget</h1>' +
      '<select></select>'
    );
  }

  // `renderParams` is an object containing all the informations
  // you need to create a custom widget. If you think something is missing
  // or you want to enhance this connector feel free to open an issue on Github.
  var items = renderParams.items;

  // Transform `items[]` to HTML markup:
  //
  // each item comes with a `value` and `label`, it will also have a boolean to true
  // called `isRefined` when the current menu item is selected by the user.
  var optionsHTML = items.map(function(item) {
    return (
      '<option value="' + item.value + '"' + (item.isRefined ? ' selected' : '') + '>' +
      item.label + '(' + item.count ')' +
      '</option>'
    );
  });

  // then replace content of `<select></select>` node with the new menu items markup.
  $(document.body).find('select').html(optionsHTML);
}
```

Now we have all the menu options displayed on the page but nothing is updating when the user selects a new option. Let's connect the dropdown to the search.


#### 3. Make it interacts with the search results

Menu connector comes with a `refine()` function in the first argument `renderParams` object.
You need to call this `refine()` function everytime an user select another option to filter the search results:

```javascript
var customMenuRenderFn = function(renderParams, isFirstRendering) {
  if (isFirstRendering) {
    $(document.body).append(
      '<h1>My first custom menu widget</h1>' +
      '<select></select>'
    );

    // We will bind the `<select>` change event on first render
    // since we don't want to create new listeners on every render
    // for potential performance issues:
    var refine = renderParams.refine;

    // we will use `event.target.value` to identify
    // which option is selected and then refine it:
    $(document.body).find('select').on('click', function(event) {
      refine(event.target.value);
    });
  }

  var items = renderParams.items;
  var optionsHTML = items.map(function(item) {
    return (
      '<option value="' + item.value + '"' + (item.isRefined ? ' selected' : '') + '>' +
      item.label + '(' + item.count ')' +
      '</option>'
    );
  });
  $(document.body).find('select').html(optionsHTML);
}
```

Now every time an user selects a new option in the dropdown menu, it triggers new search to refine the search results!


#### 4. Mount the custom menu dropdown widget on your page

We have written the render function that will be passed to connector.

Now we need to instantiate the custom widget so it will be displayed in the page:

```javascript
var customMenuRenderFn = function(renderParams, isFirstRendering) {
  if (isFirstRendering) {
    $(document.body).append(
      '<h1>My first custom menu widget</h1>' +
      '<select></select>'
    );

    var refine = renderParams.refine;
    $(document.body).find('select').on('click', function(event) {
      refine(event.target.value);
    });
  }

  var items = renderParams.items;
  var optionsHTML = items.map(function(item) {
    return (
      '<option value="' + item.value + '"' + (item.isRefined ? ' selected' : '') + '>' +
      item.label + '(' + item.count ')' +
      '</option>'
    );
  });
  $(document.body).find('select').html(optionsHTML);
}

// Create a new factory of the custom menu select widget:
var dropdownMenu = instantsearch.connectors.connectMenu(customMenuRenderFn);

// Instantiate custom widget and display it on the page.
//
// Custom widgets that are created with connectors accepts
// the same options as a built-in widget, for instance
// the menu widget takes a mandatory `attributeName` option
// so we have to do the same:
search.addWidget(
  dropdownMenu({
    attributeName: 'categories'
  })
);
```


#### 5. Make it reusable!

Connectors are meant to be reusable, it is important to be able to pass options to
the rendering of each single widget instance when instantiating them.

That's why all the options passed to the newly created widget factory will be forwarded to the
rendering.

Let's update our custom render function to be able to configure the DOM element where the widget is mount and also the title:

```javascript
var customMenuRenderFn = function(renderParams, isFirstRendering) {
  // widgetParams contains all the original options used to instantiate the widget on the page.
  var container = renderParams.widgetParams.containerNode;
  var title = renderParams.widgetParams.title || 'My first custom menu widget';

  if (isFirstRendering) {
    // replace `document.body` with the container provided by the user
    // and also the new title
    $(container).append(
      '<h1>' + title + '</h1>' +
      '<select></select>'
    );

    var refine = renderParams.refine;
    $(container).find('select').on('click', function(event) {
      refine(event.target.value);
    });
  }

  var items = renderParams.items;
  var optionsHTML = items.map(function(item) {
    return (
      '<option value="' + item.value + '"' + (item.isRefined ? ' selected' : '') + '>' +
      item.label + '(' + item.count ')' +
      '</option>'
    );
  });
  $(container).find('select').html(optionsHTML);
}

var dropdownMenu = instantsearch.connectors.connectMenu(customMenuRenderFn);

// Now you can use the dropdownMenu at two different places in the DOM:
// (since they use the same `attributeName` they will display the same options)
search.addWidget(
  dropdownMenu({
    attributeName: 'categories',
    containerNode: '#first-dropdown',
    title: 'First dropdown'
  })
);

search.addWidget(
  dropdownMenu({
    attributeName: 'categories',
    containerNode: '#second-dropdown',
    title: 'Second dropdown'
  })
);
```

And voilà, we have covered how to write simple custom widgets using connectors 🎉 !

Now you can [read more about connectors](/connectors.html) in the docs and create more advance usages with the same simplicity.

Feel free to share with the community your custom widgets 🙏