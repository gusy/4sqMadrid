var menuShown = false;

$(document).ready(function() {
	$( "#dialog:ui-dialog" ).dialog( "destroy" );
	$( "#menu" ).dialog({
			autoOpen: false,
			height: 300,
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
		
	$('#timeFrameButton').click(function() {
		$( "#menu" ).dialog( "open" );
	});
	$('#from').datetimepicker({
		minDate: new Date(2011, 11, 1, 8, 30),
		maxDate: new Date()
		});
	$('#to').datetimepicker({
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
