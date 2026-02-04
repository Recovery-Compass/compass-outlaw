define('nameInformation-cmpt/manifest',{
    component: {
        spec: 'blue-spec-shared/personal_name'
    },
    views: {
        nameInformationView: './views/nameInformation'
    }
});
define('nameInformation-cmpt/validator',['require','form-blocks-common/validationUtil'],function(require) {
    'use strict';
    
    var util = require('form-blocks-common/validationUtil'),
        nameRegex = {
            firstName: /^[a-zA-Z '-]{1,30}$/,
            middleName: /^[a-zA-Z '-]{1,10}$/,
            lastName: /^[a-zA-Z '-]{1,30}$/
        },
        validateOptionalProperty = function(data, model) {
            var result = {
                    isValid: true,
                    errorType: ''
                },
                property = util.getProperty(data, model);

            if (property) {
                result = util.validateDataFormat(result, property, nameRegex[data.item]);
            }

            return result;
        },
        validateProperty = function(data, model) {
            var property = util.getProperty(data, model),
                result = util.checkMissingMandatory(property);

            result = util.validateDataFormat(result, property, nameRegex[data.item]);

            return result;
        },
        formValidators = {
            firstName: validateProperty,
            middleName: validateOptionalProperty,
            lastName: validateProperty
        };
    return formValidators;
});
define('nameInformation-cmpt/component',['require','appkit-utilities/validation/componentValidate','nameInformation-cmpt/validator'],function(require) {
    'use strict';

    return function nameInformationComponent(componentContext) {
        var me = this;

        /**
         * component initalization code
         * executes before the component is enabled
         */
        me.init = function() {
            var validation = require('appkit-utilities/validation/componentValidate'),
                nameInformationValidations = require(
                    'nameInformation-cmpt/validator'),
                _model = me.model.get();

            validation.call(me, componentContext, nameInformationValidations);
            // Set validation bypass object for appkit validation
            // to ignore spec data points when form validation is checked
            me.model.set('byPass', {
                coapplicantNames: 1,
                coapplicantId: 1,
                personRole: 1,
                personalNameId: 1,
                nameSuffixes: 1,
                suffixId: 1
            });
            // For namespacing
            !_model.blockName && me.model.set('blockName', me.key);
            !_model.blockId && me.model.set('blockId', 'blx-'+me.key);
            // disabled by default
            !_model.showSuffixSelectDropDown && me.model.set('showSuffixSelectDropDown', false);
        };

        // Component Action Handlers:
        me.requestPersonalName = function() {};
    };
});
define('nameInformation-cmpt/views/spec/personalName',{
    'name': 'PERSONAL_NAME',
    'bindings': {
        'personRole': {
            'direction': 'BOTH'
        },
        'personalNameId': {
            'direction': 'BOTH'
        },
        'nameSuffixes': {
            'direction': 'BOTH'
        },
        'suffixId': {
            'direction': 'BOTH'
        },
        'firstName': {
            'direction': 'BOTH'
        },
        'middleName': {
            'direction': 'BOTH'
        },
        'lastName': {
            'direction': 'BOTH'
        }
    },
    'triggers': {
        'updateSuffix': {
            'action': 'view.updateSuffix'
        },
        'formFieldTracking': {
            'action': 'formField'
        }
    }
});
define('nameInformation-cmpt/template/nameInformation',[], function() { return {"v":4,"t":[{"t":7,"e":"div","m":[{"n":"class","f":"jpmcbb nameInformation","t":13}],"f":[" ",{"t":4,"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldRow","t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-first-name-fldgrp"],"t":13},{"n":"analyticsId","f":"firstName","t":13},{"n":"groupType","f":"textbox vertical","t":13},{"n":"label","f":[{"t":2,"r":".firstNameLabel","s":true}],"t":13},{"n":"inputValue","f":[{"t":2,"r":".firstName"}],"t":13},{"n":"input","f":["{ 'name':'firstName', 'placeholder':'', 'errorMessage': ",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"firstName\""},"errorMessage"]}},", 'errorMessageForce': ",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"firstName\""},"errorMessage"]}},", 'rBlur': 'validateField', 'rFocus': 'formFieldTracking', 'rChange': 'formFieldTracking', 'maxLength':'30', 'addValidation': true, 'labelErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"' }"],"t":13}]}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-middle-name-fldgrp"],"t":13},{"n":"analyticsId","f":"middleName","t":13},{"n":"groupType","f":"textbox vertical","t":13},{"n":"label","f":[{"t":2,"r":".middleNameLabel","s":true}],"t":13},{"n":"additionalText","f":[{"t":2,"r":".optionalLabel","s":true}],"t":13},{"n":"inputValue","f":[{"t":2,"r":".middleName"}],"t":13},{"n":"input","f":["{ 'name':'middleName', 'placeholder':'', 'errorMessage': ",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"middleName\""},"errorMessage"]}},", 'errorMessageForce': ",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"middleName\""},"errorMessage"]}},", 'rBlur': 'validateField', 'rFocus': 'formFieldTracking', 'rChange': 'formFieldTracking', 'maxLength':'10', 'addValidation': true, 'labelErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"' }"],"t":13}]}]}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldRow","t":13}],"f":[{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-last-name-fldgrp"],"t":13},{"n":"analyticsId","f":"lastName","t":13},{"n":"groupType","f":"textbox vertical","t":13},{"n":"label","f":[{"t":2,"r":".lastNameLabel","s":true}],"t":13},{"n":"inputValue","f":[{"t":2,"r":".lastName"}],"t":13},{"n":"input","f":["{ 'name':'lastName', 'placeholder':'', 'errorMessage': ",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"lastName\""},"errorMessage"]}},", 'errorMessageForce': ",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"lastName\""},"errorMessage"]}},", 'rBlur': 'validateField', 'rFocus': 'formFieldTracking', 'rChange': 'formFieldTracking', 'maxLength':'30', 'addValidation': true, 'labelErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"' }"],"t":13}]}]}," ",{"t":7,"e":"div","m":[{"n":"class","f":"inlineFieldCell","t":13}],"f":[{"t":4,"f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-suffix-fldgrp"],"t":13},{"n":"analyticsId","f":"suffixId","t":13},{"n":"groupType","f":"vertical styledselect","t":13},{"n":"label","f":[{"t":2,"r":".nameSuffixesLabel","s":true}],"t":13},{"n":"additionalText","f":[{"t":2,"r":".optionalLabel","s":true}],"t":13},{"n":"styledSelectValue","f":[{"t":2,"r":".suffixId"}],"t":13},{"n":"styledselect","f":["{ 'name': 'suffixId', 'value': ",{"t":2,"r":"value"},", 'options': ",{"t":2,"r":"nameSuffixes"},", 'placeholder': ",{"t":2,"r":"suffixNamePlaceholder","s":true},", 'addValidation': true, 'errorMessage': ",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"suffixId\""},"errorMessage"]}},", 'errorMessageForce': ",{"t":2,"rx":{"r":"v","m":[{"r":[],"s":"\"suffixId\""},"errorMessage"]}},", 'aria': { selected: '",{"t":2,"r":".currentSelectionAda","s":true},"', bottomOfMenu: '",{"t":2,"r":".endOfSelectionAda","s":true},"', buttonLabel: '",{"t":2,"r":".nameSuffixesLabel","s":true},"', listLabel: '",{"t":2,"r":".nameSuffixesLabel","s":true},"' }, 'rFocus': 'formFieldTracking', 'rChange': ['formFieldTracking', 'updateSuffix'], 'classicResponsive': true, 'labelErrorPrefix': '",{"t":2,"r":".errorAnnouncementAda","s":true},"' }"],"t":13}]}],"n":50,"x":{"r":[".suppressSuffix"],"s":"!_0"}}," ",{"t":4,"f":[{"t":7,"e":"div","f":[{"t":7,"e":"blueFieldLabel","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-suffix-fldgrp-label"],"t":13},{"n":"classes","f":"label-alignment","t":13},{"n":"inputId","f":["select-",{"t":2,"r":"blockId","s":true},"-suffixId-fldgrp-select"],"t":13},{"n":"labelPosition","f":[{"t":4,"f":["horizontal"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}},{"t":4,"n":51,"f":["vertical"],"l":1}],"t":13},{"n":"label","f":[{"t":2,"r":".nameSuffixesLabel","s":true}],"t":13},{"n":"state","f":[{"t":4,"f":["error"],"rx":{"r":".v","m":[{"r":[],"s":"\"suffixId\""},"errorMessage"]}}],"t":13}],"f":[]}," ",{"t":7,"e":"div","m":[{"n":"class","f":[{"t":4,"f":["col-xs-12 col-sm-8"],"n":50,"x":{"r":[".layoutDirection"],"s":"_0===\"horizontal\""}}],"t":13}],"f":[{"t":7,"e":"blueSelect","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-suffixId-fldgrp-select"],"t":13},{"n":"name","f":"suffixId","t":13},{"n":"options","f":[{"t":2,"r":"nameSuffixes"}],"t":13},{"n":"labelKey","f":"label","t":13},{"n":"valueKey","f":"value","t":13},{"n":"placeholder","f":"Choose one","t":13},{"n":",","f":0,"t":13},{"n":"rChange","f":"['callFormFieldEmit', 'formFieldTracking', 'validateField']","t":13},{"n":"rBlur","f":"['validateField']","t":13},{"n":"rFocus","f":"['formFieldTracking', 'callFormFieldEmit']","t":13},{"n":"labelErrorPrefix","f":[{"t":2,"r":"errorAnnouncementAda"}],"t":13},{"n":"selectedValue","f":[{"t":2,"r":"suffixId"}],"t":13},{"n":"addValidation","f":"true","t":13},{"n":"errorMessageForce","f":[{"t":2,"rx":{"r":".v","m":[{"r":[],"s":"\"suffixId\""},"errorMessage"]}}],"t":13},{"n":"showErrorHighlighting","f":[{"t":4,"f":["true"],"rx":{"r":".v","m":[{"r":[],"s":"\"suffixId\""},"errorMessage"]}}],"t":13}]}]}]}],"n":50,"r":".showSuffixSelectDropDown"}]}]}],"n":50,"x":{"r":[".customerInformationAvailable",".editMode"],"s":"!_0||_1"}},{"t":4,"n":51,"f":[{"t":7,"e":"div","f":[{"t":7,"e":"blueFieldGroup","m":[{"n":"id","f":[{"t":2,"r":"blockId","s":true},"-full-name-fldgrp"],"t":13},{"n":"groupType","f":"fieldtext horizontal","t":13},{"n":"labelColumns","f":"col-xs-12 col-sm-5","t":13},{"n":"inputColumns","f":"col-xs-12 col-sm-7","t":13},{"n":"label","f":[{"t":2,"r":"fullNameLabel","s":true}],"t":13},{"n":"fieldTextValue","f":[{"t":2,"r":".firstName"}," ",{"t":2,"r":".middleName"}," ",{"t":2,"r":".lastName"}," ",{"t":2,"r":".suffixId"}],"t":13}]}]}],"l":1}]}],"e":{}}; });
define('nameInformation-cmpt/views/nameInformation',['require','nameInformation-cmpt/views/spec/personalName','appkit-utilities/validation/trigger','nameInformation-cmpt/template/nameInformation','blue-ui/view/collections/fieldgroup','blue-ui/view/elements/select','blue-ui/view/elements/fieldlabel'],function(require) {
    'use strict';

    return function nameInformationView(viewContext) {
        var thisView = this;
        var extend = viewContext.util.object.extend,
            webSpec = require('nameInformation-cmpt/views/spec/personalName'),
            triggers = require('appkit-utilities/validation/trigger');

        thisView.init = function() {};

        // extend webspec with validation triggers from appkit utilities
        viewContext.page.triggers = triggers;
        extend(webSpec.triggers, viewContext.page.triggers);

        thisView.bridge = webSpec;

        thisView.template = require('nameInformation-cmpt/template/nameInformation');

        thisView.views = {
            'blueFieldGroup': require('blue-ui/view/collections/fieldgroup'),
            'blueSelect': require('blue-ui/view/elements/select'),
            'blueFieldLabel': require('blue-ui/view/elements/fieldlabel')
        };

        // update the model on suffix selection
        thisView.updateSuffix = function(e){
            thisView.model.suffixId = e.context.value;
        };
    };

});
