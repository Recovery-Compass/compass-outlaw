/**
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 * @module 'blue-app/observeOctagonScreenData'
 **/
define( ['require','blue-app/settings','@octagon/shared-data/dist/shared-data.dep.umd'],function( require ){
    'use strict';

    var settings = require( 'blue-app/settings' );
    var globalShare = require( '@octagon/shared-data/dist/shared-data.dep.umd' ); // if need bundled with depenecies

    function observeOctagonScreenData(){
        globalShare.sharedDataObserver( 'screen:data' ).subscribe( ( data ) => {
            var octagonScreenId = data && data.screenData ? data.screenData.id : null;
            var octagonScreenParameters = data && data.screenData && data.screenData.parameters || {};
            Object.keys( octagonScreenParameters ).forEach( ( parameterKey, i ) => {
                var value = octagonScreenParameters[ parameterKey ];
                octagonScreenId += ( i === 0 ? '?' : '&' ) + parameterKey + '=' + value;
            } );
            // get current screenId since it is not provided when the observerable receives data
            var currentScreenId = settings.get( 'blue-screen-id', settings.Type.SITE );
            // get current url from octagon app
            var currentURL = data && data.screenData ? data.screenData.currentURL : null;
            if( currentScreenId !== octagonScreenId && octagonScreenId !== null ){
                settings.set( 'blue-screen-id', octagonScreenId, settings.Type.SITE );
                settings.set( 'currentURL', currentURL, settings.Type.SITE );
            }
        } );
    }

    return {
        observeOctagonScreenData: observeOctagonScreenData
    };
} );
