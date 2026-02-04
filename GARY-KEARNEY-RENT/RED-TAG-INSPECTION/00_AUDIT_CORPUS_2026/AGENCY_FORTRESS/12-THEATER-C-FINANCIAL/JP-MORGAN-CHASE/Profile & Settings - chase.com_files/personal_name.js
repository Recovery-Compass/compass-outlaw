define([], function() { return {
  "name": "PERSONAL_NAME",
  "data": {
    "personRole": {
      "type": "Noop"
    },
    "personalNameId": {
      "type": "Description"
    },
    "coapplicantNames": {
      "type": "List",
      "items": {
        "coapplicantId": "Description",
        "coapplicantName": "Description"
      }
    },
    "coapplicantId": {
      "type": "Description"
    },
    "nameSuffixes": {
      "type": "List",
      "items": {
        "suffixId": "Noop",
        "suffixName": "Noop"
      }
    },
    "suffixId": {
      "type": "Noop"
    },
    "firstName": {
      "constraints": [
        {
          "type": "NotBlank"
        },
        {
          "type": "PersonalName"
        }
      ]
    },
    "middleName": {
      "type": "PersonalName"
    },
    "lastName": {
      "constraints": [
        {
          "type": "NotBlank"
        },
        {
          "type": "PersonalName"
        }
      ]
    }
  },
  "actions": {
    "requestPersonalName": true
  },
  "states": {
    "customerInformationAvailable": true
  },
  "settings": {
    "exitPersonalNameLabel": true,
    "confirmPersonalNameLabel": true,
    "personalNameHeader": true,
    "personalNameAdvisory": true,
    "nameSuffixesLabel": true,
    "suffixName": true,
    "firstNameLabel": true,
    "middleNameLabel": true,
    "customerFullNameLabel": true,
    "optionalLabel": true,
    "coapplicantNameLabel": true,
    "andLabel": true,
    "coapplicantAdvisory": true,
    "coapplicantMessage": true,
    "lastNameLabel": true,
    "fullNameLabel": true,
    "firstNameError": true,
    "middleNameError": true,
    "lastNameError": true,
    "suffixNamePlaceholder": true,
    "childNameAdvisory": true
  }
}; });