/*!
 * Backbone.Marionette.Subviews, v0.1
 * Copyright (c)2012 David Beck, Rotunda Software, LLC.
 * Distributed under MIT license
 * http://github.com/dgbeck/backbone.marionette.subviews
*/
(function(){
	var debugMode = false;
	var originalMarionetteItemView = Backbone.Marionette.ItemView;

	Backbone.Marionette.ItemView = originalMarionetteItemView.extend({
 
		createSubviewPlaceholder : function( subviewName ) {
			var subviewCreator = this.subviewCreators[ subviewName ];
			if( _.isUndefined( subviewCreator ) ) throw "Attempt to create undefined subview: " + subviewName;

			return "<script type='text/template' class='view-placeholder' data-view-name='" + subviewName + "'></script>";
		},

		// override Marionette's standard mixinTemplateHelpers function so that we can always mix in our
		// "subview" helper in addition to any helpers specified in the templateHelpers element.
		mixinTemplateHelpers: function( target ) {
			var _this = this;
			
			// first extend with our subview template helper
			target.subview = function(){ return _this.createSubviewPlaceholder.apply( _this, arguments ); };

			// now call default behavior to mix in helpers specified in the templateHelpers element
			return originalMarionetteItemView.prototype.mixinTemplateHelpers.apply( this, arguments );
		},

		render : function() {
			var _this = this;

			if( debugMode )
			{
				console.group( "Rendering view" );
				console.log( this );
			}
	
			this.subviews = {};
			
			originalMarionetteItemView.prototype.render.apply( this, arguments );
			
			this.$( "script.view-placeholder" ).each( function() {
				var thisPlaceHolderScriptEl = $( this );
				var subviewName = thisPlaceHolderScriptEl.attr( "data-view-name" );
				var subviewCreator = _this.subviewCreators[ subviewName ];

				if( _.isUndefined( subviewCreator ) ) throw "Can not find subview creator that corresponds to placeholder: " + subviewName;

				if( ! _.isUndefined( _this.subviews[ subviewName ] ) )
					throw( "There is already a subview with the name \"" + subviewName + "\". Each subview must have a unique name." );

				if( debugMode ) console.log( "Creating subview " + subviewName );
				var newView = subviewCreator.apply( _this );

				_this.subviews[ subviewName ] = newView;

				thisPlaceHolderScriptEl.replaceWith( newView.$el );

				if( debugMode ) console.group( "Rendering subview " + subviewName );
				newView.render();
				if( debugMode ) console.groupEnd();
			} );

			this.triggerMethod("after:render", this);

			if( debugMode ) console.groupEnd(); // "Rendering view"

			return this;
		}
	});
})();
