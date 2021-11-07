const path = require('path');
var fs = require('fs');

mergeStyles(path.join(__dirname, 'styles'), path.join(__dirname, 'project-dist'), "bundle.css")

async function mergeStyles(inpFold, outFold, outFile) {
	return new Promise(async (resolve, reject) => {
	
	let bundle = []	
		
	await readStyles(inpFold)
	await buildStyles(outFold, outFile)	
	resolve()
	
	function readStyles(folder) {
		return new Promise((resolve, reject) => {
			fs.readdir(folder,  async function(err, items) {
				for(const item of items) {
					const file = folder + '/' + item;
					await readStyleFile(file)
				}			
				resolve()
				})
		})
	}
	
	function buildStyles(outFold, outFile) {	
		return new Promise((resolve, reject) => {
			const fileName = path.join(outFold, outFile)		
			fs.writeFile(fileName,'',(err) => {}) // create file
	
			const outputFile = fs.createWriteStream(fileName, 'utf-8');
			for(const item of bundle) {
				outputFile.write(item);
			}
			outputFile.end();			
			resolve()
		})
	}
	
	function readStyleFile(file) {	
		return new Promise((resolve, reject)=>{		
			// const file = stylesFolder + '/' + item;		
			const ext = path.extname(file);	
			
			fs.stat(file, function(err, stats) {			
				if(!stats.isDirectory() && ext === ".css") {				
					readFileToArray(file, bundle, resolve)				
					} else {
						resolve()
					}
				});		
		})
	}
	
	function readFileToArray(file, array, callback) {
		var stream = new fs.ReadStream(file, {encoding: 'utf-8'});
		stream.on('readable', function(err){
			var data = stream.read();		
			if(data != null) { 
				// console.log(data.length);
				array.push(data)
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
			array.push("\n")
			callback()
		});
	}

})
}





