define('addressVerificationOverlay-cmpt/manifest',{
    component: {
        spec: 'blue-spec-shared/address_verification'
    },
    views: {
        addressVerificationOverlayView: './views/addressVerificationOverlay'
    }
});
define('addressVerificationOverlay-cmpt/component',['require','appkit-utilities/analytics/overlay'],function(require) {
    'use strict';

    return function addressVerificationComponent(componentContext) {
        var me = this;
        var dcu = componentContext.dcu.dynamicContent;
        var analyticsOverlay = require('appkit-utilities/analytics/overlay');
        /**
         * component initalization code
         * executes before the component is enabled
         */
        me.init = function(){
            var _model = me.model.get();
            var addresses = _model.addresses;
            var recommended, original;

            if (addresses[0].addressType === 'RECOMMENDED') {
                recommended = addresses[0];
                original = addresses[1];
            } else {
                recommended = addresses[1];
                original = addresses[0];
            }
            recommended.address.addressId = recommended.addressId;
            original.address.addressId = original.addressId;

            me.model.set('recommendedAddress', recommended.address);
            me.model.set('originalAddress', original.address);

            !_model.recommendedAddressLabel && me.model.set(
                'recommendedAddressLabel', dcu.get(me, 'addressType.RECOMMENDED'));
            !_model.originalAddressLabel && me.model.set(
                'originalAddressLabel', dcu.get(me, 'addressType.ORIGINAL'));

            // For namespacing
            !_model.blockName && me.model.set('blockName', me.key);
            !_model.blockId && me.model.set('blockId', 'blx-'+me.key);
        };

        me.onReady = function(){
            analyticsOverlay.showOverlay(
                me, 'requestAddressVerificationOverlay');
        };

        me.confirmAddress = function(){
            var addressId = me.model.get('addressId');
            me.closeModal('confirmAddress', function() {
                componentContext.addressVerificationOverlaySelected(me.key, addressId);
            });
        };

        me.exitAddress = function(){
            var addressId = me.model.get('addressId');
            me.closeModal('exitAddress', function() {
                componentContext.addressVerificationOverlayExited(me.key, addressId);
            });
        };

        me.closeModal = function(action, callBack){
            analyticsOverlay.hideOverlay(
                me, 'requestAddressVerificationOverlay', action).then(function() {
                    me.destroy();
                    callBack();
                });
        };

    };
});

define('addressVerificationOverlay-cmpt/views/spec/addressVerification',{
    'name': 'ADDRESS_VERIFICATION',
    'bindings': {
        'addresses': {
            'direction': 'BOTH'
        },
        'addressId': {
            'direction': 'BOTH'
        },
        'requestAddressVerificationOverlay': {},
        'exitAddressVerificationOverlay': {}
    },
    'triggers': {
        'formFieldTracking': {
            'action': 'formField'
        }
    }
});
define('addressVerificationOverlay-cmpt/template/addressVerificationOverlay',[], function() { return {"v":4,"t":[{"t":4,"f":[{"t":7,"e":"blueModal","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-address-verification-overlay"],"t":13},{"n":"customButtons","f":[{"t":2,"x":{"r":[".blockId",".confirmAddressLabel","confirmAddress"],"s":"[{customButtonModalClose:\"confirmAddress\",customItems:[{customButtonClasses:\"customButtonContainer\",customButtonId:[[_0+\"-address-verification-overlay-conf-btn\"]],customButtonLabel:[[_1]],customButtonLabelAdaText:\"\",customButtonClick:_2}]}]"}}],"t":13},{"n":"classes","f":"jpmcbb addressVerificationOverlay","t":13},{"n":"title","f":[{"t":2,"r":".addressVerificationHeader","s":true}],"t":13},{"n":"dialogText","f":[{"t":2,"r":".addressVerificationMessage","s":true}],"t":13},{"n":"additionalDialogContent","f":"true","t":13}],"f":[{"t":8,"r":"fieldsetSection"}]}],"n":50,"r":".isCustomModalEnabled"},{"t":4,"n":51,"f":[{"t":7,"e":"blueModal","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-address-verification-overlay"],"t":13},{"n":"cancelButtonId","f":[{"t":2,"r":"blockId","s":true},"-address-verification-overlay-cancel-btn"],"t":13},{"n":"cancelButtonClasses","f":"","t":13},{"n":"cancelButtonText","f":[{"t":2,"r":".exitAddressLabel","s":true}],"t":13},{"n":"cancelButtonAdaText","f":"","t":13},{"n":"cancelButtonClick","f":"exitAddress","t":13},{"n":"confirmationButtonId","f":[{"t":2,"r":"blockId","s":true},"-address-verification-overlay-conf-btn"],"t":13},{"n":"confirmationButtonClasses","f":"","t":13},{"n":"confirmationButtonText","f":[{"t":2,"r":".confirmAddressLabel","s":true}],"t":13},{"n":"confirmationButtonAdaText","f":"","t":13},{"n":"confirmationButtonClick","f":"confirmAddress","t":13},{"n":"classes","f":"jpmcbb addressVerificationOverlay","t":13},{"n":"title","f":[{"t":2,"r":".addressVerificationHeader","s":true}],"t":13},{"n":"dialogText","f":[{"t":2,"r":".addressVerificationMessage","s":true}],"t":13},{"n":"additionalDialogContent","f":"true","t":13}],"f":[{"t":8,"r":"fieldsetSection"}]}],"l":1}],"p":{"fieldsetSection":[{"t":7,"e":"div","m":[{"n":"class","f":"fieldsetSection","t":13}],"f":[{"t":7,"e":"span","m":[{"n":"class","f":"util accessible-text","t":13}],"f":[{"t":2,"r":".selectAddressesAda","s":true}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"row","t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"col-xs-12 col-sm-5 addressRdoBtnContainer","t":13}],"f":[{"t":7,"e":"blueRadioButton","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-recommended-addr-rdo-btn"],"t":13},{"n":"analyticsId","f":[{"t":2,"r":"blockId","s":true},"-addr-rdo-btn-0"],"t":13},{"n":"groupName","f":[{"t":2,"r":"blockId","s":true},"-addr-rdo-btn"],"t":13},{"n":"checkedBinding","f":[{"t":2,"r":".addressId"}],"t":13},{"n":"value","f":[{"t":2,"r":".recommendedAddress.addressId"}],"t":13},{"n":"label","f":[{"t":2,"r":".recommendedAddressLabel","s":true}],"t":13},{"n":"ariaDescribedby","f":[{"t":2,"r":"blockId","s":true},"-recommended-addr"],"t":13},{"n":"rChange","f":"formFieldTracking","t":13},{"n":"rFocus","f":"formFieldTracking","t":13}]}," ",{"t":4,"n":53,"f":[{"t":8,"r":"address"}],"x":{"r":[".recommendedAddress","blockId"],"s":"{address:_0,id:[[_1]]+\"-recommended-addr\"}"}}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"col-xs-12 col-sm-5 addressRdoBtnContainer","t":13}],"f":[{"t":7,"e":"blueRadioButton","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-user-addr-rdo-btn"],"t":13},{"n":"analyticsId","f":[{"t":2,"r":"blockId","s":true},"-addr-rdo-btn-1"],"t":13},{"n":"groupName","f":[{"t":2,"r":"blockId","s":true},"-addr-rdo-btn"],"t":13},{"n":"checkedBinding","f":[{"t":2,"r":".addressId"}],"t":13},{"n":"value","f":[{"t":2,"r":".originalAddress.addressId"}],"t":13},{"n":"label","f":[{"t":2,"r":".originalAddressLabel","s":true}],"t":13},{"n":"ariaDescribedby","f":[{"t":2,"r":"blockId","s":true},"-user-addr"],"t":13},{"n":"rChange","f":"formFieldTracking","t":13},{"n":"rFocus","f":"formFieldTracking","t":13}]}," ",{"t":4,"n":53,"f":[{"t":8,"r":"address"}],"x":{"r":[".originalAddress","blockId"],"s":"{address:_0,id:[[_1]]+\"-user-addr\"}"}}]}]}]}]},"e":{}}; });
define('addressVerificationOverlay-cmpt/template/_addressVerificationOverlayAddress',[], function() { return {"v":4,"t":[{"t":7,"e":"div","m":[{"n":"class","f":"addressContainer","t":13},{"n":"id","f":[{"t":2,"r":".id","s":true}],"t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"DATA addressFormText","t":13}],"f":[{"t":2,"r":".address.line1"}]}," ",{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"DATA addressFormText","t":13}],"f":[{"t":2,"r":".address.line2"}]}],"n":50,"r":".address.line2"}," ",{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"DATA addressFormText","t":13}],"f":[{"t":2,"r":".address.line3"}]}],"n":50,"r":".address.line3"}," ",{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"DATA addressFormText","t":13}],"f":[{"t":7,"e":"span","f":[{"t":2,"r":".address.city"}]},{"t":2,"r":".punctuationMarkCommaLabel","s":true}," ",{"t":7,"e":"span","f":[{"t":2,"r":".address.stateCode"}]}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"DATA addressFormText","t":13}],"f":[{"t":7,"e":"span","f":[{"t":2,"r":".address.zipcode"}]}]}],"n":50,"x":{"r":[".address.type"],"s":"_0==\"USA\""}}," ",{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"DATA addressFormText","t":13}],"f":[{"t":7,"e":"span","f":[{"t":2,"r":".address.city"}]}," ",{"t":7,"e":"span","f":[{"t":2,"r":".address.stateCode"}]}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"DATA addressFormText","t":13}],"f":[{"t":7,"e":"span","f":[{"t":2,"r":".address.zipcode"}]}]}],"n":50,"x":{"r":[".address.type"],"s":"_0==\"CANADA\""}}," ",{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"DATA addressFormText","t":13}],"f":[{"t":7,"e":"span","f":[{"t":2,"r":".address.city"}]}," ",{"t":7,"e":"span","f":[{"t":2,"r":".address.zipcode"}]}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"DATA addressFormText","t":13}],"f":[{"t":2,"r":".address.country"}]}],"n":50,"x":{"r":[".address.type"],"s":"_0==\"INTERNATIONAL\""}}," ",{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"DATA addressFormText","t":13}],"f":[{"t":7,"e":"span","f":[{"t":2,"r":".address.postOfficeType"}]}," ",{"t":7,"e":"span","f":[{"t":2,"r":".address.stateCode"}]}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"DATA addressFormText","t":13}],"f":[{"t":7,"e":"span","f":[{"t":2,"r":".address.zipcode"}]}]}],"n":50,"x":{"r":[".address.type"],"s":"_0==\"MILITARY\""}}]}],"e":{}}; });
define('addressVerificationOverlay-cmpt/views/addressVerificationOverlay',['require','addressVerificationOverlay-cmpt/views/spec/addressVerification','addressVerificationOverlay-cmpt/template/addressVerificationOverlay','blue-ui/view/modules/modal','blue-ui/view/elements/radiobutton','addressVerificationOverlay-cmpt/template/_addressVerificationOverlayAddress'],function(require) {
    'use strict';
    var viewSpec = require('addressVerificationOverlay-cmpt/views/spec/addressVerification'),
        template = require('addressVerificationOverlay-cmpt/template/addressVerificationOverlay');

    return function AddressVerificationOverlayView(viewContext) {
        var thisView = this;

        thisView.viewName = 'AddressVerificationOverlayView';
 
        thisView.bridge = viewSpec;
 
        thisView.template = template;
 
        thisView.init = function() {};

        
        thisView.views = {
            blueModal: require('blue-ui/view/modules/modal'),
            blueRadioButton: require('blue-ui/view/elements/radiobutton')
        };

        thisView.partials = {
            address: require('addressVerificationOverlay-cmpt/template/_addressVerificationOverlayAddress')
        };
        thisView.onReady = function() {
            viewContext.$('#blx-addressVerificationOverlay-address-verification-overlay').prepend('<span class="util accessible-text" id="address_validation_overlay-beginModalAdaText">Address Modal start</span>');
        };
    };

});

