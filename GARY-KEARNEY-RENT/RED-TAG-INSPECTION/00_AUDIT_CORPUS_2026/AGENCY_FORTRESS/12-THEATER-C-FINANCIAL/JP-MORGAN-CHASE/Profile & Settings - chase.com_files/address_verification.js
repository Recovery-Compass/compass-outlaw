define([], function() { return {
  "name": "ADDRESS_VERIFICATION",
  "data": {
    "addresses": {
      "type": "List",
      "items": {
        "address": "Description",
        "addressType": "Description",
        "addressId": "Numeric"
      }
    },
    "addressId": {
      "type": "Numeric"
    },
    "previousResidenceAddresses": {
      "type": "List",
      "items": {
        "previousResidenceAddress": "Description",
        "previousResidenceAddressType": "Description",
        "previousResidenceAddressId": "Numeric"
      }
    },
    "previousResidenceAddressId": {
      "type": "Numeric"
    }
  },
  "actions": {
    "confirmAddress": true,
    "exitAddress": true
  },
  "states": {
    "requestAddressVerificationOverlay": true,
    "addressVerificationOverlay": true
  },
  "settings": {
    "addressVerificationHeader": true,
    "addressVerificationMessage": true,
    "addressVerificationErrorHeader": true,
    "addressVerificationErrorAdvisory": true,
    "bpAddressVerificationHeader": true,
    "bpAddressVerificationMessage": true,
    "bpAddressOptionsHeader": true,
    "bankerAddressVerificationHeader": true,
    "addressType": true,
    "previousResidenceAddressType": true,
    "exitAddressLabel": true,
    "confirmAddressLabel": true,
    "bpConfirmAddressLabel": true,
    "punctuationMarkCommaLabel": true,
    "residentialAddressLabel": true,
    "previousResidenceAddressLabel": true,
    "bankerConfirmAddressLabel": true,
    "selectAddressesAda": true,
    "importantAda": true
  }
}; });