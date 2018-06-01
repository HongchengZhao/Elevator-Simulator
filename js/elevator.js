/*
 * Elevator Class
 */
function Elevator(id) {
    this.id = id;
    this.currentFloor = 1;
    this.running = false;
    this.goingUp = true;
    this.timer = null;
    this.queue = [];

    this.initialize = function(container) {
        // Create Set
        var set = document.createElement('div');
        set.className = 'set';
        set.id = 'set' + id;
        set.innerHTML = '<div class=inside-view><div class=elevator><div class=pannel><div class=screen><span class=floor-on-screen>1</span></div><div class="buttons inside-buttons"><button class="button emergency">E</button><div class=dial></div><div class=door-controller><button class="button open-door">&lt;></button> <button class="button close-door">>&lt;</button></div></div></div></div></div><div class=outside-view><div class=indicator><div class=current-state><div class=going-up></div><div class=going-down></div></div><span class=current-floor>1</span></div><div class=floors><ul class=floor-list></ul><div class=lift><div class="closed-lift-left lift-left"></div><div class="closed-lift-right lift-right"></div></div></div></div>';
        container.appendChild(set);

        /* 添加电梯内按键 */
        var dial = document.querySelector('#set' + id + ' .dial');
        for (var i = floorNum; i > 0; --i) {
            var dialButton = document.createElement('button');
            dialButton.className = 'button';
            dialButton.innerText = '' + i;
            var that = this;

            dialButton.addEventListener('click', function() {
                this.classList.add('pressed');
                var flr = this.innerText;
                that.dial(Number(flr));
            })

            dial.appendChild(dialButton);
        }


        /* 添加电梯外按键 */
        var floorList = document.querySelector('#set' + id + ' .floor-list');
        for (var i = floorNum; i > 0; --i) {
            var floor = document.createElement('li');
            floor.className = 'floor';
            floor.innerText = i + 'F';

            var buttons = document.createElement('div');
            buttons.className = 'buttons';

            if (i != floorNum) {
                var upButton = document.createElement('button');
                upButton.className = 'button go-up';
                upButton.innerText = '↑';
                var that = this;
                upButton.addEventListener('click', function() {
                    var f = this.parentElement.parentElement.firstChild.nodeValue;
                    var flr = f.substr(0, f.length - 1);
                    window.lightsOn('go-up', Number(flr));
                    if (pendingQueue.indexOf([true, Number(flr)]) < 0) {
                        pendingQueue.push([true, Number(flr)]);
                        window.checkPendingQueue();
                    }
                })
                buttons.appendChild(upButton);
            }

            if (i != 1) {
                var downButton = document.createElement('button');
                downButton.className = 'button go-down';
                downButton.innerText = '↓';
                var that = this;
                downButton.addEventListener('click', function() {
                    var f = this.parentElement.parentElement.firstChild.nodeValue;
                    var flr = f.substr(0, f.length - 1);
                    window.lightsOn('go-down', Number(flr));
                    if (pendingQueue.indexOf([false, Number(flr)]) < 0) {
                        pendingQueue.push([false, Number(flr)]);
                        window.checkPendingQueue();
                    }
                })
                buttons.appendChild(downButton);
            }

            floor.appendChild(buttons);
            floorList.appendChild(floor);
        }

        // Door Control
        var doorController = document.querySelector('#set' + id + ' .door-controller');
        var ele = this;

        doorController.firstChild.addEventListener('click', this.openLiftDoor);
        doorController.lastChild.addEventListener('click', this.closeLiftDoor);

        var emergency = document.querySelector('#set' + id + ' .emergency');
        emergency.addEventListener('click', function() {
            alert('ELEVATOR ' + id + ' EMERGENCY!');
        });
    }

    this.dial = function(floor) {
        if (this.queue.indexOf(floor) < 0) {
            this.queue.push(floor);

            if (!this.running)
                this.checkStatus();
        }
    }

    this.openLiftDoor = function() {
        var lift = document.querySelector('#set' + id + ' .lift');
        lift.firstChild.className = 'lift-left opened-lift-left';
        lift.lastChild.className = 'lift-right opened-lift-right';
    }

    this.closeLiftDoor = function() {
        var lift = document.querySelector('#set' + id + ' .lift');
        lift.firstChild.className = 'lift-left closed-lift-left';
        lift.lastChild.className = 'lift-right closed-lift-right';

    }

    this.moveUp = function() {
        if (this.currentFloor < floorNum) {
            var that = this;
            that.currentFloor++;
            var lift = document.querySelector('#set' + id + ' .lift');
            lift.style.transform = 'translateY(-' + (45 * (this.currentFloor - 1)) + 'px';
        }
    }

    this.moveDown = function() {
        if (this.currentFloor > 1) {
            var that = this;
            that.currentFloor--;
            var lift = document.querySelector('#set' + id + ' .lift');
            lift.style.transform = 'translateY(-' + (45 * (this.currentFloor - 1)) + 'px';
        }
    }

    this.updateFloorInfo = function() {
        var floorOnScreen = document.querySelector('#set' + id + ' .floor-on-screen');
        var curFloor = document.querySelector('#set' + id + ' .current-floor');
        curFloor.innerText = floorOnScreen.innerText = '' + this.currentFloor;
    }

    this.updateIndicator = function() {
        var indicator = document.querySelector('#set' + id + ' .current-state');
        if (this.running) {
            if (this.goingUp) {
                indicator.firstElementChild.style.borderBottom = '10px solid red';
                indicator.lastElementChild.style.borderTop = '10px solid #1D1F21';
            } else {
                indicator.firstElementChild.style.borderBottom = '10px solid #1D1F21';
                indicator.lastElementChild.style.borderTop = '10px solid red';
            }
        } else {
            indicator.firstElementChild.style.borderBottom = '10px solid #1D1F21';
            indicator.lastElementChild.style.borderTop = '10px solid #1D1F21';
        }
    }

    this.arrive = function(floor) {
        if (this.timer)
            clearInterval(this.timer);

        window.lightsOut(id, floor);
        this.queue.splice(this.queue.indexOf(floor), 1);

        this.openLiftDoor();
        var that = this;
        setTimeout(function() {
            that.closeLiftDoor();
            setTimeout(function() {
                that.timer = setInterval(function() {
                    that.run();
                }, 1000);
            }, 3000);
        }, 4000);
    }

    this.checkStatus = function() {
        this.queue.sort(function(a, b) { return a - b; });
        this.running = this.queue.length > 0 ? true : false;

        if (this.currentFloor == 1) {
            this.goingUp = true;
        } else if (this.currentFloor == floorNum) {
            this.goingUp = false;
        } else {
            this.goingUp = (this.goingUp && (!this.running || this.currentFloor < this.queue[this.queue.length - 1])) ? true : false;
            this.goingUp = (!this.goingUp && (!this.running || this.currentFloor > this.queue[0])) ? false : true;
        }
    }

    this.run = function() {
        if (this.running) {
            if (this.queue.indexOf(this.currentFloor) > -1) {
                this.arrive(this.currentFloor);
            } else {
                this.goingUp ? this.moveUp() : this.moveDown();
                this.updateFloorInfo();
            }
            this.checkStatus();
        }
        this.updateIndicator();
    }


    this.setTimer = function() {
        var that = this;
        this.timer = setInterval(function() {
            that.run();
        }, 1000);
    }
}