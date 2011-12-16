$(document).ready(function() {
	$('#from').datetimepicker({
		minDate: new Date(2011, 11, 1, 8, 30), maxDate: new Date(2011, 11, 31, 17, 30)
		});
	$('#to').datetimepicker({
		minDate: new Date(2011, 11, 1, 8, 30), maxDate: new Date(2011, 11, 31, 17, 30)
		});
	$('#menu').hide();
	$('#timeFrameButton').click(function() {
		$('#menu').slideDown('slow', function() {
		// Animation complete.
		});
	});
});

function conversion(){
	
	var fromString = document.getElementById("from").value
	var toString = document.getElementById("to").value
	if (fromString != "" && toEpoch != ""){
		var from = new Date(fromString);
		var to = new Date(toString);
		
		var fromEpoch = Math.round(from.getTime()/1000);
		var toEpoch = Math.round(to.getTime()/1000);
		document.timeFrameData.from.value = fromEpoch;
		document.timeFrameData.to.value = toEpoch;
		document.timeFrameData.timeFrameValue.value="true";
	   
	}
	
    
    

    
    
}


