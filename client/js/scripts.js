var data []


// d3.json("/dinos/dino.json", function (jsonData) {
//
// 	var dinoData = jsonData;
//
// 	// Select the field!
// 	var field = d3.select('#dino-field');
//
// 	// Need any new divs?  If so.. make them!
// 	field.selectAll('div')
// 		.data(dinoData)
// 		.enter()
// 		.append('div');
//
// 	// Fill them!
// 	field.selectAll('div')
// 		.data(dinoData)
// 		.text(function(dino){
// 			return dino.name;
// 		});
//
// 	// Make them Move!
// 	field.selectAll('div')
// 		.data(dinoData)
// 		.transition()
// 		.duration(5000)
// 		.style('width', function(dino){
// 			if (dino.weight){
// 				return (dino.weight * 0.005) + 'px';
// 			}
// 		});
//
// 	// Any Empty divs?  Remove them!
// 	field.selectAll('div')
// 		.data(dinoData)
// 		.exit()
// 		.remove();
// });
