// LiveCQServer.js
import express from 'express';
import Stream from 'node-rtsp-stream';

const app = express();
app.use(express.static('public'));

const streamUrl = 'rtsp://admin:Pp10293849pp%3F%3F@192.168.1.100:554';

const stream = new Stream({
  name: 'camera',
  streamUrl: streamUrl,
  wsPort: 4001,
  ffmpegOptions: {
    '-stats': '',
    '-r': 25,
    '-f': 'mpegts',
    '-codec:v': 'mpeg1video',
    '-bf': 0
  },
});

app.listen(4001, () => console.log('Server running on http://localhost:4001'));
