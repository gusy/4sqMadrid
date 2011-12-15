$(document).ready(function() {
	$('#from').datetimepicker({
		minDate: new Date(2011, 11, 1, 8, 30), maxDate: new Date(2011, 11, 31, 17, 30)
		});
	$('#to').datetimepicker({
		minDate: new Date(2011, 11, 1, 8, 30), maxDate: new Date(2011, 11, 31, 17, 30)
		});
	//$('#menu').hide();
});

function conversion(){
	var from = new Date(document.getElementById("from").value)//.getTime();
    var to = new Date(document.getElementById("to").value)//.getTime();
    var fromEpoch = Math.round(from.getTime()/1000);
    var toEpoch = Math.round(to.getTime()/1000);

    document.timeFrameData.from.value = fromEpoch;
    document.timeFrameData.to.value = toEpoch;
    
}

$('#test').click(function() {
  $('#menu').slideDown('slow', function() {
    // Animation complete.
  });
});
