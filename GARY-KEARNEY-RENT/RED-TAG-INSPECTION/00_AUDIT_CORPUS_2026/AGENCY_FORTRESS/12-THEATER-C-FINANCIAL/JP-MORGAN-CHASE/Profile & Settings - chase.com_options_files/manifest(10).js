define('militaryAddress-cmpt/manifest',{
    component: {
        spec: 'blue-spec-shared/address'
    },
    views: {
        militaryAddressView: './views/military'
    }
});
define('militaryAddress-cmpt/validator',['require','form-blocks-common/validationUtil'],function(require) {
    'use strict';

    var util = require('form-blocks-common/validationUtil'),
        // military address field Regex
        addressRegex = {
            addressLine1: /^[a-zA-Z0-9,:/$&#'\-. ]{0,30}$/,
            addressLine2: /^[a-zA-Z0-9,:/$&#'\-. ]{0,30}$/,
            postalCode: /^[a-zA-Z0-9 ]{1,20}$/
        },
        validPostalCodeMap = {
            AA: ['340'],
            AP: ['962', '963', '964', '965', '966'],
            AE: ['090', '091', '092', '093', '094', '095', '096', '097', '098']
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
        validatePostalCode = function (data, model) {
            var result = validateProperty(data, model),
                militaryRegionId = model.militaryRegionId,
                property = util.getProperty(data, model);
                if(militaryRegionId && validPostalCodeMap[militaryRegionId] && result.isValid) {
                    result.isValid = validPostalCodeMap[militaryRegionId].filter(function (item) {
                        return property.startsWith(item);
                    }).length > 0;
                    result.errorType = result.isValid ? '' : 'MILITARY_ADDRESS_NOT_ALLOWED';
                }
                return result;
        },

        // custom validators for military address
        formValidators = {
            addressLine1: validateProperty,
            addressLine2: validateOptionalProperty,
            postOfficeTypeId: util.validateSelection,
            militaryRegionId: util.validateSelection,
            postalCode: validatePostalCode
        };

    return formValidators;
});
define('militaryAddress-cmpt/component',['require','appkit-utilities/validation/componentValidate','militaryAddress-cmpt/validator'],function(require) {
    'use strict';

    return function militaryComponent(componentContext) {
        var me = this;

        /**
         * component initalization code
         * executes before the component is enabled
         */
        me.init = function() {
            var validation = require('appkit-utilities/validation/componentValidate');
            var militaryAddressValidator = require(
                'militaryAddress-cmpt/validator');
            var _model = me.model.get();

            validation.call(me, componentContext, militaryAddressValidator);

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
                cityNames: 1,
                cityId: 1,
                stateNames: 1,
                stateId: 1,
                provinceNames: 1,
                provinceId: 1,
                militaryRegions: 1,
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
define('militaryAddress-cmpt/views/spec/address',{
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
        'updatePostOfficeType': {
            'action': 'view.updatePostOfficeType',
            'preventDefault': true
        },
        'updateMilitaryRegion': {
            'action': 'view.updateMilitaryRegion',
            'preventDefault': true
        },
        'formFieldTracking': {
            'action': 'formField'
        }
    }
});
// jscpd:ignore-end;
define('militaryAddress-cmpt/template/military',[], function() { return {"v":4,"t":[{"t":7,"e":"div","m":[{"n":"class","f":"jpmcbb internationalAddressForm","t":13}],"f":[{"t":4,"f":[" ",{"t":8,"r":"addressLine"}," ",{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldRow","t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-city-fldgrp"],"t":13},{"n":"analyticsId","f":"postOfficeTypeId","t":13},{"n":"groupType","f":"styledselect vertical","t":13},{"n":"label","f":[{"t":2,"r":".cityNamesLabel","s":true}],"t":13},{"n":"styledSelectValue","f":[{"t":2,"r":"postOfficeTypeId"}],"t":13},{"n":"styledselect","f":["{ 'name': 'postOfficeTypeId', 'value': ",{"t":2,"r":"postOfficeTypeId"},", 'options': ",{"t":2,"r":"postOfficeTypes"},", 'placeholder': ",{"t":2,"r":"selectDataPlaceholder","s":true},", 'addValidation': true, 'errorMessage': ",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"postOfficeTypeId\""},"errorMessage"]}},", 'errorMessageForce': ",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"postOfficeTypeId\""},"errorMessage"]}},", 'aria': { selected: '",{"t":2,"r":".currentSelectionAda","s":true},"', bottomOfMenu: '",{"t":2,"r":".endOfSelectionAda","s":true},"', buttonLabel: '",{"t":2,"r":".cityNamesLabel","s":true}," ",{"t":2,"r":".requiredAda","s":true},"', buttonLabelErrorText: '",{"t":2,"r":".errorAnnouncementAda","s":true},"' }, 'rChange': ['formFieldTracking', 'updatePostOfficeType'], 'rBlur': ['formFieldTracking','updatePostOfficeType'], 'classicResponsive': true, 'isRequired': true, 'labelErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"' }"],"t":13}]}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-state-prov-fldgrp"],"t":13},{"n":"analyticsId","f":"militaryRegionId","t":13},{"n":"groupType","f":"styledselect vertical","t":13},{"n":"label","f":[{"t":2,"r":"stateNamesLabel","s":true}],"t":13},{"n":"inputValue","f":[{"t":2,"r":".militaryRegionId"}],"t":13},{"n":"styledSelectValue","f":[{"t":2,"r":"militaryRegionId"}],"t":13},{"n":"styledselect","f":["{ 'name': 'militaryRegionId', 'value': ",{"t":2,"r":"militaryRegionId"},", 'options': ",{"t":2,"r":"militaryRegions"},", 'placeholder': ",{"t":2,"r":"selectDataPlaceholder","s":true},", 'addValidation': true, 'errorMessage': ",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"militaryRegionId\""},"errorMessage"]}},", 'errorMessageForce': ",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"militaryRegionId\""},"errorMessage"]}},", 'aria': { selected: '",{"t":2,"r":".currentSelectionAda","s":true},"', bottomOfMenu: '",{"t":2,"r":".endOfSelectionAda","s":true},"', buttonLabel: '",{"t":2,"r":".stateNamesLabel","s":true}," ",{"t":2,"r":".requiredAda","s":true},"', buttonLabelErrorText: '",{"t":2,"r":".errorAnnouncementAda","s":true},"' }, 'rChange': ['formFieldTracking', 'updateMilitaryRegion'], 'rBlur': ['formFieldTracking','updateMilitaryRegion'], 'classicResponsive': true, 'isRequired': true, 'labelErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"' }"],"t":13}]}]}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"row","t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"col-xs-12 col-sm-6","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-postalCode-fldgrp"],"t":13},{"n":"analyticsId","f":"postalCode","t":13},{"n":"groupType","f":"textbox vertical","t":13},{"n":"label","f":[{"t":2,"r":"./postalCodeLabel","s":true}],"t":13},{"n":"inputValue","f":[{"t":2,"r":"./postalCode"}],"t":13},{"n":"input","f":["{ 'name':'postalCode', 'placeholder':'', 'addValidation':'true', 'errorMessage': ",{"t":2,"rx":{"r":"./v","m":[{"r":[],"s":"\"postalCode\""},"errorMessage"]}},", 'errorMessageForce': ",{"t":2,"rx":{"r":"./v","m":[{"r":[],"s":"\"postalCode\""},"errorMessage"]}},", 'rBlur': 'validateField', 'rFocus': 'formFieldTracking', 'rChange': 'formFieldTracking', 'maxLength':'20', 'type': 'tel', 'required': true, 'labelErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"' }"],"t":13}]}]}]}],"n":50,"x":{"r":[".customerInformationAvailable",".editMode"],"s":"!_0||_1"}},{"t":4,"n":51,"f":[{"t":8,"r":"addrExistingUser"}],"l":1}]}],"e":{}}; });
define('militaryAddress-cmpt/template/_addrLine',[], function() { return {"v":4,"t":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldRow","t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addrl1-fldgrp"],"t":13},{"n":"analyticsId","f":"addressLine1","t":13},{"n":"groupType","f":"textbox vertical","t":13},{"n":"label","f":[{"t":2,"r":"addressLine1Label","s":true}],"t":13},{"n":"inputValue","f":[{"t":2,"r":"addressLine1"}],"t":13},{"n":"input","f":["{ 'name':'addressLine1', 'placeholder': '', 'addValidation':'true', 'errorMessage':",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"addressLine1\""},"errorMessage"]}},", 'errorMessageForce':",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"addressLine1\""},"errorMessage"]}},", 'rBlur': 'validateField', 'rFocus': 'formFieldTracking', 'rChange': 'formFieldTracking', 'maxLength':'30', 'required': true, 'labelErrorPrefix': '",{"t":2,"r":"errorAnnouncementAda","s":true},"' }"],"t":13}]}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addrl2-fldgrp"],"t":13},{"n":"analyticsId","f":"addressLine2","t":13},{"n":"groupType","f":"textbox vertical","t":13},{"n":"label","f":[{"t":2,"r":"addressLine2Label","s":true}],"t":13},{"n":"additionalText","f":[{"t":2,"r":".optionalLabel","s":true}],"t":13},{"n":"inputValue","f":[{"t":2,"r":"addressLine2"}],"t":13},{"n":"input","f":["{ 'name':'addressLine2', 'placeholder':'', 'addValidation':'true', 'errorMessage':",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"addressLine2\""},"errorMessage"]}},", 'errorMessageForce':",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"addressLine2\""},"errorMessage"]}},", 'rBlur': 'validateField', 'rFocus': 'formFieldTracking', 'rChange': 'formFieldTracking', 'maxLength':'30', 'labelErrorPrefix': '",{"t":2,"r":"errorAnnouncementAda","s":true},"' }"],"t":13}]}]}]}],"e":{}}; });
define('militaryAddress-cmpt/template/_addrExistingUser',[], function() { return {"v":4,"t":[{"t":7,"e":"div","f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addr-street-fldgrp"],"t":13},{"n":"groupType","f":"fieldtext horizontal","t":13},{"n":"labelColumns","f":"col-xs-4 col-sm-6","t":13},{"n":"inputColumns","f":"col-xs-8 col-sm-6","t":13},{"n":"label","f":[{"t":2,"r":".addressLabel","s":true}],"t":13},{"n":"fieldTextValue","f":[{"t":2,"r":".addressLine1"},", ",{"t":2,"r":".addressLine2"}],"t":13}]}," ",{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addr-region-fldgrp"],"t":13},{"n":"groupType","f":"fieldtext horizontal","t":13},{"n":"labelColumns","f":"col-xs-4 col-sm-6","t":13},{"n":"inputColumns","f":"col-xs-8 col-sm-6","t":13},{"n":"label","f":" ","t":13},{"n":"fieldTextValue","f":[{"t":2,"r":".cityId"},", ",{"t":2,"r":".stateId"}," ",{"t":2,"r":".zipCode"}],"t":13}]}]}]}; });
define('militaryAddress-cmpt/views/military',['require','militaryAddress-cmpt/views/spec/address','appkit-utilities/validation/trigger','militaryAddress-cmpt/template/military','militaryAddress-cmpt/template/_addrLine','militaryAddress-cmpt/template/_addrExistingUser','blue-ui/view/collections/fieldgroup','blue-ui/view/modules/styledselect','blue-ui/view/elements/radiobutton'],function(require) {
    'use strict';

    return function militaryView(viewContext) {
        var me = this;
        var extend = viewContext.util.object.extend,
            webSpec = require('militaryAddress-cmpt/views/spec/address'),
            triggers = require('appkit-utilities/validation/trigger');
        /**
         * view initialization code
         */
        me.init = function() {};

        // extend webspec with validation triggers for military address
        viewContext.page.triggers = triggers;
        extend(webSpec.triggers, viewContext.page.triggers);

        me.bridge = webSpec;

        me.template = require('militaryAddress-cmpt/template/military');

        me.partials = {
            'addressLine': require('militaryAddress-cmpt/template/_addrLine'),
            'addrExistingUser': require('militaryAddress-cmpt/template/_addrExistingUser')
        };

        me.views = {
            'blueFieldGroup': require('blue-ui/view/collections/fieldgroup'),
            'blueStyledSelect': require('blue-ui/view/modules/styledselect'),
            'blueRadioButton': require('blue-ui/view/elements/radiobutton')
        };

        /**
         * view action to check PostOfficeType field is selected
         */
        me.updatePostOfficeType = function(event){
            me.model.postOfficeTypeId = event.context.value || '';
            me._validateField(event);
        };

        /**
         * view action to check MilitaryRegion field is selected
         */
        me.updateMilitaryRegion = function(event){
            me.model.militaryRegionId = event.context.value || '';
            me._validateField(event);
            //only when region and postal code both exist, we need trigger postal code region validaton
            if(me.model.militaryRegionId && me.model.postalCode) {
                me._validateField({context: {name: 'postalCode', open: event.context.open}});
            }
        };

        /**
         * Calls Component validate action to validate the input field data
         */
        me._validateField = function(event) {
            if(!event.context.open){ 
                me.trigger('validateField', event);
            }
        };

    };

});
