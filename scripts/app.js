$( document ).ready(function() {

	scoreKeeper.resetGame();
	$('#score').keypress(function(e) {
	  if(e.which == 13) {
	  	var score = $('#score').val();
	  	$('#score').val('');
	  	scoreKeeper.addScore(score);

	  	// console.log("Entered " + score);
	  }
	});

});


var TOTAL_FRAMES = 10; TOTAL_ROLLS =2;

var scoreKeeper = {
	data: {},
	scoreArr: [],
	currentFrame: 1,
	currentFrameRoll: 1,
	currentRoll: -1,
	gameCompleted: false,
	isExtraFrame: false,
	extraFrameRollCount: 0,
	totalScore: 0,

	promptNewGame: function() {
		console.log('Game Over - prompt...')
		if(confirm('Game Over. You finished with a score of ' + this.totalScore + '. Would you like to start a new game?')) {
			this.resetGame();
		}
	},
	// resets game
	resetGame: function() {
		this.data = {};
		this.scoreArr = [];
		this.currentFrame = 1;
		this.currentFrameRoll = 1;
		this.currentRoll = -1;
		this.gameCompleted = false;
		this.isExtraFrame = false;
		this.extraFrameRollCount = 0;
		this.totalScore = 0;
	},
	// adds score from input
	addScore: function(score) {
		score = score.toUpperCase();
		if(this.gameCompleted) {

			if(this.extraFrameRollCount === 0) {
				this.promptNewGame();
				return;
			} else {
				console.log('Ended on stike or spare, continue...');
				this.currentFrame ++;
				this.isExtraFrame = true;
				this.extraFrameRollCount--;
			}
		}			

		isFinalFrame = false;
		this.currentRoll++;
		switch(score) {
			case 'X':
			case '10':
				if(this.isExtraFrame ) {
					this.scoreArr.push(10); // extra frame, keep adding score for bonus points
				} else {
					// this is a strike
					this.data[this.currentFrame] = {strike: true, score: 10, spare: false, roll: this.currentRoll};
					this.scoreArr.push(10);
					if(this.currentFrame < TOTAL_FRAMES) {
						this.currentFrame++;
					} else {
						isFinalFrame = true;
						this.extraFrameRollCount = 2;
					}
					this.currentFrameRoll = 1;
				}
				break;
			case '/':
				if(this.isExtraFrame ) {
					var actualRoll = 10;
					if(this.data[this.currentFrame]) {
						actualRoll = 10 - this.data[this.currentFrame].score;
					} 

					this.scoreArr.push(actualRoll);// extra frame, keep adding score for bonus points
				} else {
					// // this is a spare
					var actualRoll = 10;
					if(this.data[this.currentFrame]) {
						actualRoll = 10 - this.data[this.currentFrame].score;
					} 

					this.data[this.currentFrame] = {strike: false, score: 10, spare: true, roll: this.currentRoll};
					this.scoreArr.push(actualRoll);
					if(this.currentFrame < TOTAL_FRAMES) {
						this.currentFrame++;
					} else {
						isFinalFrame = true;
						this.extraFrameRollCount = 1;
					}
					this.currentFrameRoll = 1;
				}
				break;
			default:
				if(!this.isExtraFrame ) {
					if(this.data[this.currentFrame]) {
						this.data[this.currentFrame].score += parseInt(score);
						if (this.data[this.currentFrame].score == 10) {
							// both rolls = 10, this is a spare
							this.data[this.currentFrame].spare = true;
							this.data[this.currentFrame].roll = this.currentRoll;
						}
					}
					else {
						this.data[this.currentFrame] = {strike: false, score: parseInt(score), spare: false, roll: this.currentRoll};
					}
					if(this.currentFrameRoll  % TOTAL_ROLLS === 0) {
						if(this.currentFrame < TOTAL_FRAMES) {
							this.currentFrame++;
						} else {
							isFinalFrame = true;
						}
						this.currentFrameRoll = 1;
						isFrameComplete = true;
					} else {
						this.currentFrameRoll++;
					}
				}	
				this.scoreArr.push(parseInt(score));
				break;
		}

		this.getAllScores();

		if(isFinalFrame) {
			this.gameCompleted = true;
			// console.log('gameCompleted');
		}
	},
	// generates results panel with frame and total score
	getAllScores: function() {
		$('#results').empty();

		this.totalScore = 0;
		for (var x =1; x<= TOTAL_FRAMES; x++) {
			if(this.data[x]) {
				var frame = this.data[x];
				// console.log('Frame: ' + x);
				if(frame.strike) {
					// console.log('STRIKE');
					// console.log('STRIKE Roll: ' + frame.roll);
					var bonusRolls = this.scoreArr.slice(frame.roll+1, frame.roll+3);
					// console.log('strike Roll[0]: ' + bonusRolls[0]);
					// console.log('strike Roll[1]: ' + bonusRolls[1]);
					var addtlPnts = addRolls(bonusRolls);
					// console.log('addtlPnts: ' + addtlPnts);
					frame.score = 10 + addtlPnts;

				} else if (frame.spare) {
					// console.log('SPARE');
					// console.log('SPARE Roll: ' + frame.roll);
					var bonusRolls = this.scoreArr.slice(frame.roll+1, frame.roll+2);
					// console.log('SPARE Roll[0]: ' + bonusRolls[0]);
					var addtlPnts = addRolls(bonusRolls);
					// console.log('addtlPnts: ' + addtlPnts);
					frame.score = 10 + addtlPnts;

				}
				$("#results").append(
				  $("<div class='frame' />").append(
					    $("<div />").text("Frame: " + x),
					    $("<div />").text("Score: " + frame.score)
					    ));

				this.totalScore += frame.score;

				// console.log('--------------------');
			}
		}
		// console.log("Total Score: " + totalScore);
		$('#results').append('<div class="total">Total Score: ' + this.totalScore + '</div>')
		// console.log('--------------------');
		// console.log('--------------------');
		if(this.gameCompleted) {

			if(this.extraFrameRollCount === 0) {
				this.promptNewGame();
				return;
			}
		}			
	}

}

// adds roll values from array and returns sum
function addRolls(arr) {
	if(arr.length === 0) {
		return 0;
	}
	var total = arr.reduce(function(a, b) {
  		return a + b;
	});
	return total;
}


// Production steps of ECMA-262, Edition 5, 15.4.4.21
// Reference: http://es5.github.io/#x15.4.4.21
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function(callback /*, initialValue*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.reduce called on null or undefined');
    }
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    var t = Object(this), len = t.length >>> 0, k = 0, value;
    if (arguments.length == 2) {
      value = arguments[1];
    } else {
      while (k < len && ! k in t) {
        k++; 
      }
      if (k >= len) {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      value = t[k++];
    }
    for (; k < len; k++) {
      if (k in t) {
        value = callback(value, t[k], k, t);
      }
    }
    return value;
  };
}