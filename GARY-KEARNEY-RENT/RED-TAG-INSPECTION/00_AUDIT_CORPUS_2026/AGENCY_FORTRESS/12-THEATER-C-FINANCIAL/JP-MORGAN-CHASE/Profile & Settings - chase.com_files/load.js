/**
 * Loader for the Page instance's WireJS configuration file, if requested by the Page.
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */
define( ['require','blue/is','blue/resolver/module'],function( require ){
    'use strict';

    var is = require( 'blue/is' ),
        Resolver = require( 'blue/resolver/module' ),
        resolver = new Resolver();

    resolver.prefix = 'wire!';
    resolver.suffix = '/pageConfig';

    /**
     * Uses resolver to request the WireJS config file for the Page. When done, execute a callback function.
     * @function module:blue-view.load
     * @param {string} name Application name, for use in the module path
     * @param {function} callback Function to execute when load completes successfully
     * @param {Object} scope Object to bind as "this" when executing callback
     * @throws {TypeError}
     */
    return function load( name, callback, scope ){
        if( !is.string( name ) ){
            throw new TypeError( 'name must be a string' );
        }

        if( !is.function( callback ) ){
            throw new TypeError( 'callback must be a function' );
        }

        resolver.resolve( name )
            .onValue( function( config ){
                callback.call( scope, config );
            } );
    };
} );
