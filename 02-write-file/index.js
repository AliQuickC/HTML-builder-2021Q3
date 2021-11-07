const path = require('path');
const fs = require('fs');
const readline = require('readline');
const fileName = path.join(__dirname, './', 'text2.txt')

fs.writeFile(fileName,'',(err) => {}) // create file

const outputFile = fs.createWriteStream(fileName, 'utf-8');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// process.on('SIGINT', handle);
// process.on('SIGTERM', handle);
rl.on('SIGINT', handle);
rl.on('SIGTERM', handle);
function handle(signal) {
  // console.log(`Received ${signal}`);
  console.log("\nПрограмма завершена!");
  outputFile.end();
  process.exit();
}

enter()
function enter() {
  rl.question('Текст будет записан в файл, Введите текст: ', (value) => {  
    if(value.toLowerCase() === "exit") {
      console.log("Программа завершена!");
      rl.close();
      outputFile.end();
      process.exit();
    }
    outputFile.write(value+"\n")
    enter2()
  });
}

function enter2() {
  rl.on('line', (value) => {
    if(value.toLowerCase() === "exit") {
      console.log("Программа завершена!");
      rl.close();
      outputFile.end();
      process.exit();
    }
    outputFile.write(value+"\n")    
  });  
}
