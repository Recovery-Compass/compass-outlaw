define('address-cmpt/manifest',{
    component: {
        spec: 'blue-spec-shared/address'
    },
    views: {
        addressFormView: './views/addressForm'
    }
});
define('address-cmpt/validator',['require','form-blocks-common/validationUtil'],function(require) {
    'use strict';

    var util = require('form-blocks-common/validationUtil'),
        // Regex for US address fields
        addressRegex = {
            streetAddress: /^[a-zA-Z0-9,:/$&#'\-. ]{0,40}$/,
            apartmentNumber: /^[a-zA-Z0-9,:/$&#'\-. ]{0,40}$/,
            POBox: /^\s*(PO|P\.O\.|P O|P\. O\.|P\. O|POST OFFICE) /i,
            COAddress: /(C\.O\.|C\. O\.|C\/O|CARE OF|CARE-OF)/i,
            zipCode: /^[0-9]{5}$/
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
        // Additional address validations for US address
        USmailingAddress = function(data, model) {
            var result = validateOptionalProperty(data, model),
                property = util.getProperty(data, model);

            if (result.isValid && data.item === 'streetAddress') {
                result = util.checkMissingMandatory(property);
            }

            if (property && result.isValid) {

                if (!model.POBoxes) {
                    result = util.checkInvalidData(
                        property, addressRegex.POBox, 'INVALID_WORD');
                }

                if (result.isValid && !model.COAddresses) {
                    result = util.checkInvalidData(
                        property, addressRegex.COAddress, 'CARE_OF_ADDRESS_NOT_ALLOWED');
                }
            }
            return result;
        },
        // custom validators for US address fields
        formValidators = {
            streetAddress: USmailingAddress,
            apartmentNumber: USmailingAddress,
            zipCode: validateProperty
        };
    return formValidators;
});
define('address-cmpt/addressValByPass',[],function() {
    'use strict';
    return {
        addressLine1: 1,
        addressLine2: 1,
        addressId: 1,
        addressType: 1,
        addressCategories: 1,
        postOfficeTypes: 1,
        addressCategoryId: 1,
        googleAddressSuggestionAccepted: 1,
        residentialAddressSameAsProperty: 1,
        postOfficeTypeId: 1,
        cityNames: 1,
        cityId: 1,
        stateNames: 1,
        stateId: 1,
        provinceNames: 1,
        provinceId: 1,
        militaryRegions: 1,
        militaryRegionId: 1,
        postalCode: 1,
        countries: 1,
        countryId: 1,
        stateOrProvince: 1
    };
});
define('address-cmpt/component',['require','appkit-utilities/validation/componentValidate','address-cmpt/validator','address-cmpt/addressValByPass'],function(require) {
    'use strict';

    return function addressFormComponent(componentContext) {

        var me = this;
        /**
         * component initalization code
         * executes before the component is enabled
         */
        me.init = function() {
            var validation = require(
                    'appkit-utilities/validation/componentValidate'),
                addressFormValidations = require(
                    'address-cmpt/validator'),
                _model = me.model.get();
            // add validation methods and custom validations
            validation.call(me, componentContext, addressFormValidations);
            // Set validation bypass object for appkit validation
            // to ignore spec data points when form validation is checked
            me.model.set('byPass', require('address-cmpt/addressValByPass'));

            // global content for error text and required field
            componentContext.globalContentMixin.call(me, ['errorAnnouncementAda', 'requiredAda']);

            // For namespacing
            !_model.blockName && me.model.set('blockName', me.key);
            !_model.blockId && me.model.set('blockId', 'blx-'+me.key);
            // Address block configurations
            // 'vertical' by default
            !_model.layoutDirection && me.model.set('layoutDirection', 'vertical');
             // disabled by default
            _model.POBoxes === (false || undefined) && me.model.set('POBoxes', false);
             // enabled by default
            _model.COAddresses === (false || undefined) && me.model.set('COAddresses', true);
            // added address advisory note
            !_model.mailingAddressAdvisoryShownState && me.model.set('mailingAddressAdvisoryShownState', false);
            // disabled by default
            !_model.hideAddressLines  === (false || undefined) && me.model.set('hideAddressLines', false);
            // disabled by default
            !_model.hideZipCode === (false || undefined) && me.model.set('hideZipCode', false);
        
        };

        // Component Action Handlers:

        /**
         * component action handler to request city and state
         * @param  {Object} e - contains zipcode
         */
        me.requestCityAndState = function(e) {
            me.validateDataItem(e);
            if(me.v.zipCode.isValid) {
                // reset states
                me.cityAndStateAvailable = false;
                me.zipCodeErrorDisplayed = false;
                // call controller action that calls service
                componentContext.handleZipCodeEntered(e.context.value, me);
            }
        };

        /**
         * private method to invalidate the zipcode field
         * @param  {Object} e - contains zipcode
         */
        me._invalidateField = function(e) {
            var errorMessage = componentContext.dcu.dynamicContent.get(
                me, e.property + 'Error', e.errorType
            );
            var evnt = {
                    name: e.property,
                    property: e.property,
                    isValid: false,
                    errorType: e.errorType,
                    errorMessage: e.errorMessage || errorMessage
            };
            var v = me.v;
            v[e.property] = evnt;
            // set validation state
            me.v = v;
        };
    };
});

// jscpd:ignore-start
define('address-cmpt/views/spec/address',{
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
        'customerInformationAvailable': {},
        'cityAndStateAvailable': {},
        'zipCodeErrorDisplayed': {},
        'mailingAddressAdvisoryShownState': {}
    },
    'triggers': {
        'formatZip': {
            'action': 'view.formatZip'
        },
        'updateCity': {
            'action': 'view.updateCity'
        },
        'updateState': {
            'action': 'view.updateState'
        },
        'formFieldTracking': {
            'action': 'formField'
        }
    }
});
// jscpd:ignore-end
;
define('address-cmpt/template/addressForm',[], function() { return {"v":4,"t":[{"t":7,"e":"div","f":[{"t":7,"e":"div","m":[{"n":"class","f":"jpmcbb addressForm","t":13}],"f":[{"t":4,"f":[" ",{"t":4,"f":[{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldRow","t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":8,"r":"addressLine1FieldGroup"}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":8,"r":"addressLine2FieldGroup"}]}]}],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"vertical\""}},{"t":4,"n":51,"f":[{"t":8,"r":"addressLine1FieldGroup"}," ",{"t":8,"r":"addressLine2FieldGroup"}],"l":1}],"n":50,"x":{"r":[".hideAddressLines"],"s":"!_0"}}," ",{"t":4,"f":[{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"row","t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"col-xs-12 col-sm-6","t":13}],"f":[{"t":8,"r":"zipCodeFieldGroupInput"}]}]}],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"vertical\""}},{"t":4,"n":51,"f":[{"t":8,"r":"zipCodeFieldGroupInput"}],"l":1}," ",{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldRow","t":13}],"f":[{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[" ",{"t":8,"r":"cityFieldGroup"}]}],"n":50,"x":{"r":[".cityNames.length"],"s":"_0>1"}},{"t":4,"n":51,"f":[{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[" ",{"t":8,"r":"zipCodeFieldGroupFieldText"}]}],"n":50,"r":"cityNames"}],"l":1}," ",{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":8,"r":"stateFieldGroupInput"}]}],"n":50,"x":{"r":[".stateNames.length"],"s":"_0>1"}},{"t":4,"n":51,"f":[{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":8,"r":"stateFieldGroupFieldText"}]}],"n":50,"r":".cityNames"}],"l":1}]}],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"vertical\""}},{"t":4,"n":51,"f":[{"t":4,"f":[" ",{"t":8,"r":"cityFieldGroup"}],"n":50,"x":{"r":[".cityNames.length"],"s":"_0>1"}},{"t":4,"n":51,"f":[{"t":4,"f":[" ",{"t":8,"r":"zipCodeFieldGroupFieldText"}],"n":50,"r":"cityNames"}],"l":1}," ",{"t":4,"f":[{"t":8,"r":"stateFieldGroupInput"}],"n":50,"x":{"r":[".stateNames.length"],"s":"_0>1"}},{"t":4,"n":51,"f":[{"t":4,"f":[{"t":8,"r":"stateFieldGroupFieldText"}],"n":50,"r":".cityNames"}],"l":1}],"l":1}],"n":50,"x":{"r":[".hideZipCode"],"s":"!_0"}}],"n":50,"x":{"r":[".customerInformationAvailable",".editMode"],"s":"!_0||_1"}},{"t":4,"n":51,"f":[{"t":8,"r":"addrExistingUser"}],"l":1}]}," "],"p":{"addressLine1FieldGroup":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addrl1-fldgrp"],"t":13},{"n":"analyticsId","f":"streetAddress","t":13},{"n":"groupType","f":["validationInput ",{"t":2,"r":".layoutDirection","s":true}],"t":13},{"n":"labelColumns","f":[{"t":4,"f":["col-xs-12 col-sm-4"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"inputColumns","f":[{"t":4,"f":["fieldtext-wrapper col-xs-12 col-sm-8"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"label","f":[{"t":2,"r":".streetAddressLabel","s":true}],"t":13},{"n":"inputValue","f":[{"t":2,"r":".streetAddress"}],"t":13},{"n":"validationInput","f":["{ 'name':'streetAddress', 'placeholder': '', 'addValidation':'true', 'errorMessage':",{"t":2,"rx":{"r":".v","m":[{"r":[],"s":"\"streetAddress\""},"errorMessage"]}},", 'errorMessageForce':",{"t":2,"rx":{"r":".v","m":[{"r":[],"s":"\"streetAddress\""},"errorMessage"]}},", 'rBlur': 'validateField', 'rFocus': 'formFieldTracking', 'rChange': 'formFieldTracking', 'maxLength':'40', 'required': true, 'labelErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"', 'autocomplete': 'new-password' }"],"t":13},{"t":4,"f":[{"n":"fieldHelperText","f":["{ 'text': '",{"t":2,"r":"~/mailingAddressAdvisory","s":true},"' }"],"t":13}],"n":50,"r":".mailingAddressAdvisoryShownState"},{"n":"classes","f":"blockFieldGroupXs","t":13}]}],"addressLine2FieldGroup":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addrl2-fldgrp"],"t":13},{"n":"analyticsId","f":"apartmentNumber","t":13},{"n":"groupType","f":["validationInput ",{"t":2,"r":".layoutDirection","s":true}],"t":13},{"n":"labelColumns","f":[{"t":4,"f":["col-xs-12 col-sm-4"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"inputColumns","f":[{"t":4,"f":["fieldtext-wrapper col-xs-12 col-sm-8"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"label","f":[{"t":2,"r":".apartmentNumberLabel","s":true}," ",{"t":2,"r":".optionalLabel","s":true}],"t":13},{"n":"inputValue","f":[{"t":2,"r":".apartmentNumber"}],"t":13},{"n":"validationInput","f":["{ 'name':'apartmentNumber', 'placeholder':'', 'addValidation':'true', 'errorMessage':",{"t":2,"rx":{"r":".v","m":[{"r":[],"s":"\"apartmentNumber\""},"errorMessage"]}},", 'errorMessageForce':",{"t":2,"rx":{"r":".v","m":[{"r":[],"s":"\"apartmentNumber\""},"errorMessage"]}},", 'rBlur': 'validateField', 'rFocus': 'formFieldTracking', 'rChange': 'formFieldTracking', 'maxLength':'40', 'labelErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"', 'autocomplete': 'new-password' }"],"t":13},{"n":"classes","f":"blockFieldGroupXs","t":13}]}],"zipCodeFieldGroupInput":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-zipcd-fldgrp"],"t":13},{"n":"analyticsId","f":"zipCode","t":13},{"n":"groupType","f":["validationInput ",{"t":2,"r":".layoutDirection","s":true}],"t":13},{"n":"labelColumns","f":[{"t":4,"f":["label-wrapper col-xs-12 col-sm-4"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"inputColumns","f":[{"t":4,"f":["fieldtext-wrapper col-xs-5 col-sm-3 col-md-2"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"label","f":[{"t":2,"r":".zipCodeLabel","s":true}],"t":13},{"n":"fieldHelperText","f":["{ text:'",{"t":2,"r":".zipCodeAdvisory","s":true},"' }"],"t":13},{"n":"inputValue","f":[{"t":2,"r":".zipCode"}],"t":13},{"n":"validationInput","f":["{ 'name':'zipCode', 'placeholder':'', 'addValidation':'true', 'errorMessage': ",{"t":2,"rx":{"r":".v","m":[{"r":[],"s":"\"zipCode\""},"errorMessage"]}},", 'errorMessageForce': ",{"t":2,"rx":{"r":".v","m":[{"r":[],"s":"\"zipCode\""},"errorMessage"]}},", 'rBlur': 'requestCityAndState', 'rKeyup': 'formatZip', 'rFocus': 'formFieldTracking', 'rChange': 'formFieldTracking', 'maxLength':'5', 'required': true, 'type': 'tel', 'ariaPlaceholder': '",{"t":2,"r":".requestCityAndStateAda","s":true},"', 'labelErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"', 'autocomplete': 'new-password' }"],"t":13},{"n":"classes","f":"blockFieldGroupXs","t":13}]}],"cityFieldGroup":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-city-fldgrp"],"t":13},{"n":"analyticsId","f":"cityId","t":13},{"n":"groupType","f":[{"t":2,"r":".layoutDirection","s":true}," styledselect"],"t":13},{"n":"labelColumns","f":[{"t":4,"f":["col-xs-12 col-sm-4"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"inputColumns","f":[{"t":4,"f":["fieldtext-wrapper col-xs-12 col-sm-8"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"label","f":[{"t":2,"r":".cityNamesLabel","s":true}],"t":13},{"n":"styledSelectValue","f":[{"t":2,"r":".cityId"}],"t":13},{"n":"styledselect","f":["{ 'name': 'cityId', 'options': ",{"t":2,"r":".cityNames"},", 'aria': { selected: '",{"t":2,"r":".currentSelectionAda","s":true},"', bottomOfMenu: '",{"t":2,"r":".endOfSelectionAda","s":true},"', buttonLabel: '",{"t":2,"r":".cityNamesLabel","s":true}," ",{"t":2,"r":".requiredAda","s":true},"', buttonLabelErrorText: '",{"t":2,"r":".errorAnnouncementAda","s":true},"' }, 'rFocus': 'formFieldTracking', 'rChange': ['formFieldTracking', 'updateCity'], 'classicShow':false, 'classicResponsive': true }"],"t":13},{"n":"classes","f":"blockFieldGroupXs","t":13}]}],"zipCodeFieldGroupFieldText":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-city-fldgrp"],"t":13},{"n":"groupType","f":["fieldtext ",{"t":2,"r":".layoutDirection","s":true}],"t":13},{"n":"labelColumns","f":[{"t":4,"f":["col-xs-12 col-sm-4"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"inputColumns","f":[{"t":4,"f":["col-xs-12 col-xs-8"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"label","f":[{"t":2,"r":".cityNamesLabel","s":true}],"t":13},{"n":"fieldTextValue","f":[{"t":2,"r":".cityNames.0.name"}],"t":13},{"n":"classes","f":"blockFieldGroupXs","t":13}]}],"stateFieldGroupInput":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-state-fldgrp"],"t":13},{"n":"analyticsId","f":"stateId","t":13},{"n":"groupType","f":[{"t":2,"r":".layoutDirection","s":true}," styledselect"],"t":13},{"n":"labelColumns","f":[{"t":4,"f":["col-xs-12 col-sm-4"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"inputColumns","f":[{"t":4,"f":["col-xs-12 col-sm-8"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"label","f":[{"t":2,"r":".stateNamesLabel","s":true}],"t":13},{"n":"styledSelectValue","f":[{"t":2,"r":".stateId"}],"t":13},{"n":"styledselect","f":["{ 'name': 'stateId', 'options': ",{"t":2,"r":".stateNames"},", 'aria': { selected: '",{"t":2,"r":".currentSelectionAda","s":true},"', bottomOfMenu: '",{"t":2,"r":".endOfSelectionAda","s":true},"', buttonLabel: '",{"t":2,"r":".stateNamesLabel","s":true}," ",{"t":2,"r":".requiredAda","s":true},"', buttonLabelErrorText: '",{"t":2,"r":".errorAnnouncementAda","s":true},"' }, 'rFocus': 'formFieldTracking', 'rChange': ['formFieldTracking', 'updateState'], 'classicShow':false, 'classicResponsive': true }"],"t":13},{"n":"classes","f":"blockFieldGroupXs","t":13}]}],"stateFieldGroupFieldText":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-state-fldgrp"],"t":13},{"n":"groupType","f":["fieldtext ",{"t":2,"r":".layoutDirection","s":true}],"t":13},{"n":"labelColumns","f":[{"t":4,"f":["col-xs-12 col-sm-4"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"inputColumns","f":[{"t":4,"f":["fieldtext-wrapper col-xs-12 col-sm-8"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13},{"n":"label","f":[{"t":2,"r":".stateNamesLabel","s":true}],"t":13},{"n":"fieldTextValue","f":[{"t":2,"r":".stateNames.0.name"}],"t":13},{"n":"classes","f":"blockFieldGroupXs","t":13}]}]}}],"e":{}}; });
define('address-cmpt/template/_addrExistingUser',[], function() { return {"v":4,"t":[{"t":7,"e":"div","f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addr-street-fldgrp"],"t":13},{"n":"groupType","f":"fieldtext horizontal","t":13},{"n":"labelColumns","f":"col-xs-4 col-sm-6","t":13},{"n":"inputColumns","f":"col-xs-8 col-sm-6","t":13},{"n":"label","f":[{"t":2,"r":".addressTypeHeader","s":true}],"t":13},{"n":"fieldTextValue","f":[{"t":2,"r":".addressLine1"},{"t":4,"f":[", "],"n":50,"r":".addressLine2"},{"t":2,"r":".addressLine2"}],"t":13}]}," ",{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-addr-region-fldgrp"],"t":13},{"n":"groupType","f":"fieldtext horizontal","t":13},{"n":"labelColumns","f":"col-xs-4 col-sm-6","t":13},{"n":"inputColumns","f":"col-xs-8 col-sm-6","t":13},{"n":"label","f":" ","t":13},{"n":"fieldTextValue","f":[{"t":2,"r":".cityId"},", ",{"t":2,"r":".stateId"}," ",{"t":2,"r":".zipCode"}],"t":13}]}]}]}; });
define('address-cmpt/views/addressForm',['require','address-cmpt/views/spec/address','appkit-utilities/validation/trigger','form-blocks-common/transitions/focus','address-cmpt/template/addressForm','blue-ui/view/modules/styledselect','blue-ui/view/collections/fieldgroup','blue-ui/template/elements/fieldlabel','address-cmpt/template/_addrExistingUser'],function(require) {
    'use strict';

    return function AddressFormView(viewContext) {
        var me = this;
        var extend = viewContext.util.object.extend,
            webSpec = require('address-cmpt/views/spec/address'),
            triggers = require('appkit-utilities/validation/trigger'),
            focusTransition = require('form-blocks-common/transitions/focus');

        me.init = function() {
            me.onData('cityAndStateAvailable', function(data){
                if(data){
                    me.focusOnCityField();
                }

            });

            me.onData('zipCodeErrorDisplayed', function(data){
                if(data){
                    me.focusOnZipFieldError();
                }
            });
        };

        // extend webspec with validation triggers from appkit utilities
        viewContext.page.triggers = triggers;
        extend(webSpec.triggers, viewContext.page.triggers);

        me.bridge = webSpec;

        me.template = require('address-cmpt/template/addressForm');

        me.transitions = {
            'focusOnRender': focusTransition.focusOnRender
        };

        me.views = {
            'blueStyledSelect': require('blue-ui/view/modules/styledselect'),
            'blueFieldGroup': require('blue-ui/view/collections/fieldgroup')
        };

        me.partials = {
            'blueFieldLabel': require('blue-ui/template/elements/fieldlabel'),
            'addrExistingUser': require('address-cmpt/template/_addrExistingUser')
        };

        me.onReady = function() {};

        /**
         * Put focus on the "City" field, whichever type it is that renders
         * (Styled Select or text field)
         */
        me.focusOnCityField = function() {
            var $cityStyledSelect = viewContext.$('#header-' + me.model.blockId + '-city-fldgrp-styledselect');
            var $cityTextField = viewContext.$('#' + me.model.blockId + '-city-fldgrp .fieldtext');
            /*
             * We put focus on the city field depending on which one renders
             * (Styled Select or text field).
             */
            if ($cityStyledSelect.length || $cityTextField.length) {
                if ($cityStyledSelect.length) {
                    $cityStyledSelect.focus();
                } else {
                    $cityTextField[1].focus();
                }
            }
        };

        /**
         * Put focus on the zipcode error message
         */
        me.focusOnZipFieldError = function() {
            var $zipErrorBubble = viewContext.$('#' + me.model.blockId + '-zipcd-fldgrp-text-error-message');

            $zipErrorBubble.focus();
        };

        /**
         * method to format the zip code
         */
        me.formatZip = function(e) {
            me.model.zipCode = e.context.value.match(/\d*/g).join('');
        };

        /**
         * update the model on city selection
         */
        me.updateCity = function(e){
            me.model.cityId = e.context.value;
        };

        /**
         * update the model on state selection
         */
        me.updateState = function(e){
            me.model.stateId = e.context.value;
        };

    };
});
