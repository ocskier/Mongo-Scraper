
$(document).on("click", "#scrape-btn", function() {
  // Empty the notes from the note section
  $("#scrape-btn").remove();
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
    .then((data) => {
      window.location.replace(data);
    })
});


$(document).on("click", "#cancel-btn", function() {
  // Empty the notes from the note section
  $("#titleinput").val("");
  $("#bodyinput").val("");
});


$(document).on("click", "#open-note", function() {
  // Empty the notes from the note section

  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);

      $("#savenote").attr("data-id",thisId);
      // The title of the article
      $(".modal-content h4").text(data.title);

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note[data.note.length-1].title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note[data.note.length-1].body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val(),
      date: moment().format("MMMM Do YYYY HH:mm:ss")
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      const newNote = data.note[data.note.length-1];
      console.log(newNote);
      // Empty the notes section
      $("#notes").empty();
      $("#"+data._id).append(`<h5 style="color: black;background: floralwhite;">${newNote.date}<br>${newNote.title}: ${newNote.body}</h5>`);
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
