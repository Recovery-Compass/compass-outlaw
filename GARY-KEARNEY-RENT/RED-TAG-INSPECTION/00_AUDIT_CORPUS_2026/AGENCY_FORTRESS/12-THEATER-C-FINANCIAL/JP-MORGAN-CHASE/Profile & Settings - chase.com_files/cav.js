/**
 * ComponentAndView ("CAV") base type.
 * Stores the component instance and resolves the requested view instance (if necessary) as requested by
 * a controller action. Provides a promise that resolves when both component and view are created and
 * ready for use.
 *
 * @author Jeff Rose
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */
define( ['require','blue/as/serializable','blue/is','blue/object/extend','blue/util','blue/deferred','blue/log'],function( require ){
    'use strict';
    var asSerializable	= require( 'blue/as/serializable' ),
        is = require( 'blue/is' ),
        extend = require( 'blue/object/extend' ),
        clone = require( 'blue/util' ).object.deepClone,
        ReqDeferred = require( 'blue/deferred' ),
    	logger = require( 'blue/log' )( '[blue:view]' ),
        defaults = {
            append: false,
            react: false
        },
        counter = 0;

    /**
     * CAV constructor function. Establishes default values for various properties, then
     * attempts to set the component property and view property on the CAV.
     * @class module:blue-view.ComponentAndView
     * @mixes module:blue-core.asSerializable
     * @param {module:blue-core.Context} context
     * @param {object} viewImports View engine map
     * @param [ [ {module:blue-app.Component},{module:blue-view.View|external:string} ], ... ] cavList list of Component-View pairs. Views may be specified as strings to be resolved into actual instanced views.
     * @param {external:string} contextStack Slash-separated listing of the context hierarchy in place in the controller requesting thie CAV to be rendered.
     * @param {external:string} defaultPathOptions Default path location for view resolution
     */
    // eslint-disable-next-line complexity
    function ComponentAndView( context, viewEngine, viewImports, cav, contextStack, defaultPathOptions ){
	    // viewImports is used as a workaround for view registry difficulties. See page/web.js for details
        var component = is.array( cav ) ? cav[ 0 ] : cav.component,
            view = is.array( cav ) ? cav[ 1 ] : cav.view,
            options = is.array( cav ) ? cav[ 2 ] || {} : cav.options,
            pathOptions = defaultPathOptions ? clone( defaultPathOptions ) : context.viewResolverOptions || {};

        this.hasComponent = !component;
        this.hasView = false;

        /**
         * @member {module:blue-view.View} module:blue/resolver/cav#view
         */
        this.view = undefined;

        /**
         * @member {module:blue-app.Component} module:blue/resolver/cav#component
         */
        this.component = undefined;

        /**
         * @member {external:string}
         */
        this.viewName = undefined;

        /**
         * @member {object}
         */
        this.options = extend( {}, defaults, options || {} );

        this.resolving = new  ReqDeferred();

        /**
         * @member {external:Promise}
         */
        this.resolved = this.resolving.promise;

        component && this.setComponent( context, component, view );

        /**
         * @member {external:string}
         */
        this.viewEngine = viewEngine;

        // Leading / in the view name means explicitly set view path, we do not use configuration for path.
        // Allow component's context to override default options.
        if( is.string( view ) && view[ 0 ] !== '/' && component && component.context ){
            if( component.context.page && component.context.page.viewResolverOptions ){
                pathOptions = clone( component.context.page.viewResolverOptions );
            }
        } else if( is.string( view ) && view[ 0 ] === '/' ){
            // BLUEJS-2164 - strip leading slash and bypass viewResolverOptions when absolute view path is indicated
            view = view.substr( 1 );
            pathOptions = {};
        }

        view && this.setView( context, viewImports, view, contextStack, pathOptions );
    }


    /**
     * Performs final changes on CAV instance before returning the CAV. This function is called when
     * either the component or view has been created and set on the CAV. When both component and view
     * are complete and attached to the CAV, this function can proceed.
     * This function is one of the very few places in BlueJS where a component instance and its paired view
     * instance are both in scope and data can be transferred between them. When everything is finished,
     * the "resolving" property of the CAV (a Promise) is resolved with the CAV instance.
     * @function module:blue-view.ComponentAndView#resolve
     */
    ComponentAndView.prototype.resolve = function(){
        var spec;
        if( this.isReady() ){
            // Update "viewName" property if not already defined. Usually this is because
            // CAV used a view instance instead of a string name for the view.
            if( this.component && this.view.viewName && !this.component._('viewName') ){
                this.component._( 'viewName', this.view.viewName );
            }

            if( !this.viewInternals.bridge ){
                var bridgeName = this.component && this.component.key ? this.component.key : 'EMPTY';
                // BLUEJS-2729 & BLUEJS-2541
                this.viewInternals.createBridge( { name: bridgeName, bindings: {}, triggers: {} } );
            }
            // add downstream bindings for settings
            // BLUEJS-2390 - ...and also for data properties if bridge spec bindings are empty
            if( this.component ){
                spec = this.component.spec || {};
                this.viewInternals.bridge.addComponentSpecData( Object.keys( spec.data || {} ).reduce( function( obj, key ){
                    obj[ key ] = 1;
                    return obj;
                }, {} ) );
                this.viewInternals.bridge.addComponentSpecSettings( this.component.getSettingsValues() );
                this.viewInternals.bridge.addComponentSpecActions( this.component.getActionNames() );
                this.view._componentStack  = this.component.context.getStack();
            }

            // BLUEJS-6254 - add component name(s) to root node of view
            if( this.component && this.component.context ){
                this.view.htmlAttrs['data-component-name'] = this.component.context.parent.getStack() +'|'+ (this.component.key || this.component.context.name) +'|'+ this.component.spec.name +'|'+ this.component._('guid');
            }
                
            // allow the resolver to access the view internals
            this.options.viewInternals = this.viewInternals;
            this.resolving.resolve( [ this.component, this.view, this.options ] );
        }
    };

    /**
	 * Logs and broadcasts error messages that the CAV instance could not be created. Once messages have been
	 * sent, the "resolving" Promise on the CAV is rejected with the provided error object.
	 * @function module:blue-view.ComponentAndView#reject
	 * @param {blue/context} context
	 * @param {Error} e Error object
	 */
    ComponentAndView.prototype.reject = function( context, e ){
        // BLUEJS-3079
        e.msg = e.message;
        logger.error( '[' + context.getStack() + ']', 'CAV failed to resolve:', e );
        context.page.emit( 'page:error', {
            'code': 'blue:cav:error:cavResolutionFailed',
            "description": 'CAV could not be resolved:' + e
        } );
        this.resolving.reject( e );
    };

    /**
     * Sets the provided component instance onto the CAV instance.
     * @function module:blue-view.ComponentAndView#setComponent
     * @param {module:blue/context} context
     * @param {module:blue-app.Component} component
     * @param {external:string} viewName
     */
    ComponentAndView.prototype.setComponent = function( context, component, viewName ){
        var me = this;

        if( component.oldComponent ){
            component.oldComponent.then( function(){
                me.component = component;
                me.component._( 'viewName', is.string( viewName ) ? viewName : '' );
                me.hasComponent = true;
                me.resolve();
            } ).catch( function( e ){
                // BLUEJS-3079
                e.msg = e.message;
                logger.warn( '[' + context.getStack() + ']', 'Old Component instance ' + component.key + ' failed to destroy cleanly', e );
                me.component = component;
                me.component._( 'viewName', is.string( viewName ) ? viewName : '' );
                me.hasComponent = true;
                logger.error( '[' + context.getStack() + ']', 'CAV component ' + component.key + ' failed to remove old component with same name:', e );
                context.page.emit( 'page:error', {
                    'code': 'blue:cav:error:componentConstructionFailed',
                    "description": 'CAV component ' + component.key + ' failed to remove old component with same name:' + e
                } );
                me.reject( context, e );
            } );
            // cleanup
            delete component.oldComponent;
        } else {
            me.component = component;
            me.component._( 'viewName', is.string( viewName ) ? viewName : '' );
            me.hasComponent = true;
            me.resolve();
        }
    };

    /**
     * Sets the provided view onto the CAV instance
     * @function module:blue-view.ComponentAndView#setView
     * @param {module:blue/context} context
     * @param {object} viewImports View engine map
     * @param {string|module:blue-view.View} view If view is a string, it will be resolved using view resolver; if it's an instance, then set view instance onto CAV immediately
     * @param {external:string} contextStack Slash-separated listing of the context hierarchy in place in the controller requesting thie CAV to be rendered.
     * @param {object} pathOptions Settings for the view resolver to use in constructing the path to the view module
     */
    ComponentAndView.prototype.setView = function( context, viewImports, view, contextStack, pathOptions ){
        var that = this,
            registeredName,
            viewPath,
            prefix = pathOptions.prefix || '',
            suffix = pathOptions.suffix || '',
            viewRegistry;
        pathOptions = pathOptions || {};

        // A view name given
        if( is.string( view ) ){
            this.viewName = view;

            // The registration name, the key used to refer to this instance in the registry, will be composed of the
            // current execution context stack and the view name.
            registeredName = contextStack + '/' + view;

            // If this registeredName is defined in our custom index of imported views, then we use that index's module
            // path. Otherwise, we will fall back on the typical view resolver options system.
            if( viewImports[ registeredName ] ){
                viewPath = viewImports[ registeredName ];
                pathOptions = {};  // don't use resolver config when we already know the full path
                viewRegistry = context.getViewRegistry( that.viewEngine );
            } else {
                viewPath = prefix + view + suffix;
                viewRegistry = context.getViewRegistry( that.viewEngine );
            }

            // Create a unique name for this view instance
            registeredName = registeredName + '/' + counter;

            // add view data to registy to be resolved
            viewRegistry.then( function( registry ){
                // WEBPACK: registering imported component block view instance
                if (is.string(viewPath)) {
                    registry.registerView( registeredName, context.viewResolver.createId( viewPath, pathOptions ), true );
                } else {
                    registry.registerView( registeredName, viewPath, true );
                }
            } );
        } else {
            // A view instance given
            this.viewName = view.name || view.viewName || 'anonymous';
            registeredName = prefix + this.viewName + suffix;
            // add view data to registy to be resolved
            viewRegistry = context.getViewRegistry( that.viewEngine );
            viewRegistry.then( function( registry ){
                registry.registerView( registeredName, view, true );
            } );
        }

        // Needed when a view without business logic is defined in main.js
        /*
        Example in main.js:

        myView: {
            create: {
                module: 'blue/reactiveView',
                args: ['myViewName']
            },
            properties: {
                template: {
                    module: 'myApp/template/myTemplateName'
                },
                target: '#myNode'
            }
        },
        */
        if( is.object( this.options ) && is.defined( view.targetSelector ) && !is.defined( this.options.target ) ){
            this.options.target = view.targetSelector;
        }

        // viewRegistry is tracked separately for each supported view engine and may not be available for use immediately if view engine has never
        // been requested. Wait for the appropriate engine promise to resolve before loading the view and marking this CAV instance as complete.
        viewRegistry.then( function( registry ){
            registry.getView( registeredName ).then( function( view ){
                if( view && is.function( view.replaceIn ) && is.function( view.appendTo ) ){
                    that.view = view;
                    that.viewInternals = view.link();

                    if( that.viewName && !that.view.viewName ){
                        that.view.viewName = that.viewName;
                    }
                } else {
                    logger.warn( '[' + context.getStack() + ']', 'This is not a view!', view );
                }
                that.hasView = true;
                that.resolve();
            }, function( e ){
                // BLUEJS-3079
                e.msg = e.message;
                logger.error( '[' + context.getStack() + ']', 'CAV view ' + that.viewName + ' failed to resolve:', e );
                context.page.emit( 'page:error', {
                    'code': 'blue:cav:error:viewResolutionFailed',
                    "description": 'CAV view ' + that.viewName + ' failed to resolve:' + e.name + ':' + e.message
                } );
                that.reject( context, e );
            } );
        } );
        counter++;
    };

    /**
     * @function module:blue-view.ComponentAndView#isReady
     * @return {boolean} Whether or not the ComponentAndView has been resolved, i.e. it contains both a component and view instance.
     */
    ComponentAndView.prototype.isReady = function(){
        return this.hasComponent && this.hasView;
    };

    // add serializable functionality
    asSerializable.call( ComponentAndView.prototype, function(){
        return 'ComponentAndView';
    } );

    return ComponentAndView;
} );
