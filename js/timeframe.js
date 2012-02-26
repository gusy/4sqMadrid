var menuShown = false;

$(document).ready(function() {
	$('#from').datetimepicker({
		minDate: new Date(2011, 11, 1, 8, 30),
		maxDate: new Date()
		});
	$('#to').datetimepicker({
		minDate: new Date(2011, 11, 1, 8, 30),
		maxDate: new Date()
		});
	$('#menu').hide();
	$('#timeFrameButton').click(function() {
		var menuPosition = $('#timeFrameButton').offset();
		menuPosition.left += 70;
		menuPosition.top += 40;
		menuPosition.top -= $('#menu').outerHeight();
		$('#menu').css(menuPosition);
		$('#menu').fadeToggle('slow');
		/*
		
		if (!menuShown){
			$('#menu').slideDown('slow', function() {
		        menuShown=true;
		    });
			
		}else{
			$('#menu').slideUp('slow', function() {
		// Animation complete.
		});
			menuShown=false;
		}*/
		
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


