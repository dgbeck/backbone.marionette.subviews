#### IMPORTANT: Development of this plugin has been stopped because it has been replaced by the more general [Backbone.Subviews](https://github.com/rotundasoftware/backbone.subviews) View mixin, which does not depend on Marionette. Please use that mixin for all new projects, as it contains all features of this plugin and is being actively developed and maintained.

# Backbone.Marionette.Subviews

Easily create and manage subviews (views within views) in your Backbone.js Marionette apps. This is a drop-in plugin that augments the original Marionette ItemView class with additional functionality.

The work on this plugin was directly inspired by [Spike Brehm's](https://github.com/spikebrehm) NestedView.

## Benefits

* Use a clear and consistent syntax in your templates to insert subviews.
* Organize all javascript logic for creating subviews in a declarative hash.
* Access subviews via the automatically populated `myView.subviews` hash.
* Supports re-rendering of parent view while reusing existing subview objects.
* Automatically closes subviews when parent view is closed.
* Works seamlessly with [Backbone.Courier](Backbone.Courier), for easy inter-view communication.

## Usage

In your underscore template for MyItemView, which contains a subview MySubview:

```
<script type='text/template' id="MyItemViewTemplate">
	<h1>This is my item view template</h1>

	<%= subview( "MySubview" ) %>
</script>
```

Or, if you are using a different templating library, an alternative syntax is:

```
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

After including `backbone.marionette.subviews.js` in your project, the `subview` helper will automatically be available in all of your underscore templates. The helper takes one argument, which is the name of the subview to be created. You may also use the alternative syntax (shown above) for declaring a subview that without a template helper. In this case the "placeholder" `div` is completely replaced with the subview's element.

The `subviewCreators` hash of your view should contain an entry for each subview. The key of each entry is the subview's name, and the value is a function that should create and return the subview instance.

Subviews are not rendered until after the parent view has completely finished rendering. A new "after:render" event is fired (and its corresponding onAfterRender method is called) after all subviews have finished rendering. The sequence of events is as follows:

	1. Marionette's "before:render" event is fired on parent view
	2. [parent view is rendered]
	3. Marionette's "render" event is fired on parent view
	4. [subviews are created and rendered in the order they appear in your template]
	5. A new "after:render" event is fired on parent view

A parent view will automatically attempt to close all its subviews when its close() method is called. If any subview can not be closed, then the parent view will also not close.

When a view is re-rendered, its subviews will also be re-rendered, as opposed to being replaced with new view objects. As a result any state information that the subview objects contain will be preserved.

You can turn on debugMode be setting the variable of the same name to true, which will help in debugging errors in rendering code by leaving breadcrumbs in the console log. (The call stack can be difficult to interpret when rendering subviews several layers deep.)

## Bonus

This plugin works very well with [Backbone.Courier](https://github.com/dgbeck/backbone.courier), since you may use your subview names as the `source` part of the `onMessages` and `passMessages` hashes. Backbone.Courier provides an easy way for views to communicate up and down the view hierarchy.