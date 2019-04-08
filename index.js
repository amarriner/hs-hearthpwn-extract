var JSSoup = require('jssoup').default;
var fs = require('fs');
var imageDownloader = require("image-downloader");

var html = fs.readFileSync('collection.html', 'UTF-8');
var cards = require('./cards.json');

var soup = new JSSoup(html);
var tags = soup.findAll('div');

function getCardByName(name) {

    for (h in cards) {
        for (j in cards[h]) {
            if (cards[h][j].name === name) {
                if (cards[h][j].cost !== undefined && cards[h][j].rarity !== undefined && cards[h][j].collectible === true) {
                    return cards[h][j];
                }
            }
        }
    }

    return;

}

var card;
var collection = {};
for (i in tags) {
    if (tags[i].attrs.class && tags[i].attrs.class.indexOf('card-image-item') >= 0) {
        card = getCardByName(tags[i].attrs['data-card-name'].replace(/&#x27;/g, '\''));

        var img = tags[i].find("img");
        var options = {
            url: img.attrs["data-src"],
            dest: "images/" + card.dbfId + ".png"
        };

        if (!fs.existsSync(options.dest)) {

            imageDownloader.image(options)
                .then(( { filename, image} ) => {
                    console.log("Downloaded " + filename);
                })
                .catch((error) => {
                    console.log("Error downloading " + filename);
                });

        }

        var count;
        var spans = tags[i].findAll('span');
        if (spans.length) {
            count = spans[spans.length - 1];
        }

        var owned = 0;
        if (tags[i] && tags[i].attrs.class && tags[i].attrs.class.indexOf('owns-card') >= 0) {
            owned = 1;
        }

        var gold = 0;
        if (tags[i] && tags[i].attrs && tags[i].attrs['data-is-gold'].toUpperCase() === 'TRUE') {
            gold = 1;
        }

        if (card) {
            if (!collection[card.cardId]) {
                collection[card.cardId] = {
                    'name': card.name,
                    'gold': 0,
                    'normal': 0,
                    'rarity': card.rarity,
                    'cost': card.cost,
                    'class': card.playerClass
                };

                if (collection[card.cardId].rarity === "Free") {
                    collection[card.cardId].rarity = "Basic";
                }
            }

            if (gold === 1) {
                collection[card.cardId].gold = parseInt(count.attrs['data-card-count']);

                if (collection[card.cardId].gold > 2) {
                    collection[card.cardId].gold = 2
                }

            }
            else {
                collection[card.cardId].normal = parseInt(count.attrs['data-card-count']);

                if (collection[card.cardId].normal > 2) {
                    collection[card.cardId].normal = 2
                }

            }
            
        }
        else {
            if (tags[i] && tags[i].attrs) {
                console.log('Cannot find card: ' + tags[i].attrs['data-card-name']);
            }
        }
    }
}

for (c in collection) {
    card = collection[c];
    console.log(card.name + '|' + card.normal + '|' + card.gold + '|' + card.cost + '|' + card.rarity + '|' + card.class);
}
