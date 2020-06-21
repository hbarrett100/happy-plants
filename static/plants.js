var dropdown = `<div class="form-group">
                <select class="form-control" id="frequency">
                <option>1 day</option>
                <option>2 days</option>
                <option>3 days</option>
                <option>4 days</option>
                <option>5 days</option>
                <option>6 days</option>
                <option>1 week</option>
                <option>8 days</option>
                <option>9 days</option>
                <option>10 days</option>
                <option>11 days</option>
                <option>12 days</option>
                <option>13 days</option>
                <option>2 weeks</option>
                <option>3 weeks</option>
                <option>4 weeks</option>
                <option>5 weeks</option>
                <option>6 weeks</option>
                </select>
                </div>`

$(document).ready(function(){

     // Get the current user email from flask
     const CURRENT_USER = "{{user_email}}"
 
     let plant = "{{user_plants_info}}"

   
// https://www.tutorialrepublic.com/codelab.php?topic=bootstrap&file=table-with-add-and-delete-row-feature

	$('[data-toggle="tooltip"]').tooltip();
	var actions = $("table td:last-child").html(); //add html for all buttons to var
	// Append table with add row form on add new button click
    $(".add-new").click(function(){
		$(this).attr("disabled", "disabled"); //disable button
		var index = $("table tbody tr:last-child").index(); // how many rows we have
        var row = '<tr>' +
            '<td><input type="text" class="form-control" name="plant" id="plant"></td>' +
            '<td>' + dropdown + '</td>' +
            '<td><input type="text" id="datepicker"></td>' +
            '<td><input type="text" name="timepicker" class="timepicker"/></td>' +
            '<td><input type="text" class="form-control" name="comments" id="comments"></td>' +
			'<td>' + actions + '</td>' +
        '</tr>';
    	$("table").append(row);		
		$("table tbody tr").eq(index + 1).find(".add, .edit").toggle(); // hiding edit and showing add for the new row
        $('[data-toggle="tooltip"]').tooltip(); 

        $( "#datepicker" ).datepicker();

        // wickedpicker code from https://github.com/ericjgagnon/wickedpicker
        $('.timepicker').wickedpicker({
            showSeconds: true,
            upArrow: 'wickedpicker__controls__control-up',  //The up arrow class selector to use, for custom CSS
            downArrow: 'wickedpicker__controls__control-down', //The down arrow class selector to use, for custom CSS
            close: 'wickedpicker__close', //The close class selector to use, for custom CSS
            hoverState: 'hover-state', //The hover state class to use, for custom CSS
            title: 'Choose a time', //The Wickedpicker's title,

        });

        
    });

   
	// Add row on add button click
	$(document).on("click", ".add", function(){
		var empty = false; // flag
        var input = $(this).parents("tr").find('input[type="text"]'); // get input boxes in this row
        
        // for loop
        input.each(function(){
			if(!$(this).val()){
				$(this).addClass("error"); // if no value add class error
				empty = true;
			} else{
                $(this).removeClass("error");
            }
        });
        
        if(empty){
            $(this).parents("tr").find(".error").first().focus(); // focus - the empty cell is now active to type in
        }
        // if no cells are empty execute this code
		if(!empty){
			input.each(function(){
				$(this).parent("td").html($(this).val()); // Set the table cell contents as the contents in the input box
            });			
            
            // send post request to route to add plant to database

            // split watering frequency into interval and frequency
            let freqBeforeSplit = $('#frequency').val();
            let interval = freqBeforeSplit.split(" ")[0];
            let frequency = freqBeforeSplit.split(" ")[1];
            console.log("interval" + interval);
            console.log("freq" + frequency);

            var date = $("#datepicker").datepicker({ dateFormat: 'dd-MM-yyyy' }).val();
            var timepicker = $('.timepicker').wickedpicker();
            var time = timepicker.wickedpicker('time');
            console.log("time" + time);
            var startDate = date + ' ' + time;
            console.log("start date: " + startDate);

            $.post("/new_plant", { email: CURRENT_USER, plant_name: $('#plant').val(), comments: $('#comments').val(), interval: interval, frequency: frequency, start_date: startDate }, function (result) {
                if (result == 'unique constraint') {
                    $('#homepage-error').html("Plant already exists")
                } // else here to use the json strings returned to populate the table and show to user

            });
			$(this).parents("tr").find(".add, .edit").toggle(); // change add button to edit
			$(".add-new").removeAttr("disabled"); // enable the add new button again
		}		
    });


	// Edit row on edit button click
	$(document).on("click", ".edit", function(){	
        
        //get all td elements except the last one
        $(this).parents("tr").find("td:not(:last-child)").each(function(){
			$(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
		});		
		$(this).parents("tr").find(".add, .edit").toggle();
		$(".add-new").attr("disabled", "disabled");
    });
	// Delete row on delete button click
	$(document).on("click", ".delete", function(){
        $(this).parents("tr").remove();
		$(".add-new").removeAttr("disabled");
    });



   


    // hardcoding example input to test
    // $('#newplant').click(function () {
    //     console.log("adding" + TEMP_PLANT_NAME);
    //     let plantName = TEMP_PLANT_NAME;
    //     let comments = "direct sunlight";
    //     let interval = 'weeks';
    //     let frequency = 2;
    //     // format of time will be from jquery datetime picker
    //     let start_date = '30-05-2020 18:00:00'

    //     // send post request
      
    //     });
    // });


    $('#calendar').click(function () {
        console.log("adding " + TEMP_PLANT_NAME + " to calendar");
        let plantName = TEMP_PLANT_NAME;
        let comments = "direct sunlight";
        let interval = 2;
        let frequency = 'weeks';
        // format of time will be from jquery datetime picker
        let start_date = '30-05-2020 18:00:00'

        // send post request
        $.post("/add_to_calendar", { email: CURRENT_USER, plant_name: plantName, comments: comments, interval: interval, frequency: frequency, start_date: start_date }, function (result) {
            if (result) {
                $('#calendar-test').html("Event added to google calendar")
            }
        });
    });


    // function to remove a plant from database and calendar
    // no need to have any callback function here? 
    $('#delete').click(function () {
        let plantName = TEMP_PLANT_NAME;
        console.log('inside delete');
        $.get("/remove_plant", { email: CURRENT_USER, plant: 'hbb' }, function(result){
            if (result) {
                $('#calendar-test').html("Event deleted")
            }
        })
    });


    // function to edit content of a plant in the database
    // hard coding example input to test
    $('#edit').click(function () {
        console.log("editing" + TEMP_PLANT_NAME);
        let plantName = TEMP_PLANT_NAME;
        let comments = "no sunlight";
        let interval = 'weeks';
        let frequency = 2;
        // format of time will be from jquery datetime picker
        let start_date = '30-05-2020 18:00:00'

        // send post request
        $.post("/edit_plant", { email: CURRENT_USER, plant_name: plantName, comments: comments, interval: interval, frequency: frequency, start_date: start_date }, function (result) {
            if (result == 'unique constraint') {
                $('#homepage-error').html("Plant already exists")
            } // else here to use the json strings returned to populate the table and show to user
        });
    });

    $('#go').click(function () {
        console.log("hello login page");
        var email = $('#existinguser').val();
        // add check for when button pressed with no email given

        window.location.replace("/home?email=" + email);


    });

    });




