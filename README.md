# Backbone.Marionette.Subviews

Easily create subviews (views within views) in your Backbone.js Marionette apps, directly from your templates. This is a drop-in plugin that augments the original Marionette ItemView class with additional functionality.

The work on this plugin was directly inspired by [Spike Brehm's](https://github.com/spikebrehm) NestedView.

## Benefits

* Create named subviews with a crystal clear syntax directly from your underscore templates 
* Subviews are created with pure javascript - no need to put "placeholder" elements in your templates
* Access subviews via the automatically populated myView.subviews hash.
* Organize all javascript logic for creating subviews in a declarative hash

## Usage

In your underscore template for MyItemView, which contains a subview MySubview:

```javascript
<script type='text/template' id="MyItemViewTemplate">
	<h1>This is my item view template</h1>

	<%= subview( "MySubview" ) %>
</script>
```

Or, if you are not using underscore, an alternative syntax is:

```javascript
<script type='text/template' id="MyItemViewTemplate">
	<h1>This is my item view template</h1>

	<div data-subview-name="MySubview"></div>
</script>
```

Now in MyItemView.js:

```javascript
MyItemViewClass = Backbone.Marionette.ItemView.extend( {
	template: "#MyItemViewTemplate",

	subviewCreators : {
		"MySubview" : function() {
			var options = {};
			// do any logic required to create initialization options
			new MySubviewClass( options );
		}
	}

	onAfterRender : {
		// anytime after rendering, you can find the subviews in this.subviews
		this.subviews.MySubview.bind( "click", _.mySubview_onClick, this );
	}
} );
```

## Details

After including `backbone.marionette.subviews.js` in your project, the `subview` helper will automatically be available in all of your underscore templates. The helper takes one argument, which is the name of the subview to be created. See above for alternative syntax for declaring a subview that does not use a template helper.

The subviewCreators hash of your view should contain an entry for each subview. The key of each entry is the subview's name, and the value is a function that should create and return the subview instance.

Subviews are not rendered until after the parent view has completely finished rendering. A new "after:render" event is fired (and its corresponding onAfterRender method is called) after all subviews have finished rendering. The sequence of events is as follows:

	1. Marionette's "before:render" event is fired on parent view
	2. [parent view is rendered]
	3. Marionette's "render" event is fired on parent view
	4. [subviews are created and rendered in the order they appear in the underscore template]
	5. A new "after:render" event is fired on parent view

A parent view will automatically attempt to close all its subviews when its close() method is called. If any subview can not be closed, then the parent view will also not close.

When a view is re-rendered, its subviews will also be re-rendered, as opposed to being replaced with new view objects. As a result any state information that the subview objects contain will be preserved.

You can turn on debugMode be setting the variable of the same name to true, which will help in debugging errors in rendering code by leaving breadcrumbs in the console log. (The call stack can be difficult to interpret when rendering subviews several layers deep.)

## Bonus

This plugin works very well with (Backbone.Courier)[https://github.com/dgbeck/backbone.courier], since you may use your subview names as the `source` part of the `onMessages` and `passMessages` hashes. Backbone.Courier provides an easy way for views to communicate up and down the view hierarchy.