define([],function() {
    'use strict';
    return {
        API_ROUTES: {
            updateHistoricalFiltersState: 'dashboard/investmentsContainer/updateHistoricalFiltersState'
        },
        PAGE_URL: {
            setDefaultReportingTimeframeUrl: '/dashboard/profileArea/setDefaultReportingTimeFrame/requestUpdateReportingTimeframe'
        },
        STRUCTURED_CONTENT_URL_MAPPER: {
            'balances': '/content/tooltips/digital-ui/en/investments.json',
            'investmentIndicators': '/content/tooltips/digital-ui/en/investment-indicator.json',
            'disclosures': '/content/legal-disclaimers/digital-ui/en/categories/box-disclaimers.json',
            'tradeAdHocMessage': '/content/ad-hoc-messages/digital-ui/en/categories/trade.json/',
            'portfolioAdHocMessage': '/content/ad-hoc-messages/digital-ui/en/categories/portfolio.json/'
        },
        SECURE_MESSAGE_ADDRESSEE: {
            ADVISOR: 'ADVISOR',
            BANKER: 'BANKER'
        },
        SELF_DIRECT_STRINGS:[
            'DIRECTED',
            'CLIENT SERVICES'
        ],
        DATE_FORMATS: {
            fullDate: 'YYYYMMDD',
            fullDateWithSlash: 'MM/DD/YYYY',
            fullDateWithHyphen: 'MM-DD-YYYY',
            fullDateWithTime: 'h:mm A MM/DD/YYYY',
            fullDateWithMilitaryTime: 'MM/DD/YYYY hh:mm:ss A',
            monthYearWithSlash: 'MM/YYYY',
            yearMonthWithSlash: 'YYYY/MM'
        },
        TIME_ZONES: {
            ET: 'America/New_York'
        },
        INTRADAY: 'INTRADAY',
        PRIOR_CLOSE: 'PRIOR_CLOSE',
        MONTH_END: 'MONTH_END',
        SPECIFIC_DATE: 'SPECIFIC_DATE',
        MAKE_DEFAULT: 'MAKE_DEFAULT',
        // check constants above this
        NO_VALUE: '--',
        defaultUserDatePreferences: {
            intraDay: true,
            userInputDate: null,
            svcFormattedDate: null,
            type: 'INTRADAY'
        },
        AGREEMENT_TYPE: { // TODO Remove this when investmentsAgreement is ported to area block 08/31/2021
            'brokerageAgreement': 'brokerage'
        },
        AGREEMENT_SERVICE_CONTEXT: 'JPMCC_JPMSI'
        // Move investments/lib/investmentFocusManagerUtility to dashboard
    };
});
