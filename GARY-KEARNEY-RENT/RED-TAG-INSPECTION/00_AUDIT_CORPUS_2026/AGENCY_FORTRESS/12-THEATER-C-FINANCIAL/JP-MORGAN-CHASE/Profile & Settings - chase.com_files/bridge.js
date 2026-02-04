/**
 * Base BlueJS Bridge.
 * Bridge instances are created as mixins applied to instances of this Bridge prototype.
 * Every view uses a Bridge instance to map incoming and outgoing events and data updates
 * between the view and component. Using a configuration file (a "web spec"), the bridge
 * creates listeners and handlers for data changes and events.
 * @author Jeff Rose
 * @author Aaron Brown
 * @author Ben White
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */
define( ['require','exports','module','blue/compose','blue/declare','blue/event','blue/event/channel','blue/event/channel/domEvents','blue/log','blue/is','blue/util','blue/util','blue/util','blue/util','blue/as/contextual','blue-view/nodeDictionary','blue/perf','path-toolkit'],function( require, exports, module ){
    'use strict';
    var compose             = require( 'blue/compose' ),
        declare             = require( 'blue/declare' ),
        Event               = require( 'blue/event' ),
        EventChannel        = require( 'blue/event/channel' ),
        domEventsChannel    = require( 'blue/event/channel/domEvents' ),
        getLogger           = require( 'blue/log' ),
        is                  = require( 'blue/is' ),
        deepEquals          = require( 'blue/util' ).object.deepEquals,
        obj                 = require( 'blue/util' ).object,
        merge               = require( 'blue/util' ).object.merge,
        flatten             = require( 'blue/util' ).array.flatten,
        asContextual        = require( 'blue/as/contextual' ),
        reqNodeDictionary   = require( 'blue-view/nodeDictionary' ),
        perf                = require( 'blue/perf' ),
        PathToolkit         = require( 'path-toolkit' ),
        logger              = getLogger( '[blue:view:ractive]' ),
        ptk                 = new PathToolkit( { simple:true } ),
        ptkFull             = new PathToolkit( { simple:false } ),

        // support module config overrides
        config = Object.assign( {
            batchUpdateDefault: false
        }, module.config() ),

        // direction lookups
        upstream = {
            UPSTREAM: 1,
            BOTH: 1
        },
        downstream = {
            DOWNSTREAM: 1,
            BOTH: 1
        },

        uuid = 0,


        // ractive v0.8.x
        // ensure keypath format is uniform (foo.bar.baz)

        /**
         * Starting with RactiveJS version 0.8.0, the keypath provided by Ractive in certain callbacks was no longer
         * represented as a simple dot-separated object path. Instead, it was a complex string best interpreted by
         * Ractive within the context of its own model and hierarchy. This made the keypath difficult to rely on in
         * application code. This function attempts to normalize the complex keypath into the former, simple form.
         * @function module:blue-view-ractive.Bridge~parseKeyPath
         * @param {external:string} raw Complex keypath string from RactiveJS
         * @returns {external:string} new, simplified keypath
         */
        parseKeyPath = function( raw ){
            if( !raw || raw[ 0 ] !== '@' ){ return raw; }
            var rxData = /\{[^@}]+}/,
                rxProp = /\.([^}]+)$/,
                rxClean = /[^\s,:{}]+/g,
                tryParse = function( str ){
                    try {
                        return JSON.parse( str );
                    } catch ( ignore ){
                        return {};
                    }
                },
                // grab deepest object string
                json = ( rxData.exec( raw ) || [ '{}' ] )[ 0 ],
                // grab requested prop from end
                prop = ( rxProp.exec( raw ) || [] )[ 1 ],
                // clean json object
                clean = json.replace( rxClean, function( key ){
                    // ignore properties that are strings
                    return key[ 0 ] === '"' ? '' : '"' + key + '"';
                } ),
                // parse json string
                data = tryParse( clean ),
                // grab deepest keypath
                deepest = function(){
                    var maxProp,
                        maxLen = 0;
                    Object.keys( data ).forEach( function( key ){
                        var len = data[ key ].split( '.' ).length;
                        if( len > maxLen ){
                            maxLen = len;
                            maxProp = key;
                        }
                    } );
                    return maxProp && data[ maxProp ].split( '.' ).splice( 0, maxLen - 1 ).join( '.' );
                };
            // return requested keypath or deepest keypath parent
            return ( prop ? data[ prop ] : deepest() ) || '';
        },

        /**
         * When PathToolkit evaluates the string path to find the requested value inside the data object,
         * the source data object may differ depending on the argument. The argument string may have a prefix
         * with certain special values that allow data from different sources such as the document or the
         * event target element. If such a prefix exists, return the corresponding object as the data object.
         * If no prefix exists, then use the view's model as the default data object.
         */
        getEventDataSource = function( data, argPrefix ){
            var dataSource,
                globalDataSources = {
                    window: window,
                    document: document,
                    body: document.body
                },
                domEvent = data.domEvent || undefined;

            if( argPrefix ){
                if( globalDataSources[ argPrefix ] ){
                    return globalDataSources[ argPrefix ];
                }

                // domEvent is required to evaluate "event" and "element" argument types
                if( domEvent ){
                    switch( argPrefix ){
                        case 'element':
                            return domEvent.target;
                        case 'event':
                            return domEvent;
                        // "$event" is invalid, so force it to return empty
                        case '$event':
                            return undefined;
                        default:
                    }
                }
            }

            return dataSource;
        },

        /**
         * If the webspec dictates that a triggered action should receive a specific list of arguments, some of
         * those arguments must be calculated from the document, or the targeted element, for example. This function
         * creates the arguments array of values based on the configuration for the action found in the webspec.
         * @function module:blue-view-ractive.Bridge~makeEventData
         * @param {object} data Object provided by Ractive when a Ractive event is fired
         * @param {object} model View model
         * @param {Array} argList List of arguments from the webspec
         * @returns {Array} New array of values calculated from the "argList" parameter
         */
        makeEventData = function( data, model, argList ){
            var dataSource,
                newData = [];
            argList.forEach( function( arg ){
                var argCopy = arg + '',
                    argParts = argCopy.match( /^((window|document|body|element|event)\.).+$/ ) || [],
                    prefix = argParts[ 1 ] || '',
                    argTokens,
                    val = null;

                // BLUEJS-6510 - provide support for legacy shim to override arg processing
                val = Bridge.prototype._makeEventDataCallback( data, model, arg );
                if( val ){
                    newData.push( val );
                    return;
                }

                if( prefix ){
                    // strip prefix from argument string so it won't be treated as a property
                    argCopy = argCopy.replace( prefix + '.', '' );
                }
                argTokens = ptkFull.getTokens( argCopy );

                // if valid argument string...
                if( argTokens ){
                    // dataSource defaults to view model, but may be set to something specific based
                    // on argument string (e.g. "document.height" sets dataSource to document).
                    dataSource = getEventDataSource( data, prefix ) || model;
                    val = ptkFull.get( dataSource, argTokens );
                    if( typeof val === 'function' ){
                        newData.push( val() );
                    } else if( typeof val === 'undefined' ){
                        newData.push( null );
                    } else {
                        newData.push( val );
                    }
                }
            } );

            return newData;
        },

        /**
         * takes an object and returns an object with the same properties, but applied in reverse order
         * @function module:blue-view-ractive.Bridge~reverseMap
         * @param {object} map Object to reverse the properties of
         * @returns {object} New object with properties applied in reverse order
         */
        reverseMap = function( map ){
            var reverseKeys = Object.keys( map ).reverse(),
                rMap = {};
            reverseKeys.forEach( function( keyName ){
                rMap[ keyName ] = map[ keyName ];
            } );
            return rMap;
        },

        /**
         * Constructor function for base Bridge instance
         * @class module:blue-view-ractive.Bridge
         * @param {external:string} name Name of Bridge instance
         * @param {module:blue-core.Context} parentContext context of parent
         */
        Bridge = function( name, parentContext ){
            var thisBridge = this;

            thisBridge.defineContext( parentContext, {
                logger: getLogger( '[bridge:' + name + ']' )
            } );

            thisBridge.name = name;

            thisBridge.id = '<#' + thisBridge.name + 'Bridge:' +  ++uuid  + '>';
            thisBridge.listeners = {};
            thisBridge.queue = [];
            thisBridge.output = new EventChannel( {
                eventTarget: thisBridge
            } );
            thisBridge.downstreamOutput = new EventChannel( {
                eventTarget: thisBridge
            } );
            thisBridge.__enabled = false;
            thisBridge.eventUnlisteners = [];

            // Collect events while disabled
            var outOutput = thisBridge.output.asEventStream(),
                outUnValue = outOutput.onValue( function( event ){
                    // Only collect if disabled and collection not forced
                    if( thisBridge.__enabled && !thisBridge.queueOutput ){ return; }
                    // Push events to queue
                    thisBridge.queue.push( event );
                } );

            outOutput.onEnd( outUnValue );

            Object.defineProperty( thisBridge, 'enabled', {
                get: function(){
                    return thisBridge.__enabled;
                },
                enumerable: true
            } );

            perf.count.call( { id: thisBridge.id, ref: thisBridge }, 'blue/reactiveBridge', 'create', thisBridge.name );
        };

    Bridge.prototype = Object.create( null );

    Bridge.prototype.constructor = Bridge;

    Bridge.prototype._makeEventDataCallback = function(){ return undefined; };

    /**
     * Composes a bridge instance from a base bridge instance and a webspec.
     * @function module:blue-view-ractive.Bridge#define
     * @param {object} spec Web spec bridge configuration
     * @param {object|function} definition Application bridge module
     */
    Bridge.prototype.define = function( spec, definition ){
        var thisBridge = this;
        definition = definition || {};
        compose( thisBridge, definition );
        // BLUEJS-1782 - add internal version setting
        thisBridge.spec = merge( { bindings: { v: {} }, triggers: {} }, spec );
    };

    /**
     * Create data change callbacks and bind them to either the view model, the bridge's
     * input channel from the component, or both. The callbacks will be executed as directed
     * by the web spec in order to keep the component and view models in synch.
     * @function module:blue-view-ractive.Bridge#createBinding
     * @param {external:string} target Model property name
     */
    Bridge.prototype.createBinding = function( target ){
        var propName,
            thisBridge = this,
            mapping = thisBridge.spec.bindings[ target ];

        if( !is.plainObject( mapping ) ){
            throw new TypeError( 'The mapping for target "' + target + '" is not valid' );
        }

        // Apply default direction if not defined
        mapping.direction = ( mapping.direction || 'DOWNSTREAM' ).toUpperCase();

        // assign mapping field if not defined
        mapping.field = propName = mapping.field || target;

        if( upstream[ mapping.direction ] ){
            // Ractive will manage its own observers and bindings
            // Make the observe calls as specific as possible!
            thisBridge.eventUnlisteners.push( thisBridge.view.rtemplate.observe( propName, function( newValue, oldValue, keypath ){
                if( !thisBridge._fromComp && newValue !== oldValue ){
                    thisBridge.output.emit( 'binding', {
                        value: parseKeyPath( keypath ),
                        data: newValue
                    } );
                }
            } ).cancel );
            if( is.undefined( thisBridge.view.model[ propName ] ) ||
                thisBridge.view.model[ propName ] === null ||
                is.array( thisBridge.view.model[ propName ] ) ||
                is.plainObject( thisBridge.view.model[ propName ] )
            ){
                // watch for changes in children
                thisBridge.eventUnlisteners.push( thisBridge.view.rtemplate.observe( propName + '.*', function( newValue, oldValue, keypath ){
                    var model = thisBridge.view.model[ propName ];
                    if( !thisBridge._fromComp && ( is.array( model ) || is.plainObject( model ) ) && newValue !== oldValue ){
                        thisBridge.output.emit( 'binding', {
                            value: parseKeyPath( keypath ),
                            data: newValue
                        } );
                    }
                } ).cancel );
                // watch for changes in grandchildren
                thisBridge.eventUnlisteners.push( thisBridge.view.rtemplate.observe( propName + '.*.*', function( newValue, oldValue, keypath ){
                    var model = thisBridge.view.model[ propName ];
                    if( !thisBridge._fromComp && is.array( model ) && is.plainObject( model[ 0 ] ) && newValue !== oldValue ){
                        thisBridge.output.emit( 'binding', {
                            value: parseKeyPath( keypath ),
                            data: newValue
                        } );
                    }
                } ).cancel );
            }
        }
    };

    /**
     * Create callback function to execute in response to event triggered by either Ractive's teamplate
     * or explicitly in view code. The event callback is defined in the web spec; this function sets up
     * the callback function according to the web spec's configuration: either a local view function
     * will be executed, or else a signal will be sent to the component to execute a function there.
     * @function module:blue-view-ractive.Bridge#createTrigger
     * @param {external:string} target Name of action
     */
    Bridge.prototype.createTrigger = function( target ){
        var thisBridge = this,
            mapping = thisBridge.spec.triggers[ target ] || {},
            action = mapping.action || target || '',
            actionList = [],
            actionParts = [],
            actionObject = '',
            actionMethod = '',
            targetParts = [],
            eventType = '',
            targetName = '',
            suspend = false,
            throttled = false,
            processEvent = function( data, action, actionObject, actionMethod, eventType, targetName ){
                var triggerEvent, args;

                if( suspend ){ return false; }
                if( throttled ){ return false; } // BLUEJS-5810 - add throttle setting to trigger

                if( mapping.suspend ){
                    suspend = true;
                    setTimeout( function(){ suspend = false; }, mapping.suspend );
                }

                // BLUEJS-5810 - add event throttling config to webspec
                if( typeof mapping.throttle === 'number' ){
                    throttled = true;
                    setTimeout( function(){
                        throttled = false;
                    }, mapping.throttle );
                }

                // BLUEJS-5588
                data.nonCustomerEvent = !thisBridge.view.root._userEventRunning;

                if( mapping.args ){
                    args = makeEventData( data, thisBridge.view.model, mapping.args );
                    args.push( data );
                }

                // BLUEJS-3634 - domEvent may be undefined if event was artificially
                // triggered by view code, causing errors here. These features are
                // not needed in that situation, so skip if domEvent not defined
                if( data.domEvent ){
                    // check trigger preference
                    if( 'preventDefault' in mapping ){
                        mapping.preventDefault && data.domEvent.preventDefault();
                        // check spec default
                    } else if( thisBridge.spec.preventDefault ){
                        data.domEvent.preventDefault();
                    }

                    // check trigger preference
                    if( 'stopPropagation' in mapping ){
                        mapping.stopPropagation && data.domEvent.stopPropagation();
                        // check spec default
                    } else if( thisBridge.spec.stopPropagation ){
                        data.domEvent.stopPropagation();
                    }
                }

                // Allow Trigger to call for function execution on component, bridge, or view
                // by specifying an action like "bridge.someFn", "view.otherFn". The default
                // execution context is component if none is specified (action: 'someFn').
                if( actionObject === 'component' ){
                    triggerEvent = new Event( data.domEvent, {
                        type: 'trigger',
                        value: action,
                        data: args ? args : [ data ]
                    } );
                    // trigger component actions
                    thisBridge.output.emit( triggerEvent );
                } else if(
                    actionObject === 'view' &&
                    thisBridge.view[ actionMethod ] &&
                    thisBridge.view[ actionMethod ].constructor === Function &&
                    // hack to filter duplication of the framework onReady functionality
                    ( actionMethod !== 'onReady' || targetName !== 'render' )
                ){
                    thisBridge.view[ actionMethod ].apply( thisBridge.view, args ? args : [ data ] );
                }

                if( targetName === 'render' ){
                    return false;
                }
            };

        actionList = Array.isArray( action ) ? action.concat() : [ action ];
        actionList.forEach( function( thisAction ){
            var actionParts = thisAction.split( '.' ),
                actionObject = actionParts[ 1 ] ? actionParts[ 0 ] : 'component',
                actionMethod = actionParts[ 1 ] ? actionParts[ 1 ] : actionParts[ 0 ],
                targetParts = target.split( ':' ),
                eventType = targetParts[ 1 ] || '',
                targetName = targetParts[ 0 ],
                rAction = {};

            if( !actionMethod ){
                throw new TypeError( 'The mapping for target "' + target + '" is not valid' );
            }

            if( eventType && ( targetName === 'window' || targetName === 'document' ) ){
                thisBridge.eventUnlisteners.push( domEventsChannel.on( function( e ){
                    var val;
                    if(
                        e.type === eventType &&
                        (
                            e.target === document && targetName === 'document' ||
                            e.target === window && targetName === 'window'
                        )
                    ){
                        // BLUEJS-5588
                        thisBridge.view.root._userEventRunning = true;

                        val = processEvent( {
                            dataPath: null,
                            context: merge( {}, thisBridge.view.model ), // clean up magic-mode ractive data and send plain object
                            domEvent: e.originalEvent
                        }, thisAction, actionObject, actionMethod, eventType, targetName );

                        // BLUEJS-5588
                        thisBridge.view.root._userEventRunning = false;

                        return val;
                    }
                } ) );
            } else {
                rAction[ '*.' + targetName ] = rAction[ targetName ] = function( e ){
                    var data, val;
                    // JIRA BLUEJS-631 - preserve bluejs event and pass through
                    if( e && e.context && e.domEvent ){
                        data = e;
                    } else {
                        data = e ? {
                            // isolate context
                            context: e.context ? merge( {}, e.context ) : e,
                            // calculate dataPath
                            dataPath: parseKeyPath( e.keypath ),
                            // provide original dom event...
                            // todo: clean up or deprecate this
                            domEvent: e.original
                        } : {};
                    }
                    if( !eventType || data.domEvent && data.domEvent.type === eventType ){
                        // BLUEJS-5588
                        if( data.domEvent ){
                            thisBridge.view.root._userEventRunning = true;
                        }

                        val = processEvent( data, thisAction, actionObject, actionMethod, eventType, targetName );

                        // BLUEJS-5588
                        if( data.domEvent ){
                            thisBridge.view.root._userEventRunning = false;
                        }

                        return val;
                    }
                };

                if( is.defined( thisBridge.view.rtemplate ) && is.defined( thisBridge.view.rtemplate.on ) ){
                    if( targetName === 'teardown' ){
                        thisBridge.eventUnlisteners.push( thisBridge.view.rtemplate.on( 'teardown', rAction.teardown ).cancel );
                    } else {
                        thisBridge.eventUnlisteners.push( thisBridge.view.rtemplate.on( rAction ).cancel );
                    }
                    if( thisBridge.view._rendered && rAction.render && is.function( rAction.render ) ){
                        rAction.render.call( thisBridge );
                    }
                } else if( is.defined( thisBridge.view.rtemplate ) ){
                    thisBridge.view.rtemplate._triggers = thisBridge.view.rtemplate._triggers ? thisBridge.view.rtemplate._triggers : [];
                    thisBridge.view.rtemplate._triggers.push( { 'event': targetName, 'action': rAction } );
                }
            }
        } );
    };

    /**
     * To make the web spec less verbose, data bindings that are defined in the
     * component spec but missing in the web spec will be auto-populated into the web spec as defaults.
     * If only some bindings are defined in the web spec, then no changes to the web spec
     * will be made since it is assumed the web spec intends to only consume a subset of the component
     * spec. If the bindings section is empty, however, then that section will be
     * auto-filled with configurations from the component spec.
     * By default, data bindings are mapped as DOWNSTREAM.
     * @function module:blue-view-ractive.Bridge#addComponentSpecData
     * @param {object} props The "data" section of the component spec
     */
    Bridge.prototype.addComponentSpecData = function( props ){
        var thisBridge = this;
        if(
            !props ||

                !thisBridge.spec.defaultBindings &&
                Object.keys( thisBridge.spec.bindings || {} ).length > ( thisBridge.spec.bindings.v ? 1 : 0 )

        ){
            return;
        }
        // append default component spec bindings if the web spec bindings are empty
        // or they are explicitly asked for via the defaults flag
        thisBridge.spec.bindings || ( thisBridge.spec.bindings = {} );
        Object.getOwnPropertyNames( props ).forEach( function( prop ){
            thisBridge.spec.bindings[ prop ] || (
                thisBridge.spec.bindings[ prop ] = { direction: 'DOWNSTREAM' }
            );
        } );
    };

    /**
     * To make the web spec less verbose, data bindings that are defined in the
     * component spec but missing in the web spec will be auto-populated into the web spec as defaults.
     * If only some bindings are defined in the web spec, then no changes to the web spec
     * will be made since it is assumed the web spec intends to only consume a subset of the component
     * spec. If the bindings section is empty, however, then that section will be
     * auto-filled with configurations from the component spec.
     * By default, data bindings are mapped as DOWNSTREAM.
     * @function module:blue-view-ractive.Bridge#addComponentSpecSettings
     * @param {object} settings The "settings" section of the component spec
     */
    Bridge.prototype.addComponentSpecSettings = function( settings ){
        var thisBridge = this;
        if( !settings ){ return; }
        thisBridge.spec.bindings || ( thisBridge.spec.bindings = {} );
        Object.getOwnPropertyNames( settings ).forEach( function( settingKey ){
            // reject _init key added by component initialization
            if( settingKey === '_init' ){ return; }
            thisBridge.spec.bindings[ settingKey ] || (
                thisBridge.spec.bindings[ settingKey ] = { direction: 'DOWNSTREAM' }
            );
        } );
    };

    /**
     * To make the web spec less verbose, trigger actions that are defined in the
     * component spec but missing in the web spec will be auto-populated into the web spec as defaults.
     * If only some triggers are defined in the web spec, then no changes to the web spec
     * will be made since it is assumed the web spec intends to only consume a subset of the component
     * spec. If the triggers section is empty, however, then that section will be
     * auto-filled with configurations from the component spec.
     * By default, trigger actions are mapped to execution in the component.
     * @function module:blue-view-ractive.Bridge#addComponentSpecActions
     * @param {object} actions The "actions" section of the component spec
     */
    Bridge.prototype.addComponentSpecActions = function( actions ){
        var thisBridge = this;
        if( !actions ){ return; }
        // append default component spec actions
        thisBridge.spec.triggers || ( thisBridge.spec.triggers = {} );
        Object.keys( actions ).forEach( function( action ){
            thisBridge.spec.triggers[ action ] || (
                thisBridge.spec.triggers[ action ] = {
                    action: action,
                    preventDefault: thisBridge.spec.preventDefault || false,
                    stopPropagation: thisBridge.spec.stopPropagation || false
                }
            );
        } );
    };

    /**
     * Shuts down all activity in the bridge related to observed activity like data changes and signals from
     * the component. All listeners are shut down, and the bridge's input and output channels are deleted.
     * @function module:blue-view-ractive.Bridge#disable
     */
    Bridge.prototype.disable = function(){
        var fn, unlisteners,
            thisBridge = this;

        if( thisBridge.__enabled ){
            thisBridge.__enabled = false;

            perf.count.call( { id: thisBridge.id }, 'blue/reactiveBridge', 'destroy', thisBridge.name );


            // Only shut down component when top level view is destroyed. Sub views all may have
            // direct ties to component through their bridges, would not want to disable it multiple
            // times for just one view destroy operation.
            thisBridge.view.parent ||  thisBridge.output && thisBridge.output.emit( 'destroy' );

            thisBridge.output && thisBridge.output.destroy();

            // If a secondary input was piped into the main input, undo that connection
            thisBridge.pipedInputUnplugger && thisBridge.pipedInputUnplugger();

            unlisteners = flatten( thisBridge.eventUnlisteners );
            while( fn = unlisteners.pop() || unlisteners.length ){
                if( is.function( fn ) ){
                    fn();
                } else {
                    logger.warn( '[' + thisBridge.view.context.getStack() + ']', 'Bridge disable - unexpected non-function found in eventUnlisteners array for ' + thisBridge.view.viewName );
                }
            }

            // TODO Should we emit "destroy" as well?
            thisBridge.downstreamOutput && thisBridge.downstreamOutput.destroy();

            thisBridge.listeners = {};
            thisBridge.context && thisBridge.destroyContext();

            // cleanups
            delete thisBridge.input;
            delete thisBridge.output;
            delete thisBridge.eventUnlisteners;
            delete thisBridge.spec;
            delete thisBridge.view;
        }
    };

    /**
     * Attaches a bridge to a new component and component channel. Typically used in the case of
     * an already live Page view being bound to a component once the Application side has been
     * created. In that case, the Page view likely had a dummy bridge but will need to bind to the
     * component and communicate normally.
     * @function module:blue-view-ractive.Bridge#reBind
     * @param {module:blue/event/channel/component} input Component's "output" channel
     * @param {object} specData The "data" section from the component's spec
     * @param {object} settings The "settings" section from the component's spec
     * @param {object} actions The "actions" section from the component's spec
     */
    Bridge.prototype.reBind = function( input, specData, settings, actions ){
        // Disabled this code - I don't think we should do this unless lots of additional tracking
        // is added. The existing listeners may be a mix of standard data and state listeners along
        // with local listeners created in the view. The standard listeners can be unbound and re-attached,
        // but the local listeners cannot. Instead, we only use the normal process of filling the spec with
        // default data and action entries when the bridge is not yet enabled, at which point it should be
        // safe to do so without risk of doubling the listeners. Once the bridge has been enabled,
        // we don't add anything new, we only pipe the new component output channel into the bridge's
        // existing input channel.
        //
        // var unlisteners = flatten( this.eventUnlisteners );
        // while ( fn = unlisteners.pop() || unlisteners.length ) {
        // 	if ( is[ 'function' ]( fn ) ) {
        // 		fn();
        // 	} else {
        // 		logger.warn('[' + this.view.context.getStack() + ']', 'Bridge disable - unexpected non-function found in eventUnlisteners array for ' + this.view.viewName );
        // 	}
        // }
        // this.listeners = {};

        if( this.input ){
            // If bridge is already enabled with an input, we don't want to forget all the listeners already applied
            // to this input. When a new input is to be bound, plug the new input into the existing one so the
            // existing listeners will receive all events coming across on new input.
            this.pipedInputUnplugger = this.input.plug( input.asEventStream() );
        } else {
            this.addComponentSpecData( specData );
            this.addComponentSpecSettings( settings );
            this.addComponentSpecActions( actions );
            this.enable( input );
        }
    };

    /**
     * Attach the component's output channel to the bridge as "input". Create listeners for messages
     * that arrive from the component.
     * @function blue-view-ractive.Bridge#enable
     * @param {module:blue/event/channel/component} input Event channel bringing events from the component
     */
    Bridge.prototype.enable = function( input ){
        var updateId, // batch update timeout id
            updateRootMap = {}, // track each batch update root properties
            updateRootMapAll = {}, // track all unapplied batch update root properties
            updateMap = {}, // batch update store
            updateArray = [ updateMap ];

        var thisBridge = this,
            ds = {};

        thisBridge.input = input;

        if( is.plainObject( thisBridge.spec ) ){
            // Bindings
            // Do not configure data bindings for sub-view bridges
            if( thisBridge.view.isRoot() && is.plainObject( thisBridge.spec.bindings ) && is.defined( thisBridge.view.rtemplate.observe ) ){
                // UPSTREAM binding
                Object.keys( thisBridge.spec.bindings ).forEach( thisBridge.createBinding, thisBridge );

                // DOWNSTREAM binding

                // tell component what we are listening for
                Object.keys( thisBridge.spec.bindings ).forEach( function( key ){
                    downstream[ thisBridge.spec.bindings[ key ].direction ] && ( ds[ key ] = true );
                } );
                thisBridge.output.emit( 'init', { downstream: ds } );

                // apply default batchUpdate value
                thisBridge.spec.batchUpdate =
                    'batchUpdate' in thisBridge.spec
                        ? thisBridge.spec.batchUpdate
                        : config.batchUpdateDefault;

                // listen for component data changes
                thisBridge.on( 'data/*', function( event ){
                    var value, rootTarget,
                        target = event.value,
                        bindings = thisBridge.spec.bindings[ target ] || {},
                        direction = bindings.direction,
                        obj = {};

                    // should this flow downstream
                    if( !downstream[ direction ] ){ return; }
                    // do we need deepEquals here? === may suffice
                    if( !updateRootMapAll[ target ] && deepEquals( event.current, thisBridge.view.model[ target ] ) ){ return; }

                    // get value and root target property
                    if( event.path ){
                        // rebuild this part of the original data model so the full data path is valid
                        obj[ target ] = event.current;
                        value = ptk.get( obj, event.path );
                        rootTarget = event.path.split( '.' )[ 0 ];
                    } else {
                        value = event.current;
                        rootTarget = target;
                    }

                    // check for batch data change support
                    if( thisBridge.spec.batchUpdate ){
                        // check for batch property conflict
                        if( updateRootMap[ rootTarget ] ){
                            // start new batch
                            updateRootMap = {};
                            updateMap = {};
                            updateArray.push( updateMap );
                        }
                        // track batch changes
                        updateRootMap[ rootTarget ] = updateRootMapAll[ rootTarget ] = true;
                        updateMap[ event.path || target ] = value;
                        // create timeout if one doesn't exists
                        updateId =
                            updateId ||
                            setTimeout( function(){
                                thisBridge._fromComp = true;
                                // apply batch data changes
                                updateArray.forEach( function( map, index ){
                                    var done = perf.count.call(
                                        { bucket: 'render' },
                                        'blue-view-ractive/bridge',
                                        'batch',
                                        thisBridge.spec.name || thisBridge.name,
                                        index,
                                        Object.keys( map ).length
                                    );
                                    // reverse object property order to account for ractive apply ordering
                                    var rMap = reverseMap( map );
                                    try {
                                        // apply batched data to view model
                                        thisBridge.view.rtemplate.set( rMap );
                                    } catch ( ex ){
                                        logger.error(
                                            'Exception thrown when calling rtemplate.set for ' + ( thisBridge.spec.name || thisBridge.name ),
                                            ex
                                        );
                                    }
                                    done();
                                } );
                                // reset flags
                                updateRootMap = {};
                                updateRootMapAll = {};
                                updateMap = {};
                                updateArray = [ updateMap ];
                                updateId = 0;
                                delete thisBridge._fromComp;
                            }, 0 );
                    } else {
                        // apply data change
                        thisBridge._fromComp = true;
                        thisBridge.view.rtemplate.set( event.path || target, value );
                        delete thisBridge._fromComp;
                    }
                    perf.count( 'blue/reactiveBridge', 'change', thisBridge.name, event.path || target );
                } );

                // support reset of view data
                thisBridge.on( 'reset/data', function( event ){
                    var prop,
                        map = {},
                        bindings = thisBridge.spec.bindings,
                        data = event.current;
                    thisBridge._fromComp = true;
                    // every downstream property should be initialized from the reset data
                    for( prop in bindings ){
                        if( downstream[ bindings[ prop ].direction ] ){
                            map[ prop ] = data[ prop ];
                        }
                    }
                    // apply all changes at once
                    thisBridge.view.rtemplate.set( map );
                    delete thisBridge._fromComp;
                    perf.count( 'blue/reactiveBridge', 'reset', thisBridge.name );
                } );
            }

            // Triggers
            is.plainObject( thisBridge.spec.triggers ) && Object.keys( thisBridge.spec.triggers ).forEach( function( target ){
                // console.info( 'creating trigger for:', target );
                thisBridge.createTrigger( target );
            } );

            // If no render callback is defined in webspec, set up a default handler
            if( !thisBridge.spec.triggers.render ){
                var renderAction = { 'render': function(){
                    // default empty function for render event which prevents this
                    // event from bubbling to parents
                    return false;
                }
                };
                if( is.defined( thisBridge.view.rtemplate ) && is.defined( thisBridge.view.rtemplate.on ) ){
                    thisBridge.eventUnlisteners.push( thisBridge.view.rtemplate.on( renderAction ).cancel );
                }
                if( is.defined( thisBridge.view.rtemplate ) ){
                    thisBridge.view.rtemplate._triggers = thisBridge.view.rtemplate._triggers ? thisBridge.view.rtemplate._triggers : [];
                    thisBridge.view.rtemplate._triggers.push( { 'event': 'render', 'action': renderAction } );
                }
            }
        }

        var eventTypes = Object.keys( thisBridge.listeners ),
            callbacks;

        eventTypes.length && eventTypes.forEach( function( eventType ){
            callbacks = thisBridge.listeners[ eventType ];

            callbacks.forEach( function( callback ){
                thisBridge.on( eventType, callback );
            } );

            callbacks.clear();
        } );

        thisBridge.listeners = {};

        if( thisBridge.view.isRoot() ){
            thisBridge.on( 'componentInputReady', function(){
                thisBridge.queueOutput = false; // Remove instruction to queue output after messages have been flushed
                while( thisBridge.queue.length ){
                    var item = thisBridge.queue.shift();
                    if( item.type === 'binding' ){ continue; }
                    thisBridge.output.emit( item );
                }
            } );
        }

        // Plug each sub-view bridge output into the top-level bridge so each bridge
        // sends messages directly to component
        // JIRA-766 - added checks to make sure root hasn't been disabled/destroyed in the meantime
        if( !thisBridge.view.isRoot() ){
            // Collect events while disabled
            var outOutput = thisBridge.output.asEventStream(),
                outUnValue = outOutput.onValue( function( event ){
                    var rootBridge = thisBridge.root;
                    logger.warn( '[' + thisBridge.view.context.getStack() + ']', 'DEPRECATED:BLUEJS-2297: Subview communicating directly to component' );
                    rootBridge && rootBridge.__enabled && thisBridge.output.emit.call( thisBridge.root.output, event );
                } );
            outOutput.onEnd( outUnValue );
        }

        // Receive "destroy" instruction from component and apply it to view
        thisBridge.on( 'destroyView', function( msg ){
            var done = thisBridge.__enabled ? reqNodeDictionary.destroyView( thisBridge.view ) : Promise.resolve();
            done.catch( function(){} ).then( function(){
                msg.compDestroyResolve && msg.compDestroyResolve();
            } );
        } );

        thisBridge.__enabled = true;
    };

    /**
     * @description Subscribe to events on the component's local Channel. Events on the
     *              local channel are not visible to other components or the main
     *              ComponentChannel.
     * @function module:blue-view-ractive.Bridge#on
     * @param {tring|object} [eventType] The type of event.
     * @param {function} [callback] The callback to execute when the event is published.
     * @example
     * // Execute callback for ALL events on the component (no eventType given)
     * myComponent.on(function(event){
     *     // Analyze, log, etc the event
     * });
     *
     * // Execute callback for a component-generated event
     * // Format of eventType is ACTION/VALUE
     * // ACTION - function call, state change, etc on the component
     * // VALUE - name of action, property name, etc.
     *
     * // Note: TARGET is automatically prepended to the eventType and
     * //       is equal to the name of the component as defined in the spec
     * myComponent.on('action/submit', function(event){
     *     // Execute logic for the submit action on the component
     * });
     *
     * // Subscribe to multiple events
     * myComponent.on( {
     *     'action/submit': function(submitEvent){
     *         // Business Logic
     *     },
     *     'state/enabled': function(enabledEvent){
     *         // Business Logic
     *     },
     *     'action/requestBalance': function(requestEvent){
     *         // Business Logic
     *     },
     *     'state/valid': function(validEvent){
     *         // Business Logic
     *     }
     * } );
     *
     * // Can use wildcards
     * myComponent.on('action/*', function(actionEvent){
     *     // Logic for all actions on the component
     * } );
     */
    Bridge.prototype.on = function( eventType, callback ){
        var thisBridge = this;
        // #ie8-friendly - since this.enabled is a read-only property that uses defineProperty
        // it is replaced with an equivalent as used inside the this.enabled getter function
        if( is.defined( thisBridge.input ) ){
            // Prepend the name of the current component
            // Dev's format is "action/submit"
            // Internal format is "auth/action/submit"
            if( !is.string( eventType ) && is.object( eventType ) ){
                obj.map( eventType, function( v, k ){
                    var parts = k.split( '/' );
                    var newkey = parts.join( '/' );
                    eventType[ newkey ] = v;
                    delete eventType[ k ];
                } );
            }

            thisBridge.eventUnlisteners.push( thisBridge.input.on( eventType, callback ) );
        } else {
            // Collect listeners
            is.defined( thisBridge.listeners[ eventType ] ) || ( thisBridge.listeners[ eventType ] = new Set() );
            !thisBridge.listeners[ eventType ].has( callback ) && thisBridge.listeners[ eventType ].add( callback );
        }
    };

    /**
     * Creates a new bridge from a web spec, a view, and an application bridge module (optional)
     * @deprecated
     * @function module:blue-view-ractive.Bridge#create
     * @param {object} spec Web spec bridge configuration
     * @param {blue-view-ractive/view} view View instance
     * @param {object|funtion} prototype Application bridge module
     * @returns {blue-vew-ractive/bridge} Bridge instance
     */
    Bridge.prototype.create = function( spec, view, prototype ){
        is.undefined( prototype ) && ( prototype = Object.create( null ) );
        prototype.spec = spec;
        prototype.view = view;

        return declare( Bridge, prototype );
    };

    Bridge = asContextual.call( Bridge, { name: 'bridge' } );

    return Bridge;
} );
