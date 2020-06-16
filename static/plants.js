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


