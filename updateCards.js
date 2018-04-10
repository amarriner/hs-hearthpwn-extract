
const config = require("./config.json");
const fs = require("fs");
const request = require("sync-request");

const jsonDir = "./";

const hearthstoneCardsUrl = "https://omgvamp-hearthstone-v1.p.mashape.com/cards"
console.log("Beginning Hearthstone card refresh");

cards = JSON.parse(request("GET", hearthstoneCardsUrl, {
    "headers": {
        "X-Mashape-Key": config.mashapeKey
    }
}).getBody());

fs.writeFileSync(jsonDir + "cards.json", JSON.stringify(cards));

console.log("Done");
