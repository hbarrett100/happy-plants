
$(document).ready(function(){
    $('#go').on('click', function(event) {
        event.preventDefault(); 
        var url = $(this).data('/home');
        location.replace(url);
    });

// https://www.tutorialrepublic.com/codelab.php?topic=bootstrap&file=table-with-add-and-delete-row-feature

	$('[data-toggle="tooltip"]').tooltip();
	var actions = $("table td:last-child").html();
	// Append table with add row form on add new button click
    $(".add-new").click(function(){
		$(this).attr("disabled", "disabled");
		var index = $("table tbody tr:last-child").index();
        var row = '<tr>' +
            '<td><input type="text" class="form-control" name="name" id="name"></td>' +
            '<td><input type="text" class="form-control" name="department" id="department"></td>' +
            '<td><input type="text" class="form-control" name="phone" id="phone"></td>' +
			'<td>' + actions + '</td>' +
        '</tr>';
    	$("table").append(row);		
		$("table tbody tr").eq(index + 1).find(".add, .edit").toggle();
        $('[data-toggle="tooltip"]').tooltip();
    });
	// Add row on add button click
	$(document).on("click", ".add", function(){
		var empty = false;
		var input = $(this).parents("tr").find('input[type="text"]');
        input.each(function(){
			if(!$(this).val()){
				$(this).addClass("error");
				empty = true;
			} else{
                $(this).removeClass("error");
            }
		});
		$(this).parents("tr").find(".error").first().focus();
		if(!empty){
			input.each(function(){
				$(this).parent("td").html($(this).val());
			});			
			$(this).parents("tr").find(".add, .edit").toggle();
			$(".add-new").removeAttr("disabled");
		}		
    });
	// Edit row on edit button click
	$(document).on("click", ".edit", function(){		
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
});


// Get the current user email from flask
const CURRENT_USER = "{{user_email}}"
const TEMP_PLANT_NAME = 'hi'


let plant = "{{user_plants_info}}"


// hardcoding example input to test
$('#newplant').click(function () {
    console.log("adding" + TEMP_PLANT_NAME);
    let plantName = TEMP_PLANT_NAME;
    let comments = "direct sunlight";
    let interval = 'weeks';
    let frequency = 2;
    // format of time will be from jquery datetime picker
    let start_date = '30-05-2020 18:00:00'

    // send post request
    $.post("/new_plant", { email: CURRENT_USER, plant_name: plantName, comments: comments, interval: interval, frequency: frequency, start_date: start_date }, function (result) {
        if (result == 'unique constraint') {
            $('#homepage-error').html("Plant already exists")
        } // else here to use the json strings returned to populate the table and show to user
    });
});


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

$('#existinguser').click(function () {
    console.log("hello login page");
    var email = $('#existinguser').val();
    // add check for when button pressed with no email given

    $.get("/checkuser", { email: email }, function (existingUser) {
        console.log(existingUser);
        console.log("test");

        // if true
        if (existingUser == 'user')
            window.location.replace("/home?email=" + email);
        else if (existingUser == 'no user') // never gets here
            $('#usererror').html("User does not exist.")

            
        else if (existingUser == 'no email'){
            $('#usererror').html("You must enter an email")

        }

    });
});

$('#newuser').click(function () {
    console.log("login page new user button");
    var email = $('#newuser').val();
    // add check for when button pressed with no email given

    $.get("/newuser", { email: email }, function (newUser) {
        console.log(newUser);
        console.log("test");

        // if true
        if (newUser == 'new user')
            window.location.replace("/home?email=" + email);
        else if (newUser == 'user already exists') // never gets here
            $('#usererror').html("User already exists")

            
        else if (newUser == 'no email'){
            $('#usererror').html("You must enter an email")

        }

    });
});


