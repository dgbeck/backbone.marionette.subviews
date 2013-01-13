/*!
 * Backbone.Marionette.Subviews, v0.2
 * Copyright (c)2012 Rotunda Software, LLC.
 * Distributed under MIT license
 * http://github.com/dgbeck/backbone.marionette.subviews
*/
(function(){
	var debugMode = false;
	var originalMarionetteItemView = Backbone.Marionette.ItemView;
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;

	Backbone.Marionette.ItemView = originalMarionetteItemView.extend({
 
		render : function() {
			var _this = this;

			if( debugMode )
			{
				console.group( "Rendering view" );
				console.log( this );
			}
	
			if( _.isUndefined( this.subviews )  )
				this.subviews = {};

			_.each( this.subviews, function( thisSubview, subviewName ) {
				if( _.isFunction( thisSubview.unrender ) ) thisSubview.unrender();
				thisSubview.$el.detach();
			} );

			originalMarionetteItemView.prototype.render.apply( this, arguments );

			this.$( "div[data-subview-name]" ).each( function() {
				var thisPlaceHolderScriptEl = $( this );
				var subviewName = thisPlaceHolderScriptEl.attr( "data-subview-name" );
				var newView;

				// if the subview is already defined, then use the existing subview instead
				// of creating a new one. This allows us to re-render a parent view without
				// loosing any dynamic state data on the existing subview objects.
				if( _.isUndefined( _this.subviews[ subviewName ] ) )
				{
					var subviewCreator = _this.subviewCreators[ subviewName ];

					if( _.isUndefined( subviewCreator ) ) throw "Can not find subview creator that corresponds to placeholder: " + subviewName;

					if( debugMode ) console.log( "Creating subview " + subviewName );
					newView = subviewCreator.apply( _this );

					_this.subviews[ subviewName ] = newView;
				}
				else newView = _this.subviews[ subviewName ];

				thisPlaceHolderScriptEl.replaceWith( newView.$el );
			} );

			_.each( this.subviews, function( thisSubview, subviewName ) {
				if( debugMode ) console.group( "Rendering subview " + subviewName );
				thisSubview.render();
				if( debugMode ) console.groupEnd();
			} );

			this.triggerMethod("after:render", this);

			if( debugMode ) console.groupEnd(); // "Rendering view"

			return this;
		},

		// override Marionette's standard mixinTemplateHelpers function so that we can always mix in our
		// "subview" helper in addition to any helpers specified in the templateHelpers element.
		mixinTemplateHelpers: function( target ) {
			var _this = this;
			
			// extend with our subview template helper
			target.subview = function(){ return _this._createSubviewPlaceholder.apply( _this, arguments ); };

			// call default behavior to mix in helpers specified in the templateHelpers element
			return originalMarionetteItemView.prototype.mixinTemplateHelpers.apply( this, arguments );
		},

		// close add subviews when this view is closed.
		onBeforeClose : function() {
			var _this = this;

			var couldCloseAllSubviews = true;

			// loop through subviews and call their close handlers
			var subviewsCopy = _.map( this.subviews, _.identity ); // make a copy, since we will be unsetting as we go along
			_.each( subviewsCopy, function( thisSubview, thisSubviewName ) {
				if( _.isFunction( thisSubview.close ) )
				{
					thisSubview.close();

					if( ! thisSubview.isClosed ) couldCloseAllSubviews = false;
					else delete _this.subviews[ thisSubviewName ];
				}
			} );

			if( ! couldCloseAllSubviews ) this.shouldClose = false;
		},

		_createSubviewPlaceholder : function( subviewName ) {
			var subviewCreator = this.subviewCreators[ subviewName ];
			if( _.isUndefined( subviewCreator ) ) throw "Attempt to create undefined subview: " + subviewName;

			return "<div data-subview-name='" + subviewName + "'></div>";
		}
	});
})();