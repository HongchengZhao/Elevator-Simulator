/*
 * Global Variables
 */
if (!window.localStorage) {
    alert('Google Chrome or FireFox recommended!');
}

if (!localStorage.eleData) {
    var eleData = {
        eleNum: 3,
        floorNum: 20
    };
    localStorage.setItem('eleData', JSON.stringify(eleData));
}
var eleNum = 1;
var floorNum = 15;
var eles = [];
var pendingQueue = [];

function initialize() {
    var eleData = JSON.parse(localStorage.eleData);
    eleNum = eleData.eleNum;
    floorNum = eleData.floorNum;
    var container = document.getElementById('container');
    container.innerHTML = '';

    for (var i = 0; i < eleNum; ++i) {
        eles[i] = new Elevator(i + 1);
        eles[i].initialize(container);
        eles[i].setTimer();
    }

    setInterval(checkPendingQueue, 1000);
}

function lightsOn(className, floor) {
    var floorLists = document.getElementsByClassName('floor-list');
    for (var i = 0; i < floorLists.length; ++i) {
        var f = floorLists[i].children[floorNum - floor];
        if (floor == 1 || floor == floorNum) {
            f.firstElementChild.firstElementChild.classList.add('pressed');
        } else {
            if (className == 'go-up')
                f.firstElementChild.firstElementChild.classList.add('pressed');
            else
                f.firstElementChild.lastElementChild.classList.add('pressed');

        }
    }
}

function lightsOut(id, floor) {
    var dialButton = document.querySelector('#set' + id + ' .dial').children[floorNum - floor];
    dialButton.className = 'button';

    var floorLists = document.getElementsByClassName('floor-list');
    for (var i = 0; i < floorLists.length; ++i) {
        var f = floorLists[i].children[floorNum - floor];

        if (floor == floorNum) {
            if (!eles[id - 1].goingUp)
                f.firstElementChild.firstElementChild.className = 'button go-down';
        } else if (floor == 1) {
            if (eles[id - 1].goingUp)
                f.firstElementChild.firstElementChild.className = 'button go-up';
        } else {
            f.firstElementChild.firstElementChild.className = 'button go-up';
            f.firstElementChild.lastElementChild.className = 'button go-down';
        }
    }
}

function checkPendingQueue() {
    var toRemove = [];
    for (f in pendingQueue) {
        var min = Number.POSITIVE_INFINITY;
        var closestId = 0;

        for (var i in eles) {
            if (pendingQueue[f][0] == eles[i].goingUp || !eles[i].running) {
                var dist = Math.abs(pendingQueue[f][1] - eles[i].currentFloor);
                if (dist < min) {
                    min = dist;
                    closestId = eles[i].id;
                }
            }
        }
        if (closestId > 0) {
            eles[closestId - 1].queue.push(pendingQueue[f][1]);
            toRemove.push(f);
            if (!eles[closestId - 1].running)
                eles[closestId - 1].checkStatus();
        }
    }

    for (i in toRemove) {
        pendingQueue.splice(toRemove[i], 1);
    }
}

/*
 ************************************************************
 */
function openSetting() {
    document.getElementById('setting').style.width = '200px';
    document.getElementById('container').style.marginLeft = '200px';
}

function closeSetting() {
    document.getElementById('setting').style.width = '0px';
    document.getElementById('container').style.marginLeft = '0px';
}

document.getElementById('reset').addEventListener('click', function(e) {
    e.preventDefault();

    var eleData = {
        eleNum: Number(document.getElementById('ele').value),
        floorNum: Number(document.getElementById('flr').value)
    };
    localStorage.setItem('eleData', JSON.stringify(eleData));
    window.location.reload();
})