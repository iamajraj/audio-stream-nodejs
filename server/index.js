const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

app.get('/play', (req, res) => {
  const id = req.query.id;

  if (!id)
    return res.status(400).json({
      message: 'Please provide the id',
    });
  const nasheed = `./audio/${id}.mp3`;

  if (!fs.existsSync(nasheed)) {
    return res.status(404).json({
      message: "The id doesn't exists",
    });
  }

  let readstream;
  const stat = fs.statSync(nasheed);
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');

    const partical_start = parts[0];
    const partical_end = parts[1];

    if (isNaN(partical_start) || isNaN(partical_end)) {
      return res.sendStatus(500);
    }

    const start = parseInt(partical_start, 10);
    const end = partical_end ? parseInt(partical_end, 10) : stat.size - 1;

    const content_length = end - start + 1;

    res.status(206).header({
      'Content-Type': 'audio/mpeg',
      'Content-Length': content_length,
      'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
    });

    readstream = fs.createReadStream(nasheed, {
      start,
      end,
    });
  } else {
    readstream = fs.createReadStream(nasheed);
  }
  readstream.pipe(res);
});

app.listen(3000, () => {
  console.log('server running');
});
