var requestsController = (function () {

    return {
        // 1. New plant
        newPlant: function (newPlantArgs) {
            return $.post("/new_plant", newPlantArgs);
        },

        // 2. add to calendar
        addToCalendar: function (addToCalArgs) {
            return $.post("/add_to_calendar", addToCalArgs);
        },

        // 3. delete plant
        removePlant: function (removePlantArgs) {
            // { email: email, plant_name: plant }
            return $.post("/remove_plant", removePlantArgs);
        },
    }
})();

var UIController = (function () {

    var actions = `<div class="spinner-border spinner-border-sm text-warning " role="status">
                        <span class="sr-only" style="height: 30px">Loading...</span>
                    </div>
                <a class="add" title="Add" data-toggle="tooltip"><i class="material-icons">&#xE03B;</i></a>
                <a class="edit" title="Edit" data-toggle="tooltip"><i class="material-icons">&#xE254;</i></a>
                <a class="delete" title="Delete" data-toggle="tooltip" data-plant=""><i class="material-icons">&#xE872;</i></a>`;

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

    var datepicker, plant, comments, timepicker;

    // function which returns values from table row
    var getValuesFromRow = function (thisElement) {

        var cells = $(thisElement).parents("tr").find("td");
        var plantName = cells.eq(0).html();
        var freqBeforeSplit = cells.eq(1).html();
        var frequency = freqBeforeSplit.split(" ")[0];
        var interval = freqBeforeSplit.split(" ")[1];
        var startDate = cells.eq(2).html() + " " + cells.eq(3).html();
        var commentsValue = cells.eq(4).html();


        return {
            email: email,
            plant_name: plantName,
            comments: commentsValue,
            interval: interval,
            frequency: frequency,
            start_date: startDate,
        }

    };


    return {

        // 1. append new row
        appendRow: function (plantName = "", startDate = "", comments = "") {

            

            if (startDate) {
                var date = startDate.split(" ")[0];
                var time = startDate.split(" ")[1];
            } else {
                date = "";
                time = "";
            }


            $(this).attr("disabled", "disabled"); //disable button
            var index = $("table tbody tr:last-child").index(); // how many rows we have
            var row = '<tr>' +
                '<td><input type="text" class="form-control" name="plant" id="plant" value="' + plantName + '"></td>' +
                '<td>' + dropdown + '</td>' +
                '<td><input type="text" id="datepicker" value="' + date + '"></td>' +
                '<td><input type="text" class="timepicker" id="timepicker" value="' + time + '"></td>' +
                '<td><input type="text" class="form-control" name="comments" id="comments" value="' + comments + '"></input></td>' +
                '<td>' + actions + '</td>' +
                '</tr>';

            $("table").append(row);
            $("table tbody tr").eq(index + 1).find(".add, .edit").toggle(); // hiding edit and showing add for the new row
            $('[data-toggle="tooltip"]').tooltip();

            // flatpickr date https://flatpickr.js.org/options/
            datepicker = $("#datepicker").flatpickr({
                dateFormat: 'd-m-yy',
                defaultDate: new Date(),
                minDate: "today"
            });

            plant = $("#plant");
            comments = $("#comments");

            // flatpickr time https://flatpickr.js.org/options/
            timepicker = $('.timepicker').flatpickr({
                enableTime: true,
                defaultDate: new Date().getHours() + ":" + new Date().getMinutes(),
                dateFormat: 'H:i:ss',
                noCalendar: true,
                time_24hr: true,
                minuteIncrement: 1,
                enableSeconds: true
            });

        },

        // 2. add row to table
        addRow: function (thisElement) {

            $('#homepage-error').html(""); // hide duplicate plant error

            var empty = false; // flag
            var input = $(thisElement).parents("tr").find('input[type="text"]'); // get input boxes in this row
            console.log(thisElement);
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
                $(thisElement).parents("tr").find(".error").first().focus(); // focus - the empty cell is now active to type in
            }
            // if no cells are empty execute this code
            if (!empty) {

                input.each(function () {
                    $(this).parent("td").html($(this).val()); // Set the table cell contents as the contents in the input box
                });

                // set cell content of select dropdown
                $('#frequency').parents("td").html($('#frequency').val());
                $(thisElement).parents("tr").find(".spinner-border").show();
                $(thisElement).parents("tr").find(".edit").hide();
                $(thisElement).parents("tr").find(".delete").hide();
                $(thisElement).parents("tr").find(".add").hide();

                return getValuesFromRow(thisElement);

            }
        },

        // 3. delete row
        deleteRow: function (thisElement) {

            // var plant = $(thisElement).parent("a").attr("data-plant"); // NEED TO SEND THIS TO POST REQ
            $(thisElement).parents("tr").remove();
            $(".add-new").removeAttr("disabled");

            var plantObject = getValuesFromRow(thisElement);
            return plantObject;

        },


        // 4. edit row
        editRow: function (thisElement) {
            var plantObject = this.deleteRow(thisElement);
            this.appendRow(plantObject.plant_name, plantObject.start_date, plantObject.comments);
            return plantObject;
        },


        // 5. duplicate plant error
        duplicatePlant: function (thisElement) {
            $('#homepage-error').html("You have already added a plant with this name to your calendar!")
            $(thisElement).parents("tr").remove();
            $(".add-new").removeAttr("disabled");
            this.appendRow();

        }
    }

})();

var controller = (function (rqsCtrl, UICtrl) {

    var setupEventListeners = function () {

        // 1. Add on click to add new (append) button
        $(document).on("click", ".add-new", function (event) {
            UICtrl.appendRow();
        });


        // Add on click to add button
        $(document).on("click", ".add", function (event) {
            let thisElement = event.target;
            let newPlantArgs = UICtrl.addRow(thisElement);
            rqsCtrl.newPlant(newPlantArgs).then(function (value) {

                // if plant has already been added to database and calendar, show error to use and do not add
                if (value === 'unique constraint') {
                    UICtrl.duplicatePlant(thisElement);
                } else {
                    rqsCtrl.addToCalendar(newPlantArgs).then(function () {
                        $(".add-new").removeAttr("disabled"); // enable the add new button again
                        $(thisElement).parents("tr").find(".spinner-border").hide();
                        $(thisElement).parents("tr").find(".delete").show();
                        $(thisElement).parents("tr").find(".add").hide();
                        $(thisElement).parents("tr").find(".edit").show();
                    });
                }
            });
        });

        $(document).on("click", ".delete", function (event) {
            let thisElement = event.target;
            let plantObject = UICtrl.deleteRow(thisElement);
            removePlantArgs = { email: email, plant_name: plantObject.plant_name }
            rqsCtrl.removePlant(removePlantArgs);

        });

        $(document).on("click", ".edit", function (event) {
            let thisElement = event.target;
            let plantObject = UICtrl.editRow(thisElement);
            removePlantArgs = { email: email, plant_name: plantObject.plant_name }
            rqsCtrl.removePlant(removePlantArgs);
        });


    };

    return {
        init: function () {
            console.log('app has started');
            $('[data-toggle="tooltip"]').tooltip();
            setupEventListeners();
        }
    }

})(requestsController, UIController);


controller.init();

// email validation on login page
$(function () {
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
            form.submit();
        }
    });
});