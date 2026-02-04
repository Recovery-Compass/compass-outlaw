define('canadaAddress-cmpt/manifest',{
    component: {
        spec: 'blue-spec-shared/address'
    },
    views: {
        canadaAddressView: './views/canada'
    }
});
define('canadaAddress-cmpt/validator',['require','form-blocks-common/validationUtil'],function(require) {
    'use strict';

    var util = require('form-blocks-common/validationUtil'),
        // Canada address field Regex
        addressRegex = {
            addressLine1: /^[a-zA-Z0-9,:/$&#'\-. ]{0,30}$/,
            addressLine2: /^[a-zA-Z0-9,:/$&#'\-. ]{0,30}$/,
            postalCode: /^[a-zA-Z0-9 ]{1,20}$/,
            cityId: /^[a-zA-Z0-9.,:/$&#'\- ]{1,30}$/
        },
        validateOptionalProperty = function(data, model) {
            var result = {
                    isValid: true,
                    errorType: ''
                },
                property = util.getProperty(data, model);

            if (property) {
                result = util.validateDataFormat(result, property, addressRegex[data.item]);
            }

            return result;
        },
        validateProperty = function(data, model) {
            var property = util.getProperty(data, model),
                result = util.checkMissingMandatory(property);

            result = util.validateDataFormat(result, property, addressRegex[data.item]);

            return result;
        },
        // custom validators for canadian address
        formValidators = {
            addressLine1: validateProperty,
            addressLine2: validateOptionalProperty,
            postalCode: validateProperty,
            cityId: validateProperty,
            provinceId: util.validateSelection
        };

    return formValidators;
});
define('canadaAddress-cmpt/component',['require','appkit-utilities/validation/componentValidate','canadaAddress-cmpt/validator'],function(require) {
    'use strict';

    return function canadaComponent(componentContext) {

        var me = this;

        /**
         * component initalization code
         * executes before the component is enabled
         */
        me.init = function() {
            var validation = require('appkit-utilities/validation/componentValidate');
            var canadaAddressValidator = require(
                'canadaAddress-cmpt/validator');
            var _model = me.model.get();

            validation.call(me, componentContext, canadaAddressValidator);

            // Set validation bypass object for appkit validation
            // to ignore spec data points when form validation is checked
            me.model.set('byPass', {
                streetAddress: 1,
                apartmentNumber: 1,
                addressId: 1,
                addressType: 1,
                addressCategories: 1,
                postOfficeTypes: 1,
                addressCategoryId: 1,
                googleAddressSuggestionAccepted: 1,
                residentialAddressSameAsProperty: 1,
                mailingAddressAdvisoryShownState: 1,
                postOfficeTypeId: 1,
                cityNames: 1,
                stateNames: 1,
                stateId: 1,
                provinceNames: 1,
                militaryRegions: 1,
                militaryRegionId: 1,
                zipCode: 1,
                countries: 1,
                countryId: 1
            });

            // global content for error text and required field
            componentContext.globalContentMixin.call(me, ['errorAnnouncementAda', 'requiredAda']);

            // For namespacing
            !_model.blockName && me.model.set('blockName', me.key);
            !_model.blockId && me.model.set('blockId', 'blx-'+me.key);
        };


    };
});
// jscpd:ignore-start
define('canadaAddress-cmpt/views/spec/address',{
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
        'validateProvince': {
            'action': 'view.validateProvince',
            'preventDefault': true
        },
        'formFieldTracking': {
            'action': 'formField'
        }
    }
});
// jscpd:ignore-end;
define('canadaAddress-cmpt/template/canada',[], function() { return {"v":4,"t":[{"t":7,"e":"div","m":[{"n":"class","f":"jpmcbb canadaAddressForm","t":13}],"f":[{"t":4,"f":[" ",{"t":8,"r":"addressLine"}," ",{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldRow","t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-city-fldgrp"],"t":13},{"n":"analyticsId","f":"cityId","t":13},{"n":"groupType","f":"validationInput vertical","t":13},{"n":"label","f":[{"t":2,"r":".cityNamesLabel","s":true}],"t":13},{"n":"inputValue","f":[{"t":2,"r":".cityId"}],"t":13},{"n":"validationInput","f":["{ 'name':'cityId', 'placeholder': '', 'addValidation':'true', 'errorMessage':",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"cityId\""},"errorMessage"]}},", 'errorMessageForce':",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"cityId\""},"errorMessage"]}},", 'rBlur': 'validateField', 'rFocus': 'formFieldTracking', 'rChange': 'formFieldTracking', 'maxLength':'30', 'required': true, 'labelErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"', 'autocomplete': 'new-password' }"],"t":13}]}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-prov-fldgrp"],"t":13},{"n":"analyticsId","f":"provinceId","t":13},{"n":"groupType","f":"validationStyledSelect vertical","t":13},{"n":"label","f":[{"t":2,"r":".provinceNamesLabel","s":true}],"t":13},{"n":"styledSelectValue","f":[{"t":2,"r":"provinceId"}],"t":13},{"n":"validationStyledSelect","f":["{ 'name': 'provinceId', 'value': ",{"t":2,"r":"provinceId"},", 'options': ",{"t":2,"r":"provinceNames"},", 'placeholder': ",{"t":2,"r":".provinceNamePlaceholder","s":true},", 'errorMessage': ",{"t":2,"rx":{"r":".v","m":[{"r":[],"s":"\"provinceId\""},"errorMessage"]}},", 'aria': { selected: '",{"t":2,"r":".currentSelectionAda","s":true},"', bottomOfMenu: '",{"t":2,"r":".endOfSelectionAda","s":true},"', buttonLabel: '",{"t":2,"r":".provinceNamesLabel","s":true}," ",{"t":2,"r":".requiredAda","s":true},"', describedByButton: 'provinceId' }, 'rChange': ['formFieldTracking', 'validateProvince'], 'rBlur': ['formFieldTracking','validateProvince'], 'classicResponsive': true, 'isRequired': true, 'hatErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"', 'autocomplete': 'new-password' }"],"t":13}]}]}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"row","t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"col-xs-12 col-sm-6","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-postalcd-fldgrp"],"t":13},{"n":"analyticsId","f":"postalCode","t":13},{"n":"groupType","f":"validationInput vertical","t":13},{"n":"label","f":[{"t":2,"r":"./postalCodeLabel","s":true}],"t":13},{"n":"inputValue","f":[{"t":2,"r":"./postalCode"}],"t":13},{"n":"validationInput","f":["{ 'name':'postalCode', 'placeholder':'', 'addValidation':'true', 'errorMessage': ",{"t":2,"rx":{"r":"./v","m":[{"r":[],"s":"\"postalCode\""},"errorMessage"]}},", 'errorMessageForce': ",{"t":2,"rx":{"r":"./v","m":[{"r":[],"s":"\"postalCode\""},"errorMessage"]}},", 'rBlur': 'validateField', 'rFocus': 'formFieldTracking', 'rChange': 'formFieldTracking', 'maxLength':'20', 'required': true, 'labelErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"', 'autocomplete': 'new-password' }"],"t":13}]}]}]}],"n":50,"x":{"r":[".customerInformationAvailable",".editMode"],"s":"!_0||_1"}},{"t":4,"n":51,"f":[{"t":8,"r":"addrExistingUser"}],"l":1}]}],"e":{}}; });
define('canadaAddress-cmpt/template/_addrLine',[], function() { return {"v":4,"t":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldRow","t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addrl1-fldgrp"],"t":13},{"n":"analyticsId","f":"addressLine1","t":13},{"n":"groupType","f":"validationInput vertical","t":13},{"n":"label","f":[{"t":2,"r":"addressLine1Label","s":true}],"t":13},{"n":"inputValue","f":[{"t":2,"r":"addressLine1"}],"t":13},{"n":"validationInput","f":["{ 'name':'addressLine1', 'placeholder': '', 'addValidation':'true', 'errorMessage':",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"addressLine1\""},"errorMessage"]}},", 'errorMessageForce':",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"addressLine1\""},"errorMessage"]}},", 'rBlur': 'validateField', 'rFocus': 'formFieldTracking', 'rChange': 'formFieldTracking', 'maxLength':'30', 'required': true, 'labelErrorPrefix': '",{"t":2,"r":"errorAnnouncementAda","s":true},"', 'autocomplete': 'new-password' }"],"t":13}]}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addrl2-fldgrp"],"t":13},{"n":"analyticsId","f":"addressLine2","t":13},{"n":"groupType","f":"validationInput vertical","t":13},{"n":"label","f":[{"t":2,"r":"addressLine2Label","s":true}],"t":13},{"n":"additionalText","f":[{"t":2,"r":".optionalLabel","s":true}],"t":13},{"n":"inputValue","f":[{"t":2,"r":"addressLine2"}],"t":13},{"n":"validationInput","f":["{ 'name':'addressLine2', 'placeholder':'', 'addValidation':'true', 'errorMessage':",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"addressLine2\""},"errorMessage"]}},", 'errorMessageForce':",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"addressLine2\""},"errorMessage"]}},", 'rBlur': 'validateField', 'rFocus': 'formFieldTracking', 'rChange': 'formFieldTracking', 'maxLength':'30', 'labelErrorPrefix': '",{"t":2,"r":"errorAnnouncementAda","s":true},"', 'autocomplete': 'new-password' }"],"t":13}]}]}]}],"e":{}}; });
define('canadaAddress-cmpt/template/_addrExistingUser',[], function() { return {"v":4,"t":[{"t":7,"e":"div","f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addr-street-fldgrp"],"t":13},{"n":"groupType","f":"fieldtext horizontal","t":13},{"n":"labelColumns","f":"col-xs-4 col-sm-6","t":13},{"n":"inputColumns","f":"col-xs-8 col-sm-6","t":13},{"n":"label","f":[{"t":2,"r":".addressLabel","s":true}],"t":13},{"n":"fieldTextValue","f":[{"t":2,"r":".addressLine1"},", ",{"t":2,"r":".addressLine2"}],"t":13}]}," ",{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addr-region-fldgrp"],"t":13},{"n":"groupType","f":"fieldtext horizontal","t":13},{"n":"labelColumns","f":"col-xs-4 col-sm-6","t":13},{"n":"inputColumns","f":"col-xs-8 col-sm-6","t":13},{"n":"label","f":" ","t":13},{"n":"fieldTextValue","f":[{"t":2,"r":".cityId"},", ",{"t":2,"r":".stateId"}," ",{"t":2,"r":".zipCode"}],"t":13}]}]}]}; });
define('canadaAddress-cmpt/views/canada',['require','canadaAddress-cmpt/views/spec/address','appkit-utilities/validation/trigger','canadaAddress-cmpt/template/canada','canadaAddress-cmpt/template/_addrLine','canadaAddress-cmpt/template/_addrExistingUser','blue-ui/view/collections/fieldgroup','blue-ui/view/modules/styledselect','blue-ui/view/elements/checkbox'],function(require) {
    'use strict';

    return function canadaView(viewContext) {
        var me = this;
        var extend = viewContext.util.object.extend,
            webSpec = require('canadaAddress-cmpt/views/spec/address'),
            triggers = require('appkit-utilities/validation/trigger');
        /**
         * view initialization code
         */
        me.init = function() {};

        // extend webspec with validation triggers from appkit utilities
        viewContext.page.triggers = triggers;
        extend(webSpec.triggers, viewContext.page.triggers);

        me.bridge = webSpec;

        me.template = require('canadaAddress-cmpt/template/canada');

        me.partials = {
            'addressLine': require('canadaAddress-cmpt/template/_addrLine'),
            'addrExistingUser': require('canadaAddress-cmpt/template/_addrExistingUser')
        };

        me.views = {
            'blueFieldGroup': require('blue-ui/view/collections/fieldgroup'),
            'blueStyledSelect': require('blue-ui/view/modules/styledselect'),
            'blueCheckbox': require('blue-ui/view/elements/checkbox')
        };

        /**
         * view action to check province field is selected
         */
        me.validateProvince = function(event){

            me.model.provinceId = event.context.value;
            if(!event.context.open){ 
                me.trigger('validateField', event);
            }
        };

    };

});
