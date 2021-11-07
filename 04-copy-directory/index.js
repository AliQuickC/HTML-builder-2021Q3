const path = require('path');
var fs = require('fs');

// function createFolder1(folder) {
// 	fs.stat(folder, function(err, stats) {
// 			if (!err) {			
// 				if(!stats.isDirectory()) {
// 					console.log('Невозможно создать директорию, существует файл с таким именем!');			
// 				} else {
// 					console.log('Папка уже существует');
// 				}
// 			} else {
// 				fs.mkdir('files-copy', err => {
// 					if(err) throw err; // не удалось создать папку
// 					console.log('Папка успешно создана');
// 				});
// 			}
// 	});
// }


copyFolder(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'))

async function copyFolder(dirFrom, dirTo) {
	return new Promise(async (resolve, reject) => {
		await createFolder(dirTo);
		await clearFolder(dirTo, false);
		await copyFiles(dirFrom, dirTo);
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






