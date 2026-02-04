/**
 * Prototype for the Page object for use in a web browser environment.
 *
 * The Page is the top-level entity in the front-end of the BlueJS architecture. The Page
 * is responsible for receiving output directives from the back-end and rendering that
 * output on a specific platform. It includes listeners for render or display instructions
 * and will emit messages communicating the state and/or result of the render.
 *
 * The web implementation of Page supports multiple view template libraries ("view engines")
 * using an on-demand loader and a simple registry of available and loaded engines.
 *
 * A Page defined in an application may be configured by a module, a WireJS configuration,
 * or a combination of both.
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */
 define( ['require','blue/as/contextual','blue/as/registry','blue/util','../resolver/cav','blue/deferred','blue/dom','blue/event/channel','blue/log','blue/is','../load','../nodeDictionary','blue/queue','blue/resolver/module','blue/root','blue/siteData','emitter-js'],function( require ){
    'use strict';
    var asContextual = require( 'blue/as/contextual' ),
        asRegistry = require( 'blue/as/registry' ),
        clone = require( 'blue/util' ).object.deepClone,
        ComponentAndView = require( '../resolver/cav' ),
        Deferred = require( 'blue/deferred' ),
        dom = require( 'blue/dom' ),
        EventChannel = require( 'blue/event/channel' ),
        getLogger = require( 'blue/log' ),
        is = require( 'blue/is' ),
        load = require( '../load' ),
        NodeDictionary = require( '../nodeDictionary' ),
        Queue = require( 'blue/queue' ),
        Resolver = require( 'blue/resolver/module' ),
        root = require( 'blue/root' ),
        siteData = require( 'blue/siteData' ),
        Emitter = require( 'emitter-js' ).default,
        logger = getLogger( '[blue:view]' ),
        hasPerformance = root.performance && root.performance.now && root.performance.mark,
  
        viewImports = {},
        VIEW_ENGINES = {
            ractive: {
                path: 'blue-view-ractive/view',
                deferred: undefined
            },
            vue: {
                path: 'blue-view-vue/view',
                deferred: undefined
            }
            // hyperhtml: {
            //     path: 'blue-view-hyperhtml/view',
            //     deferred: undefined
            // }
        },
        DEFAULT_VIEW_ENGINE = 'ractive',
  
        trackingConfig,
        trackingSeen = {},
  
        /**
         * Some applications require observation of specific DOM nodes and events that alert when the nodes become visible within the
         * display window, or when the nodes are scrolled (or re-sized) out of view. The term "visible" here is a combination of CSS visibility
         * as well as node geometry relative to the viewport: if more than 50% of the node's bounding block is inside the visible viewport, then
         * the node is "visible".
         * Visibility tracking is performance-intensive so it is therefore optional and only enabled on demand for specific nodes. When needed,
         * tracking is turned on for a node by calling this function, which contains all the math processing and event code in a single package.
         * @function module:blue-view.WebPage~enableVTracking
         * @param {module:blue-core.Context} context
         * @param {external:Object} target This value is not used in the function; it should be removed
         * @param {external:Object} pageConfig Reference to the Page's WireJS configuration which may include settings relevant to visibility tracking
         */
        enableVTracking = function( context, target, pageConfig ){
            var observer, lastCheck, isAive,
  
                defaultSelector = '[trackVisibility]',
  
                // default defaults
                defaultConfig = {
                    alert: 'once',
                    when: 'visible',
                    percent: 50,
                    duration: 0,
                    event: 'blue:dom:visibility',
                    handler: function(){ }
                },
  
                // todo: should this be moved into a utility?
                // recursively build a unique dom selector
                calculateSelector = function( el, nestedPath ){
                    var path = nestedPath ? '>' + nestedPath : '',
                        child = el,
                        cnt = 0;
                    // one of a kind
                    if( el.id ){ return '#' + el.id + path; }
                    // no parent
                    if( !el.parentNode ){ return el.tagName + path; }
                    // list?
                    if( ( el.nextSibling || el.previousSibling || {} ).tagName === el.tagName ){
                        while( child = child.previousSibling ){
                            cnt++;
                        }
                        return calculateSelector( el.parentNode, el.tagName + ':nth-child(' + cnt + ')' + path );
                    }
                    // no list
                    return calculateSelector( el.parentNode, el.tagName + path );
                },
  
                // logger errors on context
                anounceError = function( el, options, msg ){
                    var pageContext = trackingConfig.context;
                    el && el.removeAttribute( 'trackVisibility' );
                    pageContext && logger.error( '[' + pageContext.getStack() + ']', msg + ' [' + options.data + ']' );
                },
  
                // tell view of change
                anounceChange = function( el, options, global ){
                    var container,
                        pageContext = pageConfig.context || {},
                        children = pageContext.children || [],
                        x = children.length,
                        message = {
                            selector: options.selector,
                            isVisibile: options.isVisible,
                            data: options.data
                        };
                    // requested via global selector
                    if( global ){
                        try {
                            trackingConfig.handler( message );
                        } catch ( ex ){
                            anounceError( el, options, ex.message );
                        }
                    }
                    // return if trackVisibility attribute not present on element
                    if( options.default ){ return; }
                    // find the view that contains the visible element
                    while( x-- ){
                        // check if root element of view contains visible element
                        if( !( container = children[ x ].element ) || !container.contains( el ) ){ continue; }
                        // emit event on view context
                        return children[ x ].emit( options.event, message );
                    }
                },
  
                // extract tracking options from element
                getOptions = function( el, config ){
                    var options = el.getAttribute( 'trackVisibility' ) || '{"default": true}';
                    try {
                        options = JSON.parse( options );
                    } catch ( ignore ){
                        anounceError( el, { data: el.id }, 'Unable to parse trackVisibility value' );
                        options = {};
                    }
                    return {
                        alert: options.alert || config.alert,
                        when: options.when || config.when,
                        percent: Math.max( 1, Math.min( 100, options.percent || config.percent ) ),
                        duration: Math.max( options.duration || config.duration ),
                        event: options.event || config.event,
                        isVisible: options.isVisible || false,
                        selector: options.selector || calculateSelector( el ),
                        data: options.data
                    };
                },
  
                // check if element visible
                // eslint-disable-next-line complexity
                isElementVisible = function( el ){
                    var elArea, visArea,
                        rect = el.getBoundingClientRect(),
                        padH = Math.ceil( ( rect.bottom - rect.top ) * 0.1 ),
                        padW = Math.ceil( ( rect.right - rect.left ) * 0.1 ),
                        vWidth = window.innerWidth || document.documentElement.clientWidth,
                        vHeight = window.innerHeight || document.documentElement.clientHeight,
                        efp = function( x, y ){
                            return el.contains( document.elementFromPoint( x, y ) );
                        };
                    // check if any part visible
                    if(
                        rect.top > vHeight ||
                        rect.left > vWidth ||
                        rect.right < 0 ||
                        rect.bottom < 0 || !(
                            // test if any of the element corners are visible
                            // ensure tests are within visible window
                            efp( Math.max( rect.left + padW, 0 ), Math.max( rect.top + padH, 0 ) ) || // top-left
                            efp( Math.min( rect.right - padW, vWidth ), Math.max( rect.top + padH, 0 ) ) || // top-right
                            efp( Math.max( rect.left + padW, 0 ), Math.min( rect.bottom - padH, vHeight ) ) || // bottom-left
                            efp( Math.min( rect.right - padW, vWidth ), Math.min( rect.bottom - padH, vHeight ) )    // bottom-right
                        )
                    ){ return 0; }
  
                    // calculate total element area
                    elArea =
                        ( rect.bottom - rect.top ) *
                        ( rect.right - rect.left );
                    // calculate visible area
                    visArea =
                        ( Math.min( rect.bottom, vHeight ) - Math.max( rect.top, 0 ) ) *
                        ( Math.min( rect.right, vWidth ) - Math.max( rect.left, 0 ) );
                    // return % visible
                    return Math.round( visArea / elArea * 100 );
                },
  
                validateEvent = function( options ){
                    // eslint-disable-next-line default-case
                    switch( options.when ){
                        case 'visible': return options.isVisible;
                        case 'hidden': return !options.isVisible;
                    }
                    return true;
                },
  
                // handle the unique state of each element
                // eslint-disable-next-line complexity
                processItem = function( el, global ){
                    var lastState, percentVisible,
                        options = getOptions( el, trackingConfig );
  
                    if( global && trackingSeen[ options.selector ] ){ return; }
  
                    lastState = options.isVisible;
                    percentVisible = isElementVisible( el );
                    options.isVisible = percentVisible >= options.percent;
  
                    // check duration if moving from hidden -> visible
                    if( options.duration && options.isVisible ){
                        // false or empty then delay
                        if( !lastState ){
                            options.isVisible = Date.now() + options.duration;
                            el.setAttribute( 'trackVisibility', JSON.stringify( options ) );
                            return setTimeout( function(){ processItem( el, global ); }, options.duration );
                        }
                        // number > now then wait
                        if( lastState.constructor === Number && lastState > Date.now() ){
                            return;
                        }
                    }
  
  
                    switch( options.alert ){
                        case 'once':
                            // if not requested visible state, just wait
                            if( !validateEvent( options ) ){ return; }
                            // save "seen" flag for globally tracked elements
                            global && ( trackingSeen[ options.selector ] = true );
                            // now that it's visible, remove the attribute to prevent future triggers
                            el.removeAttribute( 'trackVisibility' );
                            break;
                        case 'every':
                            // check for change
                            if( options.isVisible === lastState ){ return; }
                            // save current state so we can check for change next time
                            el.setAttribute( 'trackVisibility', JSON.stringify( options ) );
                            // if not requested visible state, just wait
                            // check for false -> true -> false within duration
                            if(
                                !validateEvent( options ) ||
                                !options.isVisible && lastState.constructor === Number
                            ){ return; }
                            break;
                        default:
                            anounceError( el, options, 'Invalid trackVisibility alert attribute' );
                            return;
                    }
                    anounceChange( el, options, global );
                },
  
                // enable/disable visibility checks on resize/scroll
                setAlive = function( state ){
                    if( state ){
                        root.addEventListener( 'resize', triggerTest, false );
                        root.addEventListener( 'scroll', triggerTest, false );
                    } else {
                        root.removeEventListener( 'resize', triggerTest, false );
                        root.removeEventListener( 'scroll', triggerTest, false );
                    }
                    isAive = state;
                },
  
                // check visibility for all elements with "trackVisibility" attribute
                testVisibility = function( selector, global ){
                    var cnt,
                        items = document.querySelectorAll( selector ),
                        x = cnt = items.length;
                    // check each element's visibility
                    while( x-- ){
                        processItem( items[ x ], global );
                    }
                    return cnt;
                },
  
                // trigger check every 250ms at most
                triggerTest = function(){ // jshint ignore:line
                    if( lastCheck ){ return; }
                    lastCheck = setTimeout( function(){
                        var ms,
                            dtm = Date.now(),
                            cnt =
                                // check for items matching global selector
                                ( trackingConfig.selector ? testVisibility( trackingConfig.selector, true ) : 0 ) +
                                // check for items matching default selector
                                testVisibility( defaultSelector );
                        // perf optimization to only check if elements exist
                        !cnt && isAive && setAlive( false );
                        cnt && !isAive && setAlive( true );
                        lastCheck = undefined;
                        if( ( ms = Date.now() - dtm ) > 50 ){
                            trackingConfig.context && logger.warn( '[' + trackingConfig.context.getStack() + ']', 'Visibility tracking took ' + ms + 'ms to check ' + cnt + ' elements!' );
                        }
                    }, 250 );
                },
  
                // listen for dom changes on window
                addRootListeners = function(){
                    // listen for nodes added to dom
                    if( root.MutationObserver ){
                        // link handler to mutation observer
                        observer = new root.MutationObserver( triggerTest );
                        // tell observer what to listen for
                        observer.observe( dom, { childList: true, subtree: true } );
                    } else {
                        root.addEventListener( 'DOMNodeInserted', triggerTest, false );
                    }
                },
  
                init = function(){
                    // build config object
                    if( pageConfig.constructor !== Object ){
                        pageConfig = {};
                    }
                    Object.keys( defaultConfig ).forEach( function( key ){
                        key in pageConfig || ( pageConfig[ key ] = defaultConfig[ key ] );
                    } );
                    pageConfig.context = context;
                    // only init page listeners once
                    if( !trackingConfig ){ addRootListeners(); }
                    // save config
                    trackingConfig = pageConfig;
                    triggerTest();
                };
  
            init();
        },
  
        /**
         * Normalization function to retrieve the name of the current application. In most cases, the app name
         * is the first segment of the route fragment. When the application first starts up, however, the route
         * may be incomplete or even empty. In this case, the default application name is retrieved from a
         * configuration property.
         * @function module:blue-view.WebPage~getAppName
         * @returns {external:string} application name
         */
        getAppName = function getAppName(){
            var name = '',
                location = dom.location,
                hash = location.hash || '',
                routeParts = hash.replace( '#', '' ).split( '/' );
  
            if( routeParts.length && routeParts[ 0 ] ){
                name = routeParts[ 0 ];
            } else if( root.appRoutes && root.appRoutes[ 0 ] ){
                name = root.appRoutes[ 0 ];
            }
  
            return name;
        },
  
        /**
         * Combines information from component spec, role configuration, and current user type to generate an object map
         * of all actions that are allowed for this user.
         * @function module:blue-view.WebPage~privileges
         * @param {module:blue-app.Component} component
         * @param {external:Object} roledata Object map of configurations for known roles
         * @param {external:string} userType
         * @returns {external:Object} Map of all actions allowed for this user
         */
        privileges = function privileges( component, roledata, userType ){
            var actions = Object.create( null ),
                allTrue = true,
                specdata,
                i, k;
            function add( actionsdata ){
                if( is.defined( actionsdata ) && is.plainObject( actionsdata ) && !!actionsdata && is.defined( actionsdata.actions ) && is.plainObject( actionsdata.actions ) && !!actionsdata.actions ){
                    for( k in actionsdata.actions ){ // jshint ignore:line
                        actions[ k ] = actionsdata.actions[ k ];
                    }
                }
            }
            if( userType.length ){
                specdata = roledata[ component.spec.name ];
                if( is.defined( specdata ) && is.plainObject( specdata ) && !!specdata ){
                    for( i = 0; i < userType.length; i++ ){
                        add( specdata[ userType[ i ] ] );
                    }
                }
            } else {
                // no userType, default user all actions
                add( component.spec );
            }
            for( k in component.spec.actions ){ // jshint ignore:line
                allTrue = allTrue && actions[ k ];
            }
            if( allTrue ){
                actions[ component.spec.name ] = true;
            }
            return actions;
        },
  
        /**
         * The view engine that should be used for a given view is determined by a hierarchy of settings. This function will
         * evaluate those settings and provide the view engine that is appropriate for this case.
         * @function module:blue-view.WebPage~chooseViewEngine
         * @param {external:string} defaultEngine String name of default engine choice
         * @param {module:blue-view/resolver/cav} cav
         * @returns {external:string} view engine name
         */
        chooseViewEngine = function chooseViewEngine( defaultEngine, cav ){
            var viewEngine = cav[ 0 ] && cav[ 0 ].context && cav[ 0 ].context.viewEngine ? cav[ 0 ].context.viewEngine : defaultEngine;
  
            // allow options block from CAV to override all other viewEngine settings
            if( cav[ 1 ] && cav[ 1 ].viewEngine ){
                viewEngine = cav[ 1 ].viewEngine;
            }
            if( cav[ 2 ] && cav[ 2 ].viewEngine ){
                viewEngine = cav[ 2 ].viewEngine;
            }
  
            return viewEngine;
        },
  
        /**
         * An abbreviated CAV constructor for use in cases when a component is to be attached to an already-rendered Page view.
         * A Page's view is never part of a regular CAV, which is only used in a component action. This function constructs a
         * CAV-like object using the Page view and a given component. The resulting object can be used in the regular render
         * process in place of a normal CAV.
         * @function module:blue-view.WebPage~quickCAV
         * @param {module:blue-app.Component} component
         * @param {module:blue-view.View} view Page's view instance
         * @param {external:Object} options
         * @returns {external:Object} CAV-like object with a "resolved" promise that can be used in the normal render pipeline
         */
        quickCAV = function quickCAV( component, view, options ){
            // cavList.push( {
            //     viewInternals: that.pageView.link(),
            //     linkToPage: true,
            //     resolved: Promise.resolve( [ msg.cavList[ 0 ], that.pageView, msg.cavList[ 2 ] || {} ] )
            // } );
            var viewInternals = view.link(),
                spec = component.spec || {};
            options = options || {};
            options.linkToPage = true;
  
            viewInternals.bridge.addComponentSpecData( Object.keys( spec.data || {} ).reduce( function( obj, key ){
                obj[ key ] = 1;
                return obj;
            }, {} ) );
            viewInternals.bridge.addComponentSpecSettings( component.getSettingsValues() );
            viewInternals.bridge.addComponentSpecActions( component.getActionNames() );
            options.viewInternals = viewInternals;
  
            return {
                resolved: Promise.resolve( [ component, view, options ] )
            };
        },
  
        /**
         * When a component is attached to the Page's view, the component's destroy method is disabled to
         * prevent destruction of the view as a side-effect. The instance's destroy method is overloaded
         * with a function that simply warns the developer about the action.
         * If needed, original destroy method can be activated by passing TRUE argument.
         * @function module:blue-view.WebPage~makeUndestroyable
         * @param {module:blue-app.Component} component
         */
        makeUndestroyable = function makeUndestroyable( component ){
            var _destroy = component.destroy;
            component.destroy = function( force ){
                if( force ){
                    return _destroy.call( component );
                }
                return Promise.reject( new Error( 'Warning: Page view\'s component was told to destroy. This component may not be destroyed.' ) );
            };
        },
  
        /**
         * (Web) Page constructor function.
         * @class module:blue-view.WebPage
         * @mixes module:blue-core.asContextual
         * @param {external:string} name
         * @param {module:blue-core.Context} parentContext
         */
        Web = function( name, parentContext ){
            var that = this;
  
            that.name = name;
  
            // Chain Web and Emitter constructors together
            Emitter( that );
  
            that.defineContext( parentContext, {
                name: name,
                pageName: name,
                logger: getLogger( '[Page-' + name + ']' ),
                viewResolver: new Resolver(),
                // Not sure I like screen and node stuff in Application
                screen: Object.create( null, {
                    hasViewAt: {
                        value: NodeDictionary.hasViewAt.bind( NodeDictionary ),
                        enumerable: true
                    },
                    getViewAt: {
                        value: NodeDictionary.getViewAt.bind( NodeDictionary ),
                        enumerable: true
                    }
                } ),
                env: Object.create( parentContext.env || null ),
                pageReady: new Promise( function( resolve){
                    // https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState
                    // https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
                    if( dom.readyState === 'loading' ){
                        dom.addEventListener( 'DOMContentLoaded', resolve );
                    }
                    else {
                        resolve();
                    }
                } )
            } );
  
            // make read only features available to entire site
            Object.defineProperties( that.context.site.env, {
                // isMobile: {
                //     value: (/'android|ios|ipad|phone|mobile|silk|bb10|blackberry|webos'/).test(root.navigator.userAgent.toLowerCase()),
                //     enumerable: true
                // },
                onLine: {
                    get: function(){ return root.navigator.onLine; },
                    enumerable: true
                },
                print: {
                    value: function(){ root.print(); },
                    enumerable: true
                }
            } );
  
            // make read only features available to page
            Object.defineProperties( that.context.env, {
                scrollToTop: {
                    value: function( el ){
                        if( el ){
                            el.scrollTop = 0;
                            el.scrollLeft = 0;
                        } else {
                            root.scrollTo( 0, 0 );
                        }
                    },
                    enumerable: true
                }
            } );
  
            that.tellApp = undefined;
  
            that.context.getViewRegistry = function( engine ){
                return new Promise( function( resolve, reject ){
                    if( VIEW_ENGINES[ engine ] ){
                        VIEW_ENGINES[ engine ].deferred.promise.then( function(){
                            resolve( VIEW_ENGINES[ engine ].registry );
                        } );
                    } else {
                        reject();
                    }
                } );
            };
  
            // eslint-disable-next-line complexity
            that.context.on( 'application:display', function( msg ){
                var cavList = [],
                    viewEngine,
                    contextStack = msg.contextStack,
                    resolverOptions = msg.resolverPathOptions || clone( that.context.viewResolverOptions ) || {};
  
                if( !msg.resolverPathOptions && msg.areaName ){
                    resolverOptions.prefix = resolverOptions.prefix || '';
                    resolverOptions.prefix = resolverOptions.prefix + msg.areaName + '/';
                }
  
                if( !msg.viewEngine ){
                    msg.viewEngine = DEFAULT_VIEW_ENGINE;
                }
  
                if( is.array( msg.cavList ) ){
                    if( is.array( msg.cavList[ 0 ] ) || is.plainObject( msg.cavList[ 0 ] ) ){
                        // We received an array of CAV arrays/config objects
                        msg.cavList.forEach( function( cav ){
                            if( cav[ 1 ] === 'PAGE' && cav[ 0 ] ){
                                // Attach provided component to the Page's view
                                makeUndestroyable( cav[ 0 ] );
                                cavList.push( quickCAV( cav[ 0 ], that.pageView, cav[ 2 ] ) );
                            } else {
                                viewEngine = chooseViewEngine( msg.viewEngine, cav );
                                that.loadViewEngine( viewEngine );
                                cavList.push( new ComponentAndView( that.context, viewEngine, viewImports, cav, contextStack, resolverOptions ) );
                            }
                        }, that );
                    } else {
                        // We received a single CAV array
                        if( msg.cavList[ 1 ] === 'PAGE' && msg.cavList[ 0 ] ){
                            // Attach provided component to the Page's view
                            makeUndestroyable( msg.cavList[ 0 ] );
                            cavList.push( quickCAV( msg.cavList[ 0 ], that.pageView, msg.cavList[ 2 ] ) );
                        } else {
                            viewEngine = chooseViewEngine( msg.viewEngine, msg.cavList );
                            that.loadViewEngine( viewEngine );
                            cavList.push( new ComponentAndView( that.context, viewEngine, viewImports, msg.cavList, contextStack, resolverOptions ) );
                        }
                    }
                } else if( is.plainObject( msg.cavList ) ){
                    // We received a single CAV config object
                    cavList.push( new ComponentAndView( that.context, msg.viewEngine, viewImports, msg.cavList, contextStack, resolverOptions ) );
                }
  
                if( !cavList.length ){
                    // BLUEJS-3600 - add new route events
                    that.context.emit( 'blue:route:viewRenderComplete', {
                        msgType: 'blue:route:viewRenderComplete',
                        id: msg.routeId,
                        displayReqId: msg.displayReqId,
                        contextPath: msg.contextStack,
                        cavList: '',
                        timestamp: hasPerformance ? performance.now() : 0,
                        name: 'blue:route:viewRenderComplete view ' + msg.contextStack + ' ' + msg.displayReqId
                    } );
  
                    msg.resolve && msg.resolve();
                }
  
                that.insertComponentView( msg.controllerAction, cavList, msg.activityChannel ).then(
                    function( cavNames ){
                        // BLUEJS-3600 - add new route events
                        that.context.emit( 'blue:route:viewRenderComplete', {
                            msgType: 'blue:route:viewRenderComplete',
                            id: msg.routeId,
                            displayReqId: msg.displayReqId,
                            contextPath: msg.contextStack,
                            cavList: cavNames,
                            timestamp: hasPerformance ? performance.now() : 0,
                            name: 'blue:route:viewRenderComplete view ' + msg.contextStack + ' ' + msg.displayReqId
                        } );
  
                        msg.resolve && msg.resolve();
                    },
                    function( err ){
                        // BLUEJS-3600 - add new route events
                        that.context.emit( 'blue:route:viewRenderComplete', {
                            msgType: 'blue:route:viewRenderComplete',
                            id: msg.routeId,
                            displayReqId: msg.displayReqId,
                            contextPath: msg.contextStack,
                            cavList: '',
                            timestamp: hasPerformance ? performance.now() : 0,
                            name: 'blue:route:viewRenderComplete view ' + msg.contextStack + ' ' + msg.displayReqId
                        } );
  
                        msg.reject && msg.reject( err );
                    } );
            } );
  
            that.context.on( 'application:ready', function(){
                that.context.on( 'page:error', function( msg ){
                    that.tellApp( 'page:error', msg );
                } );
  
                // BLUEJS-3600 - add new route events
                that.context.on( 'blue:route:viewRenderComplete', function( msg ){
                    that.tellApp( msg.msgType, msg );
                } );
            } );
  
            // Receive request to register a view with context stack, view name, and view path.
            // This "registration" is made on a private index of imported views - they are treated specially by the CAV factory. This
            // private index will associate this view name, when requested in this execution context, to a custom require path, bypassing
            // the typical viewResolverOptions construct.
            that.context.on( 'importer:registerView', function( msg ){
                var registeredName = msg.contextStack + '/' + msg.viewName;
  
                // Can't register the view in advance since registry will not work as a factory, will return this
                // module every time it's referenced, causing view instances to be shared between multiple components
                // that.context.viewResolver.registry.registerView( registeredName, that.context.viewResolver.createId( msg.viewPath, {} ), true );
  
                // Workaround for above problem...
                viewImports[ registeredName ] = msg.viewPath;
            } );
  
            that.clearSelectorsConfig = null;
            that.context.on( 'clearSelectors', function(){ that.clearSelectors(); } );
  
            this.constructorLegacyCallback.call( this );
        };
  
    Web.prototype = Object.create( Emitter.prototype );
  
    Web.prototype.constructor = Web;
  
    Web.prototype.constructorLegacyCallback = function(){};
  
    /**
     * Destroy the Page
     * @function module:blue-view.WebPage#destroy
     */
    Web.prototype.destroy = function(){
        trackingConfig = undefined;
        // Trigger onDestroy handler if present and call destroy on top of the Emitter prototype to fully destroy
        if( is.function( this.onDestroy ) ){ this.onDestroy(); }
        Emitter.prototype.destroy.call( this );
        // todo: remove mutation watcher if there are no remaining targets
        this.destroyContext();
    };
  
    /**
     * Construct a useful name for this view by combining the view's component context stack name with the view's name
     * @function module:blue-view.WebPage~cavToNameString
     * @param {module:blue-app.Component} component
     * @param {module:blue-view.View} view
     * @returns {external:string} CAV name
     */
    function cavToNameString( component, view ){
        var compName = component && component.context ? component.context.getStack() : '',
            viewName = view ? view.name : '';
        return compName + '+' + viewName;
    }
  
    /**
     * Download (if necessary) and load a new view template engine into memory. Store the Promise from the request in the
     * VIEW_ENGINES map for use by the rendering pipeline.
     * Code will safely short-circuit if this view engine is already loaded.
     * @function module:blue-view.WebPage#loadViewEngine
     * @param {external:string} engine View engine name
     */
    Web.prototype.loadViewEngine = function( engine ){
        var that = this;
        if( engine && VIEW_ENGINES[ engine ] ){
            if( !VIEW_ENGINES[ engine ].deferred ){
                VIEW_ENGINES[ engine ].deferred = new Deferred();
                root.requirejs( [ VIEW_ENGINES[ engine ].path ], function( engineModule ){
                    VIEW_ENGINES[ engine ].deferred.resolve( engineModule );
                    asRegistry.call( VIEW_ENGINES[ engine ], 'view', engineModule, { 'lazy': true, 'noCache': true } );
                    // Use Page's context as parent context for all constructed views
                    VIEW_ENGINES[ engine ].defineViewsRegistry( that.context );
                }, function( e ){
                    context.error( e );
                } );
            }
        } else {
            // throw error here
        }
    };
  
    function findComponentsInDom( target ){
        var searchScope = target || dom,
            nodeList, attr, parts,
            componentList = [];
        
        if( is.string( target ) ){
            searchScope = dom.querySelector( target );
        }
        nodeList = ( searchScope && searchScope.querySelectorAll('[data-component-name]') ) || [];        
        componentList = Array.prototype.map.call( nodeList, function( node ){
            attr = node.getAttribute( 'data-component-name' );
            parts = attr.split( '|' );
            // return parts[ 0 ] === controllerName && parts[ 1 ] === componentName;
            return parts[ 3 ];
        } );
        return componentList;
    }
  
    /**
     * The primary render pipeline function. For each CAV in a list, wait for the CAV to be "resolved", then attach component
     * and view (bridge) channels to one another, and render the view to the target node in the DOM. Return a Promise that indicates
     * when all CAVs in the list have been rendered and all component-view pairs are bound together with live channels.
     * @function module:blue-view.WebPage#insertComponentView
     * @param {external:string} controllerAction Name of controller action that generated this render request
     * @param {array} cavList Array of CAVs to render
     * @param {module:blue/event/channel/component} activityChannel Global component channel used by analytics
     * @returns {external:Promise} Promise that is resolved when all CAVs in the cavList have been rendered and signalled "ready"
     */
    Web.prototype.insertComponentView = function( controllerAction, cavList, activityChannel /* , allDone */ ){
        var that = this,
            cavListPromise, cavPromiseAry, cavCount, cavListDone, cavListFinish, cavListReject,
            cavListNames = [];
  
        cavPromiseAry = cavList.map( function( cav ){
            // Action error may have resulted in "undefined" cav
            if( cav ){
                return cav.resolved;
            }
        } );
        cavListPromise = Promise.all( cavPromiseAry );
        cavCount = cavPromiseAry.length;
  
        cavListDone = new Promise( function( resolve, reject ){
            cavListFinish = resolve;
            cavListReject = reject;
        } );
  
        cavListPromise.then( function( cavs ){
            var cavsQ = new Queue( 'sync' );
            cavs.forEach( function( args, cavsIdx ){
                // eslint-disable-next-line complexity
                cavsQ.add( function( done ){
                    var target,
                        component = args[ 0 ],
                        view = args[ 1 ],
                        options = args[ 2 ],
                        thisContext = component && component.context || {},
                        baseModel = {},
                        componentsInTarget = [];
  
                    var bindCAV = function(){
                            var stream, unplug, channel;
                            if( component ){
                            // Test to make sure component has not been immediately destroyed - do not continue with
                            // view render if component is gone
                                if( !component.destroyed ){
                                    component._( 'enabled' ) && component.disable();
                                    options.viewInternals.bridge.enable( component.output );
  
                                    // Prevent a long-living component from plugging to componentChannel again
                                    if( !component.__used && activityChannel ){
                                        component.__used = true;
                                        stream = component.output.asEventStream();
                                        unplug = activityChannel.plug( stream );
                                        stream.onEnd( unplug );
                                    }
  
                                    component.enable( options.viewInternals.bridge.output );
  
                                // If component was destroyed early, Ractive was already asked to render the view and it's listed
                                // in NodeDictionary. Must clean up this view from NodeDictionary and the page.
                                } else {
                                    setTimeout( function(){
                                        NodeDictionary.destroyView( view );
                                    }, 0 );
                                }
                            } else {
                                channel = new EventChannel( {
                                    eventTarget: options.viewInternals.bridge
                                } );
                                // Enable queueing of all output messages in case a component is attached at a later time
                                options.viewInternals.bridge.queueOutput = true;
                                options.viewInternals.bridge.enable( channel );
                            }
                            done();
                            cavListNames.push( cavToNameString( component, view ) );
                            // We are finished when last CAV has finished inserting
                            if( cavsIdx + 1 >= cavCount ){ cavListFinish( cavListNames.join( ',' ) ); }
                        },
                        bindExisting = function(){
                            var stream, unplug,
                                spec = component.spec || {},
                                specData = Object.keys( spec.data || {} ).reduce( function( obj, key ){
                                    obj[ key ] = 1;
                                    return obj;
                                }, {} ),
                                viewModel = view.rtemplate.get();
  
                            if( !component.destroyed ){
                                component._( 'enabled' ) && component.disable();
                                // View was already in DOM, data may have been modified by user, so copy to component
                                Object.keys( viewModel ).forEach( function( prop ){
                                    if( specData[ prop ] ){
                                        component.model.set( prop, viewModel[ prop ] );
                                    }
                                } );
                                options.viewInternals.bridge.reBind( component.output, specData, component.getSettingsValues(), component.getActionNames() );
  
                                // Prevent a long-living component from plugging to componentChannel again
                                if( !component.__used && activityChannel ){
                                    component.__used = true;
                                    stream = component.output.asEventStream();
                                    unplug = activityChannel.plug( stream );
                                    stream.onEnd( unplug );
                                }
  
                                component.enable( options.viewInternals.bridge.output );
                            }
  
                            done();
                            // We are finished when last CAV has finished inserting
                            if( cavsIdx + 1 >= cavCount ){ cavListFinish( cavListNames.join( ',' ) ); }
                        };
  
                    if( component && component.destroyed ){
                        done();
                        cavListNames.push( cavToNameString( component, view ) );
                        if( cavsIdx + 1 >= cavCount ){ cavListFinish( cavListNames.join( ',' ) ); }
                        return;
                    }
  
                    if( view && view.destroyed ){
                        done();
                        cavListNames.push( cavToNameString( component, view ) );
                        if( cavsIdx + 1 >= cavCount ){ cavListFinish( cavListNames.join( ',' ) ); }
                        return;
                    }
  
                    if( options.target ){
                        target = options.target;
                    } else if( thisContext.viewTargeter ){
                        target = thisContext.viewTargeter.targetRequest( controllerAction, view.viewName );
                    }
  
                    // BLUEJS-6397 - throw error if this component is already bound to a view within
                    // the given target. If we proceed, the component would be destroyed just before
                    // the framework tries to use it with the new view. By throwing an error here we
                    // can at least warn the developer what went wrong when the view fails to render.
                    // BLUEJS-6678 - Remember keepAlive setting for every component that is present
                    // in the CAV list and is also within the target node so it would be destroyed.
                    // Match components by unique GUID in order to be sure we are matching the same
                    // instances of each component.
                    // If we are in a scenario where the component would be erroneously
                    // destroyed as part of the render process, temporarily set keepAlive
                    // to "true" to prevent destruction.
                    if( target && !options.append ){
                        componentsInTarget = findComponentsInDom( target );
                        cavs.forEach( function( cav ){
                            if( cav[ 0 ] && componentsInTarget.includes(cav[ 0 ]._( 'guid' )) ){
                                cav.keepAlive = cav[ 0 ]._( 'keepAlive' );
                                cav[ 0 ]._( 'keepAlive', true );
                                // If the framework is going to work to prevent this problem, not sure if
                                // we should log a warning about it or not.
                                // var componentReRenderErrorReplace = 'CAV render error: In controller '+component.context.parent.getStack()+' the compoonent "'+component.key+'" cannot be bound to a view within "'+target+'" because doing so would cause the component to destroy and the view will fail. To avoid this issue, you can use "thisController.components.componentName.activeViewName". The value of this property equals the name of the active view currently bound to the component, or undefined if the component is not bound to an active view.';
                                // var componentReRenderErrorAppend = 'CAV render error: In controller '+component.context.parent.getStack()+' the compoonent "'+component.key+'" cannot be bound to another view on the page because a component can only be bound to one active view at a time. To avoid this issue, you can use "thisController.components.componentName.activeViewName". The value of this property equals the name of the active view currently bound to the component, or undefined if the component is not bound to an active view.';
                                // var componentReRenderError = options.append ? componentReRenderErrorAppend : componentReRenderErrorReplace;
                                // component.context.parent.logger.warn( componentReRenderError );
                            }
                        } );
                    }
  
                    if( options.linkToPage ){
                        view.model.roles = privileges( component, that.roledata, that.userType );
                        component._queueData = true;
                        bindExisting();
                    }
                    // Halt if we don't have a target defined
                    // BLUEJS-4584 - merge error fix: the "else" was dropped by accident
                    else if( target ){
                        // Allow initial view model to be set through options passed in CAV. Adds support
                        // for front-end-only view to be rendered with data
                        if( is.plainObject( options.model ) ){
                            view.model = that.context.util.object.mixIn( view.model, clone( options.model ) );
                        }
  
                        // Set view.model as a clone of the component.model. This
                        // prevents data leaking from one view to another when multiple
                        // components are sharing the same base observable from the controller.
                        if( component ){
                            Object.keys( component.spec.data || {} ).forEach( function( key ){
                                baseModel[ key ] = undefined;
                            } );
                            view.model = that.context.util.object.mixIn( baseModel, view.model, component.model.get( { isolate: true } ), component.getSettingsValues() );
                            view.model.roles = privileges( component, that.roledata, that.userType );
                            component._queueData = true;
                        }
  
                        ( options.append ? Promise.resolve() : NodeDictionary.destroy( [ target ] ) )
                            .then(
                                function(){
                                    // BLUEJS-6678
                                    // restore keepAlive setting as soon as possible
                                    if( component){
                                        component._( 'keepAlive', args[0].keepAlive );
                                    }
                                    if( options.append ){
                                        view.appendTo( target, bindCAV );
                                    } else {
                                        view.replaceIn( target, bindCAV );
                                    }
                                },
                                function( e ){
                                    logger.error( '[' + that.context.getStack() + ']', 'View(s) in target node ' + target + ' failed to destroy', e );
                                    that.context.page.emit(
                                        'page:error',
                                        {
                                            code: 'blue:app:error:nodeDestroyFailed',
                                            description: 'View(s) in target node ' + target + ' failed to destroy; ' + e.name + ':' + e.message
                                        }
                                    );
                                    throw e;
                                }
                            )
                            .catch( function( e ){
                                var specName = component ? component.spec.name : 'NONE',
                                    insertType = options.append ? 'appended' : 'rendered';
                                logger.error( '[' + that.context.getStack() + ']', 'CAV (' + specName + ':' + view.viewName + ') could not be ' + insertType + ' to target ' + target, e );
                                that.context.page.emit(
                                    'page:error',
                                    {
                                        code: options.append ? 'blue:app:error:cavAppendFailed' : 'blue:app:error:cavInsertFailed',
                                        description: 'CAV (' + specName + ':' + view.viewName + ') could not be ' + insertType + ' to target ' + target + '; ' + e.name + ':' + e.message
                                    }
                                );
                                done();
                                // We are finished when last CAV has finished inserting
                                if( cavsIdx + 1 >= cavCount ){ cavListReject( e ); }
                            } );
                    } else {
                        logger.error( '[' + that.context.getStack() + ']', view.viewName + ' has no render target specified' );
                        done();
                        // We are finished when last CAV has finished inserting
                        if( cavsIdx + 1 >= cavCount ){ cavListReject( e ); }
                    }
                } );
            } );
        },
        function( err ){
            logger.error( '[' + that.context.getStack() + ']', 'CAV List could not be resolved:', err );
            that.context.page.emit( 'page:error', {
                code: 'blue:app:error:cavListResolutionFailed',
                description: 'CAV List could not be resolved:' + err
            } );
            cavListReject( err );
        } );
  
        return cavListDone;
    };
  
    /**
     * Load and apply the WireJS configuration for the Page.
     * @function module:blue-view.WebPage#loadSpec
     * @returns Promise Promise is resolved once spec has been loaded and internal settings have been applied to the Page instance.
     */
    Web.prototype.loadSpec = function(){
        var that = this,
            pageLoadPromiseResolve, pageLoadPromiseReject,
            pageLoadPromise = new Promise( function( res, rej ){ pageLoadPromiseResolve = res; pageLoadPromiseReject = rej; } );
  
        load(
            getAppName(),
            // eslint-disable-next-line complexity
            function( config ){
                that.settings = config;
                that.roledata = config.roles || Object.create( null );
                that.userType = [];
  
                var r0 = siteData.getData( 'userType' );
                if( is.defined( r0 ) && !!r0 && ( is.string( r0 ) || is.array( r0 ) ) ){
                    var r1 = [],
                        hasUserType = true;
                    if( is.string( r0 ) ){
                        r0 = [ r0 ];
                    }
                    for( var i = 0; i < r0.length; i++ ){
                        if( is.undefined( r0[ i ] ) || !r0[ i ] || r0[ i ] === 'PrimaryUser' ){
                            hasUserType = false;
                        } else {
                            r1.push( r0[ i ] );
                        }
                    }
                    if( hasUserType ){
                        that.userType = r1;
                    }
                }
  
                if( config.viewResolverOptions ){
                    that.context.viewResolverOptions = config.viewResolverOptions || {};
                }
  
                if( config.viewEngine ){
                    that.view && that.loadViewEngine( config.viewEngine );
                    // that.setViewEngine( config.viewEngine, that.context.getStack() );
                } else {
                    config.viewEngine = DEFAULT_VIEW_ENGINE;
                    that.view && that.loadViewEngine( DEFAULT_VIEW_ENGINE );
                }
  
                config.context && Object.keys( config.context ).forEach( function( key ){
                    that.context[ key ] = config.context[ key ];
                } );
  
                that.context.pageReady.then( function(){ // on-dom-ready
                    if( that.view ){
                        var target = that.viewTarget || 'body',
                            pageCAV;
  
                        that.loadViewEngine( config.viewEngine );
                        pageCAV = new ComponentAndView( that.context, config.viewEngine, viewImports, [ undefined, that.view, { target: target } ], that.context.getStack() );
                        pageCAV.resolved.then( function( cav ){
                            that.pageView = cav[ 1 ];
                        } );
  
                        // only track visibility if page module asks for tracking
                        // and after page view successfully created
                        that.trackVisibility && pageCAV.resolved.then( function(){
                            enableVTracking( that.context, target, that.trackVisibility );
                        } );
  
                        that.insertComponentView( 'page.root', [ pageCAV ] ).then( pageLoadPromiseResolve, pageLoadPromiseReject );
                    } else {
                        that.trackVisibility && enableVTracking( that.context, 'body', that.trackVisibility );
                        pageLoadPromiseResolve();
                    }
                } );
            }
        );
  
        return pageLoadPromise;
    };
  
    function cleanHash( route ){
        var newRoute = route || '';
  
        newRoute = newRoute.replace( /^#/, '' );           // remove leading #
        while( newRoute.indexOf(';') > -1 ){
            newRoute = newRoute.replace( /;[^\/]*/, '' );  // remove matrix params from each segment
        }
        while( newRoute.indexOf( '//' ) > -1 ){
            newRoute = newRoute.replace( '//', '/' );      // correct repeating / characters
        }
        newRoute = newRoute.replace( /\?.*$/, '' );        // strip get param string from end
        if( newRoute[0] !== '/' ){
            newRoute = '/' + newRoute;                     // normalize all routes to start with /
        }
  
        return newRoute;
    }
  
    function routeMatchesGlob( route, glob ){
        var globSegments = glob.split('/'),
            globRegExString,
            globRegEx;
      
        globRegExString = globSegments.map( function( segment ){
          if( segment === '*' ){ segment = '[^\/]*'; }
          return segment;
        } ).join( '/' );
        globRegExString = globRegExString.replace(/\/\*\*/g, '(/[^/]+)*');
        globRegEx = new RegExp( `^${globRegExString}$` );
        return globRegEx.test( route);
    }
    
    /**
     * 
     * @returns Promise Resolves when all views in configured DOM nodes have been destroyed
     * 
     * Requires the "clearSelectorsConfig" property of the Page to have been set with an object
     * of the form:
     * [key] : [string | Array<string>]
     *   key = hash route to match against current document.location hash
     *   value = either a selector string for a DOM node or an array of selectors
     * The key may use glob wildcards where * replaces a single route segment and **
     * matches zero or more segments.
     * When matching against the location hash, the current hash will be normalized:
     *  - enforce a leading /
     *  - eliminate any double / in the path (like "foo//bar")
     *  - remove any matrix params ( /foo;x=1 becomes /foo )
     *  - remove any trailing query string ( /bar?y=2 becomes /bar )
     * The resulting clean hash string will be matched against each key in the config object.
     * For every key that matches, all views in the corresponding selectors will be destroyed.
     * 
     */
     // {
     //   '/one/two/three': '#content',
     //   '/four/five': [ '#contentA', '#contentB' ],
     //   '/app/**/*': [ '#content' ],
     //   '/one/*/three': [ '#content' ]
     // }
    Web.prototype.clearSelectors = function(){
        var config = this.clearSelectorsConfig;
        var route = cleanHash( dom.location.hash );
        var promiseArray = [];
        if( !config || !is.plainObject( config ) ){
            return Promise.resolve();
        }
  
        Object.keys( config ).forEach( function( key ){
            if( Object.hasOwnProperty.call( config, key ) ){
                var selectorArray = Array.isArray( config[ key ] ) ? config[ key ] : [ config[ key ] ];
                if( routeMatchesGlob( route, key ) ){
                    selectorArray.forEach( function( selector ){
                        promiseArray.push( NodeDictionary.destroy( selector ) );
                    } );
                }
            }
        } );
        return Promise.all( promiseArray );
    };
  
    Web = asContextual.call( Web, { name: 'page' } );
  
    return Web;
  } );
  