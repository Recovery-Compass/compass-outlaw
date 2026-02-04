/**
 * Global mapping of DOM nodes ( keys ) to ViewInstances ( values ) in a Weak Memory Store.
 * Provides framework with ability to run "destroy" on Views when application tries to draw
 * a new View into a given DOM node.
 * @author Aaron Brown
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */
define( ['require','blue/dom','blue/is','blue/store/weakMemory','blue/as/serializable','blue/log'],function( require ){
    'use strict';
    var dom             = require( 'blue/dom' ),
        is              = require( 'blue/is' ),
        WeakMemoryStore = require( 'blue/store/weakMemory' ),
        asSerializable	= require( 'blue/as/serializable' ),
        Logger          = require( 'blue/log' ),
        logger          = new Logger( '[nodeDictionary]' ),

        /**
         * Plucks the first DOM node object out of a standard jQuery node collection.
         * @function module:blue-view.NodeDictionary~getDomNode
         * @param {Object} node or node collection
         * @returns {Object} DOM node
         */
        getDomNode = function( node ){
            var n = is.array( node ) ? node[ 0 ] : node;
            if( is.string( n ) ){
                return dom.querySelector( n );
            }
            return n;
        },

        /**
         * Look for "data-has-view" attribute in "node" and node's descendants.
         * Needed by removeView method because top-level element of a view may
         * also be a container for other views, so it's not enough to just look
         * in descendants of the view's top element.
         * @function module:blue-view.NodeDictionary~findContainers
         * @param {Object} node
         * @returns {Array} Array of DOM nodes
         */
        findContainers = function( node ){
            var containers;
            if( !node ){ return []; }

            // find descendants of node with the correct attribute
            containers = Array.from( node.querySelectorAll( '[data-has-view]' ) );

            // if the node itself is a container then add it to the end of the
            // list so it will be processed last
            if( node.getAttribute( 'data-has-view' ) ){
                containers.push( node );
            }

            return containers;
        };

    /**
     * The NodeDictionary tracks all DOM nodes which contain Views. These are the nodes which were specified as
     * target containers when the view templates were rendered. The NodeDictionary is most important when destroying
     * a view: any view's internal DOM may itself be a container for another view. In this situation, the template library
     * is not tracking the DOM relationship between these two views, so it's up to the framework to track and properly
     * destroy descendants when a container view is removed.
     *
     * The NodeDictionary is a singleton in the front end layer of the framework. Only one instance is created per application.
     *
     * @class module:blue-view.NodeDictionary
     * @mixes module:blue-core.asSerializable
     */
    function NodeDictionary(){
        this.store = new WeakMemoryStore( 'node' );
    }

    /**
     * Return a boolean indicating whether the nodeDictionary has a view currently registered at the node described by the selector.
     * The selector should resolve to a single node. If the selector resolves multiple nodes, return undefined.
     * @function module:blue-view.NodeDictionary#hasViewAt
     * @param {string} selector
     * @returns {boolean}
     */
    NodeDictionary.prototype.hasViewAt = function( selector ){
        var node = dom.querySelectorAll( selector ),
            domNode = node[ 0 ];
        // Selector resolves to single DOM node
        if( node.length === 1 ){
            return this.store.has( domNode );
        }
        // Selector doesn't resolve to any DOM node
        if( node.length === 0 ){
            return false;
        }

        // Selector resolves to multiple DOM nodes
        return false;
    };

    /**
     * Resolves the DOM selector to a single node. If selector resolves multiple nodes, return undefined.
     * Look up the node in nodeDictionary:
     * if not found, return undefined;
     * if found and only one view is at this node, return that view instance;
     * if found and multiple views at this node, return array of view instances.
     * @function module:blue-view.NodeDictionary#getViewAt
     * @param {string} selector
     * @returns {module:blue-view-ractive/view} view
     */
    NodeDictionary.prototype.getViewAt = function( selector ){
        var node = dom.querySelectorAll( selector ),
            domNode = node[ 0 ],
            viewArr;
        // Selector resolves to single DOM node and view exists in nodeDictionary
        if( node.length === 1 && this.store.has( domNode ) ){
            viewArr = this.store.get( domNode );
            viewArr = viewArr.length === 1 ? viewArr[ 0 ] : viewArr;
            return viewArr;
        }
        // undefined for other cases
        return undefined;
    };

    /**
     * Adds given view instance to list of views mapped to DOM node
     * @function module:blue-view.NodeDictionary#add
     * @param {Object} node DOM node or array of DOM nodes
     * @param {module:blue-view-ractive/view} view
     * @throws Could not create-view in controller...
     */
    NodeDictionary.prototype.add = function( node, viewInstance ){
        var viewAry,
            domNode = getDomNode( node ),
            controllerPath,
            componentPath;
        if( domNode ){
            domNode.setAttribute( 'data-has-view', 'true' );
            viewAry = this.store.get( domNode ) || [];
            viewAry.push( viewInstance );
            this.store.set( domNode, viewAry );
        } else {
            controllerPath = viewInstance.name.split( viewInstance.viewName )[ 0 ].slice( 0,-1 );
            if( viewInstance._componentStack ){
                componentPath = viewInstance._componentStack;
            }
            logger.warn( 'Could not create view in node "' + node + '". Node not found in DOM.' );
            viewInstance._destroy();
            if( componentPath ){
                throw new Error( 'Could not create-view in controller "' + controllerPath + '" for component "' + componentPath + '" in node "' + node.selector + '". Node not found in DOM.' );
            } else {
                throw new Error( 'Could not create-view in controller "' + controllerPath + '" in node "' + node.selector + '". Node not found in DOM.' );
            }
        }
    };

    /**
     * Execute "destroy" method on View instance(s) associated with given node, then clear contents of node. Any views listed in NodeDictionary
     * residing in nodes that are descendants of the node parameter will be destroyed first, then the views in the target node will be destroyed.
     * The full view hierarchy within the target node must be destroyed in the proper order, from the inside out.
     * @function module:blue-view.NodeDictionary#destroy
     * @param  {Object} node DOM node
     * @returns {external:Promise}
     */
    NodeDictionary.prototype.destroy = function( node ){
        var views,
            me = this,
            promiseAry = [],
            domNode = getDomNode( node );
        // no dom node... return already resolved promise
        if( !domNode ){ return Promise.resolve(); }
        // get views directly appended to this dom node
        views = me.store.get( domNode ) || [];
        // call destroy for each view
        views.forEach( function( view ){
            promiseAry.push( me.destroyView( view ) );
        } );
        // return destroyed promise
        return Promise.all( promiseAry ).then( function(){
            // clean up dom element
            domNode.removeAttribute( 'data-has-view' );
            // clean up store
            me.store.remove( domNode );
        } );
    };

    /**
     * Destroys the parameter view while obeying the hierarchical structure of any nested views, destroying all inner views from
     * the inside out.
     * @function module:blue-view.NodeDictionary#destroyView
     * @param {module:blue-view-ractive/view} view
     * @returns {external:Promise}
     */
    NodeDictionary.prototype.destroyView = function( view ){
        var _this = this,
            viewName = view.viewName || '(unknown)',
            viewInstanceAry,
            containers,
            promiseAry = [],
            reducedArray,
            destroyViewResolve, destroyViewReject,
            destroyViewPromise = new Promise( function( res, rej ){ destroyViewResolve = res; destroyViewReject = rej; } ),
            childrenPromise,

            targetNode = view.target ? view.target : null,
            viewCompare = function( v ){ return v !== view; };

        // Scan for DOM children that contain views and destroy them in deepest-first order
        if( view.element && targetNode && _this.store.has( targetNode ) && _this.store.get( targetNode ).indexOf( view ) > -1 ){
            containers = findContainers( view.element );
            childrenPromise = Array.from( containers ).map(
                function( node ){
                    // node should still exist here, so this code is over-engineered for safety
                    var views,
                        viewDestroys = [];

                    if( node && _this.store.has( node ) ){
                        views = _this.store.get( node );
                        views.forEach( function( viewInstance ){
                            viewDestroys.push( function(){ return viewInstance._destroy(); } );
                        } );
                        node.removeAttribute( 'data-has-view' );
                        _this.store.remove( node );
                    }
                    return function(){ return Promise.all( viewDestroys.map( function( fn ){ return fn(); } ) ); };
                }
            ).reduceRight(
                function( curr, next ){
                    return next ?
                        curr.then( next() ).catch( function( e ){
                            throw e;
                        } ) : curr;
                },
                Promise.resolve()
            );

            // If reduceRight is given an empty array, it doesn't run the callback, so we must do so here
            if( typeof childrenPromise === 'function' ){ childrenPromise = childrenPromise(); }

            childrenPromise.then(
                function(){
                    // Destroy the view and remove from nodeDictionary if no other views exist in this target
                    if( targetNode ){
                        viewInstanceAry = _this.store.get( targetNode );
                        if( viewInstanceAry ){
                            if( viewInstanceAry.length === 1 && viewInstanceAry[ 0 ] === view ){
                                promiseAry.push( view._destroy() );
                                targetNode.removeAttribute( 'data-has-view' );
                                _this.store.remove( targetNode );
                            } else if( viewInstanceAry.length > 1 ){
                                reducedArray = viewInstanceAry.filter( viewCompare );
                                promiseAry.push( view._destroy() );
                                _this.store.set( targetNode, reducedArray );
                            }
                        }
                    } else {
                        // Views without targetNode defined are not listed in NodeDictionary because they
                        // were injected as sub-views by the template engine. Destroy them directly without
                        // attempting to update NodeDictionary
                        promiseAry.push( view._destroy() );
                    }
                    Promise.all( promiseAry ).then( function(){
                        destroyViewResolve();
                    } ).catch( function( e ){
                        logger.error( 'Error encountered when destroying a top-level view ' + viewName, e );
                        destroyViewReject( e );
                    } );
                }
            ).catch( function( e ){
                logger.error( 'Error encountered when destroying a nested view within ' + viewName, e );
                throw e;
            } );
        } else { // if ( view.element && store.has(targetNode) )
            // BLUEJS-6749 - If the view doesn't have a root element, it may
            // just be empty, not broken. Be sure to do all the required cleanup
            // work to make sure the view is properly destroyed and removed
            // from the NodeDictionary store
            // Destroy the view and remove from nodeDictionary if no other views exist in this target
            if( targetNode ){
                viewInstanceAry = _this.store.get( targetNode );
                if( viewInstanceAry ){
                    if( viewInstanceAry.length === 1 && viewInstanceAry[ 0 ] === view ){
                        promiseAry.push( view._destroy() );
                        targetNode.removeAttribute( 'data-has-view' );
                        _this.store.remove( targetNode );
                    } else if( viewInstanceAry.length > 1 ){
                        reducedArray = viewInstanceAry.filter( viewCompare );
                        promiseAry.push( view._destroy() );
                        _this.store.set( targetNode, reducedArray );
                    }
                }
            } else {
                // Views without targetNode defined are not listed in NodeDictionary because they
                // were injected as sub-views by the template engine. Destroy them directly without
                // attempting to update NodeDictionary
                promiseAry.push( view._destroy() );
            }
            Promise.all( promiseAry ).then( function(){
                destroyViewResolve();
            } ).catch( function( e ){
                logger.error( 'Error encountered when destroying a top-level view ' + viewName, e );
                destroyViewReject( e );
            } );
        }
        return destroyViewPromise;
    };

    // add serializable functionality
    asSerializable.call( NodeDictionary.prototype, function(){
        return 'NodeDictionary';
    } );

    return new NodeDictionary();
} );
