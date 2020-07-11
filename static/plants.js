var dropdown = `<select class="form-control" id="frequency">
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
                </select>`

var plantName;
var comments;
var datepicker;

var actions = `<a class="add" title="Add" data-toggle="tooltip"><i class="material-icons">&#xE03B;</i></a>
    <a class="edit" title="Edit" data-toggle="tooltip"><i class="material-icons">&#xE254;</i></a>
    <a class="delete" title="Delete" data-toggle="tooltip" data-plant=""><i class="material-icons">&#xE872;</i></a>`;


$(document).ready(function () {
    var timepicker;
    // adapted from basic table at https://www.tutorialrepublic.com/codelab.php?topic=bootstrap&file=table-with-add-and-delete-row-feature

    $('[data-toggle="tooltip"]').tooltip();

    // Append table with add row form on add new button click
    $(".add-new").click(function () {
        console.log("inside add new click");

        addNewRow()
        console.log("under function call");

        addOnClickDelete();

    });


    // Edit row on edit button click
    $(document).on("click", ".edit", function () {


        var currentPlantValues = [];
        var val;
        // 1. save current values to an array
        $(this).parents("tr").find("td:not(:last-child)").each(function () {
            if ($(this).is('select')) {
                console.log("inside select"); //not working
                val = $(this).val();

            } else {
                val = $(this).html();
            }
            console.log(val);
            currentPlantValues.push(val);
        });
        console.log(currentPlantValues);

        // 2. delete the plant - need to call a function - this is not DRY    
        //send get request to remove plant route to remove plant from database and calendar
        $(this).parents("tr").remove();
        $.post("/remove_plant", { email: email, plant_name: currentPlantValues[0] }, function (result) {
            $(".add-new").removeAttr("disabled"); 
        });
        addNewRow(currentPlantValues[0], currentPlantValues[2], currentPlantValues[3], currentPlantValues[4]) // need to send select value 
        $(this).parents("tr").find(".edit, .add").toggle();
        $(".add-new").attr("disabled", "disabled");
    });

    addOnClickDelete();

    // check for valid email at login
    $("form[name='login']").validate({
        rules: {
            email: {
                required: true,
                email: true
            },
        },
        messages: {
            email: "Please enter a valid email address"
        },
        submitHandler: function (form) {

            email = $('#existinguser').val();
            form.submit();
        }
    });
});


// Delete row on delete button click
function addOnClickDelete() {
    $(".delete").click(function () {

        console.log("inside delete");
        var plant = $(this).attr("data-plant");
        //send get request to remove plant route to remove plant from database and calendar
        $.post("/remove_plant", { email: email, plant_name: plant }, function (result) {
            if (result) {
                console.log('deleted');
                $('#calendar-test').html("Event deleted")
            }
        });
        $(this).parents("tr").remove();
        $(".add-new").removeAttr("disabled");
    });
};



function addNewRow(currentPlant = "", currentDate = "", currentTime = "", currentComments = "") {
    console.log("inside add new function at bottom");

    $(this).attr("disabled", "disabled"); //disable button
    var index = $("table tbody tr:last-child").index(); // how many rows we have
    console.log(currentPlant)
    var row = '<tr>' +
        '<td><input type="text" class="form-control" name="plant" id="plant" value="' + currentPlant + '"></td>' +
        '<td>' + dropdown + '</td>' +
        '<td><input type="text" id="datepicker" value="' + currentDate + '"></td>' +
        '<td><input type="text" class="timepicker" value="' + currentTime + '"></td>' +
        '<td><input type="text" class="form-control" name="comments" id="comments" value="' + currentComments + '"></input></td>' +
        '<td>' + actions + '</td>' +
        '</tr>';
    $("table").append(row);
    $("table tbody tr").eq(index + 1).find(".add, .edit").toggle(); // hiding edit and showing add for the new row
    $('[data-toggle="tooltip"]').tooltip();

    datepicker = $("#datepicker").datepicker({
        dateFormat: 'dd-mm-yy'
    });

    var plant = $("#plant")
    var comments = $("#comments")


    timepicker = $('.timepicker').timepicker({
        timeFormat: 'HH:mm:ss',
        scrollbar: true,
        zindex: 1000,
    });

    console.log("just before add button");
    // Add row on add button click
    $('.add').click(function () {


        var empty = false; // flag
        var input = $(this).parents("tr").find('input[type="text"]'); // get input boxes in this row

        // for loop
        input.each(function () {
            if (!$(this).val()) {
                $(this).addClass("error"); // if no value add class error
                empty = true;
            } else {
                $(this).removeClass("error");
            }
        });

        if (empty) {
            $(this).parents("tr").find(".error").first().focus(); // focus - the empty cell is now active to type in
        }
        // if no cells are empty execute this code
        if (!empty) {
            input.each(function () {
                $(this).parent("td").html($(this).val()); // Set the table cell contents as the contents in the input box
            });


            // split watering frequency into interval and frequency
            let freqBeforeSplit = $('#frequency').val();
            let interval = freqBeforeSplit.split(" ")[1];
            let frequency = freqBeforeSplit.split(" ")[0];
            console.log("interval" + interval);
            console.log("freq" + frequency);

            // get date and time from datepicker and wickedpicker
            var date = datepicker.val();
            console.log("date " + date);
            // var time = ('#timepicker').wickedpicker('time');
            var time = timepicker.val();

            console.log("time " + time);
            var startDate = date + ' ' + time;
            console.log("start date: " + startDate);

            let plantName = plant.val();
            console.log(plantName);
            let commentsValue = comments.val();

            $(this).parents("tr").find(".delete").attr("data-plant", plantName);

            // send post request to route to add plant to database
            $.post("/new_plant", { email: email, plant_name: plantName, comments: commentsValue, interval: interval, frequency: frequency, start_date: startDate }, function (result) {
                if (result == 'unique constraint') {
                    $('#homepage-error').html("Plant already exists") // still to be implemented!
                } // else here to use the json strings returned to populate the table and show to user

            });

            // send post request to add event to google calendar
            $.post("/add_to_calendar", { email: email, plant_name: plantName, comments: commentsValue, interval: interval, frequency: frequency, start_date: startDate });
        }
        console.log(this);
        $(this).parents("tr").find(".add, .edit").toggle();
        $(".add-new").removeAttr("disabled");
    });
}

