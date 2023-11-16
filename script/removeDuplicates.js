/** Return a QUESTIONS.md file with duplicate questions removed */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'QUESTIONS.md'); // Replace with your file path
const outputFile = path.join(__dirname, 'QUESTIONS-unique.md'); // Path for the output file

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const lines = data.split('\n');
  const uniqueLines = lines.reduce((all, line) => all.includes(line) ? all : [...all, line], []);

  const outputData = uniqueLines.join('\n');
  fs.writeFile(outputFile, outputData, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('File has been saved with unique questions.');
  });
});
