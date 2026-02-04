define([], function() { return {
  "name": "SCAM_PROTECTION_INTERCEPT",
  "actions": {
    "requestContinueTransaction": true,
    "requestCancelTransaction": true,
    "requestCloseErrorMessage": true,
    "requestContinuePaymentValidation": true,
    "requestPaymentPurposeAction": true,
    "requestBackAction": true,
    "requestAcknowledgementAction": true
  },
  "settings": {
    "paymentRiskAccceptedError": true,
    "interceptScamPageErrorHeader": true,
    "interceptScamPageErrorAdvisory": true,
    "interceptScamRiskHeader": true,
    "scamRiskAlertHeader": true,
    "scamRiskAlertIcon": true,
    "scamProtectionTipsAdvisory": true,
    "paymentRiskAcceptedLabel": true,
    "onlineScamProtectionTip": true,
    "onlineScamProtectionIcon": true,
    "buyerScamProtectionTip": true,
    "buyerScamProtectionIcon": true,
    "jobScamProtectionTip": true,
    "jobScamProtectionIcon": true,
    "requestContinueTransactionLabel": true,
    "requestCancelTransactionLabel": true,
    "closeLabel": true,
    "onlineScamProtectionTipHeading": true,
    "buyerScamProtectionTipHeading": true,
    "jobScamProtectionTipHeading": true,
    "scamReviewInfoHeader": true
  }
}; });