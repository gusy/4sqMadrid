$(document).ready(function(){
	/* This code is executed after the DOM has been completely loaded */

	/* Changing thedefault easing effect - will affect the slideUp/slideDown methods: */
	//$.easing.def = "easeOutBounce";
	var queue=[$("#acord1"),$("#acord2")];
	/* Binding a click event handler to the links: */
	$('#container .button a').click(function(e){
	
		/* Finding the drop down list that corresponds to the current section: */
		var dropDown = $(this).parent().next();
		if(dropDown.css('display')!="none"){	
			return;
		}
		var t=queue.shift();
		/* Closing all other drop down sections, except the current one */
		$('.dropdown').not(dropDown).not(queue[0]).slideUp('slow');
		dropDown.slideToggle('slow');
		queue.push(dropDown);
		/* Preventing the default event (which would be to navigate the browser to the link's address) */
		e.preventDefault();
	})
	console.log($('#container .button a'))
});
