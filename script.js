'use strict'

var minesPercentage = 0;
var mineFieldSize = 0;
var numberOfColumns = 0;
var numberOfRows = 0;
var clickCounter = 0;

var minesArray = [];
var noMineAreas = [];
var mineSymbol = 'X';
var uncoveredID = '';  // will store the ID of the cell that was clicked
var revealedButtonCount = 0;
var amountOfMines = 0;

// Creates a HTML table with number of row & columns fetched within the input fields.
function CreateMineField() {
    $('.js-mine-field').remove();
    var $mineField = $('<table></table>').addClass('js-mine-field');
    for (var i = 0; i < numberOfRows; i++) {
        var $row = $('<tr></tr>').attr('class', 'row');
        for (var j = 0; j < numberOfColumns; j++) { 
            var $cell = $('<td></td>').attr('id', (i.toString()) + '-' + (j.toString()));
            var $button = $('<button></button>').addClass('button');
            $cell.append($button);
            $row.append($cell);
        }
        $mineField.append($row);
    }
    $('#js-mine-field-section').append($mineField);
}

// A sequence of functions that runs on the first click on the mine field.
function CreateAndBuryMines(cellID) {
    CreateArrayOfMines();
    BuryMines();
    UncoverEmptyCellOnFirstClick(cellID);
    AddNumbersAroundMines();
}

// Create a array that contains null & mines, then randomize their locations
function CreateArrayOfMines() {
    for (var i = 0; i < mineFieldSize; i++) {
        if (i < amountOfMines) {
            minesArray.push(mineSymbol);
        } else {
            minesArray.push(null);
        }
    }
    ShuffleArray(minesArray);
}

// Shuffle function: swap the value at each index with a value at a random index.
function ShuffleArray(array) {
    var length = array.length;
    for (length; length; length--) {
        var random = Math.floor(Math.random() * length);
        var temp = array[length - 1]; 
        array[length - 1] = array[random]; 
        array[random] = temp;
    }
}

// Iterate through the mines array and plug in the value (either mines or null) into the talble
var BuryMines = function () {
    for (var i = 0; i < mineFieldSize; i++) {
        var thisCell = $('td')[i];
        var mine = minesArray[i];
        if (minesArray[i] == mineSymbol) {
            $(thisCell).data('answer', mineSymbol).addClass('text-color-' + minesArray[i]);
            //$(thisCell).children().text(mineSymbol);  //debug: reveal mines
        } else {
            $(thisCell).data('answer', null);
        }
    }
}

// Remove all possible mines on the cell and its surrounding area where the first click happens
var UncoverEmptyCellOnFirstClick = function (id) {
    $('#' + id).data('answer', null);
    var surroundingArea = GetSurroundingAreaIDs(id);
    for (var i = 0; i < surroundingArea.length; i++) {
        var $thisArea = $('#' + surroundingArea[i]);
        if ($thisArea.data('answer') == mineSymbol) {
            $thisArea.data('answer', null);
            amountOfMines -= 1;
        }
    }
}

// Iterate through the table and adds the numbers around the mines 
var AddNumbersAroundMines = function () {
    var $mineFieldCells = $('td');
    var numberCells = [];
    for (var i = 0; i < $mineFieldCells.length; i++) {
        if ($mineFieldCells.eq(i).data('answer') == mineSymbol) {
            var mineCellID = ($mineFieldCells.eq(i).attr('id'));
            var surroundingAreaIDs = GetSurroundingAreaIDs(mineCellID);
            for (var j = 0; j < surroundingAreaIDs.length; j++) { 
                var $thisArea = $('#' + surroundingAreaIDs[j]);
                if ($thisArea.length > 0 && $thisArea.data('answer') != mineSymbol) {
                    $thisArea.data('answer', $thisArea.data('answer') + 1);
                    $thisArea[0].className = 'text-color-' + $thisArea.data('answer');
                }
            }
        }
    }
}

// A function that takes in a ID of a position and return a list of IDs that surrounds that position
function GetSurroundingAreaIDs(centerID) {
    var rowColumn = centerID.split('-');
    var centerRow = Number(rowColumn[0]);
    var centerColumn = Number(rowColumn[1]);

    var leftID = (centerRow) + '-' + (centerColumn - 1);
    var leftUpID = (centerRow - 1) + '-' + (centerColumn - 1);
    var leftDownID = (centerRow + 1) + '-' + (centerColumn - 1);
    var upID = (centerRow - 1) + '-' + (centerColumn);
    var downID = (centerRow + 1) + '-' + (centerColumn);
    var rightID = (centerRow) + '-' + (centerColumn + 1);
    var rightUpID = (centerRow - 1) + '-' + (centerColumn + 1);
    var rightDownID = (centerRow + 1) + '-' + (centerColumn + 1);

    var surroundingArea = [];
    surroundingArea.push(leftID, leftUpID, leftDownID, upID, downID, rightID, rightUpID, rightDownID);
    return surroundingArea;
}

// Removes the button from the DOM on the ID position
var RemoveButton = function (id) {
    var $cellID = $('#' + id);
    $cellID.text($cellID.data('answer'));
    $cellID.children().remove();
    revealedButtonCount += 1;
}

// Opens up all the surrounding area around a empty cell.
var OpenSurrounding = function (id) {
    var surroundingArea = GetSurroundingAreaIDs(id);
    for (var i = 0; i < surroundingArea.length; i++) {
        var thisAreaID = surroundingArea[i];
        var $thisArea = $("#" + surroundingArea[i]);
        if ($thisArea.length > 0 && $thisArea.data('answer') !== mineSymbol) {
            RemoveButton(thisAreaID);
            if ($thisArea.data('answer') == null && noMineAreas.indexOf(thisAreaID) <= 0) {
                noMineAreas.push(thisAreaID);
                OpenSurrounding(thisAreaID);
            }
        }
    }
    WinConditionCheck();
}

// Checks if the number of uncovered fields equal the number of mines, if so pop up a win window.
var WinConditionCheck = function () {
    if ($('.button').length == amountOfMines) {
        $('.js-win-screen').css('visibility', 'visible');
    }
}

// Pops up lose window
var LoseWindowPopup = function () {
    $('td').unbind('click');
    $('.js-lose-screen').css('visibility', 'visible');
}

// Uncovers the field of where the player clicked.
var UncoverField = function () {
    // Get the ID (of position) of where the player clicked
    uncoveredID = $(this).attr('id');
    if (clickCounter < 1) {
        // If it was the first click, it generates the mines and buries them in the table.
        CreateAndBuryMines(uncoveredID);
    }
    clickCounter += 1;
    RemoveButton(uncoveredID); // Uncover the cell
    var revealed = $('#' + uncoveredID).data('answer'); // reveals what is underneath.
    if (revealed == mineSymbol) {
        // Call lose window if it was mine
        LoseWindowPopup();
    } else if (typeof (revealed) == 'number') {
        // Disable click event if it's number
        $(this).unbind('click');
    } else if (revealed == null) {
        // Open surrounding areas if it's a empty cell. P.s: this happends recursively, if there is a empty cell among surrounding area, it will open its own surrounding areas.
        OpenSurrounding(uncoveredID);
    }
    WinConditionCheck();
}

// Place a flag on the cell that player right clicked
var PlaceFlag = function (e) {
    e.preventDefault();
    if ($(e.target).text() !== 'F') {
        $(this).unbind('click');
        $(this).children().text('F');
    } else if ($(e.target).text() == 'F') {
        $(this).bind('click', UncoverField);
        $(this).children().text('');
    }
}


var AddEventListeners = function () {
    $('td').click(UncoverField);
    $('td').contextmenu(PlaceFlag);

}

// Resets the values and creates a empty table
var Start = function () {
    // Initialize values
    minesArray = [];
    noMineAreas = [];
    clickCounter = 0;
    $('.js-restart').parent().css('visibility', 'hidden');
    numberOfColumns = Number($('.js-board-columns').val());
    numberOfRows = Number($('.js-board-rows').val());
    minesPercentage = Number($('.js-mines-percentage').val()) * 0.01;
    mineFieldSize = numberOfRows * numberOfColumns;
    amountOfMines = Math.floor(mineFieldSize * minesPercentage);
    CreateMineField(); // creates a empty table 
    AddEventListeners();
}

$(document).ready(function () {
    Start();
    $('input').change(Start);
    $('.js-restart').click(Start);
});
