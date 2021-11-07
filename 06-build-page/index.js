const path = require('path');
var fs = require('fs');

const buildDir = path.join(__dirname, 'project-dist')

build()

async function build() {
	await createOutFolder(buildDir)
	buildHTML()
	mergeStyles(path.join(__dirname, 'styles'), buildDir, "style.css")
	copyFolder(path.join(__dirname, 'assets'), path.join(buildDir, 'assets'))
}

async function copyFolder(dirFrom, dirTo) {
	return new Promise(async (resolve, reject) => {		
		await createFolder(dirTo);
		await clearFolder(dirTo, false);
		await copyFiles(dirFrom, dirTo);
		console.log('Папка Assets скопирована');
		resolve()
	})

	function createFolder(folder) {
		return new Promise(async (resolve, reject) => {
			fs.mkdir(folder, {recursive: true}, err => {
				if(err) {throw err;} // не удалось создать папку			
				resolve()
			});
		})
	}
	
	function clearFolder(dirName, fo) {
		return new Promise(async (resolve, reject) => {
			fs.readdir(dirName,  async function(err, items) {
				if(items.length === 0) {resolve();}
	
				for(const item of items) {
					const file = path.join(dirName, item)
					// console.log('file: ', file);
	
					await deleteFile(file, fo)
				}			
				resolve()
				})
	
			function deleteFile(file, fo) {
				return new Promise((resolve, reject) => {
	
					fs.stat(file, async function(err, stats) {			
						if(!stats.isDirectory()) {
							fs.unlink(file, function(err) {				
								if (err) {console.log(err);} 
								else {resolve()}
							});
						} else {
							await clearFolder(file, fo)
							if(fo === false){							
								fs.rmdir(file, err => {if (err) {console.log(err);}}); // удаляем директорию
							}
							resolve()
						}
					});
				})
			}	
		})
	}
	
	function copyFiles(dirFrom, dirTo) {	
		return new Promise(async (resolve, reject) => {
			
			fs.readdir(dirFrom,  async function(err, items) {
				// console.log('items copy: ', items);
				if(items.length === 0) {resolve();}
	
				for(const item of items) {
					const fileFrom = path.join(dirFrom, item)
					const fileTo = path.join(dirTo, item)
					// console.log('file: ', file);
	
					await copyFile(fileFrom, fileTo)
				}			
				resolve()
			})
	
			function copyFile(from, to) {
				return new Promise((resolve, reject) => {
	
					fs.stat(from, async function(err, stats) {			
						if(!stats.isDirectory()) {
							fs.copyFile(from, to, err => {
								if(err) {throw err;} // не удалось скопировать файл
								// console.log("Файл - " + file + " успешно скопирован");	
								resolve()
							});
						} else {
							await createFolder(to)
							await copyFiles(from, to)
							resolve()
						}
					});
				})
			}	
		})
	}
}

async function mergeStyles(inpFold, outFold, outFile) {
	return new Promise(async (resolve, reject) => {
	
	let bundle = []	
		
	await readStyles(inpFold)
	await buildStyles(outFold, outFile)	
	console.log('Файл styles.css собран');
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

function buildHTML() {
	return new Promise(async (resolve, reject) => {
		const outFileName = path.join(buildDir, './', 'index.html')
		const inputFileName = path.join(__dirname, './', 'template.html')

			let p = new Promise((resolve) => {resolve();});

		await p.then(createOutFile).then(readHtmlToArray).then(replaceTemplateTegs).then(writeArrayToHTML)
		console.log('Файл index.html собран');
		resolve()

		function writeArrayToHTML(arr) {
			return new Promise(async (resolve, reject) => {
				const outputFile = fs.createWriteStream(outFileName, 'utf-8');
				for (const item of arr) {
					outputFile.write(item + "\n");
				}
				outputFile.end();
				resolve()
			})
		}

		function replaceTemplateTegs(arr) {
			return new Promise(async (resolve, reject) => {
				templArr = []

				for (let item of arr) {
					let startTegPos = item.indexOf("{{")
					if (startTegPos !== -1) {
						let endTegPos = item.indexOf("}}")
						if (endTegPos !== -1) {
							let teg = item.substr(startTegPos + 2, endTegPos - startTegPos - 2)
							let tegReplace = item.substr(startTegPos, endTegPos - startTegPos + 2)
							let t = await getTemplateForTeg(teg)
							item = item.replace(tegReplace, t)

							templArr.push(item)
						}
					} else {
						templArr.push(item)
					}
				}
				resolve(templArr)
			})
		}

		function getTemplateForTeg(templTeg) {
			return new Promise(async (resolve, reject) => {
				// console.log('templTeg: ', templTeg);
				const templlDir = path.join(__dirname, 'components')
				const templFile = path.join(templlDir, templTeg + '.html')

				let templTagContent = await readFileToString(templFile)

				resolve(templTagContent)
			})
		}

		function readFileToString(file) {
			return new Promise((resolve, reject) => {
				var stream = new fs.ReadStream(file, {
					encoding: 'utf-8'
				});
				let strData = ""

				stream.on('readable', function (err) {
					var data = stream.read();
					if (data != null) {
						// console.log(data.length);
						strData += data
					}
				});

				stream.on('error', function (err) {
					if (err.code == 'ENOENT') {
						console.log("Файл не найден");
					} else {
						console.error(err);
					}
				});

				stream.on('end', function () {
					resolve(strData)
					// console.log("THE END");
				});
			})
		}

		function createOutFile() {
			return new Promise((resolve, reject) => {
				fs.writeFile(outFileName, '', (err) => {
					if (!err) {
						resolve()
					}
				}) // create file
			})
		}

		function readHtmlToArray() {
			return new Promise((resolve, reject) => {
				let stream = new fs.ReadStream(inputFileName, {
					encoding: 'utf-8'
				});
				let htmlArray = []

				stream.on('readable', function (err) {
					let data = stream.read();

					if (data != null) {
						let array = data.split("\n");
						if (data[data.length - 1] !== "\n" && htmlArray.length !== 0) {
							htmlArray[htmlArray.length] += array.shift()
						}
						htmlArray = htmlArray.concat(array);

					}
				});

				stream.on('error', function (err) {
					if (err.code == 'ENOENT') {
						console.log("Файл не найден");
					} else {
						console.error(err);
					}
				});

				stream.on('end', function () {
					// console.log('htmlArray1: ', htmlArray);
					resolve(htmlArray)
					// console.log("THE END");
				});
			})
		}

	})
}

function createOutFolder(folder) {
	return new Promise((resolve, reject) => {
		fs.mkdir(folder, {
			recursive: true
		}, err => {
			if (err) {
				throw err;
			} // не удалось создать папку
			resolve()
			console.log(`Папка "${path.basename(folder)}" успешно создана`);
			// clearFolder(dirCopyName);
		});
	})
}