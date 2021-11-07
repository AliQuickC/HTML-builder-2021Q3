const path = require('path');
const fs = require('fs');

var stream = new fs.ReadStream(path.join(__dirname, 'text.txt'), {encoding: 'utf-8'});

stream.on('readable', function(err){
	var data = stream.read();
	if(data != null) { 
		// console.log(data.length);
		console.log(data);
	}
});

stream.on('error', function(err){
	if(err.code == 'ENOENT'){
			console.log("Файл не найден");
	}else{
			console.error(err);
	}
});

stream.on('end', function(){
	// console.log("THE END");
});
