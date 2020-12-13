const express = require("express");
const app = express();
const axios = require("axios");
app.use(express.json());

const Authorization = `Basic ${Buffer.from(`${process.env.RESTkey}:${process.env.RESTsecret}`).toString("base64")}`;

app.get("/", (req, res) => res.send("Agora Cloud Recording Server"));

app.post("/acquire", async (req, res) => {
  const appID = process.env.appID;
  const channel = req.body.channel;
  const uid = req.body.uid;

  const acquire = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/acquire`,
    {
      cname: channel,
      uid: uid,
      clientRequest: {
        resourceExpiredHour: 24,
      },
    },
    { headers: { Authorization } }
  );

  res.send(acquire.data);
});

app.post("/start", async (req, res) => {
  const appID = process.env.appID;
  const channel = req.body.channel;
  const uid = req.body.uid;
  const resource = req.body.resource;
  const mode = req.body.mode;

  axios
    .post(
      `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/mode/${mode}/start`,
      {
        cname: req.body.channel,
        uid: req.body.uid,
        clientRequest: {
          recordingConfig: {
            maxIdleTime: 30,
            streamTypes: 2,
            channelType: 0,
            videoStreamType: 0,
            transcodingConfig: {
              height: 640,
              width: 360,
              bitrate: 500,
              fps: 15,
              mixedVideoLayout: 1,
              backgroundColor: "#FFFFFF",
            },
          },
          recordingFileConfig: {
            avFileType: ["hls"],
          },
          storageConfig: {
            vendor: 1,
            region: 2,
            bucket: process.env.bucket,
            accessKey: process.env.accessKey,
            secretKey: process.env.secretKey,
            fileNamePrefix: ["directory1", "directory2"],
          },
        },
      },
      { headers: { Authorization } }
    )
    .then((response) => res.send(response.data))
    .catch((error) => res.send(error));
});

app.post("/stop", async (req, res) => {
  const appID = process.env.appID;
  const resource = req.body.resource;
  const sid = req.body.sid;
  const mode = req.body.mode;

  const channel = req.body.channel;
  const uid = req.body.uid;

  axios
    .post(
      `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/stop`,
      {
        cname: channel,
        uid: uid,
        clientRequest: {},
      },
      { headers: { Authorization } }
    )
    .then((response) => res.send(response.data))
    .catch((error) => res.send(error));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Agora Cloud Recording Server listening at Port ${port}`));
