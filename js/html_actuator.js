function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "restart");
  }

  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var text=new Array(18);
  text[0] = " ";
  text[1] = " ";
  text[2] = " ";
  text[3] = " ";
  text[4] = " ";
  text[5] = " ";
  text[6] = " ";
  text[7] = " ";
  text[8] = " ";
  text[9] = " ";
  text[10] = " ";
  text[11] = " ";
  text[12] = " ";
  text[13] = " ";
  text[14] = " ";
  text[15] = " ";
  text[16] = " ";
  text[17] = " ";
  var self = this;
  var text2 = function (n) { var r = 0; while (n > 1) r++, n >>= 1; return r; }

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 131072) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.innerHTML = text[text2(tile.value)];

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var mytxt=new Array(14);
  mytxt[0]="Haa , you lost at 3 tiles!";
  mytxt[1]="Haa , you lost at 4 tiles!";
  mytxt[2]="Haa , you lost at 5 tiles!";
  mytxt[3]="Haa , you lost at 6 tiles!";
  mytxt[4]="Haa , you lost at 7 tiles!";
  mytxt[5]="Haa , you lost at 8 tiles!";
  mytxt[6]="Haa , you lost at 9 tiles!";
  mytxt[7]="Haa , you lost at 10 tiles!";
  mytxt[8]="Haa , you lost at 11 tiles!";
  mytxt[9]="Haa , you lost at 12 tiles!";
  mytxt[10]="Haa , you lost at 13 tiles!";
  mytxt[11]="Haa , you lost at 14 tiles!";
  mytxt[12]="Haa , you lost at 15 tiles!";
  mytxt[13]="Haa , you lost at 16 tiles!";


  var text3 = function (m) { var r = 0; while (m > 1) r++, m >>= 1; return r; }
  var type    = won ? "game-won" : "game-over";
  var message = won ? "Haaaaaaaaaaaaaaaa , you won the game!" : mytxt[text3(maxscore)-3];

  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "end", type, this.score);
  }

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  this.clearContainer(this.sharingContainer);
  this.sharingContainer.appendChild(this.scoreTweetButton());
  twttr.widgets.load();
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.scoreTweetButton = function () {
  var tweet = document.createElement("a");
  tweet.classList.add("twitter-share-button");
  tweet.setAttribute("href", "https://twitter.com/share");
  tweet.setAttribute("data-via", "Y. Z. Chen");
  tweet.setAttribute("data-url", "http://github.com/geno1024");
  tweet.setAttribute("data-counturl", "http://github.com/geno1024");
  tweet.textContent = "Tweet";

  var text = "I scored " + this.score + " points at 23333333333333333 edition, a game where you " +
             "join numbers to score high! #23333333333333333";
  tweet.setAttribute("data-text", text);

  return tweet;
};
