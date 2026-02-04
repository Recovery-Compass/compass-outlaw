define('multiTypeAddress-cmpt/manifest',{
    component: {
        spec: 'blue-spec-shared/address'
    },
    views: {
        multiTypeView: './views/multiType'
    }
});
define('multiTypeAddress-cmpt/component',['require','appkit-utilities/validation/componentValidate'],function(require) {
    'use strict';

    return function multiTypeComponent(componentContext) {

        var me = this;

        /**
         * component initalization code
         * executes before the component is enabled
         */
        me.init = function() {
            // appkit validation
            var validation = require('appkit-utilities/validation/componentValidate');

            validation.call(me, componentContext);

            var _model = me.model.get();
            // Defaults to all address
            !_model.addressTypes && me.model.set('addressTypes', [
                'DOMESTIC', 'INTERNATIONAL', 'CANADA', 'MILITARY'
            ]);
            // defaults to domestic address form
            !_model.addressCategoryId && me.model.set('addressCategoryId', 'DOMESTIC');
            // For namespacing
            !_model.blockName && me.model.set('blockName', me.key);
            !_model.blockId && me.model.set('blockId', 'blx-'+me.key);

            // set address categories in dropdown
            me.setAddressTypes();

            // TODO: check if framework gracefully handles route with missing area name
            me.model.onValue('addressCategoryId', function() {
                var myPrivateState = [
                    componentContext.appName,
                    componentContext.areaName,
                    componentContext.controllerName,
                    'changeAddressBlock'
                ].join('/');
                // private state change to 'changeAddressBlock' controller action
                // to render different address block
                componentContext.privateState(myPrivateState);
            });
        };

        /**
         * set/validate address types on drop down based on the use config
         */
        me.setAddressTypes = function() {
            var addrTypesDefined = me.model.get('addressTypes'),
                addressCategories = me.model.get('addressCategories'),
                addrTypes = [];

            if (addrTypesDefined.length > 0){
                addressCategories.forEach(function(el, i) {
                    if(addrTypesDefined.indexOf(addressCategories[i].value) !== -1) {
                        addrTypes.push(el);
                    }
                });
                // set the user defined address types in the drop down
                this.model.set('addressCategories', addrTypes);
            }
        };
    };
});

define('multiTypeAddress-cmpt/views/spec/address',{
    'name': 'ADDRESS',
    'bindings': {
        'addressId': {
            'direction': 'BOTH'
        },
        'addressType': {
            'direction': 'BOTH'
        },
        'addressCategories': {
            'direction': 'BOTH'
        },
        'addressCategoryId': {
            'direction': 'BOTH'
        },
        'postOfficeTypes': {
            'direction': 'BOTH'
        },
        'postOfficeTypeId': {
            'direction': 'BOTH'
        },
        'addressLine1': {
            'direction': 'BOTH'
        },
        'streetAddress': {
            'direction': 'BOTH'
        },
        'apartmentNumber': {
            'direction': 'BOTH'
        },
        'addressLine2': {
            'direction': 'BOTH'
        },
        'cityNames': {
            'direction': 'BOTH'
        },
        'cityId': {
            'direction': 'BOTH'
        },
        'stateNames': {
            'direction': 'BOTH'
        },
        'stateId': {
            'direction': 'BOTH'
        },
        'provinceNames': {
            'direction': 'BOTH'
        },
        'provinceId': {
            'direction': 'BOTH'
        },
        'militaryRegions': {
            'direction': 'BOTH'
        },
        'militaryRegionId': {
            'direction': 'BOTH'
        },
        'zipCode': {
            'direction': 'BOTH'
        },
        'postalCode': {
            'direction': 'BOTH'
        },
        'countries': {
            'direction': 'BOTH'
        },
        'countryId': {
            'direction': 'BOTH'
        },
        'addressVerificationOverlay': {},
        'customerInformationAvailable': {}
    },
    'triggers': {
        'onDropdownChange': {
            'action': 'view.onDropdownChange'
        },
        'formFieldTracking': {
            'action': 'formField'
        }
    }
});
define('multiTypeAddress-cmpt/template/multiType',[], function() { return {"v":4,"t":[{"t":7,"e":"div","m":[{"n":"class","f":"jpmcbb multiType","t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"row","t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"col-xs-12 col-sm-6","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addr-type-fldgrp"],"t":13},{"n":"analyticsId","f":"addressCategoryId","t":13},{"n":"groupType","f":"vertical styledselect","t":13},{"n":"label","f":[{"t":2,"r":".addressCategoriesLabel"}],"t":13},{"n":"styledSelectValue","f":[{"t":2,"r":".addressCategoryId"}],"t":13},{"n":"styledselect","f":["{ 'name': 'addressCategoryId', 'options': ",{"t":2,"r":".addressCategories"},", 'aria': { selected: '",{"t":2,"r":".currentSelectionAda","s":true},"', bottomOfMenu: '",{"t":2,"r":".endOfSelectionAda","s":true},"', buttonLabel: '",{"t":2,"r":".addressCategoriesLabel","s":true},"', listLabel: '",{"t":2,"r":".updatesContentBelowAda","s":true},"' }, 'rFocus': 'formFieldTracking', 'rChange': ['formFieldTracking', 'onDropdownChange'], 'classicShow':false, 'classicResponsive': true, 'labelErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"' }"],"t":13},{"n":"classes","f":"blockFieldGroupXs","t":13}]}]}]}," ",{"t":7,"e":"div","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addr-container"],"t":13}],"f":[]}]}]}; });
define('multiTypeAddress-cmpt/views/multiType',['require','multiTypeAddress-cmpt/views/spec/address','appkit-utilities/validation/trigger','form-blocks-common/transitions/focus','multiTypeAddress-cmpt/template/multiType','blue-ui/view/modules/styledselect','blue-ui/view/collections/fieldgroup','blue-ui/template/elements/fieldlabel'],function(require) {
    'use strict';

    return function MultiTypeView(viewContext) {

        var me = this;
        var extend = viewContext.util.object.extend,
            webSpec = require('multiTypeAddress-cmpt/views/spec/address'),
            triggers = require('appkit-utilities/validation/trigger'),
            focusTransition = require('form-blocks-common/transitions/focus');

        me.init = function() {};

        viewContext.page.triggers = triggers;
        // extend webspec with validation triggers from appkit utilities
        extend(webSpec.triggers, viewContext.page.triggers);
        me.bridge = webSpec;

        me.template = require('multiTypeAddress-cmpt/template/multiType');

        me.transitions = {
            'focusOnRender': focusTransition.focusOnRender
        };

        me.views = {
            'blueStyledSelect': require('blue-ui/view/modules/styledselect'),
            'blueFieldGroup': require('blue-ui/view/collections/fieldgroup')
        };

        me.partials = {
            'blueFieldLabel': require('blue-ui/template/elements/fieldlabel')
        };

        /**
         * view onReady method
         */
        me.onReady = function() {};

        /**
         * view action to handle address type drop down change event
         */
        me.onDropdownChange = function(e) {
            me.model.addressCategoryId = e.domEvent.target.value;
        };

    };
});
