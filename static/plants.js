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

var plantName;
var comments;
var datepicker;


$(document).ready(function () {
    var timepicker;
    // adapted from basic table at https://www.tutorialrepublic.com/codelab.php?topic=bootstrap&file=table-with-add-and-delete-row-feature

    $('[data-toggle="tooltip"]').tooltip();

    var actions = `<a class="add" title="Add" data-toggle="tooltip"><i class="material-icons">&#xE03B;</i></a>
    <a class="edit" title="Edit" data-toggle="tooltip"><i class="material-icons">&#xE254;</i></a>
    <a class="delete" title="Delete" data-toggle="tooltip" data-plant=""><i class="material-icons">&#xE872;</i></a>`;

    // Append table with add row form on add new button click
    $(".add-new").click(function () {
        $(this).attr("disabled", "disabled"); //disable button
        var index = $("table tbody tr:last-child").index(); // how many rows we have
        var row = '<tr>' +
            '<td><input type="text" class="form-control" name="plant" id="plant"></td>' +
            '<td>' + dropdown + '</td>' +
            '<td><input type="text" id="datepicker"></td>' +
            '<td><input type="text" class="timepicker"></td>' +
            '<td><input type="text" class="form-control" name="comments" id="comments"></input></td>' +
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

                // send post request to route to add plant to database

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

                
                $(this).parents("tr").find(".delete").attr("data-plant", plantName);

                let commentsValue = comments.val();
                console.log(commentsValue);

                $.post("/new_plant", { email: email, plant_name: plantName, comments: commentsValue, interval: interval, frequency: frequency, start_date: startDate }, function (result) {
                    if (result == 'unique constraint') {
                        $('#homepage-error').html("Plant already exists") // still to be implemented!
                    } // else here to use the json strings returned to populate the table and show to user

                });

                // send post request to add event to google calendar
                $.post("/add_to_calendar", { email: email, plant_name: plantName, comments: commentsValue, interval: interval, frequency: frequency, start_date: startDate }, function (result) {
                    if (result) {
                        console.log("added to calendar");
                        $('#calendar-test').html("Event added to google calendar") // take this out? 
                    }
                });

                $(this).parents("tr").find(".add, .edit").toggle(); // change add button to edit
                $(".add-new").removeAttr("disabled"); // enable the add new button again
            }

         
        });

        addOnClickDelete();

    });

    addOnClickDelete();


    // Edit row on edit button click
    $(document).on("click", ".edit", function () {

        //get all td elements except the last one
        $(this).parents("tr").find("td:not(:last-child)").each(function () {
            $(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
        });
        $(this).parents("tr").find(".add, .edit").toggle();
        $(".add-new").attr("disabled", "disabled");
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
    function addOnClickDelete(){
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
}

