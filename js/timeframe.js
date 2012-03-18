var menuShown = false;

$(document).ready(function() {
	$( "#dialog:ui-dialog" ).dialog( "destroy" );
	$( "#menu" ).dialog({
			autoOpen: false,
			height: 350,
			width: 280,
			modal: true,
			buttons: {
				"Submit": function() {
					$("#timeFrameData").submit();
				},
				Cancel: function() {
					$(this).dialog( "close" );
				}
			}
		});
		
	$('#settingsButton').click(function() {
		$( "#menu" ).dialog( "open" );
	});
	$('#from').datetimepicker({
		addSliderAccess: true,
		sliderAccessArgs: { touchonly: false },
		minDate: new Date(2011, 11, 1, 8, 30),
		maxDate: new Date()	
		});
	$('#to').datetimepicker({
		/*changeMonth: true,
		changeYear: true,*/
		addSliderAccess: true,
		sliderAccessArgs: { touchonly: false },
		minDate: new Date(2011, 11, 1, 8, 30),
		maxDate: new Date()
		});	
});

function conversion(){
	var fromString = $("#from").val()
	var toString = $("#to").val()
	if (fromString != "" && toEpoch != ""){
		var from = new Date(fromString);
		var to = new Date(toString);
		var fromEpoch = Math.round(from.getTime()/1000);
		var toEpoch = Math.round(to.getTime()/1000);
		$("#from").val(fromEpoch.toString());
		$("#to").val(toEpoch.toString());
		$("#timeFrameValue").val("true");  
	}   
}
