define([], function() { return {
  "name": "MANAGE_INVESTMENT_PROFILE",
  "data": {
    "investmentProfileHelpOptions": {
      "type": "List",
      "items": {
        "investmentProfileHelpHeader": "Description",
        "investmentProfileHelpDetails": "Description"
      }
    },
    "clientNameOptions": {
      "type": "List",
      "items": {
        "clientNameId": "Description",
        "clientName": "Description"
      }
    },
    "accountDisplayName": {
      "type": "Description"
    }
  },
  "actions": {
    "requestMyAccountsDisplay": true,
    "requestClientNameOptions": true,
    "requestMyAdvisoryTeam": true,
    "requestClientInformation": true,
    "requestInvestmentProfileInformation": true,
    "exitInvestmentProfileInformation": true,
    "requestInvestmentProfileHelpDetail": true,
    "exitInvestmentProfileHelpDetail": true
  },
  "states": {
    "exitConfirmationOverlay": true
  },
  "settings": {
    "manageInvestmentProfileHeader": true,
    "clientNameOptionsLabel": true,
    "manageInvestmentProfileMessage": true,
    "accountDisplayMessage": true,
    "accountDisplayAdvisory": true,
    "hiddenAccountsMessage": true,
    "clientInformationHeader": true,
    "accountInformationLabel": true,
    "investmentProfileHelpHeader": true,
    "manageInvestmentProfileWarningHeader": true,
    "manageInvestmentProfileWarningAdvisory": true,
    "requestMyAdvisoryTeamLabel": true,
    "confirmationHeader": true,
    "confirmationMessage": true,
    "missingInformationMessage": true,
    "missingAccountInformationHeader": true,
    "missingAccountInformationMessage": true,
    "investmentProfileErrorHeader": true,
    "investmentProfileErrorAdvisory": true
  }
}; });