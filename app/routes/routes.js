// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require ("axios");
const cheerio = require ("cheerio");

const express = require ("express");

const router = express.Router();

// Requiring our models
const db = require ("../models");

router.get("/", (req, res) => {
    db.Article.find({})
        .populate("note")
        .then(dbArticle => {
            let hdbrsObj = {
                articles: dbArticle
            }
            console.log(hdbrsObj);
            if (hdbrsObj.articles.length === 0) {
                res.render("scrape", {});
            } else {
                res.render("index", hdbrsObj);
            }
        })
        .catch(err =>
            // If an error occurred, send it to the client
            res.json(err)
        );
});

// A GET route for scraping the echoJS website
router.get("/scrape", (req, res) => {
// First, we grab the body of the html with axios
    axios.get("https://www.npr.org/sections/music-news/").then((response) => {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article", ".list-overflow").each(function(i, element) {
        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
            .children(".item-info")
            .children("h2")
            .children("a")
            .text();
        result.link = $(this)
            .children(".item-info")
            .children("h2")
            .children("a")
            .attr("href");
        result.date = $(this)
            .children(".item-info")
            .children("p")
            .children("a")
            .contents()
            .eq(0)
            .text()
            .replace("•", "")
            .trim();
        result.summary = $(this)
            .children(".item-info")
            .children("p")
            .children("a")
            .contents()
            .eq(1)
            .text();
        result.image = $(this)
            .children(".item-image")
            .first()
            .contents()
            .children('a')
            .children('img')
            .attr('src');

        console.log(result);
        // Create a new Article using the `result` object built require scraping
        db.Article.create(result)
        .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.json("/");
    // setTimeout(res.redirect("/"),2000);
    });
});

// Route for getting all Articles require the db
router.get("/articles", (req, res) =>
// Grab every document in the Articles collection
    getAllArticles(res)
);

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({
            _id: req.params.id
        })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    console.log(req.body);
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated Article -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({
                _id: req.params.id
            }, {
                $push: {
                note: dbNote._id
            }}, {
                new: true
            }).populate("note");
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

module.exports = router;

function getAllArticles(res) {
    return db.Article.find({})
        .populate("note")
        .then(dbArticle =>
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle))
        .catch(err =>
            // If an error occurred, send it to the client
            res.json(err));
}
