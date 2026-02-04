define([], function() { return {
  "name": "MANAGE_INVESTMENT_PROFILE_INFORMATION",
  "data": {
    "accountDisplayName": {
      "type": "Description"
    },
    "clientInformationLastUpdatedDate": {
      "type": "Date"
    },
    "accountInformationLastUpdatedDate": {
      "type": "Date"
    },
    "grossAnnualIncome": {
      "type": "Money"
    },
    "totalNetWorth": {
      "type": "Money"
    },
    "investableAssets": {
      "type": "Money"
    },
    "retirementAccountsInvestableAssets": {
      "type": "Money"
    },
    "totalDebt": {
      "type": "Money"
    },
    "assetsCash": {
      "type": "Money"
    },
    "externalInvestableAssets": {
      "type": "Money"
    },
    "annualExpensesExceedAnnualIncome": {
      "type": "OnOff"
    },
    "comfortableToFundNearTermExpense": {
      "type": "OnOff"
    },
    "investedInEquities": {
      "type": "OnOff"
    },
    "investedInFixedIncomeAndCash": {
      "type": "OnOff"
    },
    "investedInAlternativeInvestments": {
      "type": "OnOff"
    },
    "investedInOther": {
      "type": "OnOff"
    },
    "otherInvestmentDetails": {
      "type": "Description"
    },
    "federalTaxBracketOptions": {
      "type": "List",
      "items": {
        "federalTaxBracketOptionId": "Description",
        "federalTaxBracketOptionName": "Description"
      }
    },
    "federalTaxBracketOptionId": {
      "type": "Description"
    },
    "federalTaxBracketOptionName": {
      "type": "Description"
    },
    "certificateOfDeposit": {
      "type": "Description"
    },
    "mutualFunds": {
      "type": "Description"
    },
    "fixedIncome": {
      "type": "Description"
    },
    "stocks": {
      "type": "Description"
    },
    "listedOptions": {
      "type": "Description"
    },
    "fixedAnnuities": {
      "type": "Description"
    },
    "variableAnnuities": {
      "type": "Description"
    },
    "foreignExchange": {
      "type": "Description"
    },
    "futures": {
      "type": "Description"
    },
    "derivatives": {
      "type": "Description"
    },
    "structuredProducts": {
      "type": "Description"
    },
    "margin": {
      "type": "Description"
    },
    "alternativeInvestments": {
      "type": "Description"
    },
    "investmentExperience": {
      "type": "List",
      "items": {
        "investmentExperienceId": "Description",
        "investmentExperienceName": "Description"
      }
    },
    "accountInvestmentObjective": {
      "type": "Description"
    },
    "riskTolerance": {
      "type": "Description"
    },
    "accountValueChange": {
      "type": "Description"
    },
    "investmentValueChangeResponse": {
      "type": "Description"
    },
    "investmentTenure": {
      "type": "Description"
    },
    "accountWithdrawalTimeline": {
      "type": "Description"
    }
  },
  "actions": {
    "requestAccountUpdateWarningAdvisoryHelpMessage": true,
    "updateInvestmentProfileInformation": true,
    "requestInvestmentProfileHelp": true,
    "cancelTask": true,
    "requestNextStep": true,
    "requestPreviousStep": true,
    "confirmInvestmentProfileInformation": true
  },
  "states": {
    "exitConfirmationOverlay": true
  },
  "settings": {
    "requestInvestmentProfileHelpLabel": true,
    "clientInformationLastUpdatedDateLabel": true,
    "accountInformationLastUpdatedDateLabel": true,
    "financialInformationHeader": true,
    "financialInformationMessage": true,
    "cashAndCashEquivalentsAdvisory": true,
    "totalInvestableAssetsAdvisory": true,
    "totalDebtAdvisory": true,
    "totalNetWorthAdvisory": true,
    "grossAnnualIncomeAdvisory": true,
    "investedInEquitiesLabel": true,
    "investedInFixedIncomeAndCashLabel": true,
    "investedInAlternativeInvestmentsLabel": true,
    "investedInOtherLabel": true,
    "federalTaxBracketOptionPlaceholder": true,
    "federalTaxBracketOption": true,
    "investmentExperienceLabel": true,
    "investmentExperienceMessage": true,
    "investmentExperienceAdvisory": true,
    "investmentExperienceOption": true,
    "investmentExperienceYearsOption": true,
    "investmentExperienceAda": true,
    "accountInformationLabel": true,
    "accountInformationMessage": true,
    "accountInvestmentObjectiveOption": true,
    "riskToleranceOption": true,
    "accountValueChangeOption": true,
    "investmentValueChangeResponseOption": true,
    "investmentTenureOption": true,
    "accountWithdrawalTimelineOption": true,
    "progressBarHeader": true,
    "verificationHeader": true,
    "verificationMessage": true,
    "verificationAdvisory": true,
    "accountUpdateWarningAdvisory": true,
    "accountUpdateWarningAdvisoryHelpMessage": true,
    "requestAccountUpdateWarningAdvisoryHelpMessageAda": true,
    "managedAccountUpdateWarningAdvisory": true,
    "brokerageAccountUpdateWarningAdvisory": true,
    "missingInformationAda": true,
    "updateInvestmentProfileErrorHeader": true,
    "updateInvestmentProfileErrorAdvisory": true,
    "grossAnnualIncomeError": true,
    "totalNetWorthError": true,
    "investableAssetsError": true,
    "retirementAccountsInvestableAssetsError": true,
    "totalDebtError": true,
    "assetsCashError": true,
    "annualExpensesExceedAnnualIncomeError": true,
    "comfortableToFundNearTermExpenseError": true,
    "externalInvestableAssetsError": true,
    "investmentOptionsError": true,
    "otherInvestmentDetailsError": true,
    "federalTaxBracketOptionIdError": true,
    "certificateOfDepositError": true,
    "mutualFundsError": true,
    "fixedIncomeError": true,
    "stocksError": true,
    "listedOptionsError": true,
    "fixedAnnuitiesError": true,
    "variableAnnuitiesError": true,
    "foreignExchangeError": true,
    "futuresError": true,
    "derivativesError": true,
    "structuredProductsError": true,
    "marginError": true,
    "alternativeInvestmentsError": true,
    "accountInvestmentObjectiveError": true,
    "riskToleranceError": true,
    "accountValueChangeError": true,
    "investmentValueChangeResponseError": true,
    "investmentTenureError": true,
    "accountWithdrawalTimelineError": true,
    "investmentProfileInformationErrorHeader": true,
    "investmentProfileInformationErrorAdvisory": true
  }
}; });