// LiveCQServer.js
import express from 'express';
import Stream from 'node-rtsp-stream';

const app = express();
app.use(express.static('public'));

const streamUrl = 'rtsp://admin:Pp10293849pp%3F%3F@192.168.1.100:554';
// const streamUrl = 'rtsp://admin:Pp10293849pp%3F%3F@192.168.0.8:554/profile2/media.smp';

const stream = new Stream({
  name: 'camera',
  streamUrl: streamUrl,
  wsPort: 4002,
  ffmpegOptions: {
    '-stats': '',
    '-r': 25,
    '-f': 'mpegts',
    '-codec:v': 'mpeg1video',
    '-bf': 0
  },
});

app.listen(4002, () => console.log('Server running on http://localhost:4002'));
