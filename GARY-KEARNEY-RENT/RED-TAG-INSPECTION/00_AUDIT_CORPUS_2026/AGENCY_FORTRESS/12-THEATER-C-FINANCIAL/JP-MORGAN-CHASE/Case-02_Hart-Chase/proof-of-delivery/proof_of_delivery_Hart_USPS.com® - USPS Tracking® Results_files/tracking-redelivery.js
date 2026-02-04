var redeliveryLocationSelectable = "";
var redeliveryTypeSelectable = "";
var eligible = {};
var smartLockerInfo = {};

var isLocationSetup = false;
var isTypeSetup = false;


$(document).ready(function () {
    clearAllErrors();

	$(".editTrackingRedeliveryAddress").on('click touch', function () {

		var trackNumber = $(this).data('trackRedeliver');
		$("#addressUnavail" + trackNumber).hide();
		$("#redeliveryInputForm" + trackNumber).show();
		$("#navailAddressMatch" + trackNumber).hide();
		$(".trackOK-" + trackNumber).show();
		$("#navailAddressIntercept" + trackNumber).hide();
		$("#navailNotAllowed" + trackNumber).hide();

	});


	$(".submitTrackingRedelivery").on('click touch', function () {

        clearAllErrors();
		var trackNumber = $(this).data('trackRedeliver');
		redeliverySubmit(trackNumber);

	});

	$(".extra-input-field").on('keyup', function (event) {

		var trackNumber = $(this).data('trackRedeliver');
		additionalCounter(trackNumber);

	});

	$(".clearForm").on('click touch', function () {
		var trackNumber = $(this).data('trackRedeliver');
		clearForm(trackNumber);
		
		if ($("#representative-for-" + trackNumber).is(':checked')) {
			$("#representative-for-" + trackNumber).closest('.redelivery-pickup-wrapper').find('.representative-requirements-wrapper').show();
			$("#representative-for-" + trackNumber).closest('.redelivery-pickup-wrapper').find('.id-pickup').show();
		} else {
			$("#representative-for-" + trackNumber).closest('.redelivery-pickup-wrapper').find('.representative-requirements-wrapper').hide();
			$("#representative-for-" + trackNumber).closest('.redelivery-pickup-wrapper').find('.id-pickup').hide();
		}
	});

	$(".zipCode").mask("99999-9999");


	setTimeout(function () {
		reenableFunctions();
	}, 1000);
});

$('.phone').mask("999-999-9999");

function additionalCounter(trackingNumber) {

	var text_max = 250;
	$('.extra-input-field').on('keyup', function (event) {
		var text_length = $(this).val().length;
		var text_remaining = text_max - text_length;
		this.parentElement.childNodes[5].innerText = text_length + '/' + text_max;


		// special characters
		var regex = /^[\.\,\_\&\-\(\)\?\#\/\+\@A-Za-z0-9 ]+$/
		if (!regex.test(this.value) && (this.textLength > 0)) {
			$(this).parent().find(".error-message-characters").attr('style', 'display:block;');
		} else {
			$(this).parent().find(".error-message-characters").attr('style', 'display:hidden;');
		}

	});
}

function clearForm(trackingNumber) {

	$("#firstName-" + trackingNumber).val('');
	$("#lastName-" + trackingNumber).val('');
	$("#middleInitial-" + trackingNumber).val('');
	$("#companyName-" + trackingNumber).val('');
	$("#addressLineOne-" + trackingNumber).val('');
	$("#addressLineTwo-" + trackingNumber).val('');
	$("#city-" + trackingNumber).val('');
	$("#state-" + trackingNumber).val('');
	$("#zipCode-" + trackingNumber).val('');
	$("#urbanizationCode-" + trackingNumber).val('');
	$("#phone-" + trackingNumber).val('');
	$("#emailAddress-" + trackingNumber).val('');
	$("#redeliveryTypeDropdown-" + trackingNumber).val('');
	$("#select-date-" + trackingNumber).val('');
	$("#modal-resume-date").val('');
	$('.dp-highlight').removeClass("dp-highlight");
	$("#redeliveryLocationDropdown-" + trackingNumber).val('');
	$("#additional-instructions-" + trackingNumber).val('');
	$("#additional-instructions-" + trackingNumber).parents('.form-wrapper').find('.count_message').html('0/250');

	$("#scheduleRedelivery-tc-" + trackingNumber).attr('checked', false);

	$("#representative-for-" + trackingNumber).attr('checked', false);
	$("#representative-for-" + trackingNumber).closest('.redelivery-pickup-wrapper').find('.representative-requirements-wrapper').toggle();
	$("#representative-for-" + trackingNumber).closest('.redelivery-pickup-wrapper').find('.id-pickup').toggle();
	$("#repFirst-" + trackingNumber).val('');
	$("#repMiddle-" + trackingNumber).val('');
	$("#repLast-" + trackingNumber).val('');



	$("#redeliveryTypeDropdown-" + trackingNumber).closest('.redelivery-details-wrapper').removeClass('pickup-redelivery carrier-redelivery return-sender-redelivery').addClass('redelivery-not-special');
	$("#redeliveryTypeDropdown-" + trackingNumber).closest('.additional-instructions-wrapper').removeClass('col-md-10 col-sm-10').addClass('col-md-5 col-sm-5');
	$("#redeliveryTypeDropdown-" + trackingNumber).closest('.carrier-redeliver-required').hide();
	$("#redeliveryTypeDropdown-" + trackingNumber).closest('.additional-instructions-wrapper').removeClass('required-field error');

	//Removes Error Messages from page
	jQuery("#firstNameErrorMessage").parent().removeClass("error");
	jQuery("#lastNameErrorMessage").parent().removeClass("error");
	jQuery("#addressLineOneErrorMessage").parent().removeClass("error");
	jQuery("#cityErrorMessage").parent().removeClass("error");
	$("#stateErrorMessage").hide();
	$("#state-" + trackingNumber).css("border", "1px solid #333366");
	jQuery("#zipCodeErrorMessage").parent().removeClass("error");
	jQuery("#phoneErrorMessage").parent().removeClass("error");
	jQuery("#redeliveryTypeDropdownErrorMessage").parent().removeClass("error");
	$("#redeliveryTypeDropdown-" + trackingNumber).css("border", "1px solid #333366");
	jQuery("#emailAddressErrorMessage").parent().removeClass("error");
	jQuery("#tcErrorMessage").hide();
	jQuery("#select-dateErrorMessage").hide();
	jQuery("#select-date-" + trackingNumber).css("border", "1px solid #333366");
	jQuery("#redeliveryLocationDropdownErrorMessage").hide();
	jQuery("#redeliveryLocationDropdown-" + trackingNumber).css("border", "1px solid #333366");
	jQuery("#addInstructionErrorMessage").hide();
	jQuery("#instructionTypeErrorMesage").hide();
	jQuery("#additional-instructions-" + trackingNumber).css("border", "1px solid #333366");
	jQuery(".smart-locker-information-wrapper").hide();
	jQuery(".select-date-wrapper").hide();
	jQuery(".additional-instructions-wrapper").show();
	

	jQuery("#repFirstNameErrorMessage").hide();
	jQuery("#repFirst-" + trackingNumber).css("border", "1px solid #333366");
	jQuery("#repLastNameErrorMessage").hide();
	jQuery("#repLast-" + trackingNumber).css("border", "1px solid #333366");


}


function getRedeliveryLocations() {
    
    if(isLocationSetup == false)
        {
            	jQuery.ajax({
		url: "/ctrs/redelivery/locations",
		type: "GET",
		headers: {
			"Content-Type": "application/json;charset=utf-8"
		},
		dataType: "json",
		success: function (resp) {
			var allLocations = resp;

			jQuery.each(allLocations, function (locIndex, locationInformation) {

				redeliveryLocationSelectable = redeliveryLocationSelectable + "<option value=\"" + locationInformation.name + "\">" + locationInformation.displayName + "</option>";

			});
		}
	});
         isLocationSetup = true;
            
        }
    
}

function getRedeliveryTypes() {
    
    if(isTypeSetup == false)
        {
         
            	jQuery.ajax({
		url: "/ctrs/redelivery/types",
		type: "GET",
		headers: {
			"Content-Type": "application/json;charset=utf-8"
		},
		dataType: "json",
		success: function (resp) {

			var allTypes = resp;

			jQuery.each(allTypes, function (tpIndex, typeInformation) {

				redeliveryTypeSelectable = redeliveryTypeSelectable + "<option value=\"" + typeInformation.name + "\">" + typeInformation.displayName + "</option>";

			});
		}
	});
            
            isTypeSetup = true;
            
        }
}

function getLinx() {
    jQuery.ajax({
        url: "/ctrs/redelivery/loadLinks",
        type: "GET",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        dataType: "json",
        success: function (resp) {


            $("#termsConditionsLink").attr('href', resp.Terms);
            var termsChange = resp.xsell.replace("CHANGEMEHERE", "REDELIVERY");

            $("#yes-radio").data("xsellLink", termsChange);
        }
    });
}

function checkRedeliverySmartLockers(length, width, height, poinfo)
{
    //console.log(poinfo);
	var data = 
	{
		packageLength: length,
		packageWidth: width,
		packageHeight: height,

		// Start with Address
        destAddress1: "",
        destAddress2: "",    
        destCity: "",
        destState: "",
        destZip: poinfo.pozipcode.substring(0,5),
        
        
        //fdbid: poinfo.fdbid,
        //pozipcode: poinfo.pozipcode.substring(0,5),
        trackingNumber: poinfo.trackingNumber


	};
	    jQuery.ajax({
        url: "/ctrs/smartLockers/reserveLocker",
        type: "POST",
		data: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        dataType: "json",
        success: function (resp) {
			
            if (!resp.Error) {
                
                getSLLatLong(resp.ePLAddress, poinfo.trackingNumber);
                    
                }
			else 
                {
					$("#redeliveryTypeDropdown-"+ poinfo.trackingNumber + " option[value='SMART_LOCKER']").attr('disabled', true);
                    $("#redeliveryTypeDropdown-"+poinfo.trackingNumber).parents('.redelivery-details-wrapper').find('.smart-locker-information-wrapper').hide();
					$("#redeliveryTypeDropdownErrorMessage-"+poinfo.trackingNumber).text("Sorry, there are no parcel lockers available.");
                    $("#redeliveryTypeDropdown-"+poinfo.trackingNumber).parent().addClass("error");
                }
	
        }
    });
}




function fakeSuccess(trackNumber) {
	$("#newRedelivery-" + trackNumber).hide();
	$("#rdSuccess-" + trackNumber).removeClass("hidden");
	var emailAdd = $("#emailAddress-" + trackNumber).val();
	$("#email-sent-to-" + trackNumber).text(emailAdd);
	$("#email-success-" + trackNumber).text(emailAdd);
	var phoneadd = $("#phone-" + trackNumber).val();
	$("#phone-success-" + trackNumber).text(phoneadd);


	var redeliveryType = $("redeliveryTypeDropdown-" + trackNumber + " option:selected").text();
	$("#pickupType-" + trackNumber).text(redeliveryType);

}

function redeliverySubmit(trackingNumber) {
	var packagedData = {};
	// Grab Fields
	packagedData.firstName = $("#firstName-" + trackingNumber).val();
	packagedData.middleInitial = $("#middleInitial-" + trackingNumber).val();
	packagedData.lastName = $("#lastName-" + trackingNumber).val();
	packagedData.companyName = $("#companyName-" + trackingNumber).val();
	packagedData.addressLineOne = $("#addressLineOne-" + trackingNumber).val();
	packagedData.addressLineTwo = $("#addressLineTwo-" + trackingNumber).val();
	packagedData.city = $("#city-" + trackingNumber).val();
	packagedData.state = $("#state-" + trackingNumber).val();
	packagedData.zipCode = $("#zipCode-" + trackingNumber).val();
	packagedData.urbCode = $("#urbanizationCode-" + trackingNumber).val();
	packagedData.phone = $("#phone-" + trackingNumber).val();
	packagedData.email = $("#emailAddress-" + trackingNumber).val();

	// Get the redelivery information
	packagedData.trackingNumber = trackingNumber;
	packagedData.redeliveryDate = $("#select-date-" + trackingNumber).val();
	packagedData.redeliveryType = $("#redeliveryTypeDropdown-" + trackingNumber).val();
	packagedData.redeliveryComments = $("#additional-instructions-" + trackingNumber).val();
	packagedData.redliveryLocation = $("#redeliveryLocationDropdown-" + trackingNumber).val();
	packagedData.ipAddress = $("#customerIPAddress").val();

	// Pickup Rep
	packagedData.rdRep = $("#representative-for-" + trackingNumber).is(":checked");
	packagedData.rdRepFirst = $("#repFirst-" + trackingNumber).val();
	packagedData.rdRepMiddle = $("#repMiddle-" + trackingNumber).val();
	packagedData.rdRepLast = $("#repLast-" + trackingNumber).val();



	if (validateRDFields(packagedData)) {
		checkAddress(packagedData);
	}
}

function checkAddress(rdData) {
	var data = {

		addressLineOne: rdData.addressLineOne,
		addressLineTwo: rdData.addressLineTwo,
		city: rdData.city,
		state: rdData.state,
		zip: rdData.zipCode
	};

	jQuery.ajax({
		url: "/ctrs/redelivery/validateAddress",
		type: "POST",
		data: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json;charset=utf-8"
		},
		dataType: "json",
		success: function (resp) {


			switch (resp.addressMatchType) {
				case "ADDRESS NOT FOUND":
				// Address is not available.
				//navailFirstName
				//addressUnavail + tracking number
				$("#navailFirstName" + rdData.trackingNumber).text(rdData.firstName.toUpperCase());
				$("#navailmiddleInitial" + rdData.trackingNumber).text(rdData.middleInitial.toUpperCase());
				$("#navailLastName" + rdData.trackingNumber).text(rdData.lastName.toUpperCase());
				$("#navailCompanyName" + rdData.trackingNumber).text(rdData.companyName.toUpperCase());
				$("#navailAddressLineOne" + rdData.trackingNumber).text(rdData.addressLineOne);
				$("#navailCityStateZip" + rdData.trackingNumber).text(rdData.city + ", " + rdData.state + " " + rdData.zipCode);


				var phoneDigits = rdData.phone;
				// remove all non-numbers
				phoneDigits = phoneDigits.replace(/[^\d]/g, "");
				var phoneSplit = phoneDigits.match(/(\d{3})(\d{3})(\d{4})/);
				$("#navailPhone" + rdData.trackingNumber).text(phoneSplit[1] + "-" + phoneSplit[2] + "-" + phoneSplit[3]);

				$("#navailEmailAddress" + rdData.trackingNumber).text(rdData.email.toUpperCase());


				$("#addressUnavail" + rdData.trackingNumber).show();
				$("#redeliveryInputForm" + rdData.trackingNumber).hide();
				$("#navailAddressEligible" + rdData.trackingNumber).show();
				$("#navailAddressIntercept" + rdData.trackingNumber).hide();
				$("#navailNotAllowed" + rdData.trackingNumber).show();


				// Scroll to the error
				$('html, body').animate({
					scrollTop: $("#addressUnavail" + rdData.trackingNumber).offset().top
				}, 500);
					break;
				case "DEFAULT MATCH":
					/*var allAddressMatch = resp.allAddressMatches;
					//                    multipleMatchAddresses(addressMatch);
					var addressVal = resp.defaultMatch;*/
					/*getRedeliveryServiceAvailability(resp);*/
					getMultipleAddressModal(resp);
					jQuery("#checkAvailabilityModal").modal('show');
					break;
				case "MULTIPLE RESPONSE":
					/*var allAddressMatch = resp.allAddressMatches;
					//                    multipleMatchAddresses(addressMatch);
					var addressVal = resp.defaultMatch;*/
					/*getRedeliveryServiceAvailability(resp);*/
					getMultipleAddressModal(resp);
					jQuery("#checkAvailabilityModal").modal('show');
					break;
				case "EXACT MATCH":
					var addressVal = resp.defaultMatch;
					cccValidateAddress(rdData, addressVal);
					break;
				default:
				// Address is not available.
				//navailFirstName
				//addressUnavail + tracking number
				$("#navailFirstName" + rdData.trackingNumber).text(rdData.firstName.toUpperCase());
				$("#navailmiddleInitial" + rdData.trackingNumber).text(rdData.middleInitial.toUpperCase());
				$("#navailLastName" + rdData.trackingNumber).text(rdData.lastName.toUpperCase());
				$("#navailCompanyName" + rdData.trackingNumber).text(rdData.companyName.toUpperCase());
				$("#navailAddressLineOne" + rdData.trackingNumber).text(rdData.addressLineOne);
				$("#navailCityStateZip" + rdData.trackingNumber).text(rdData.city + ", " + rdData.state + " " + rdData.zipCode);


				var phoneDigits = rdData.phone;
				// remove all non-numbers
				phoneDigits = phoneDigits.replace(/[^\d]/g, "");
				var phoneSplit = phoneDigits.match(/(\d{3})(\d{3})(\d{4})/);
				$("#navailPhone" + rdData.trackingNumber).text(phoneSplit[1] + "-" + phoneSplit[2] + "-" + phoneSplit[3]);

				$("#navailEmailAddress" + rdData.trackingNumber).text(rdData.email.toUpperCase());


				$("#addressUnavail" + rdData.trackingNumber).show();
				$("#redeliveryInputForm" + rdData.trackingNumber).hide();
				$("#navailAddressEligible" + rdData.trackingNumber).show();
				$("#navailAddressIntercept" + rdData.trackingNumber).hide();
				$("#navailNotAllowed" + rdData.trackingNumber).show();


				// Scroll to the error
				$('html, body').animate({
					scrollTop: $("#addressUnavail" + rdData.trackingNumber).offset().top
				}, 500);
                    
					break;
			}
		}
	});

}


//Check me first
function getRedeliverStatus(trackingNumber) {
	var data = {};

	data.trackingNumber = trackingNumber;

	jQuery.ajax({
		url: "/ctrs/redelivery/trackingNumberValidate",
		type: "POST",
		data: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json;charset=utf-8"
		},
		dataType: "json",
		success: function (resp) {

			var createCheck = resp.createRedelivery;
			var modCheck = resp.modifyRedelivery;
			var cancelCheck = resp.cancelRedelivery;
			var cccMCode = resp.cccCode;

			if (!createCheck && cccMCode != "1185") {
				$("#newRedelivery-" + trackingNumber).addClass("hidden");
				$("#rdExists-" + trackingNumber).removeClass("hidden");

			}
			if (cccMCode == "1185") {


				eligible.exceeded = "yes";
			}

		}
	});
}


function cccValidateAddress(rdData, addressData) {
    
    $("#navailAddressEligible" + rdData.trackingNumber).hide();
    $("#navailAddressIntercept" + rdData.trackingNumber).show();
    $("#navailNotAllowed" + rdData.trackingNumber).hide();
    
	// Call to CCC to make sure its all OK
	var data = {

		addressLineOne: addressData.addressLine1,
		city: addressData.city,
		state: addressData.state,
		zip5: addressData.zip5,
		zip4: addressData.zipPlus4,
		carrierRoute: addressData.carrierRoute

	};
	jQuery.ajax({
		url: "/ctrs/redelivery/checkAddress",
		type: "POST",
		data: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json;charset=utf-8"
		},
		dataType: "json",
		success: function (resp) {

			var cccAddressData = resp[0].address;

			//If Address in eligible
			var addressEligibilty = resp[0].code;
			var dataString = this.data;
			var dataError = dataString.split(",");
			var inEligibleStreetAddrOne = dataError[0].replace("{\"addressLineOne\":\"", "").replace("\"", "");
			var inEligibleCity = dataError[1].replace("\"city\":\"", "").replace("\"", "");
			var inEligibleState = dataError[2].replace("\"state\":\"", "").replace("\"", "");
			var inEligibleZip5 = dataError[3].replace("\"zip5\":\"", "").replace("\"", "");
			var inEligibleZip4 = dataError[4].replace("\"zip4\":\"", "").replace("\"", "");

			// GEE - do your address checks

			if (addressEligibilty == 1006 || addressEligibilty == 1020 || addressEligibilty == 1007 || addressEligibilty == 1011 || addressEligibilty == 1022 || addressEligibilty == 1021 || addressEligibilty == 1028 || addressEligibilty == 1024 || addressEligibilty == 1004 || addressEligibilty == 1014 || addressEligibilty == 1040 || addressEligibilty == 1039 || addressEligibilty == 1002 || addressEligibilty == 1013 || addressEligibilty == 1025) {

				// Address is not available.
				//navailFirstName
				//addressUnavail + tracking number
				$("#navailFirstName" + rdData.trackingNumber).text(rdData.firstName.toUpperCase());
				$("#navailmiddleInitial" + rdData.trackingNumber).text(rdData.middleInitial.toUpperCase());
				$("#navailLastName" + rdData.trackingNumber).text(rdData.lastName.toUpperCase());
				$("#navailCompanyName" + rdData.trackingNumber).text(rdData.companyName.toUpperCase());
				$("#navailAddressLineOne" + rdData.trackingNumber).text(addressData.addressLine1);
				$("#navailCityStateZip" + rdData.trackingNumber).text(addressData.city + ", " + addressData.state + " " + addressData.zip5);


				var phoneDigits = rdData.phone;
				// remove all non-numbers
				phoneDigits = phoneDigits.replace(/[^\d]/g, "");
				var phoneSplit = phoneDigits.match(/(\d{3})(\d{3})(\d{4})/);
				$("#navailPhone" + rdData.trackingNumber).text(phoneSplit[1] + "-" + phoneSplit[2] + "-" + phoneSplit[3]);

				$("#navailEmailAddress" + rdData.trackingNumber).text(rdData.email.toUpperCase());


				$("#addressUnavail" + rdData.trackingNumber).show();
				$("#redeliveryInputForm" + rdData.trackingNumber).hide();
				$("#navailAddressEligible" + rdData.trackingNumber).show();
				$("#navailAddressIntercept" + rdData.trackingNumber).hide();
				$("#navailNotAllowed" + rdData.trackingNumber).show();


				// Scroll to the error
				$('html, body').animate({
					scrollTop: $("#addressUnavail" + rdData.trackingNumber).offset().top
				}, 500);



			} else {

				addressMatchTracking(rdData, addressData);
			}

		}
	});
}


function addressMatchTracking(rdData, addressData) {
	var data = {};

	data.addressLineOne = addressData.addressLine1;
	data.city = addressData.city;
	data.state = addressData.state;
	data.zipCode = addressData.zip5;

	data.trackingNumber = rdData.trackingNumber;


	jQuery.ajax({
		url: "/ctrs/redelivery/addressValidate",
		type: "POST",
		data: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json;charset=utf-8"
		},
		dataType: "json",
		success: function (resp) {

			var respCCC = resp.ccccode;

			// Bad Code = 1041
			if (respCCC != "1041" && eligible.exceeded != "yes") {
				var phoneDigits = rdData.phone;
				// remove all non-numbers
				phoneDigits = phoneDigits.replace(/[^\d]/g, "");
				var phoneSplit = phoneDigits.match(/(\d{3})(\d{3})(\d{4})/);
				var cccSubmitData = {};
				// Start with Address
				cccSubmitData.addressLineOne = addressData.addressLine1;
				cccSubmitData.city = addressData.city;
				cccSubmitData.state = addressData.state;
				cccSubmitData.zipCode = addressData.zip5;

				// Phone Number
				cccSubmitData.areaCodePhone = phoneSplit[1]
				cccSubmitData.exchangePhone = phoneSplit[2];
				cccSubmitData.linePhone = phoneSplit[3];

				// Customer Name
				cccSubmitData.firstName = rdData.firstName;
				cccSubmitData.middleName = rdData.middleInitial;
				cccSubmitData.lastName = rdData.lastName;

				//Business Name
				cccSubmitData.companyName = rdData.companyName;

				//Items for Redelivery
				cccSubmitData.trackingNumber = rdData.trackingNumber;

				// If there is a rep
				cccSubmitData.isRepPickup = rdData.rdRep;
				cccSubmitData.pickupRepFirstName = rdData.rdRepFirst;
				cccSubmitData.pickupRepLastName = rdData.rdRepLast;
				cccSubmitData.pickupRepMiddleInitial = rdData.rdRepMiddle;

				// Everything else
				cccSubmitData.ipAddress = rdData.ipAddress;
				cccSubmitData.emailAddress = rdData.email;
				cccSubmitData.redeliveryDate = moment(rdData.redeliveryDate, "MM/DD/YYYY").format("YYYYMMDD");
				cccSubmitData.additionalInstructions = rdData.redeliveryComments;
				cccSubmitData.redeliveryType = rdData.redeliveryType;

				if (rdData.redliveryLocation != "") {
					cccSubmitData.redeliveryPickupLocation = rdData.redliveryLocation;
				}
                
                //Set the proper source.
                 cccSubmitData.sourceIdentifier = "USPSTRACKING";
                
                

				var urbCode = addressData.urbanizationCode;


			    var isSmartLocker =  rdData.redeliveryType;
			    if(isSmartLocker == "SMART_LOCKER")
			        {
			            confirmParcelLocker(rdData.trackingNumber,cccSubmitData);
			        }

				finalSubmit(cccSubmitData, urbCode);
			} else if (eligible.exceeded == "yes") {
				//ERROR
				// Address is not available.
				//navailFirstName
				//addressUnavail + tracking number
				$("#navailFirstName" + rdData.trackingNumber).text(rdData.firstName.toUpperCase());
				$("#navailmiddleInitial" + rdData.trackingNumber).text(rdData.middleInitial.toUpperCase());
				$("#navailLastName" + rdData.trackingNumber).text(rdData.lastName.toUpperCase());
				$("#navailCompanyName" + rdData.trackingNumber).text(rdData.companyName.toUpperCase());
				$("#navailAddressLineOne" + rdData.trackingNumber).text(addressData.addressLine1);
				$("#navailCityStateZip" + rdData.trackingNumber).text(addressData.city + ", " + addressData.state + " " + addressData.zip5);


				var phoneDigits = rdData.phone;
				// remove all non-numbers
				phoneDigits = phoneDigits.replace(/[^\d]/g, "");
				var phoneSplit = phoneDigits.match(/(\d{3})(\d{3})(\d{4})/);
				$("#navailPhone" + rdData.trackingNumber).text(phoneSplit[1] + "-" + phoneSplit[2] + "-" + phoneSplit[3]);

				$("#navailEmailAddress" + rdData.trackingNumber).text(rdData.email.toUpperCase());


				$("#addressUnavail" + rdData.trackingNumber).show();
				$("#redeliveryInputForm" + rdData.trackingNumber).hide();
				$("#navailExceedMax" + rdData.trackingNumber).show();
				$("#navailAddressIntercept" + rdData.trackingNumber).hide();

				// Scroll to the error
				$('html, body').animate({
					scrollTop: $("#addressUnavail" + rdData.trackingNumber).offset().top
				}, 500)

				//$(".trackOK-"+rdData.trackingNumber).hide();
			} else {

				//ERROR
				// Address is not available.
				//navailFirstName
				//addressUnavail + tracking number
				$("#navailFirstName" + rdData.trackingNumber).text(rdData.firstName.toUpperCase());
				$("#navailmiddleInitial" + rdData.trackingNumber).text(rdData.middleInitial.toUpperCase());
				$("#navailLastName" + rdData.trackingNumber).text(rdData.lastName.toUpperCase());
				$("#navailCompanyName" + rdData.trackingNumber).text(rdData.companyName.toUpperCase());
				$("#navailAddressLineOne" + rdData.trackingNumber).text(addressData.addressLine1);
				$("#navailCityStateZip" + rdData.trackingNumber).text(addressData.city + ", " + addressData.state + " " + addressData.zip5);

				//ERROR
				// Address is not available.
				//navailFirstName
				//addressUnavail + tracking number
				$("#navailFirstName" + rdData.trackingNumber).text(rdData.firstName.toUpperCase());
				$("#navailmiddleInitial" + rdData.trackingNumber).text(rdData.middleInitial.toUpperCase());
				$("#navailLastName" + rdData.trackingNumber).text(rdData.lastName.toUpperCase());
				$("#navailCompanyName" + rdData.trackingNumber).text(rdData.companyName.toUpperCase());
				$("#navailAddressLineOne" + rdData.trackingNumber).text(addressData.addressLine1);
				$("#navailCityStateZip" + rdData.trackingNumber).text(addressData.city + ", " + addressData.state + " " + addressData.zip5);


				var phoneDigits = rdData.phone;
				// remove all non-numbers
				phoneDigits = phoneDigits.replace(/[^\d]/g, "");
				var phoneSplit = phoneDigits.match(/(\d{3})(\d{3})(\d{4})/);
				$("#navailPhone" + rdData.trackingNumber).text(phoneSplit[1] + "-" + phoneSplit[2] + "-" + phoneSplit[3]);

				$("#navailEmailAddress" + rdData.trackingNumber).text(rdData.email.toUpperCase());


				$("#addressUnavail" + rdData.trackingNumber).show();
				$("#redeliveryInputForm" + rdData.trackingNumber).hide();
				$("#navailAddressMatch" + rdData.trackingNumber).show();
				$(".trackOK-" + rdData.trackingNumber).hide();

				// Scroll to the error
				$('html, body').animate({
					scrollTop: $("#addressUnavail" + rdData.trackingNumber).offset().top
				}, 500)
			}


		}
	});


}


function finalSubmit(cccVerifiedData, urbCode) {
	jQuery.ajax({
		url: "/ctrs/redelivery/createRedelivery",
		type: "POST",
		data: JSON.stringify(cccVerifiedData),
		headers: {
			"Content-Type": "application/json;charset=utf-8"
		},
		dataType: "json",
		success: function (resp) {

			if (resp.errorReturned == "true") {
				// Do something

			} else {
				displayConfirmation(resp.confirmation, cccVerifiedData.trackingNumber, urbCode);
			}
		},


	});



}


function displayConfirmation(confirmNumber, trackNumber, urbCode) {
	var data = {

		confirmationNumber: confirmNumber,

	};
	jQuery.ajax({
		url: "/ctrs/redelivery/loadExistingRedelivery",
		type: "POST",
		data: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json;charset=utf-8"
		},
		dataType: "json",
		success: function (resp) {

			var redeliveryType = resp.type;

			switch (redeliveryType) {
				case "REDELIVERY":
					var informationPane = presentCarrierRedelivery(resp, urbCode);
					$("#rdSuccessDetailsPane-" + trackNumber).append(informationPane);
					break;
				case "CUSTOMER_PICKUP":
					var informationPane = presentPickupRedelivery(resp);
					$("#rdSuccessDetailsPane-" + trackNumber).append(informationPane);
					break;
				case "RETURN":
					var informationPane = presentReturnRedelivery(resp);
					$("#rdSuccessDetailsPane-" + trackNumber).append(informationPane);
					break;
				case "SMART_LOCKER":
					$("#modifyText").hide();
					var informationPane = presentLockerRedelivery(resp);
					$("#rdSuccessDetailsPane-" + trackNumber).append(informationPane);
					break;
				default:
					break;
			}

			$("#newRedelivery-" + trackNumber).hide();
			$("#rdSuccess-" + trackNumber).removeClass("hidden");
			var emailAdd = resp.emailAddress;
			$("#email-sent-to-" + trackNumber).text(emailAdd);
			$("#email-success-" + trackNumber).text(emailAdd);
			var phoneadd = resp.phone;
			$("#phone-success-" + trackNumber).text(phoneadd.areaCode + "-" + phoneadd.exchange + "-" + phoneadd.line);
			var redeliveryType = "USPS Carrier Redelivery";
			$("#pickupType-" + trackNumber).text(redeliveryType);
			$("#redelivery-success-" + trackNumber).text(resp.confirmationNumber);


			// Scroll to the error
			$('html, body').animate({
				scrollTop: $("#rdSuccess-" + trackNumber).offset().top
			}, 500)

		},
		error: function (respCode) {

			//

		}
	});
}


function confirmParcelLocker(trackingNumber, userDta) {
    
    var tData = lockerInfo[trackingNumber];
    var tdZip = tData.poInfo.pozipcode.substr(0,5);
    
    var data = {

        // Start with Address
        destAddress1: userDta.addressLineOne,
        destAddress2: "",    
        destCity: userDta.city,
        destState: userDta.state,
        destZip: userDta.zipCode,
        
        
        packageHeight: tData.height,
        packageWidth: tData.width,
        packageLength: tData.length,
        
        
        //fdbid: tData.poInfo.fdbid,
        //pozipcode: tdZip,
        trackingNumber: trackingNumber

    };

    jQuery.ajax({
        url: "/ctrs/smartLockers/confirmLocker",
        type: "POST",
        data: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        dataType: "json",
        success: function (resp) {
        }
    });
}


function presentCarrierRedelivery(packageData, urbCode) {
	var informationText = "";

	informationText = informationText + "<div class=\"col-md-12 col-sm-12 col-xs-12 confirmation-package-details\">";
	informationText = informationText + "<div class=\"redelivery-item-details-wrapper\">";
	informationText = informationText + "<div class=\"row\">";
	informationText = informationText + "<div class=\"col-md-12 col-sm-12 col-xs-12 redelivery-type-wrapper\">";
	informationText = informationText + "<p><strong>Redelivery Type:</strong> ";
	informationText = informationText + "USPS<sup>®</sup> Carrier Redelivery</p>";
	informationText = informationText + "</div>";
	informationText = informationText + "<div class=\"col-md-12 col-sm-12 col-xs-12 redelivery-date-wrapper\">";
	informationText = informationText + "<p><strong>Redelivery Date:</strong> " + moment(packageData.redeliveryDate, "YYYYMMDD").format("MM/DD/YYYY") + "</p>";
	informationText = informationText + "</div>";
	informationText = informationText + "</div>";
	informationText = informationText + "</div>";
	informationText = informationText + "<div class=\"redelivery-contact-info-wrapper\">";
	informationText = informationText + "<div class=\"row\">";
	informationText = informationText + "<div class=\"col-md-5 col-sm-5 col-xs-12 name-primary-address-wrapper\">";
	informationText = informationText + "<p class=\"name-address-header\">Name and Primary Address:</p>";
	var fullName = "<p>" + packageData.customer.firstName + " " + packageData.customer.lastName + "</p>";
	if (packageData.customer.middleName && packageData.customer.middleName != "") {
		fullName = "<p>" + packageData.customer.firstName + " " + packageData.customer.middleName + " " + packageData.customer.lastName + "</p>";
	}
	informationText = informationText + fullName;
	if (packageData.customer.organizationName) {
		informationText = informationText + "<p>" + packageData.customer.organizationName + "</p>";
	}
	if (urbCode) {
		informationText = informationText + "<p>" + urbCode + "</p>";
	}
	informationText = informationText + "<p>" + packageData.address.line1 + "</p>";
	if (packageData.address.line2) {
		informationText = informationText + "<p>" + packageData.line2 + "</p>";
	}
	informationText = informationText + "<p>" + packageData.address.city + ", " + packageData.address.state + " " + packageData.address.postalCode + "-" + packageData.address.postalCodeExtended + "</p>";
	informationText = informationText + "</div>";
	informationText = informationText + "<div class=\"col-md-7 col-sm-7 col-xs-12 contact-phone-email-wrapper\">";
	informationText = informationText + "<div class=\"contact-phone-number\">";
	informationText = informationText + "<p><strong>Phone:</strong></p>";
	informationText = informationText + "<p class=\"phone-number\">" + packageData.phone.areaCode + "-" + packageData.phone.exchange + "-" + packageData.phone.line + "</p>";
	informationText = informationText + "</div>";
	informationText = informationText + "<div class=\"contact-email-address\">";
	informationText = informationText + "<p><strong>Email:</strong></p>";
	informationText = informationText + "<p class=\"contact-email\">" + packageData.emailAddress + "</p>";
	informationText = informationText + "</div>";
	informationText = informationText + "</div>";
	informationText = informationText + "</div>";
	informationText = informationText + "<div class=\"row\">";
	informationText = informationText + "<div class=\"col-md-12 col-sm-12 col-xs-12 final-confirm-message\">";
	/*informationText = informationText + "<p>You will receive a final delivery confirmation via email.</p>";*/
	informationText = informationText + "</div>";
	informationText = informationText + "</div>";
	informationText = informationText + "</div>";
	informationText = informationText + "</div>";

	return informationText;
}

function presentPickupRedelivery(packageData) {

	var informationText = "";

	informationText = informationText + "<div class=\"col-md-12 col-sm-12 col-xs-12 confirmation-package-details\">";
	informationText = informationText + "<div class=\"confirmation-number\">";
	//informationText = informationText + "<p class=\"redelivery-tracking-number\">"+ packageData.redeliveryItem[0].trackingNumber +"</p>";
	informationText = informationText + "</div>";
	informationText = informationText + "<div class=\"redelivery-item-details\">";
	informationText = informationText + "<div class=\"row\">";
	informationText = informationText + "<div class=\"col-md-5 col-sm-5 col-xs-12 post-office-info-wrapper redelivery-type-wrapper\">";
	informationText = informationText + "<table class=\"office-details-table\">";
	informationText = informationText + "<tbody>";
	informationText = informationText + "<tr>";
	informationText = informationText + "<td class=\"table-heading\"><p><strong>Redelivery Type:</strong></p></td>";
	informationText = informationText + "<td><p>Customer Pickup</p><p></p></td>";
	informationText = informationText + "</tr>";
	informationText = informationText + "<table class=\"office-details-table\">";
	informationText = informationText + "<tbody>";
	informationText = informationText + "<tr>";
	informationText = informationText + "<td class=\"table-heading\"><p><strong>Pickup Date: </strong> </p></td>";
	informationText = informationText + "<td><p style=\"padding-left: 35%\">" + moment(packageData.redeliveryDate, "YYYYMMDD").format("MM/DD/YYYY") + "</p><p></p></td>";
	informationText = informationText + "</tr>";
	informationText = informationText + "</tbody>";
	informationText = informationText + "</table>";
	/*    informationText = informationText + "<tr>";
	    informationText = informationText + "<td class=\"table-heading\"><p><strong>Post Office <br>Location:</strong></p></td>";
	    informationText = informationText + "<td>";
	    informationText = informationText + "<table>";
	    informationText = informationText + "<tbody>";
	    informationText = informationText + "<tr>";
	    informationText = informationText + "<td><a class=\"inline-link secondary\" href=\"https://tools.usps.com/find-location.htm?location=" + packageData.fdbid + "\" target=\"_blank\">" + packageData.poLocationName + "</a></td>";
	    informationText = informationText + "</tr>";
	    informationText = informationText + "<tr>";
	    informationText = informationText + "<td><p>" + packageData.poLocationAddress + "</p></td>";
	    informationText = informationText + "</tr>";
	    informationText = informationText + "<tr>";
	    informationText = informationText + "<td><p>" + packageData.poLocationCity + "," + packageData.poLocationState + " " + packageData.poLocationZip + "</p></td>";
	    informationText = informationText + "</tr>";*/
	/*
	    informationText = informationText + "</tbody>";
	    informationText = informationText + "</table>";
	    informationText = informationText + "</td>";
	    informationText = informationText + "</tr>";
	    informationText = informationText + "<tr>";
	    informationText = informationText + "<td class=\"hours-table-heading\"><p><strong>Pickup Hours:</strong></p></td>";
	    informationText = informationText + "<td>";
	    informationText = informationText + "<table class=\"office-hours-of-operation\">";
	    informationText = informationText + "<tbody>";
	    informationText = informationText + "<tr>";
	    informationText = informationText + "<td><p>" + packageData.poLocationHours + "</p></td>";
	    informationText = informationText + "</tr>";*/
	informationText = informationText + "</tbody>";
	informationText = informationText + "</table>";
	informationText = informationText + "</td>";
	informationText = informationText + "</tr>";
	informationText = informationText + "</tbody>";
	informationText = informationText + "</table>";
	informationText = informationText + "</div>";

	if (packageData.pickupRepresentative) {

		var pickupRep = packageData.pickupRepresentative;

		informationText = informationText + "<div class=\"col-md-7 col-sm-7 col-xs-12 pickup-representative-wrapper\">";
		informationText = informationText + "<table class=\"pickup-representative-name\">";
		informationText = informationText + "<tbody>";
		informationText = informationText + "<tr>";
		informationText = informationText + "<td class=\"col-md-6 col-sm-6 col-xs-4 pickup-rep-header\"><p><strong>Pickup Representative:</strong></p></td>";
		var pickupName = pickupRep.firstName + " " + pickupRep.lastName;
		if (pickupRep.middleName && pickupRep.middleName != "") {
			pickupName = pickupRep.firstName + " " + pickupRep.middleName + " " + pickupRep.lastName;
		}
		informationText = informationText + "<td><p>" + pickupName + "</p></td>";
		informationText = informationText + "</tr>";
		informationText = informationText + "</tbody>";
		informationText = informationText + "</table>";
		informationText = informationText + "<p class=\"requirement-notice\">At the time of pickup, the specified representative will be required to show:</p>";
		informationText = informationText + "<ul class=\"requirements-identification-list\">";
		informationText = informationText + "<li style=\"list-style-type: disc\"><p>Government-issued photo ID. The name entered must match the representative's photo ID. The ID may be scanned for our records.</p></li>";
		informationText = informationText + "<li style=\"list-style-type: disc\"><p>PS Form 3849, We ReDeliver for You! signed by the original recipient and the name of the representative printed on the back.</p></li>";
		informationText = informationText + "</ul>";
		informationText = informationText + "<br>";
		informationText = informationText + "<p class=\"acceptable-ids-link\"><a class=\"uspsLinkColored\" href=\"https://faq.usps.com/s/article/Acceptable-Form-of-Identification?r=4&amp;ui-force-components-controllers-recordGlobalValueProvider.RecordGvp.getRecord=1\" target=\"_blank\"><strong>See Acceptable IDs</strong></a></p>";
		informationText = informationText + "</div>";
	} else {

		informationText = informationText + "<div class=\"col-md-7 col-sm-7 col-xs-12 notification-information-wrapper\">";
		informationText = informationText + "<p class=\"required-to-show-id\">You will be required to show a government-issued photo ID at the time of pickup.</p>";
		informationText = informationText + "<br>";
		informationText = informationText + "<p class=\acceptable-ids-link\"><a class=\"uspsLinkColored\" href=\"https://faq.usps.com/s/article/Acceptable-Form-of-Identification?r=4&amp;ui-force-components-controllers-recordGlobalValueProvider.RecordGvp.getRecord=1\" target=\"_blank\"><strong>See Acceptable IDs</strong></a></p>";

	}
	informationText = informationText + "</div>";
	informationText = informationText + "</div>";
	informationText = informationText + "</div>";

	return informationText;

}


function presentReturnRedelivery(packageData) {

	var informationText = "";

	document.getElementById("modifyText").style.display = "none";

	informationText = informationText + "<div class=\"col-md-12 col-sm-12 col-xs-12 confirmation-package-details\">";
	informationText = informationText + "<div class=\"confirmation-number\">";
	//informationText = informationText + "<p class=\"redelivery-tracking-number\">" + packageData.redeliveryItem[0].trackingNumber + "</p>";
	informationText = informationText + "</div>";
	informationText = informationText + "<div class=\"redelivery-item-details-wrapper\">";
	informationText = informationText + "<div class=\"row\">";
	informationText = informationText + "<div class=\"redelivery-type-wrapper\" style=\"width: 78%\">";
	informationText = informationText + "<p><strong>Redelivery Type: </strong>Return to Sender by USPS</p>";
	informationText = informationText + "<br><p><strong>NOTE:</strong> This Redelivery request cannot be modified. To see when the package has been successfully returned to the sender, please enter the tracking number above to track the details.</p>"
	informationText = informationText + "</div>";
	informationText = informationText + "</div>";
	informationText = informationText + "</div>";
	informationText = informationText + "</div>";

	return informationText;

}


function presentLockerRedelivery(packageData) {

	var trackingNumberLocker = packageData.redeliveryItem[0].trackingNumber;
	var poInfoLocker = this["postOfficeInformation"+trackingNumberLocker];
	var informationText = "";

	informationText = informationText + "<div class=\"col-md-12 col-sm-12 col-xs-12 confirmation-package-details\">";
	informationText = informationText + "<div class=\"redelivery-item-details\">";
	informationText = informationText + "<div class=\"row\">";
	informationText = informationText + "<div class=\"col-md-5 col-sm-5 col-xs-12 post-office-info-wrapper redelivery-type-wrapper\">";
	informationText = informationText + "<table class=\"office-details-table\">";
	informationText = informationText + "<tbody>";
	informationText = informationText + "<tr>";
	informationText = informationText + "<td class=\"table-heading\"><p><strong>Redelivery Type:</strong></p></td>";
	informationText = informationText + "<td><p>USPS Smart Parcel Locker</p><p></p></td>";
	informationText = informationText + "</tr>";
	informationText = informationText + "<tr>";
    informationText = informationText + "<td class=\"table-heading\"><p><strong>Smart Locker <br>Location:</strong></p></td>";
   	informationText = informationText + "<td>";
    informationText = informationText + "<table>";
    informationText = informationText + "<tbody>";
    informationText = informationText + "<tr>";
    informationText = informationText + "<td><a class=\"inline-link secondary\" href=\"https://tools.usps.com/find-location.htm?location="+ poInfoLocker.locationID +"\" target=\"_blank\">"+ poInfoLocker.name +"</a></td>";
    informationText = informationText + "</tr>";
    informationText = informationText + "<tr>";
    informationText = informationText + "<td><p>"+ poInfoLocker.address +"</p></td>";
    informationText = informationText + "</tr>";
    informationText = informationText + "<tr>";
    informationText = informationText + "<td><p>"+ poInfoLocker.city + ", " + poInfoLocker.state + " " + poInfoLocker.zipCode +"</p></td>";
    informationText = informationText + "</tr>";
    informationText = informationText + "</tbody>";
    informationText = informationText + "</table>";
	informationText = informationText + "</td>";
    informationText = informationText + "</tr>";
	informationText = informationText + "<tr>";
    informationText = informationText + "<td class=\"table-heading\"><p><strong>Pickup Date:</strong></p></td>";
    informationText = informationText + "<td><p>" + moment(packageData.redeliveryDate, "YYYYMMDD").format("MM/DD/YYYY") + "</p></td>";
    informationText = informationText + "</tr>";
	informationText = informationText + "<tr>";
    informationText = informationText + "<td class=\"hours-table-heading\"><p><strong>Pickup Hours:</strong></p></td>";
    informationText = informationText + "<td>";
    informationText = informationText + "<table class=\"office-hours-of-operation\">";
    informationText = informationText + "<tbody>";
    informationText = informationText + "<tr>";
    informationText = informationText + "<td><p>" + poInfoLocker.pickupHours + "</p></td>";
    informationText = informationText + "</tr>";
 	informationText = informationText + "</tbody>";
    informationText = informationText + "</table>";
    informationText = informationText + "</td>";
    informationText = informationText + "</tr>";
    informationText = informationText + "</tbody>";
    informationText = informationText + "</table>";
    informationText = informationText + "</div>";
    informationText = informationText + "<div class=\"col-md-7 col-sm-7 col-xs-12 package-additional-updates\">";
	informationText = informationText + "<p><strong>You'll receive a follow-up email confirming your pickup details within 24-36 hours.</strong></p>";
    informationText = informationText + "</br>";
	informationText = informationText + "<p><strong>NOTE:</strong> You can't modify or cancel this Redelivery request.</p>";
    informationText = informationText + "</div>";
	informationText = informationText + "</div>";
    informationText = informationText + "</div>";
    informationText = informationText + "</div>";

    informationText = informationText + "<div class=\"row\">";
    informationText = informationText + "<div class=\"col-md-12 col-sm-12 col-xs-12 horizontal-line-container step-line\">";
    informationText = informationText + "<hr class=\"horizontal-line\">";
    informationText = informationText + "</div>";
    informationText = informationText + "</div>";
    informationText = informationText + "<br/>";
	informationText = informationText + "</div>";

    return informationText;
	
	}




function validateRDFields(data) {
	var trackNums = data.trackingNumber;
	//    jQuery(".required-field").toggleClass("error");

	var hasErrorFields = false;
	// Field Checks

	// special characters
	var regex = /^[\.\,\_\&\-\(\)\?\#\/\+\@A-Za-z0-9 ]+$/
	if (!regex.test($("#additional-instructions-" + trackNums).val()) && ($("#additional-instructions-" + trackNums).val().length > 0)) {
		hasErrorFields = true
	}


	var grabFields = {};

	grabFields.firstName = $("#firstName-" + trackNums).val();
	grabFields.lastName = $("#lastName-" + trackNums).val();
	grabFields.addressLineOne = $("#addressLineOne-" + trackNums).val();
	grabFields.city = $("#city-" + trackNums).val();
	grabFields.zipCode = $("#zipCode-" + trackNums).val();
	grabFields.phone = $("#phone-" + trackNums).val();
	grabFields.emailAddress = $("#emailAddress-" + trackNums).val();
	grabFields.redeliveryTypeDropdown = $("#redeliveryTypeDropdown-" + trackNums).val();

	var erroredFields = [];

	if (grabFields.phone.length <= 11) {
		jQuery("#phoneErrorMessage").parent().addClass("error");
		hasErrorFields = true;
	}


	jQuery.each(grabFields, function (gfIndex, gfValue) {

		if (gfValue == "") {
			jQuery("#" + gfIndex + "ErrorMessage").parent().addClass("error");
			hasErrorFields = true;
		}

	});

	// Now Specifics for ZIP Code, Phone Number and Email Address?
	var zipFix = grabFields.zipCode.replace(/[^\d]/g, "");


	if (zipFix.length !== 5 && zipFix.length !== 9) {
		jQuery("#zipCodeErrorMessage").parent().addClass("error");
		hasErrorFields = true;
	}

	if (!emailValidation(grabFields.emailAddress)) {
		jQuery("#emailAddressErrorMessage").show();
	} else {
		if (!validateEmail(grabFields.emailAddress)) {
			jQuery("#emailAddressErrorMessage").parent().addClass("error");
			jQuery("#emailAddressErrorMessage").show();
			hasErrorFields = true;
		}

	}

	if (!$("#scheduleRedelivery-tc-" + trackNums).is(':checked')) {
		$("#tcErrorMessage").show();
		hasErrorFields = true;
	}


	var redlivType = $("#redeliveryTypeDropdown-" + trackNums).val();
	if (redlivType == 'REDELIVERY') {
		var startDate = $("#select-date-" + trackNums).val();
		var dropdownLoc = $("#redeliveryLocationDropdown-" + trackNums).val();
		var additionalInstruct = $("#additional-instructions-" + trackNums).val();

		if (startDate == '') {
			$("#select-dateErrorMessage").show();
			$("#select-date-" + trackNums).css("border", "1px solid #e71921");
			hasErrorFields = true;
		} else {
			$("#select-dateErrorMessage").hide();
			$("#select-date-" + trackNums).css("border", "1px solid #333366");
		}

		if (dropdownLoc == null) {
			$("#redeliveryLocationDropdownErrorMessage").show();
			$("#redeliveryLocationDropdown-" + trackNums).css("border", "1px solid #e71921");
			hasErrorFields = true;
		} else if (dropdownLoc == 'OTHER') {
			if (additionalInstruct == '') {
				$("#addInstructionErrorMessage").show();
				/*$("#instructionTypeErrorMesage").show();*/
				$("#additional-instructions-" + trackNums).css("border", "1px solid #e71921");
				hasErrorFields = true;
			}
		} else {
			$("#redeliveryLocationDropdownErrorMessage").hide();
			$("#redeliveryLocationDropdown-" + trackNums).css("border", "1px solid #333366");
		}
	}

	if (redlivType == 'CUSTOMER_PICKUP') {
		var startDate = $("#select-date-" + trackNums).val();
		var repFirstName = $("#repFirst-" + trackNums).val();
		var repLastName = $("#repLast-" + trackNums).val();

		if (startDate == '') {
			$("#select-dateErrorMessage").show();
			$("#select-date-" + trackNums).css("border", "1px solid #e71921");
			hasErrorFields = true;
		} else {
			$("#select-dateErrorMessage").hide();
			$("#select-date-" + trackNums).css("border", "1px solid #333366");
		}

		if ($("#representative-for-" + trackNums).is(":checked")) {
			if (repFirstName == '') {
				$("#repFirstNameErrorMessage").show();
				$("#repFirst-" + trackNums).css("border", "1px solid #e71921");
				hasErrorFields = true;
			} else {
				$("#repFirstNameErrorMessage").hide();
				$("#repFirst-" + trackNums).css("border", "1px solid #333366");
			}

			if (repLastName == '') {
				$("#repLastNameErrorMessage").show();
				$("#repLast-" + trackNums).css("border", "1px solid #e71921");
				hasErrorFields = true;
			} else {
				$("#repLastNameErrorMessage").hide();
				$("#repLast-" + trackNums).css("border", "1px solid #333366");
			}
		}

	}
    
    
        if (redlivType == "REDELIVERY" || redlivType == "CUSTOMER_PICKUP" || redlivType == "SMART_LOCKER") {
        // Do a date check
        var dateCheckable = moment(jQuery("#select-date-" + trackNums).val(), "MM/DD/YYYY");
        var maxedDate = moment(jQuery("#rtsDate" + trackNums).data("rtsDate"), "MMM DD, YYYY");
            
            console.log();

        if (dateCheckable.isAfter(maxedDate)) {
			$("#select-dateErrorMessage").show();
			$("#select-date-" + trackNums).css("border", "1px solid #e71921");
			hasErrorFields = true;
        }


        if (!dateCheckable.isAfter(moment())) {
			$("#select-dateErrorMessage").show();
			$("#select-date-" + trackNums).css("border", "1px solid #e71921");
			hasErrorFields = true;
        }

        if (dateCheckable.day() == 0) {
			$("#select-dateErrorMessage").show();
			$("#select-date-" + trackNums).css("border", "1px solid #e71921");
			hasErrorFields = true;
        }

        if (holidays.includes(jQuery("#select-date-" + trackNums).val())) {
			$("#select-dateErrorMessage").show();
			$("#select-date-" + trackNums).css("border", "1px solid #e71921");
			hasErrorFields = true;
        }
    }
    

	var state = $("#state-" + trackNums).val();
	if (state == '') {
		$("#stateErrorMessage").show();
		$("#state-" + trackNums).css("border", "1px solid #e71921");
		hasErrorFields = true;
	} else {
		$("#stateErrorMessage").hide();
		$("#state-" + trackNums).css("border", "1px solid #333366");
	}

	if ($("#redeliveryTypeDropdown-" + trackNums).val() == null) {
		$("#redeliveryTypeDropdown-" + trackNums).css("border", "1px solid #e71921");
		$("#redeliveryTypeDropdownErrorMessage").parent().addClass("error");
		hasErrorFields = true;
	}

	jQuery("#redeliveryTypeDropdown-" + trackNums).on('change', function () {
		$("#redeliveryTypeDropdownErrorMessage").hide();
		$("#redeliveryTypeDropdown-" + trackNums).css("border", "1px solid #333366");
	});


	jQuery("#scheduleRedelivery-tc-" + trackNums).on('change', function () {
		$("#tcErrorMessage").hide();
	});

	jQuery("#repLast-" + trackNums).on('keypress', function () {
		$("#repLastNameErrorMessage").hide();
		$("#repLast-" + trackNums).css("border", "1px solid #333366");
	});
	jQuery("#repFirst-" + trackNums).on('keypress', function () {
		$("#repFirstNameErrorMessage").hide();
		$("#repFirst-" + trackNums).css("border", "1px solid #333366");
	});


	//Now do some stuff when you start typing...
	jQuery("#firstName-" + trackNums).on('keypress', function () {
		jQuery(this).parent().removeClass("error")
	});
	jQuery("#lastName-" + trackNums).on('keypress', function () {
		jQuery(this).parent().removeClass("error")
	});
	jQuery("#phone-" + trackNums).on('keypress', function () {
		jQuery(this).parent().removeClass("error")
	});
	jQuery("#addressLineOne-" + trackNums).on('keypress', function () {
		jQuery(this).parent().removeClass("error")
	});
	jQuery("#city-" + trackNums).on('keypress', function () {
		jQuery(this).parent().removeClass("error")
	});
	jQuery("#zipCode-" + trackNums).on('keypress', function () {
		jQuery(this).parent().removeClass("error")
	});
	jQuery("#additional-instructions-" + trackNums).on('keypress', function () {
		$("#addInstructionErrorMessage").hide();
		$("#instructionTypeErrorMesage").hide();
		$("#additional-instructions-" + trackNums).css("border", "1px solid #333366");
	});
	jQuery("#state-" + trackNums).on('change', function () {
		$("#stateErrorMessage").hide();
		$("#state-" + trackNums).css("border", "1px solid #333366");
	});
	jQuery("#emailAddress-" + trackNums).on('keypress', function () {
		jQuery(this).parent().removeClass("error")
		jQuery("#emailAddressErrorMessage").hide();
	});

	jQuery("#select-date-" + trackNums).on('click', function () {
		$("#select-dateErrorMessage").hide();
		$("#select-date-" + trackNums).css("border", "1px solid #333366");
	});
	jQuery("#redeliveryLocationDropdown-" + trackNums).on('change', function () {
		$("#redeliveryLocationDropdownErrorMessage").hide();
		$("#redeliveryLocationDropdown-" + trackNums).css("border", "1px solid #333366");
	});
	jQuery("#scheduleRedelivery-tc-" + trackNums).on('change', function () {
		$("#tcErrorMessage").hide();
	});

	if (!hasErrorFields) {
		// Gee to complete
		return true;
	} else {
		jQuery('html, body').animate({
			scrollTop: jQuery('.error:visible:first').offset().top
		}, 800);
	}


}

function clearAllErrors() {
    $('body').find('*').removeClass("error");
} 

function emailValidation(email) {

	if (email == "") {
		return false;
	} else {
		return true;
	}

};

function validateEmail(emailField) {
	var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (reg.test(emailField) == false) {
		return false;
	}
	return true;
}

function reenableFunctions() {

	//    // Display the additional requirements for the package pickup representative upon clicking the "Add someone..." checkbox. 
	$('.pickup-representative').click(function () {
		$(this).closest('.redelivery-pickup-wrapper').find('.representative-requirements-wrapper').toggle();
		$(this).closest('.redelivery-pickup-wrapper').find('.id-pickup').toggle();
	});

	// Display input fields based on the Redelivery Type.
	$('.redelivery-type-dropdown').change(function () {
		if ($(this).val() === "REDELIVERY") {
			$(this).closest('.redelivery-details-wrapper').removeClass('pickup-redelivery return-sender-redelivery').addClass('carrier-redelivery');
			$(this).closest('.additional-instructions-wrapper').removeClass('col-md-5 col-sm-5').addClass('col-md-10 col-sm-10');
			$(this).closest('.carrier-redeliver-required').show();
			$(this).closest('.redelivery-details-wrapper').find('.smart-locker-information-wrapper').hide();
			$(this).closest('.additional-instructions-wrapper').addClass('required-field');
			$(this).closest('.redelivery-details-wrapper').find('.additional-instructions-wrapper').show();
		} else if ($(this).val() === "CUSTOMER_PICKUP") {
			$(this).closest('.redelivery-details-wrapper').removeClass('carrier-redelivery return-sender-redelivery').addClass('pickup-redelivery');
			$(this).closest('.additional-instructions-wrapper').removeClass('col-md-5 col-sm-5').addClass('col-md-10 col-sm-10');
			$('.carrier-redeliver-required').hide();
			$(this).closest('.additional-instructions-wrapper').removeClass('required-field error');
			$(this).closest('.receive-confirmation-wrapper').show();
			$(this).closest('.redelivery-details-wrapper').find('.smart-locker-information-wrapper').hide();
			$(this).closest('.redelivery-details-wrapper').find('.additional-instructions-wrapper').show();
		} else if ($(this).val() === "RETURN") {
			$(this).closest('.redelivery-details-wrapper').removeClass('pickup-redelivery carrier-redelivery').addClass('return-sender-redelivery');
			$(this).closest('.additional-instructions-wrapper').removeClass('col-md-10 col-sm-10').addClass('col-md-5 col-sm-5');
			$(this).closest('.carrier-redeliver-required').hide();
			$(this).closest('.additional-instructions-wrapper').removeClass('required-field error');
			$(this).closest('.redelivery-details-wrapper').find('.smart-locker-information-wrapper').hide();
			$(this).closest('.redelivery-details-wrapper').find('.select-date-wrapper').hide();
			$(this).closest('.redelivery-details-wrapper').find('.additional-instructions-wrapper').show();
		} else if ($(this).val() === "SMART_LOCKER") {
			var currentTN = $(this).data("trackNumber");
			var currentLocker = lockerInfo[currentTN];
			checkRedeliverySmartLockers(currentLocker.length, currentLocker.width, currentLocker.height, currentLocker.poInfo);
			$(this).closest('.redelivery-details-wrapper').find('.smart-locker-information-wrapper').show();
			$(this).closest('.redelivery-details-wrapper').removeClass('pickup-redelivery carrier-redelivery').addClass('return-sender-redelivery');
        	$(this).closest('.redelivery-details-wrapper').find('.additional-instructions-wrapper').hide();
        	$(this).closest('.redelivery-details-wrapper').find('.smart-locker-information-wrapper').show();
        	$(this).closest('.redelivery-details-wrapper').find('.select-date-wrapper').show();
		} else {
			$(this).closest('.redelivery-details-wrapper').removeClass('pickup-redelivery carrier-redelivery return-sender-redelivery').addClass('redelivery-not-special');
			$(this).closest('.additional-instructions-wrapper').removeClass('col-md-10 col-sm-10').addClass('col-md-5 col-sm-5');
			$('.carrier-redeliver-required').hide();
			$(this).closest('.additional-instructions-wrapper').removeClass('required-field error');
			$(this).closest('.redelivery-details-wrapper').find('.smart-locker-information-wrapper').hide();
		}
	});

	// Make the "Additional Instructions" input field a required field if "Other" is selected from the "Delivery Location" dropdown.
	$('.delivery-location-dropdown').change(function () {
		if ($(this).val() === "OTHER") {
			$(this).parents('.redelivery-details-wrapper').find('.additional-instructions-wrapper').addClass('required-field');
			$(this).parents('.redelivery-details-wrapper').find('.carrier-redeliver-required').show();
			if ($(this).val() !== "OTHER") {
				$(this).parents('.redelivery-details-wrapper').find('.additional-instructions-wrapper').removeClass('required-field');
				$(this).parents('.redelivery-details-wrapper').find('.carrier-redeliver-required').hide();
			}
		} else {
			$(this).parents('.redelivery-details-wrapper').find('.additional-instructions-wrapper').removeClass('required-field');
			$(this).parents('.redelivery-details-wrapper').find('.carrier-redeliver-required').hide();
		}
	});
}


function getMultipleAddressModal(resp) {

	var addressVerifyListHtml = "";

	var addressList = resp.allAddressMatches;

	foundAddresses = addressList;


	jQuery("#enteredAddress").text(resp.defaultMatch.addressLine1);
	jQuery("#enteredCityStateZip").text(resp.defaultMatch.city + " " + resp.defaultMatch.state + " " + resp.defaultMatch.zip5);


	jQuery.each(addressList, function (listId, listValue) {
		var rowId = Math.random().toString(36).substr(2, 5);
		addressVerifyListHtml = addressVerifyListHtml + "<div class=\"col-md-12 col-sm-12 col-xs-12 schedule-pick-up-radio-container radio-container step-one-radio\" style=\"background-color: rgb(255, 255, 255);\">" +
			"<input type=\"radio\" id=\"" + listId + "\" class=\"step-one-radio radio-button\" name=\"selectValidAddress\">" +
			"<label for=\"" + listId + "\">" +
			"<ul class=\"schedule-pickup\">" +
			"<li>" + listValue.addressLine1 + " " + listValue.city + " " + listValue.state + " " + listValue.postalCode + "</li>" +
			"</ul>" +
			"</label>" +
			"</div>";
		//        foundAddresses[listId] = listValue;
	});

	jQuery("#pickaPlace").html(addressVerifyListHtml);
}

function showUrb(value) {
	if (value === "PR" || value === "GU") {
		document.getElementById("urbCode").style.display = "initial";
	} else {
		document.getElementById("urbCode").style.display = "none";
	}
}


function getSLLatLong(address, tnumb)
{
    //Make Call to ESRI
    var callCenter = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer" +
        "/findAddressCandidates?SingleLine=" + address + "&f=json&outFields=location&countryCode=US";
    $.ajax({
        url: callCenter,
        type: "GET",
        dataType: "json",
        success: function (resp) {
            var locationInformation = {};
            locationInformation = resp;
            locationGPS = locationInformation.candidates[0];
            var splitaddress = locationGPS.address.split(",");            
            var slicurrent = {};
            slicurrent.Address1 = splitaddress[0];
            slicurrent.City = splitaddress[1];
            slicurrent.State = splitaddress[2];
            slicurrent.Zip = splitaddress[3];
            slicurrent.lat = locationGPS.location.y;
            slicurrent.long = locationGPS.location.x;
            
            
            var addressLineOne = slicurrent.Address1.trim();
            var addressLineTwo = "";
            var city = slicurrent.City.trim();
            var state = states[slicurrent.State.trim()];
            var zipCode = slicurrent.Zip.trim();
    var data = {

        addressLineOne: addressLineOne,
        addressLineTwo: addressLineTwo,
        city: city,
        state: state,
        zip: zipCode
    };

    jQuery.ajax({
        url: "/ctrs/redelivery/validateAddress",
        type: "POST",
        data: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        dataType: "json",
        success: function (resp) {
            
            var defaultAdd = resp.defaultMatch;
            
            slicurrent.Address1 = defaultAdd.addressLine1;
            slicurrent.City = defaultAdd.city;
            slicurrent.State = defaultAdd.state;
            slicurrent.Zip = defaultAdd.zip5;
            
            smartLockerInfo[tnumb] = slicurrent;
			$("#sl-loc-" + tnumb).show();
            $("#sl-street-" + tnumb).text(smartLockerInfo[tnumb].Address1);
            $("#sl-city-state-" + tnumb).text(smartLockerInfo[tnumb].City + ", " + smartLockerInfo[tnumb].State + " " + smartLockerInfo[tnumb].Zip);
            
                // smart locker modal
                $('.smartLockerModal').unbind();
                $('.smartLockerModal').on('click', function () {

                    var tnumb = $(this).data("trackingNumber");
                    $("#smt-lkr-address").text(smartLockerInfo[tnumb].Address1);
                    $("#smt-lkr-csz").text(smartLockerInfo[tnumb].City + ", " + smartLockerInfo[tnumb].State + " " + smartLockerInfo[tnumb].Zip);

                    mapit(tnumb);
            });
            
        }});
            
        }
    });
}

function mapit(trackingnumber)
{
    $("#smart-locker-esri").html("");
    
    require(["esri/Map", "esri/views/MapView", "esri/Graphic"], (
        Map,
        MapView,
        Graphic
      ) => {
        const map = new Map({
          basemap: "streets-vector"
        });

        const view = new MapView({
          center: [smartLockerInfo[trackingnumber].long, smartLockerInfo[trackingnumber].lat],
          container: "smart-locker-esri",
          map: map,
          zoom: 14
        });

        /*************************
         * Create a point graphic
         *************************/

        // First create a point geometry (this is the location of the Titanic)
        const point = {
          type: "point", // autocasts as new Point()
          longitude:  smartLockerInfo[trackingnumber].long,
          latitude:  smartLockerInfo[trackingnumber].lat
        };

        // Create a symbol for drawing the point
        const markerSymbol = {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          color: [51, 51, 102],
          outline: {
            // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: 3
          }
        };

        // Create a graphic and add the geometry and symbol to it
        const pointGraphic = new Graphic({
          geometry: point,
          symbol: markerSymbol
        });

        // Add the graphics to the view's graphics layer
        view.graphics.add(pointGraphic);
      });
    
    
    setTimeout(function(){$(".esri-attribution").hide();}, 750);
}

var states ={
    
"Alabama" : "AL",
"Alaska" : "AK",
"American Samoa" : "AS",
"Arizona" : "AZ",
"Arkansas" : "AR",
"California" : "CA",
"Colorado" : "CO",
"Connecticut" : "CT",
"Delaware" : "DE",
"District of Columbia" : "DC",
"Federated States of Micronesia" : "FM",
"Florida" : "FL",
"Georgia" : "GA",
"Guam" : "GU",
"Hawaii" : "HI",
"Idaho" : "ID",
"Illinois" : "IL",
"Indiana" : "IN",
"Iowa" : "IA",
"Kansas" : "KS",
"Kentucky" : "KY",
"Louisiana" : "LA",
"Maine" : "ME",
"Marshall Islands" : "MH",
"Maryland" : "MD",
"Massachusetts" : "MA",
"Michigan" : "MI",
"Minnesota" : "MN",
"Mississippi" : "MS",
"Missouri" : "MO",
"Montana" : "MT",
"Nebraska" : "NE",
"Nevada" : "NV",
"New Hampshire" : "NH",
"New Jersey" : "NJ",
"New Mexico" : "NM",
"New York" : "NY",
"North Carolina" : "NC",
"North Dakota" : "ND",
"Northern Mariana Islands" : "MP",
"Ohio" : "OH",
"Oklahoma" : "OK",
"Oregon" : "OR",
"Palau" : "PW",
"Pennsylvania" : "PA",
"Puerto Rico" : "PR",
"Rhode Island" : "RI",
"South Carolina" : "SC",
"South Dakota" : "SD",
"Tennessee" : "TN",
"Texas" : "TX",
"Utah" : "UT",
"Vermont" : "VT",
"Virgin Islands" : "VI",
"Virginia" : "VA",
"Washington" : "WA",
"West Virginia" : "WV",
"Wisconsin" : "WI",
"Wyoming" : "WY",
"Armed Forces Americas" : "AA",
"Armed Forces Africa" : "AE",
"Armed Forces Canada" : "AE",
"Armed Forces Europe" : "AE",
"Armed Forces Middle East" : "AE",
"Armed Forces Pacific" : "AP"
    
}