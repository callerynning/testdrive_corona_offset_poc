

function reCalculate(){
	var opening = Number(document.getElementById("opening").value);
	var closing = Number(document.getElementById("closing").value);
	var slot_size = Number(document.getElementById("slot_size").value);
	var no_cars = Number(document.getElementById("no_cars").value);

	var offset_size = Number(document.getElementById("offset_size").value);
	var offset_rotation_size = Number(document.getElementById("offset_rotation_size").value);

	var slotsizeHours = Math.floor(slot_size/60);
	var slotsizeMinutes = slot_size % 60;
	var totalOpeningMinutes = closing - opening;
	var openingHours = Math.floor(totalOpeningMinutes/60);
	var openingMinutes = totalOpeningMinutes % 60;

	var timeslots = Math.floor(totalOpeningMinutes/slot_size);
	

	var slack = totalOpeningMinutes % slot_size;
	
	var total_slack = 0;

	var dayslot = document.getElementById("dayslot");
	dayslot.innerHTML = "";

	//Add cars (columns)
	for (var i = 0; i < no_cars; i++) {
		var car_slack = 0;
		var offset = (i % offset_rotation_size) * offset_size;
		dayslot.innerHTML = dayslot.innerHTML + getCarslot(100/no_cars, i);
		var carslot_id = "carslot" + i;
		var carslot = document.getElementById(carslot_id);

		//Add start slack
		if(offset > 0){
			carslot.innerHTML = carslot.innerHTML + getSlack(opening, offset, "Car" + i);
			car_slack += offset;
		}


		//add time slots (rows)
		for (var j = 0; j < timeslots; j++) {

			var start = opening + offset + (slot_size * j);
			var end = start + slot_size;
			if(end > closing){
				//Add trailing slack
				var slack = closing - start;
				car_slack += slack;
				carslot.innerHTML = carslot.innerHTML + getSlack(start, slack, "Car" + i);
				carslot.innerHTML = carslot.innerHTML + getSlackComponent(car_slack, "Car" + i);
				
				break;
			}
			carslot.innerHTML = carslot.innerHTML + getTimeslot(start, slot_size, "Car" + i);
		}
		total_slack += car_slack;
	}

	console.log("Total slack: " + total_slack);
	updateTotalSlackComponent(total_slack);
	generateJson();
};

function updateTotalSlackComponent(total_slack){
	var x = document.getElementById("total_slack").innerHTML = total_slack;
}

function generateJson() {

	var x = document.getElementById("dayslot");
	var timeslotsHTML = x.getElementsByClassName("timeslot")
	var bookingSlots = [];
	for (let item of timeslotsHTML) {
		if(hasClass(item, "ts_open")){
	    	bookingSlots.push(getTimeSlotAsJson(item));
	    }
	}

	document.getElementById("slotjson").textContent = JSON.stringify(bookingSlots, undefined, 2);
};

function prettyTime(minutesSinceMidnight) {
	var hours = Math.floor(minutesSinceMidnight/60);
	if(hours < 10)
		hours = "0" + hours;
	var minutes = minutesSinceMidnight % 60;
	if (minutes < 15)
		minutes = "00";

  	return hours + ":" + minutes;
};

function getCarslot(width, id) {
	var html = `
		<div id="carslot` + id + `" style="width: ` + width + `%">
			<p>Car` + id + `</p>
		</div>
		`;
  return html;
};

function getTimeslot(start, duration, car) {
	var html = `
		<div class="timeslot ts_open" style="height:` + duration + `px; position: relative;" data-car="` + car + `" data-start="` + prettyTime(start) + `" data-end="` + prettyTime(start + duration) + `">
			<span class="time time_top">` + prettyTime(start) + `</span>
			<span class="slot_text"></span> 
			<span class="time time_bottom">` + prettyTime(start + duration) + `</span>
		</div> 
		`;
  return html;
};

function getSlack(start, duration, car) {
	var html = `
		<div class="timeslot ts_blocked" style="height:` + duration + `px; position: relative;" data-car="` + car + `" data-start="` + prettyTime(start) + `" data-end="` + prettyTime(start + duration) + `">
			<span class="time time_top">` + prettyTime(start) + `</span>
			<span class="slot_text">Blocked by offset</span> 
			<span class="time time_bottom">` + prettyTime(start + duration) + `</span>
		</div> 
		`;
  return html;
};

function getSlackComponent(duration, car) {
	var html = `
		<div >
			<span >` + car + ` slack time: ` + duration + ` min</span>
		</div> 
		`;
  return html;
};

function toggleSelected(el) {
  var element = el;
  if(hasClass(element, "ts_open")){
  	removeClass(element, "ts_open");
  	addClass(element, "ts_blocked");
  }
  else{
  	addClass(element, "ts_open");
  	removeClass(element, "ts_blocked");
  }
  generateJson();
}

function hasClass(el, className)
{
    if (el.classList)
        return el.classList.contains(className);
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function addClass(el, className)
{
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className))
        el.className += " " + className;
}

function removeClass(el, className)
{
    if (el.classList)
        el.classList.remove(className)
    else if (hasClass(el, className))
    {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
    }
}

function getTimeSlotAsJson(timeslotHTML){

	return new Timeslot(timeslotHTML.dataset.car, timeslotHTML.dataset.start, timeslotHTML.dataset.end);

}

function Timeslot(car, start, end) {
   this.car = car;
   this.start = start;
   this.end = end;
   return this;
}
